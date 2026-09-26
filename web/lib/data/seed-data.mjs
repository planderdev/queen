// Seed content for the production service. One source for (1) the in-memory repository used before
// a database is connected and (2) the SQL seed migration (npm run seed:sql). All organizations,
// stories and figures are fictional examples carried over from the demo.
// Dates are relative to the build/request moment so preview data never goes stale; the SQL seed
// emits the same offsets as now() + interval (see scripts/seed-sql.mjs).
const BASE = Date.now();
const day = (n) => new Date(BASE + n * 86400000).toISOString();
export const dayOffset = (iso) => Math.round((new Date(iso).getTime() - BASE) / 86400000);
export const photos = {
  meal: '/assets/images/meal.jpg',
  child: '/assets/images/child.jpg',
  dog: '/assets/images/dog.jpg',
  forest: '/assets/images/forest.jpg',
  community: '/assets/images/community.jpg',
  ocean: '/assets/images/ocean.jpg'
};
export const categories = ['아동·청소년', '어르신', '장애인', '위기가정', '동물', '환경', '재난·긴급지원', '지역사회'];
export const regions = ['서울', '경기', '제주'];
export const bank = { holder: '퀸만덕', bank: '입금 계좌 확정 전', account: '000-0000-0000' };

const STORY = '한 끼의 식사, 한 권의 책, 곁을 지키는 작은 관심. 평범한 일상을 이어가는 데에는 함께하는 마음이 필요합니다. 우리 동네의 이웃들이 안정적으로 일상을 이어갈 수 있도록 여러분의 마음을 전해주세요.\n\n모인 기부금은 아래 사용 계획에 따라 사용하며, 활동 이후 결과보고를 통해 전달 과정과 집행 내역을 나누겠습니다.';

export const organizations = [
  { id: '11111111-0000-4000-8000-000000000001', slug: 'ongi', name: '온기나눔', category: '어르신', description: '이웃의 일상에 따뜻함을 전하는 단체입니다. 지역 어르신의 식사와 안부를 살핍니다.', image: photos.meal, status: 'approved', created_at: day(-60) },
  { id: '11111111-0000-4000-8000-000000000002', slug: 'naeil', name: '내일을잇다', category: '아동·청소년', description: '아이들의 배움과 내일을 응원하는 단체입니다. 학습 공간과 도서를 지원합니다.', image: photos.child, status: 'approved', created_at: day(-60) },
  { id: '11111111-0000-4000-8000-000000000003', slug: 'earth', name: '함께하는지구', category: '환경', description: '모든 생명이 함께하는 일상을 꿈꾸는 단체입니다. 숲과 유기동물을 돌봅니다.', image: photos.forest, status: 'approved', created_at: day(-60) }
];

const specs = [
  ['ongi', '어르신', '어르신의 하루에\n따뜻한 한 끼를 전해주세요', 'meal', 5000000, 3240000, 12, 'warm-meal'],
  ['naeil', '아동·청소년', '아이들의 배움이\n멈추지 않도록', 'child', 8000000, 5720000, 23, 'keep-learning'],
  ['earth', '동물', '다시 가족을 만날 때까지,\n유기견들의 든든한 울타리', 'dog', 4000000, 1860000, 8, 'dog-shelter'],
  ['ongi', '환경', '우리의 작은 실천으로\n숲의 내일을 지켜요', 'forest', 6000000, 4620000, 18, 'forest-tomorrow'],
  ['naeil', '위기가정', '다시 시작하는 가족에게\n안전한 일상을 선물해요', 'community', 5000000, 2180000, 6, 'safe-home'],
  ['earth', '장애인', '누구나 편안하게\n함께하는 동네 만들기', 'community', 3000000, 3090000, 30, 'town-for-all'],
  ['ongi', '재난·긴급지원', '갑작스러운 재난 이후,\n일상으로 돌아가는 길', 'ocean', 9000000, 2010000, 4, 'after-disaster'],
  ['naeil', '지역사회', '서로의 안부를 묻는\n우리 동네 작은 식탁', 'meal', 2500000, 790000, 16, 'small-table'],
  ['earth', '어르신', '이웃과 나눈 따뜻한 식탁,\n그 이후의 이야기', 'meal', 2000000, 2100000, -2, 'table-afterwards', 'ended'],
  ['ongi', '아동·청소년', '겨울방학에도 멈추지 않는\n아이들의 든든한 한 끼', 'child', 3000000, 3000000, -10, 'winter-meal', 'ended', -40]
];
const orgId = (slug) => organizations.find((o) => o.slug === slug).id;
export const fundraisers = specs.map((s, i) => ({
  id: `22222222-0000-4000-8000-0000000000${String(i + 1).padStart(2, '0')}`,
  slug: s[7],
  organization_id: orgId(s[0]),
  category: s[1],
  title: s[2],
  image: photos[s[3]],
  target: s[4],
  seedAmount: s[5],
  region: regions[i % 3],
  start_at: day(s[9] ?? -20),
  end_at: day(s[6]),
  review: 'approved',
  publication: s[8] ?? 'active',
  story: STORY,
  budget: [{ label: '물품 및 활동 지원', amount: s[4] * 0.8 }, { label: '전달 및 운영 지원', amount: s[4] * 0.2 }],
  reason: null,
  created_at: day((s[9] ?? -20) + i)
}));

