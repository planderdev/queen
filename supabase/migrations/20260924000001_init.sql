-- 퀸만덕 실서비스 1차 스키마 (기부자 + 관리자, 결제 없이 계좌이체 입금 확인)
-- 적용: supabase db push  (또는 Supabase 대시보드 SQL editor에 순서대로 실행)

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 열거형
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('donor', 'admin');
create type public.admin_role as enum ('super', 'content', 'review', 'finance');
create type public.review_status as enum ('draft', 'submitted', 'reviewing', 'revision', 'approved', 'rejected');
create type public.publication_status as enum ('scheduled', 'active', 'paused', 'ended');
create type public.donation_kind as enum ('donation', 'recurring', 'refund');
create type public.donation_status as enum ('pending', 'processing', 'success', 'failed', 'cancelled');
create type public.plan_status as enum ('active', 'paused', 'cancelled');
create type public.campaign_type as enum ('matching', 'cheer');
create type public.content_type as enum ('notice', 'faq', 'story', 'news', 'banner', 'recommend');
create type public.request_status as enum ('requested', 'approved', 'rejected', 'resolved');
create type public.payout_status as enum ('scheduled', 'approved', 'paid');

-- ---------------------------------------------------------------------------
-- 프로필 (auth.users 1:1)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  name text not null default '',
  role public.user_role not null default 'donor',
  admin_role public.admin_role,
  interests text[] not null default '{}',
  is_public boolean not null default true,
  suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and not suspended);
$$;

create or replace function public.has_admin_role(roles public.admin_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and not suspended
      and (admin_role = 'super' or admin_role = any (roles))
  );
$$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 단체 · 모금함
-- ---------------------------------------------------------------------------
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  description text not null default '',
  image text,
  status public.review_status not null default 'approved',
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger organizations_touch before update on public.organizations for each row execute function public.touch_updated_at();

create table public.fundraisers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  organization_id uuid not null references public.organizations (id) on delete restrict,
  title text not null,
  story text not null default '',
  image text,
  category text not null,
  region text not null default '전국',
  target bigint not null check (target > 0),
  start_at timestamptz not null,
  end_at timestamptz not null,
  budget jsonb not null default '[]'::jsonb,   -- [{label, amount}]
  review public.review_status not null default 'approved',
  publication public.publication_status not null default 'active',
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_at > start_at)
);
create index fundraisers_public_idx on public.fundraisers (review, publication, start_at);
create trigger fundraisers_touch before update on public.fundraisers for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 기부 원장
-- ---------------------------------------------------------------------------
create table public.recurring_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete restrict,
  amount bigint not null check (amount >= 1000 and amount <= 10000000),
  day smallint not null check (day between 1 and 31),
  next_date date not null,
  status public.plan_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index recurring_plans_user_idx on public.recurring_plans (user_id);
create trigger recurring_plans_touch before update on public.recurring_plans for each row execute function public.touch_updated_at();

