-- 행사 종료 후 참가자 명단 파기(비식별화). 최고 관리자만, 신청 마감 이후에만 실행할 수 있다.
-- 행을 지우지 않고 개인 식별 정보만 되돌릴 수 없게 지운다 → 입금 확인 인원·상태·신청 시각·코스 선택 같은 통계는 남는다.
-- 운영 이력(audit_logs)에 남은 신청자 이름·메모도 함께 지운다.
create or replace function public.purge_campaign_registrations(p_campaign uuid)
returns integer language plpgsql security definer set search_path = public as $$
declare
  v_end timestamptz;
  n integer;
begin
  -- 빈 역할 목록이면 has_admin_role은 최고 관리자(super)만 참이 된다
  if not public.has_admin_role(array[]::public.admin_role[]) then
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