const campaignBase = { details: {}, fee_amount: 0, registration_open: true, capacity: null };
// 예시용 가상 캠페인 2건은 실제 캠페인이 등록되어 목록에서 숨김(draft). 운영자가 필요하면 승인 상태로 바꿔 다시 노출할 수 있다.
export const campaigns = [
  { ...campaignBase, id: '33333333-0000-4000-8000-000000000001', slug: 'double-heart', partner_name: '초록내일 컴퍼니', title: '함께하면 두 배가 되는 마음', description: '여러분의 나눔에 초록내일 컴퍼니가 같은 마음을 보탭니다.', type: 'matching', fundraiser_id: fundraisers[0].id, limit_amount: 1000000, rate: 1, review: 'draft', start_at: fundraisers[0].start_at, end_at: fundraisers[0].end_at, image: photos.community, created_at: day(-20) },
  { ...campaignBase, id: '33333333-0000-4000-8000-000000000002', slug: 'small-promise', partner_name: '초록내일 컴퍼니', title: '지구를 위한 작은 약속', description: '오늘 한 번, 일회용품 줄이기를 함께 약속해요. 응원은 금전 기부로 환산되지 않습니다.', type: 'cheer', fundraiser_id: fundraisers[3].id, limit_amount: 0, rate: 1, review: 'draft', start_at: fundraisers[0].start_at, end_at: fundraisers[0].end_at, image: photos.forest, created_at: day(-20) },
  // 첫 번째 실제 캠페인 — 구글 폼 "[우리도 오늘은 구세군] 기부런 참가 신청서" 이관. DB에는 20260924000006 마이그레이션이 넣는다(seed:sql에서는 제외).
  {
    id: '33333333-0000-4000-8000-000000000010', slug: 'salvation-run-2026', partner_name: '아식스 구제주 칠성점 × 제주야미소영', title: '[우리도 오늘은 구세군] 기부런',
    description: '함께 달리고, 함께 나누는 하루. 추운 겨울이면 우리 곁에서 사랑의 종을 울리던 구세군, 이제는 우리가 그 마음을 이어가 보려고 합니다.',
    type: 'event', fundraiser_id: null, limit_amount: 0, rate: 1, review: 'approved', start_at: day(0), end_at: '2026-10-09T23:00:00.000Z', image: '/assets/images/salvation-run.jpg', created_at: day(0),
    fee_amount: 20000, registration_open: true, capacity: 50, registration_count: 0, confirmed_count: 0,
    details: {
      intro: '함께 달리고, 함께 나누는 하루.\n추운 겨울이면 우리 곁에서 사랑의 종을 울리던 구세군\n\n이제는 우리가 그 마음을 이어가 보려고 합니다.\n한걸음이 모이면 따뜻한 마음이 되고\n우리의 달리기가 누군가에게 작은 희망이 됩니다.\n\n아식스 구제주 칠성점 X 제주야미소영이 함께하는 기부런, 여러분의 많은 참여를 기다립니다.',
      event_name: '우리도 오늘은 구세군 기부런',
      schedule: '2026년 10월 10일 (토) 08:00 ~ 10:00',
      course: '해변공연장 앞 집결 → 탑동 → 동한두기 → 구름다리 → 용담해안도로 → 어영공원 (왕복) · 10km 완주 / 5km 완주 중 선택',
      questions: [
        { key: 'pace', label: '평소 러닝 페이스 (1km당)', short: '페이스', required: true, options: ['3~4분대', '4~5분대', '5~6분대', '6~7분대', '7~8분대', '8분 이상'] },
        { key: 'course', label: '코스 선택', short: '코스', required: true, options: ['10km 완주', '5km 완주'] }
      ],
      bank: { bank: 'MG새마을금고', account: '9003-2958-3986-3', holder: '현소영' },
      hero: { heading: ['함께 달리고,', '함께 나누는 하루.'], description: ['10월 10일(토) 오전 8시', '제주 해안도로 기부런'], cta: '기부런 참가 신청' },
      benefits: ['꽝 없는 경품행사', '1등 아식스 노바 6 운동화', '2등 아식스 가방', '3등 아식스 티셔츠', '4등 아식스 고급 양말', '5등 킹스테이블 3만원 상품권 × 7매', '6등 모두에게 소정의 기념품 증정'],
      agreements: ['본 행사는 달리기를 통해 나눔을 실천하는 기부 행사임을 확인했습니다', '참가비 및 기부금의 사용처에 대한 안내를 확인했습니다', '본인의 건강상태를 고려하며 무리하지 않고 안전하게 참여하겠습니다'],
      complete: '신청해주셔서 감사합니다.\n\n여러분의 한 걸음이 누군가에게는 따뜻한 겨울이 될 수 있습니다.\n\n우리도 오늘은 구세군, 함께 달리고, 함께 나누겠습니다.'
    }
  }
];

