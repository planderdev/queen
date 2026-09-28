-- 보안 경고 정리: 관리자 확인 함수(is_admin, has_admin_role)를 REST API로 노출되지 않는 private 스키마로 옮긴다.
-- RLS 정책은 함수를 OID로 참조하므로 스키마를 옮겨도 그대로 동작한다. 정책 평가를 위해 anon/authenticated 실행 권한은 유지한다.
-- 함수 본문에서 이름으로 부르는 guard_profile_role, purge_campaign_registrations는 새 위치로 다시 만든다.
create schema if not exists private;
grant usage on schema private to anon, authenticated, service_role;

alter function public.is_admin() set schema private;
alter function public.has_admin_role(public.admin_role[]) set schema private;
revoke all on function private.is_admin() from public;
revoke all on function private.has_admin_role(public.admin_role[]) from public;
grant execute on function private.is_admin() to anon, authenticated, service_role;
grant execute on function private.has_admin_role(public.admin_role[]) to anon, authenticated, service_role;

create or replace function public.guard_profile_role()
returns trigger language plpgsql set search_path = public as $$
begin
  if coalesce(auth.role(), '') in ('anon', 'authenticated')
     and not private.is_admin()
     and (new.role is distinct from old.role or new.admin_role is distinct from old.admin_role or new.suspended is distinct from old.suspended) then
    raise exception '권한 필드는 관리자만 변경할 수 있습니다.';
  end if;
  return new;
end $$;

-- 명단 파기: 호출한 관리자 권한(RLS 'admin all' 정책)으로 실행 — 권한 상승(security definer) 불필요
create or replace function public.purge_campaign_registrations(p_campaign uuid)
returns integer language plpgsql security invoker set search_path = public as $$
declare
  v_end timestamptz;
  n integer;
begin
  if not private.has_admin_role(array[]::public.admin_role[]) then
    raise exception 'forbidden' using errcode = '42501', hint = '최고 관리자만 명단을 파기할 수 있습니다.';
  end if;
  select end_at into v_end from public.campaigns where id = p_campaign for update;
  if not found then raise exception 'not_found' using hint = '캠페인을 찾을 수 없습니다.'; end if;
  if now() < v_end then raise exception 'not_ended' using hint = '신청 마감 이후에 파기할 수 있습니다.'; end if;

  update public.campaign_registrations
     set name = '파기됨', phone = null, email = 'purged-' || id || '@purged.invalid', gender = null, age_group = null,
         depositor_name = null, note = null, user_id = null
   where campaign_id = p_campaign and email not like 'purged-%@purged.invalid';
  get diagnostics n = row_count;

  update public.audit_logs
     set detail = detail - 'name' - 'note'
   where target_type = 'campaign_registration' and detail is not null
     and target_id in (select id::text from public.campaign_registrations where campaign_id = p_campaign);

  update public.campaigns set details = details || jsonb_build_object('purged_at', now()) where id = p_campaign;
  insert into public.audit_logs (actor_id, action, target_type, target_id, detail)
  values (auth.uid(), '참가자 명단 파기', 'campaign', p_campaign::text, jsonb_build_object('count', n));
  return n;
end $$;
revoke all on function public.purge_campaign_registrations(uuid) from public, anon;
grant execute on function public.purge_campaign_registrations(uuid) to authenticated;
