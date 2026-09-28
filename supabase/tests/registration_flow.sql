-- 자동 점검: 행사 참가 신청 → 입금 확인(정원) → 명단 파기, 그리고 권한별 접근.
-- 실행: psql -v ON_ERROR_STOP=1 -f supabase/tests/registration_flow.sql (CI에서는 로컬 Supabase DB)
-- 전부 하나의 트랜잭션 안에서 만들고 마지막에 되돌리므로 데이터가 남지 않는다. 실패하면 이유와 함께 멈춘다.
begin;

do $t$
declare
  su   constant uuid := '00000000-0000-4000-8000-00000000c101';  -- 최고 관리자
  ed   constant uuid := '00000000-0000-4000-8000-00000000c102';  -- 콘텐츠 관리자(최고 관리자 아님)
  mem  constant uuid := '00000000-0000-4000-8000-00000000c103';  -- 일반 회원
  camp constant uuid := '00000000-0000-4000-8000-00000000c201';
  r1 uuid; r2 uuid; r3 uuid;
  n int; ok boolean; msg text;
begin
  -- 준비: 계정 3개(가입 트리거가 프로필을 만든다), 정원 2명짜리 행사
  insert into auth.users (id, email, aud, role, raw_user_meta_data) values
    (su,  'ci-super@test.invalid',  'authenticated', 'authenticated', '{"name":"점검 최고관리자"}'),
    (ed,  'ci-editor@test.invalid', 'authenticated', 'authenticated', '{"name":"점검 콘텐츠관리자"}'),
    (mem, 'ci-member@test.invalid', 'authenticated', 'authenticated', '{"name":"점검 회원"}');
  update public.profiles set role = 'admin', admin_role = 'super' where id = su;
  update public.profiles set role = 'admin', admin_role = 'content' where id = ed;
  insert into public.campaigns (id, slug, partner_name, title, type, review, start_at, end_at, registration_open, capacity, details)
  values (camp, 'ci-test-run', '자동 점검', '자동 점검 행사', 'event', 'approved', now() - interval '1 day', now() + interval '1 day', true, 2,
          '{"questions":[{"key":"course","label":"코스 선택","options":["10km 완주","5km 완주"]}]}');

  -- 1. 비회원 신청: 대기(pending)로만 들어가고, 명단은 볼 수 없다
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  execute 'set local role anon';
  insert into public.campaign_registrations (campaign_id, name, phone, email, gender, age_group, depositor_name, answers)
  values (camp, '신청자 하나', '010-0000-0001', 'one@test.invalid', '여자', '30대', '신청자 하나', '{"course":"10km 완주"}'),
         (camp, '신청자 둘',  '010-0000-0002', 'two@test.invalid', '남자', '40대', '신청자 둘',  '{"course":"5km 완주"}'),
         (camp, '신청자 셋',  '010-0000-0003', 'three@test.invalid', '여자', '20대', '신청자 셋', '{"course":"5km 완주"}');
  select count(*) into n from public.campaign_registrations;
  if n <> 0 then raise exception '[비회원] 신청자 명단이 보임 (%건)', n; end if;
  ok := false;
  begin
    insert into public.campaign_registrations (campaign_id, name, email, status) values (camp, '스스로 확정', 'self@test.invalid', 'confirmed');
  exception when insufficient_privilege then ok := true; end;
  if not ok then raise exception '[비회원] 입금 확인 상태로 직접 신청할 수 있음'; end if;
  ok := false;
  begin
    insert into public.campaign_registrations (campaign_id, name, email) values (camp, '중복', 'one@test.invalid');
  exception when unique_violation then ok := true; end;
  if not ok then raise exception '[비회원] 같은 이메일로 두 번 신청됨'; end if;
  execute 'reset role';

  select id into r1 from public.campaign_registrations where email = 'one@test.invalid';
  select id into r2 from public.campaign_registrations where email = 'two@test.invalid';
  select id into r3 from public.campaign_registrations where email = 'three@test.invalid';
  select registration_count into n from public.campaigns where id = camp;
  if n <> 3 then raise exception '[집계] 신청 수가 3이 아님 (%)', n; end if;

  -- 2. 일반 회원: 명단을 못 보고, 입금 확인도 못 하고, 자기 권한도 못 올린다
  perform set_config('request.jwt.claims', json_build_object('role', 'authenticated', 'sub', mem)::text, true);
  execute 'set local role authenticated';
  select count(*) into n from public.campaign_registrations;
  if n <> 0 then raise exception '[회원] 다른 사람 신청이 보임 (%건)', n; end if;
  update public.campaign_registrations set status = 'confirmed' where id = r1;
  get diagnostics n = row_count;
  if n <> 0 then raise exception '[회원] 입금 확인을 할 수 있음'; end if;
  ok := false;
  begin
    update public.profiles set role = 'admin', admin_role = 'super' where id = mem;
  exception when others then ok := true; end;
  if not ok then raise exception '[회원] 스스로 관리자가 될 수 있음'; end if;
  execute 'reset role';

  -- 3. 관리자 입금 확인: 정원(2명)까지 확인되고, 초과는 막히고, 차면 신청이 마감된다
  perform set_config('request.jwt.claims', json_build_object('role', 'authenticated', 'sub', su)::text, true);
  execute 'set local role authenticated';
  select count(*) into n from public.campaign_registrations where campaign_id = camp;
  if n <> 3 then raise exception '[관리자] 명단이 3건이 아님 (%)', n; end if;
  update public.campaign_registrations set status = 'confirmed' where id in (r1, r2);
  select confirmed_count into n from public.campaigns where id = camp;
  if n <> 2 then raise exception '[입금 확인] 확인 인원이 2가 아님 (%)', n; end if;
  ok := false;
  begin
    update public.campaign_registrations set status = 'confirmed' where id = r3;
  exception when others then get stacked diagnostics msg = message_text; ok := msg = 'capacity_full'; end;
  if not ok then raise exception '[입금 확인] 정원을 넘겨 확인됨 (%)', coalesce(msg, '오류 없음'); end if;
  execute 'reset role';

  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  execute 'set local role anon';
  ok := false;
  begin
    insert into public.campaign_registrations (campaign_id, name, email) values (camp, '마감 후 신청', 'late@test.invalid');
  exception when insufficient_privilege then ok := true; end;
  if not ok then raise exception '[마감] 정원이 찼는데 신청이 들어감'; end if;
  execute 'reset role';

  -- 확인 취소하면 자리가 다시 난다
  perform set_config('request.jwt.claims', json_build_object('role', 'authenticated', 'sub', su)::text, true);
  execute 'set local role authenticated';
  update public.campaign_registrations set status = 'cancelled' where id = r1;
  select confirmed_count into n from public.campaigns where id = camp;
  if n <> 1 then raise exception '[취소] 확인 인원이 1로 줄지 않음 (%)', n; end if;
  update public.campaign_registrations set status = 'confirmed' where id = r3;
  select confirmed_count into n from public.campaigns where id = camp;
  if n <> 2 then raise exception '[취소 후 확인] 빈자리에 확인되지 않음 (%)', n; end if;
  execute 'reset role';

  -- 4. 명단 파기: 최고 관리자만, 마감 이후에만. 파기하면 개인정보가 지워지고 인원 집계는 남는다
  perform set_config('request.jwt.claims', json_build_object('role', 'authenticated', 'sub', ed)::text, true);
  execute 'set local role authenticated';
  ok := false;
  begin perform public.purge_campaign_registrations(camp);
  exception when others then get stacked diagnostics msg = message_text; ok := msg = 'forbidden'; end;
  if not ok then raise exception '[파기] 최고 관리자가 아닌데 파기됨 (%)', coalesce(msg, '오류 없음'); end if;
  execute 'reset role';

  perform set_config('request.jwt.claims', json_build_object('role', 'authenticated', 'sub', su)::text, true);
  execute 'set local role authenticated';
  ok := false;
  begin perform public.purge_campaign_registrations(camp);
  exception when others then get stacked diagnostics msg = message_text; ok := msg = 'not_ended'; end;
  if not ok then raise exception '[파기] 마감 전에 파기됨 (%)', coalesce(msg, '오류 없음'); end if;
  execute 'reset role';

  update public.campaigns set end_at = now() - interval '1 minute' where id = camp;
  perform set_config('request.jwt.claims', json_build_object('role', 'authenticated', 'sub', su)::text, true);
  execute 'set local role authenticated';
  n := public.purge_campaign_registrations(camp);
  if n <> 3 then raise exception '[파기] 3건이 아니라 %건 파기됨', n; end if;
  select count(*) into n from public.campaign_registrations
   where campaign_id = camp and (name <> '파기됨' or phone is not null or depositor_name is not null or email not like 'purged-%@purged.invalid');
  if n <> 0 then raise exception '[파기] 개인정보가 남은 신청 %건', n; end if;
  select confirmed_count into n from public.campaigns where id = camp;
  if n <> 2 then raise exception '[파기] 입금 확인 인원 집계가 바뀜 (%)', n; end if;
  select count(*) into n from public.audit_logs where target_id = camp::text and action = '참가자 명단 파기';
  if n <> 1 then raise exception '[파기] 작업 기록이 남지 않음'; end if;
  execute 'reset role';

  raise notice '자동 점검 통과: 신청·입금 확인·정원·명단 파기·권한';
end $t$;

rollback;