create table public.donations (
  id uuid primary key default gen_random_uuid(),
  number text not null unique default ('QM-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(gen_random_uuid()::text, 1, 6))),
  user_id uuid references public.profiles (id) on delete set null,
  fundraiser_id uuid references public.fundraisers (id) on delete restrict,
  organization_id uuid references public.organizations (id) on delete restrict,
  plan_id uuid references public.recurring_plans (id) on delete set null,
  kind public.donation_kind not null default 'donation',
  amount bigint not null check (amount >= 1000 and amount <= 10000000),
  status public.donation_status not null default 'pending',
  method text not null default 'transfer',            -- 1차: 계좌이체 입금 확인
  depositor_name text,                                -- 입금자명
  anonymous boolean not null default false,
  message text not null default '',
  original_id uuid references public.donations (id),  -- refund → 원거래
  confirmed_at timestamptz,
  confirmed_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  check (fundraiser_id is not null or organization_id is not null)
);
create index donations_user_idx on public.donations (user_id, created_at desc);
create index donations_fundraiser_idx on public.donations (fundraiser_id, status);
create index donations_status_idx on public.donations (status, created_at desc);

create table public.refund_requests (
  id uuid primary key default gen_random_uuid(),
  donation_id uuid not null references public.donations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null,
  status public.request_status not null default 'requested',
  review_reason text,
  reviewed_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger refund_requests_touch before update on public.refund_requests for each row execute function public.touch_updated_at();

create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  fundraiser_id uuid not null references public.fundraisers (id) on delete restrict,
  amount bigint not null,
  status public.payout_status not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger payouts_touch before update on public.payouts for each row execute function public.touch_updated_at();

create table public.impact_reports (
  id uuid primary key default gen_random_uuid(),
  fundraiser_id uuid not null references public.fundraisers (id) on delete cascade,
  title text not null,
  body text not null,
  spent bigint not null default 0,
  status public.review_status not null default 'approved',
  reason text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 캠페인 · 참여
-- ---------------------------------------------------------------------------
create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  partner_name text not null,
  title text not null,
  description text not null default '',
  type public.campaign_type not null default 'cheer',
  fundraiser_id uuid references public.fundraisers (id) on delete set null,
  limit_amount bigint not null default 0,
  rate numeric(4,2) not null default 1,
  image text,
  review public.review_status not null default 'approved',
  start_at timestamptz not null,
  end_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.participations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (campaign_id, user_id)
);

create table public.matching_contributions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  donation_id uuid not null references public.donations (id) on delete cascade,
  fundraiser_id uuid not null references public.fundraisers (id) on delete cascade,
  amount bigint not null,
  status public.request_status not null default 'approved',
  created_at timestamptz not null default now(),
  unique (campaign_id, donation_id)
);

-- ---------------------------------------------------------------------------
-- 커뮤니티 · 콘텐츠
-- ---------------------------------------------------------------------------
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  fundraiser_id uuid not null references public.fundraisers (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index comments_fundraiser_idx on public.comments (fundraiser_id, created_at desc);

create table public.comment_reports (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null,
  status public.request_status not null default 'requested',
  resolution text,
  created_at timestamptz not null default now()
);

create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('fundraiser', 'story', 'campaign', 'organization')),
  target_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  email text,
  category text not null,
  title text not null,
  body text not null,
  answer text,
  answered_at timestamptz,
  answered_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);
create index inquiries_user_idx on public.inquiries (user_id, created_at desc);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  text text not null,
  href text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, read, created_at desc);

