-- 참여형(행사) 캠페인: 참가 신청서를 사이트에서 받는다 (구글 폼 대체)
alter table public.campaigns
  add column if not exists details jsonb not null default '{}'::jsonb,     -- {intro, schedule, course, benefits[], complete, notes}
  add column if not exists fee_amount bigint not null default 0,           -- 참가비 (0 = 무료 또는 미정)
  add column if not exists registration_open boolean not null default true,
  add column if not exists capacity integer;                               -- null = 제한 없음

create type public.registration_status as enum ('pending', 'confirmed', 'cancelled');

create table public.campaign_registrations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  name text not null check (char_length(name) between 1 and 50),
  phone text,
  email text not null,
  gender text check (gender in ('남자', '여자')),
  age_group text,
  depositor_name text,
  agreements jsonb not null default '[]'::jsonb,   -- 확인한 안내 항목 목록
  status public.registration_status not null default 'pending',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, email)
);
create index campaign_registrations_campaign_idx on public.campaign_registrations (campaign_id, created_at desc);
create trigger campaign_registrations_touch before update on public.campaign_registrations for each row execute function public.touch_updated_at();

alter table public.campaign_registrations enable row level security;
create policy "admin all registrations" on public.campaign_registrations for all using (public.is_admin()) with check (public.is_admin());
create policy "own registrations" on public.campaign_registrations for select using (user_id = auth.uid());
-- 비회원도 이메일만 있으면 신청할 수 있다 (회원이면 user_id를 함께 기록)
create policy "register for open event" on public.campaign_registrations for insert
  with check (
    email is not null
    and (user_id is null or user_id = auth.uid())
    and exists (select 1 from public.campaigns c where c.id = campaign_id and c.type = 'event' and c.review = 'approved' and c.registration_open and now() < c.end_at)
  );

