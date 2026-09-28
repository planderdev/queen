-- 예시(샘플) 데이터 삭제. 초기 시드(20260924000002)로 넣었던 단체·모금함·기부 내역·예시 캠페인·예시 글을 지운다.
-- 남기는 것: 기부런 캠페인(33333333-…-010)과 신청자, 기부런 마감 공지(44444444-…-013), 실제 문의, 관리자 기록, 설정.
-- 예시 데이터가 다시 필요하면 20260924000002_seed.sql에서 되살릴 수 있다.

-- 글: 나눔이야기 3편, 예시 공지 2건, 후원 FAQ 6개
delete from public.content where id in (
  '44444444-0000-4000-8000-000000000001', '44444444-0000-4000-8000-000000000002', '44444444-0000-4000-8000-000000000003',
  '44444444-0000-4000-8000-000000000011', '44444444-0000-4000-8000-000000000012',
  '44444444-0000-4000-8000-000000000021', '44444444-0000-4000-8000-000000000022', '44444444-0000-4000-8000-000000000023',
  '44444444-0000-4000-8000-000000000024', '44444444-0000-4000-8000-000000000025', '44444444-0000-4000-8000-000000000026'
);

-- 숨겨 둔 예시 캠페인 2개
delete from public.campaigns where id in ('33333333-0000-4000-8000-000000000001', '33333333-0000-4000-8000-000000000002');

-- 예시 기부 내역 → 예시 모금함 → 예시 단체 (참조 순서대로)
delete from public.donations where id::text like '55555555-0000-4000-8000-%' and user_id is null;
delete from public.fundraisers where id::text like '22222222-0000-4000-8000-%';
delete from public.organizations where id::text like '11111111-0000-4000-8000-%';

-- 지우면 안 되는 것이 남았는지 확인 (하나라도 어긋나면 전체를 되돌린다)
do $$
begin
  if not exists (select 1 from public.campaigns where id = '33333333-0000-4000-8000-000000000010') then raise exception '기부런 캠페인이 사라짐'; end if;
  if not exists (select 1 from public.content where id = '44444444-0000-4000-8000-000000000013') then raise exception '기부런 마감 공지가 사라짐'; end if;
  if exists (select 1 from public.fundraisers) or exists (select 1 from public.organizations) or exists (select 1 from public.donations) then
    raise exception '예시 후원 데이터가 남음';
  end if;
end $$;
