-- 신청 인원 공개용 뷰(security definer)를 없애고, campaigns.registration_count 컬럼을 트리거로 유지한다.
-- (Supabase 보안 린트: security definer 뷰 금지. 트리거 함수는 REST로 노출되지 않는다.)
drop view if exists public.campaign_registration_counts;

alter table public.campaigns add column if not exists registration_count integer not null default 0;

create or replace function public.sync_registration_count()
returns trigger language plpgsql security definer set search_path = public as $$
declare cid uuid := coalesce(new.campaign_id, old.campaign_id);
begin
  update public.campaigns set registration_count = (select count(*) from public.campaign_registrations where campaign_id = cid and status <> 'cancelled') where id = cid;
  if tg_op = 'UPDATE' and new.campaign_id <> old.campaign_id then
    update public.campaigns set registration_count = (select count(*) from public.campaign_registrations where campaign_id = old.campaign_id and status <> 'cancelled') where id = old.campaign_id;
  end if;
  return null;
end $$;
revoke all on function public.sync_registration_count() from public, anon, authenticated;

create trigger campaign_registrations_count after insert or update or delete on public.campaign_registrations
  for each row execute function public.sync_registration_count();

update public.campaigns c set registration_count = (select count(*) from public.campaign_registrations r where r.campaign_id = c.id and r.status <> 'cancelled');
