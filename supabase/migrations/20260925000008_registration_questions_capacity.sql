-- 행사 캠페인: 추가 질문(인터뷰) 응답, 입금 확인 기준 선착순 정원.
-- 신청(pending)은 정원과 무관하게 받고, 운영자가 입금 확인(confirmed)한 인원이 정원에 닿으면 신청이 자동 마감된다.
alter table public.campaign_registrations add column if not exists answers jsonb not null default '{}'::jsonb;  -- {질문 key: 선택값}
alter table public.campaigns add column if not exists confirmed_count integer not null default 0;              -- 입금 확인 인원 (트리거 유지)

-- 신청 수·입금 확인 수를 함께 유지
create or replace function public.sync_registration_count()
returns trigger language plpgsql security definer set search_path = public as $$
declare cid uuid;
begin
  foreach cid in array array[coalesce(new.campaign_id, old.campaign_id), case when tg_op = 'UPDATE' and new.campaign_id <> old.campaign_id then old.campaign_id end] loop
    continue when cid is null;
    update public.campaigns set
      registration_count = (select count(*) from public.campaign_registrations where campaign_id = cid and status <> 'cancelled'),
      confirmed_count = (select count(*) from public.campaign_registrations where campaign_id = cid and status = 'confirmed')
    where id = cid;
  end loop;
  return null;
end $$;
revoke all on function public.sync_registration_count() from public, anon, authenticated;

-- 정원 초과 입금 확인 방지 (동시에 눌러도 캠페인 행을 잠가 순서대로 처리)
create or replace function public.guard_registration_capacity()
returns trigger language plpgsql security definer set search_path = public as $$
declare cap integer; taken integer;
begin
  if new.status = 'confirmed' and (tg_op = 'INSERT' or old.status is distinct from 'confirmed') then
    select capacity into cap from public.campaigns where id = new.campaign_id for update;
    if cap is not null then
      select count(*) into taken from public.campaign_registrations where campaign_id = new.campaign_id and status = 'confirmed' and id <> new.id;
      if taken >= cap then raise exception 'capacity_full' using errcode = 'P0001', hint = '정원이 모두 찼습니다.'; end if;
    end if;
  end if;
  return new;
end $$;
revoke all on function public.guard_registration_capacity() from public, anon, authenticated;
drop trigger if exists campaign_registrations_capacity on public.campaign_registrations;
create trigger campaign_registrations_capacity before insert or update of status on public.campaign_registrations
  for each row execute function public.guard_registration_capacity();

-- 공개 신청: 항상 입금 확인 대기(pending)로만 넣을 수 있고, 정원이 차면 거부
drop policy if exists "register for open event" on public.campaign_registrations;
create policy "register for open event" on public.campaign_registrations for insert
  with check (
    email is not null
    and status = 'pending'
    and note is null
    and (user_id is null or user_id = auth.uid())
    and exists (
      select 1 from public.campaigns c
      where c.id = campaign_id and c.type = 'event' and c.review = 'approved' and c.registration_open and now() < c.end_at
        and (c.capacity is null or c.confirmed_count < c.capacity)
    )
  );

update public.campaigns c set confirmed_count = (select count(*) from public.campaign_registrations r where r.campaign_id = c.id and r.status = 'confirmed');