export const content = [
  { id: '44444444-0000-4000-8000-000000000001', slug: 'story-warm-meal', type: 'story', title: '여러분의 마음이, 따뜻한 한 끼가 되었습니다', category: '어르신', image: photos.meal, fundraiser_id: fundraisers[8].id, body: '동네 식탁에 다시 이야기꽃이 피었습니다. 이웃들이 함께 준비한 식사를 나누고 안부를 묻는 시간을 가졌습니다.', published: true, created_at: day(-5) },
  { id: '44444444-0000-4000-8000-000000000002', slug: 'story-new-books', type: 'story', title: '새로운 책과 함께, 더 넓어진 아이들의 세상', category: '아동·청소년', image: photos.child, fundraiser_id: fundraisers[1].id, body: '책을 매개로 마음을 나누는 작은 도서관. 앞으로도 아이들의 속도에 맞춰 배움의 시간을 이어가겠습니다.', published: true, created_at: day(-8) },
  { id: '44444444-0000-4000-8000-000000000003', slug: 'story-small-tree', type: 'story', title: '함께 심은 작은 나무, 우리 동네의 내일', category: '환경', image: photos.forest, fundraiser_id: fundraisers[3].id, body: '이웃과 함께 나무를 심고 돌보는 날. 오래도록 이어질 푸른 변화를 응원합니다.', published: true, created_at: day(-12) },
  { id: '44444444-0000-4000-8000-000000000011', slug: 'notice-open', type: 'notice', title: '퀸만덕의 첫 번째 나눔에 함께해주세요', category: '공지사항', image: null, fundraiser_id: null, body: '퀸만덕이 문을 열었습니다. 마음이 닿는 이야기를 만나고, 나눔 이후의 변화까지 함께 확인하세요.', published: true, created_at: day(-3) },
  { id: '44444444-0000-4000-8000-000000000012', slug: 'notice-transfer', type: 'notice', title: '기부금 입금 확인 안내', category: '공지사항', image: null, fundraiser_id: null, body: '기부 신청 후 안내된 계좌로 입금하시면 영업일 기준 1~2일 안에 확인 후 기부 내역에 반영됩니다. 입금자명은 신청 시 입력한 이름과 같아야 합니다.', published: true, created_at: day(-1) },
  { id: '44444444-0000-4000-8000-000000000021', slug: null, type: 'faq', title: '기부한 금액은 어디서 확인하나요?', category: '기부', image: null, fundraiser_id: null, body: '나의 나눔에서 입금 확인 대기·완료·취소 내역과 순기부액을 확인하고 CSV로 내려받을 수 있습니다.', published: true, created_at: day(-30) },
  { id: '44444444-0000-4000-8000-000000000022', slug: null, type: 'faq', title: '기부는 어떻게 결제하나요?', category: '기부', image: null, fundraiser_id: null, body: '현재는 계좌이체로 진행합니다. 기부 신청 후 안내된 계좌로 입금하면 운영팀이 확인 후 기부 내역에 반영합니다. 카드·간편결제는 준비 중입니다.', published: true, created_at: day(-30) },
  { id: '44444444-0000-4000-8000-000000000023', slug: null, type: 'faq', title: '기부금 영수증을 받을 수 있나요?', category: '기부', image: null, fundraiser_id: null, body: '기부금 영수증 발급 여부와 절차는 단체별로 다르며, 발급 가능한 모금은 상세 페이지에 표시됩니다. 자세한 내용은 1:1 문의로 알려주세요.', published: true, created_at: day(-30) },
  { id: '44444444-0000-4000-8000-000000000024', slug: null, type: 'faq', title: '취소와 환불은 어떻게 하나요?', category: '기부', image: null, fundraiser_id: null, body: '입금 확인 전에는 나의 나눔에서 바로 취소할 수 있습니다. 입금 확인 후 7일 안에는 환불을 요청할 수 있고, 운영팀 확인 후 처리됩니다.', published: true, created_at: day(-30) },
  { id: '44444444-0000-4000-8000-000000000025', slug: null, type: 'faq', title: '정기기부 금액을 바꾸거나 잠시 쉬어갈 수 있나요?', category: '정기기부', image: null, fundraiser_id: null, body: '나의 나눔의 정기기부 메뉴에서 월 금액 변경, 일시중지, 재개 및 해지를 할 수 있습니다.', published: true, created_at: day(-30) },
  { id: '44444444-0000-4000-8000-000000000026', slug: null, type: 'faq', title: '단체와 기업은 어떻게 참여하나요?', category: '파트너', image: null, fundraiser_id: null, body: '모금단체 등록과 기업 캠페인 제안은 1:1 문의 또는 이메일로 접수합니다. 운영팀이 확인 후 절차를 안내합니다.', published: true, created_at: day(-30) }
];