create table public.content (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  type public.content_type not null,
  title text not null,
  body text not null default '',
  category text,
  image text,
  fundraiser_id uuid references public.fundraisers (id) on delete set null,
  published boolean not null default true,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index content_type_idx on public.content (type, published, created_at desc);
create trigger content_touch before update on public.content for each row execute function public.touch_updated_at();

create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  detail jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_created_idx on public.audit_logs (created_at desc);

-- ---------------------------------------------------------------------------
-- 집계 뷰: 성공 거래만 합산 (환불은 음수)
-- ---------------------------------------------------------------------------
create or replace view public.fundraiser_stats
with (security_invoker = false) as
select
  f.id as fundraiser_id,
  coalesce(sum(case when d.status = 'success' and d.kind <> 'refund' then d.amount when d.status = 'success' and d.kind = 'refund' then -d.amount else 0 end), 0)::bigint as direct,
  coalesce((select sum(m.amount) from public.matching_contributions m where m.fundraiser_id = f.id and m.status = 'approved'), 0)::bigint as matching,
  count(distinct case when d.status = 'success' and d.kind <> 'refund' then coalesce(d.user_id::text, d.id::text) end)::int as donors,
  coalesce((select sum(p.amount) from public.payouts p where p.fundraiser_id = f.id and p.status = 'paid'), 0)::bigint as paid
from public.fundraisers f
left join public.donations d on d.fundraiser_id = f.id
group by f.id;

-- 공개 여부: 승인 + 단체 승인 + 시작일 도래 + 게시 상태
create or replace function public.fundraiser_is_public(f public.fundraisers)
returns boolean language sql stable as $$
  select f.review = 'approved'
     and f.publication in ('active', 'paused', 'ended')
     and f.start_at <= now()
     and exists (select 1 from public.organizations o where o.id = f.organization_id and o.status = 'approved');
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.fundraisers enable row level security;
alter table public.recurring_plans enable row level security;
alter table public.donations enable row level security;
alter table public.refund_requests enable row level security;
alter table public.payouts enable row level security;
alter table public.impact_reports enable row level security;
alter table public.campaigns enable row level security;
alter table public.participations enable row level security;
alter table public.matching_contributions enable row level security;
alter table public.comments enable row level security;
alter table public.comment_reports enable row level security;
alter table public.bookmarks enable row level security;
alter table public.inquiries enable row level security;
alter table public.notifications enable row level security;
alter table public.content enable row level security;
alter table public.settings enable row level security;
alter table public.audit_logs enable row level security;

-- 관리자: 전체 접근 (역할별 세부 제한은 서버 액션에서 has_admin_role로 검증)
create policy "admin all profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all organizations" on public.organizations for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all fundraisers" on public.fundraisers for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all plans" on public.recurring_plans for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all donations" on public.donations for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all refunds" on public.refund_requests for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all payouts" on public.payouts for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all reports" on public.impact_reports for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all campaigns" on public.campaigns for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all participations" on public.participations for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all matching" on public.matching_contributions for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all comments" on public.comments for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all comment reports" on public.comment_reports for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all bookmarks" on public.bookmarks for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all inquiries" on public.inquiries for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all notifications" on public.notifications for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all content" on public.content for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all settings" on public.settings for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all audit" on public.audit_logs for all using (public.is_admin()) with check (public.is_admin());

-- 프로필: 본인 조회·수정 (role/admin_role 변경은 트리거로 차단)
create policy "own profile read" on public.profiles for select using (id = auth.uid());
create policy "own profile update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create or replace function public.guard_profile_role()
returns trigger language plpgsql as $$
begin
  if not public.is_admin() and (new.role is distinct from old.role or new.admin_role is distinct from old.admin_role or new.suspended is distinct from old.suspended) then
    raise exception '권한 필드는 관리자만 변경할 수 있습니다.';
  end if;
  return new;
end $$;
create trigger profiles_guard_role before update on public.profiles for each row execute function public.guard_profile_role();

-- 공개 읽기
create policy "public organizations" on public.organizations for select using (status = 'approved');
create policy "public fundraisers" on public.fundraisers for select using (public.fundraiser_is_public(fundraisers));
create policy "public campaigns" on public.campaigns for select using (review = 'approved');
create policy "public content" on public.content for select using (published);
create policy "public comments" on public.comments for select using (not hidden);
create policy "public impact reports" on public.impact_reports for select using (status = 'approved');
create policy "public settings" on public.settings for select using (true);
-- 공개 참여 내역: 성공 거래의 익명 여부·금액만 (user_id는 뷰에서 제거)
create policy "public success donations" on public.donations for select using (status = 'success');

-- 기부자 본인
create policy "own donations" on public.donations for select using (user_id = auth.uid());
create policy "own donation insert" on public.donations for insert with check (user_id = auth.uid() and status = 'pending' and kind in ('donation','recurring'));
create policy "own plans" on public.recurring_plans for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own refunds" on public.refund_requests for select using (user_id = auth.uid());
create policy "own refund insert" on public.refund_requests for insert with check (user_id = auth.uid());
create policy "own participations" on public.participations for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own comments insert" on public.comments for insert with check (user_id = auth.uid());
create policy "own comments read" on public.comments for select using (user_id = auth.uid());
create policy "own comment reports" on public.comment_reports for insert with check (user_id = auth.uid());
create policy "own bookmarks" on public.bookmarks for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own inquiries" on public.inquiries for select using (user_id = auth.uid());
create policy "inquiry insert" on public.inquiries for insert with check (user_id = auth.uid() or (user_id is null and email is not null));
create policy "own notifications" on public.notifications for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 공개 참여 내역 뷰 (개인정보 제거)
create or replace view public.public_donations
with (security_invoker = true) as
select d.id, d.fundraiser_id, d.amount, d.anonymous, d.message, d.created_at,
       case when d.anonymous then null else p.name end as donor_name
from public.donations d
left join public.profiles p on p.id = d.user_id
where d.status = 'success' and d.kind = 'donation';

grant usage on schema public to anon, authenticated;
grant select on public.fundraiser_stats, public.public_donations to anon, authenticated;
