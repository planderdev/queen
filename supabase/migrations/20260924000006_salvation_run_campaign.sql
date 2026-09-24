-- 첫 번째 실제 캠페인: [우리도 오늘은 구세군] 기부런 (구글 폼 참가 신청서 이관)
-- 예시용 가상 캠페인 2건은 목록에서 숨긴다.
update public.campaigns set review = 'draft' where slug in ('double-heart', 'small-promise');

insert into public.campaigns (id, slug, partner_name, title, description, type, fundraiser_id, limit_amount, rate, image, review, start_at, end_at, details, fee_amount, registration_open)
values (
  '33333333-0000-4000-8000-000000000010',
  'salvation-run-2026',
  '아식스 구제주 칠성점 × 제주야미소영',
  '[우리도 오늘은 구세군] 기부런',
  '함께 달리고, 함께 나누는 하루. 추운 겨울이면 우리 곁에서 사랑의 종을 울리던 구세군, 이제는 우리가 그 마음을 이어가 보려고 합니다.',
  'event',
  null, 0, 1,
  '/assets/images/ocean.jpg',
  'approved',
  now(),
  '2026-10-10T08:00:00+09:00',
  jsonb_build_object(
    'intro', E'함께 달리고, 함께 나누는 하루.\n추운 겨울이면 우리 곁에서 사랑의 종을 울리던 구세군\n\n이제는 우리가 그 마음을 이어가 보려고 합니다.\n한걸음이 모이면 따뜻한 마음이 되고\n우리의 달리기가 누군가에게 작은 희망이 됩니다.\n\n아식스 구제주 칠성점 X 제주야미소영이 함께하는 기부런, 여러분의 많은 참여를 기다립니다.',
    'event_name', '우리도 오늘은 구세군 기부런',
    'schedule', '2026년 10월 10일 (토) 08:00 ~ 10:00',
    'course', '10KM · 해변공연장 앞 집결 → 탑동 → 동한두기 → 구름다리 → 용담해안도로 → 어영공원 (왕복)',
    'benefits', jsonb_build_array('꽝 없는 경품행사', '1등 아식스 노바 6 운동화', '2등 아식스 가방', '3등 아식스 티셔츠', '4등 아식스 고급 양말', '5등 킹스테이블 3만원 상품권 × 7매', '6등 모두에게 소정의 기념품 증정'),
    'agreements', jsonb_build_array('본 행사는 달리기를 통해 나눔을 실천하는 기부 행사임을 확인했습니다', '참가비 및 기부금의 사용처에 대한 안내를 확인했습니다', '본인의 건강상태를 고려하며 무리하지 않고 안전하게 참여하겠습니다'),
    'complete', E'신청해주셔서 감사합니다.\n\n여러분의 한 걸음이 누군가에게는 따뜻한 겨울이 될 수 있습니다.\n\n우리도 오늘은 구세군, 함께 달리고, 함께 나누겠습니다.'
  ),
  0,
  true
)
on conflict (id) do update set details = excluded.details, description = excluded.description, title = excluded.title, partner_name = excluded.partner_name, end_at = excluded.end_at;
