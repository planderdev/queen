-- 초기 콘텐츠 시드 (생성: web/scripts/seed-sql.mjs). 단체·모금·사연·수치는 예시이며 운영 전 실제 값으로 교체합니다.

insert into public.organizations (id, slug, name, category, description, image, status, created_at) values
  ('11111111-0000-4000-8000-000000000001', 'ongi', '온기나눔', '어르신', '이웃의 일상에 따뜻함을 전하는 단체입니다. 지역 어르신의 식사와 안부를 살핍니다.', '/assets/images/meal.jpg', 'approved', (now() + interval '-60 days')),
  ('11111111-0000-4000-8000-000000000002', 'naeil', '내일을잇다', '아동·청소년', '아이들의 배움과 내일을 응원하는 단체입니다. 학습 공간과 도서를 지원합니다.', '/assets/images/child.jpg', 'approved', (now() + interval '-60 days')),
  ('11111111-0000-4000-8000-000000000003', 'earth', '함께하는지구', '환경', '모든 생명이 함께하는 일상을 꿈꾸는 단체입니다. 숲과 유기동물을 돌봅니다.', '/assets/images/forest.jpg', 'approved', (now() + interval '-60 days'))
on conflict (id) do update set slug = excluded.slug, name = excluded.name, category = excluded.category, description = excluded.description, image = excluded.image, status = excluded.status, created_at = excluded.created_at;
insert into public.fundraisers (id, slug, organization_id, title, story, image, category, region, target, start_at, end_at, budget, review, publication, created_at) values
  ('22222222-0000-4000-8000-000000000001', 'warm-meal', '11111111-0000-4000-8000-000000000001', '어르신의 하루에
따뜻한 한 끼를 전해주세요', '한 끼의 식사, 한 권의 책, 곁을 지키는 작은 관심. 평범한 일상을 이어가는 데에는 함께하는 마음이 필요합니다. 우리 동네의 이웃들이 안정적으로 일상을 이어갈 수 있도록 여러분의 마음을 전해주세요.

모인 기부금은 아래 사용 계획에 따라 사용하며, 활동 이후 결과보고를 통해 전달 과정과 집행 내역을 나누겠습니다.', '/assets/images/meal.jpg', '어르신', '서울', 5000000, (now() + interval '-20 days'), (now() + interval '12 days'), '[{"label":"물품 및 활동 지원","amount":4000000},{"label":"전달 및 운영 지원","amount":1000000}]'::jsonb, 'approved', 'active', (now() + interval '-20 days')),
  ('22222222-0000-4000-8000-000000000002', 'keep-learning', '11111111-0000-4000-8000-000000000002', '아이들의 배움이
멈추지 않도록', '한 끼의 식사, 한 권의 책, 곁을 지키는 작은 관심. 평범한 일상을 이어가는 데에는 함께하는 마음이 필요합니다. 우리 동네의 이웃들이 안정적으로 일상을 이어갈 수 있도록 여러분의 마음을 전해주세요.

모인 기부금은 아래 사용 계획에 따라 사용하며, 활동 이후 결과보고를 통해 전달 과정과 집행 내역을 나누겠습니다.', '/assets/images/child.jpg', '아동·청소년', '경기', 8000000, (now() + interval '-20 days'), (now() + interval '23 days'), '[{"label":"물품 및 활동 지원","amount":6400000},{"label":"전달 및 운영 지원","amount":1600000}]'::jsonb, 'approved', 'active', (now() + interval '-19 days')),
  ('22222222-0000-4000-8000-000000000003', 'dog-shelter', '11111111-0000-4000-8000-000000000003', '다시 가족을 만날 때까지,
유기견들의 든든한 울타리', '한 끼의 식사, 한 권의 책, 곁을 지키는 작은 관심. 평범한 일상을 이어가는 데에는 함께하는 마음이 필요합니다. 우리 동네의 이웃들이 안정적으로 일상을 이어갈 수 있도록 여러분의 마음을 전해주세요.

모인 기부금은 아래 사용 계획에 따라 사용하며, 활동 이후 결과보고를 통해 전달 과정과 집행 내역을 나누겠습니다.', '/assets/images/dog.jpg', '동물', '제주', 4000000, (now() + interval '-20 days'), (now() + interval '8 days'), '[{"label":"물품 및 활동 지원","amount":3200000},{"label":"전달 및 운영 지원","amount":800000}]'::jsonb, 'approved', 'active', (now() + interval '-18 days')),
  ('22222222-0000-4000-8000-000000000004', 'forest-tomorrow', '11111111-0000-4000-8000-000000000001', '우리의 작은 실천으로
숲의 내일을 지켜요', '한 끼의 식사, 한 권의 책, 곁을 지키는 작은 관심. 평범한 일상을 이어가는 데에는 함께하는 마음이 필요합니다. 우리 동네의 이웃들이 안정적으로 일상을 이어갈 수 있도록 여러분의 마음을 전해주세요.

모인 기부금은 아래 사용 계획에 따라 사용하며, 활동 이후 결과보고를 통해 전달 과정과 집행 내역을 나누겠습니다.', '/assets/images/forest.jpg', '환경', '서울', 6000000, (now() + interval '-20 days'), (now() + interval '18 days'), '[{"label":"물품 및 활동 지원","amount":4800000},{"label":"전달 및 운영 지원","amount":1200000}]'::jsonb, 'approved', 'active', (now() + interval '-17 days')),
  ('22222222-0000-4000-8000-000000000005', 'safe-home', '11111111-0000-4000-8000-000000000002', '다시 시작하는 가족에게
안전한 일상을 선물해요', '한 끼의 식사, 한 권의 책, 곁을 지키는 작은 관심. 평범한 일상을 이어가는 데에는 함께하는 마음이 필요합니다. 우리 동네의 이웃들이 안정적으로 일상을 이어갈 수 있도록 여러분의 마음을 전해주세요.

모인 기부금은 아래 사용 계획에 따라 사용하며, 활동 이후 결과보고를 통해 전달 과정과 집행 내역을 나누겠습니다.', '/assets/images/community.jpg', '위기가정', '경기', 5000000, (now() + interval '-20 days'), (now() + interval '6 days'), '[{"label":"물품 및 활동 지원","amount":4000000},{"label":"전달 및 운영 지원","amount":1000000}]'::jsonb, 'approved', 'active', (now() + interval '-16 days')),
  ('22222222-0000-4000-8000-000000000006', 'town-for-all', '11111111-0000-4000-8000-000000000003', '누구나 편안하게
함께하는 동네 만들기', '한 끼의 식사, 한 권의 책, 곁을 지키는 작은 관심. 평범한 일상을 이어가는 데에는 함께하는 마음이 필요합니다. 우리 동네의 이웃들이 안정적으로 일상을 이어갈 수 있도록 여러분의 마음을 전해주세요.

모인 기부금은 아래 사용 계획에 따라 사용하며, 활동 이후 결과보고를 통해 전달 과정과 집행 내역을 나누겠습니다.', '/assets/images/community.jpg', '장애인', '제주', 3000000, (now() + interval '-20 days'), (now() + interval '30 days'), '[{"label":"물품 및 활동 지원","amount":2400000},{"label":"전달 및 운영 지원","amount":600000}]'::jsonb, 'approved', 'active', (now() + interval '-15 days')),
  ('22222222-0000-4000-8000-000000000007', 'after-disaster', '11111111-0000-4000-8000-000000000001', '갑작스러운 재난 이후,
일상으로 돌아가는 길', '한 끼의 식사, 한 권의 책, 곁을 지키는 작은 관심. 평범한 일상을 이어가는 데에는 함께하는 마음이 필요합니다. 우리 동네의 이웃들이 안정적으로 일상을 이어갈 수 있도록 여러분의 마음을 전해주세요.

모인 기부금은 아래 사용 계획에 따라 사용하며, 활동 이후 결과보고를 통해 전달 과정과 집행 내역을 나누겠습니다.', '/assets/images/ocean.jpg', '재난·긴급지원', '서울', 9000000, (now() + interval '-20 days'), (now() + interval '4 days'), '[{"label":"물품 및 활동 지원","amount":7200000},{"label":"전달 및 운영 지원","amount":1800000}]'::jsonb, 'approved', 'active', (now() + interval '-14 days')),
  ('22222222-0000-4000-8000-000000000008', 'small-table', '11111111-0000-4000-8000-000000000002', '서로의 안부를 묻는
우리 동네 작은 식탁', '한 끼의 식사, 한 권의 책, 곁을 지키는 작은 관심. 평범한 일상을 이어가는 데에는 함께하는 마음이 필요합니다. 우리 동네의 이웃들이 안정적으로 일상을 이어갈 수 있도록 여러분의 마음을 전해주세요.

모인 기부금은 아래 사용 계획에 따라 사용하며, 활동 이후 결과보고를 통해 전달 과정과 집행 내역을 나누겠습니다.', '/assets/images/meal.jpg', '지역사회', '경기', 2500000, (now() + interval '-20 days'), (now() + interval '16 days'), '[{"label":"물품 및 활동 지원","amount":2000000},{"label":"전달 및 운영 지원","amount":500000}]'::jsonb, 'approved', 'active', (now() + interval '-13 days')),
  ('22222222-0000-4000-8000-000000000009', 'table-afterwards', '11111111-0000-4000-8000-000000000003', '이웃과 나눈 따뜻한 식탁,
그 이후의 이야기', '한 끼의 식사, 한 권의 책, 곁을 지키는 작은 관심. 평범한 일상을 이어가는 데에는 함께하는 마음이 필요합니다. 우리 동네의 이웃들이 안정적으로 일상을 이어갈 수 있도록 여러분의 마음을 전해주세요.

모인 기부금은 아래 사용 계획에 따라 사용하며, 활동 이후 결과보고를 통해 전달 과정과 집행 내역을 나누겠습니다.', '/assets/images/meal.jpg', '어르신', '제주', 2000000, (now() + interval '-20 days'), (now() + interval '-2 days'), '[{"label":"물품 및 활동 지원","amount":1600000},{"label":"전달 및 운영 지원","amount":400000}]'::jsonb, 'approved', 'ended', (now() + interval '-12 days')),
  ('22222222-0000-4000-8000-000000000010', 'winter-meal', '11111111-0000-4000-8000-000000000001', '겨울방학에도 멈추지 않는
아이들의 든든한 한 끼', '한 끼의 식사, 한 권의 책, 곁을 지키는 작은 관심. 평범한 일상을 이어가는 데에는 함께하는 마음이 필요합니다. 우리 동네의 이웃들이 안정적으로 일상을 이어갈 수 있도록 여러분의 마음을 전해주세요.

모인 기부금은 아래 사용 계획에 따라 사용하며, 활동 이후 결과보고를 통해 전달 과정과 집행 내역을 나누겠습니다.', '/assets/images/child.jpg', '아동·청소년', '서울', 3000000, (now() + interval '-40 days'), (now() + interval '-10 days'), '[{"label":"물품 및 활동 지원","amount":2400000},{"label":"전달 및 운영 지원","amount":600000}]'::jsonb, 'approved', 'ended', (now() + interval '-31 days'))
on conflict (id) do update set slug = excluded.slug, organization_id = excluded.organization_id, title = excluded.title, story = excluded.story, image = excluded.image, category = excluded.category, region = excluded.region, target = excluded.target, start_at = excluded.start_at, end_at = excluded.end_at, budget = excluded.budget, review = excluded.review, publication = excluded.publication, created_at = excluded.created_at;
insert into public.campaigns (id, slug, partner_name, title, description, type, fundraiser_id, limit_amount, rate, image, review, start_at, end_at, created_at) values
  ('33333333-0000-4000-8000-000000000001', 'double-heart', '초록내일 컴퍼니', '함께하면 두 배가 되는 마음', '여러분의 나눔에 초록내일 컴퍼니가 같은 마음을 보탭니다.', 'matching', '22222222-0000-4000-8000-000000000001', 1000000, 1, '/assets/images/community.jpg', 'approved', (now() + interval '-20 days'), (now() + interval '12 days'), (now() + interval '-20 days')),
  ('33333333-0000-4000-8000-000000000002', 'small-promise', '초록내일 컴퍼니', '지구를 위한 작은 약속', '오늘 한 번, 일회용품 줄이기를 함께 약속해요. 응원은 금전 기부로 환산되지 않습니다.', 'cheer', '22222222-0000-4000-8000-000000000004', 0, 1, '/assets/images/forest.jpg', 'approved', (now() + interval '-20 days'), (now() + interval '12 days'), (now() + interval '-20 days'))
on conflict (id) do update set slug = excluded.slug, partner_name = excluded.partner_name, title = excluded.title, description = excluded.description, type = excluded.type, fundraiser_id = excluded.fundraiser_id, limit_amount = excluded.limit_amount, rate = excluded.rate, image = excluded.image, review = excluded.review, start_at = excluded.start_at, end_at = excluded.end_at, created_at = excluded.created_at;
insert into public.content (id, slug, type, title, body, category, image, fundraiser_id, published, created_at) values
  ('44444444-0000-4000-8000-000000000001', 'story-warm-meal', 'story', '여러분의 마음이, 따뜻한 한 끼가 되었습니다', '동네 식탁에 다시 이야기꽃이 피었습니다. 이웃들이 함께 준비한 식사를 나누고 안부를 묻는 시간을 가졌습니다.', '어르신', '/assets/images/meal.jpg', '22222222-0000-4000-8000-000000000009', true, (now() + interval '-5 days')),
  ('44444444-0000-4000-8000-000000000002', 'story-new-books', 'story', '새로운 책과 함께, 더 넓어진 아이들의 세상', '책을 매개로 마음을 나누는 작은 도서관. 앞으로도 아이들의 속도에 맞춰 배움의 시간을 이어가겠습니다.', '아동·청소년', '/assets/images/child.jpg', '22222222-0000-4000-8000-000000000002', true, (now() + interval '-8 days')),
  ('44444444-0000-4000-8000-000000000003', 'story-small-tree', 'story', '함께 심은 작은 나무, 우리 동네의 내일', '이웃과 함께 나무를 심고 돌보는 날. 오래도록 이어질 푸른 변화를 응원합니다.', '환경', '/assets/images/forest.jpg', '22222222-0000-4000-8000-000000000004', true, (now() + interval '-12 days')),
  ('44444444-0000-4000-8000-000000000011', 'notice-open', 'notice', '퀸만덕의 첫 번째 나눔에 함께해주세요', '퀸만덕이 문을 열었습니다. 마음이 닿는 이야기를 만나고, 나눔 이후의 변화까지 함께 확인하세요.', '공지사항', null, null, true, (now() + interval '-3 days')),
  ('44444444-0000-4000-8000-000000000012', 'notice-transfer', 'notice', '기부금 입금 확인 안내', '기부 신청 후 안내된 계좌로 입금하시면 영업일 기준 1~2일 안에 확인 후 기부 내역에 반영됩니다. 입금자명은 신청 시 입력한 이름과 같아야 합니다.', '공지사항', null, null, true, (now() + interval '-1 days')),
  ('44444444-0000-4000-8000-000000000021', null, 'faq', '기부한 금액은 어디서 확인하나요?', '나의 나눔에서 입금 확인 대기·완료·취소 내역과 순기부액을 확인하고 CSV로 내려받을 수 있습니다.', '기부', null, null, true, (now() + interval '-30 days')),
  ('44444444-0000-4000-8000-000000000022', null, 'faq', '기부는 어떻게 결제하나요?', '현재는 계좌이체로 진행합니다. 기부 신청 후 안내된 계좌로 입금하면 운영팀이 확인 후 기부 내역에 반영합니다. 카드·간편결제는 준비 중입니다.', '기부', null, null, true, (now() + interval '-30 days')),
  ('44444444-0000-4000-8000-000000000023', null, 'faq', '기부금 영수증을 받을 수 있나요?', '기부금 영수증 발급 여부와 절차는 단체별로 다르며, 발급 가능한 모금은 상세 페이지에 표시됩니다. 자세한 내용은 1:1 문의로 알려주세요.', '기부', null, null, true, (now() + interval '-30 days')),
  ('44444444-0000-4000-8000-000000000024', null, 'faq', '취소와 환불은 어떻게 하나요?', '입금 확인 전에는 나의 나눔에서 바로 취소할 수 있습니다. 입금 확인 후 7일 안에는 환불을 요청할 수 있고, 운영팀 확인 후 처리됩니다.', '기부', null, null, true, (now() + interval '-30 days')),
  ('44444444-0000-4000-8000-000000000025', null, 'faq', '정기기부 금액을 바꾸거나 잠시 쉬어갈 수 있나요?', '나의 나눔의 정기기부 메뉴에서 월 금액 변경, 일시중지, 재개 및 해지를 할 수 있습니다.', '정기기부', null, null, true, (now() + interval '-30 days')),
  ('44444444-0000-4000-8000-000000000026', null, 'faq', '단체와 기업은 어떻게 참여하나요?', '모금단체 등록과 기업 캠페인 제안은 1:1 문의 또는 이메일로 접수합니다. 운영팀이 확인 후 절차를 안내합니다.', '파트너', null, null, true, (now() + interval '-30 days'))
on conflict (id) do update set slug = excluded.slug, type = excluded.type, title = excluded.title, body = excluded.body, category = excluded.category, image = excluded.image, fundraiser_id = excluded.fundraiser_id, published = excluded.published, created_at = excluded.created_at;
insert into public.settings (key, value) values
  ('categories', '["아동·청소년","어르신","장애인","위기가정","동물","환경","재난·긴급지원","지역사회"]'::jsonb),
  ('regions', '["서울","경기","제주"]'::jsonb),
  ('bank', '{"holder":"퀸만덕","bank":"입금 계좌 확정 전","account":"000-0000-0000"}'::jsonb)
on conflict (key) do nothing;

-- 예시 모금액: 데모의 초기 모금액을 익명 기부(입금 확인 완료)로 기록. 실제 운영 전 삭제하려면 아래 행을 지우거나 status를 cancelled로 바꿉니다.
insert into public.donations (id, number, user_id, fundraiser_id, kind, amount, status, method, depositor_name, anonymous, message, confirmed_at, created_at) values
  ('55555555-0000-4000-8000-000000000001', 'QM-SEED-001', null, '22222222-0000-4000-8000-000000000001', 'donation', 3240000, 'success', 'transfer', '초기 모금액', true, '함께 응원합니다.', (now() + interval '-20 days'), (now() + interval '-20 days')),
  ('55555555-0000-4000-8000-000000000002', 'QM-SEED-002', null, '22222222-0000-4000-8000-000000000002', 'donation', 5720000, 'success', 'transfer', '초기 모금액', true, '함께 응원합니다.', (now() + interval '-19 days'), (now() + interval '-19 days')),
  ('55555555-0000-4000-8000-000000000003', 'QM-SEED-003', null, '22222222-0000-4000-8000-000000000003', 'donation', 1860000, 'success', 'transfer', '초기 모금액', true, '함께 응원합니다.', (now() + interval '-18 days'), (now() + interval '-18 days')),
  ('55555555-0000-4000-8000-000000000004', 'QM-SEED-004', null, '22222222-0000-4000-8000-000000000004', 'donation', 4620000, 'success', 'transfer', '초기 모금액', true, '함께 응원합니다.', (now() + interval '-17 days'), (now() + interval '-17 days')),
  ('55555555-0000-4000-8000-000000000005', 'QM-SEED-005', null, '22222222-0000-4000-8000-000000000005', 'donation', 2180000, 'success', 'transfer', '초기 모금액', true, '함께 응원합니다.', (now() + interval '-16 days'), (now() + interval '-16 days')),
  ('55555555-0000-4000-8000-000000000006', 'QM-SEED-006', null, '22222222-0000-4000-8000-000000000006', 'donation', 3090000, 'success', 'transfer', '초기 모금액', true, '함께 응원합니다.', (now() + interval '-15 days'), (now() + interval '-15 days')),
  ('55555555-0000-4000-8000-000000000007', 'QM-SEED-007', null, '22222222-0000-4000-8000-000000000007', 'donation', 2010000, 'success', 'transfer', '초기 모금액', true, '함께 응원합니다.', (now() + interval '-14 days'), (now() + interval '-14 days')),
  ('55555555-0000-4000-8000-000000000008', 'QM-SEED-008', null, '22222222-0000-4000-8000-000000000008', 'donation', 790000, 'success', 'transfer', '초기 모금액', true, '함께 응원합니다.', (now() + interval '-13 days'), (now() + interval '-13 days')),
  ('55555555-0000-4000-8000-000000000009', 'QM-SEED-009', null, '22222222-0000-4000-8000-000000000009', 'donation', 2100000, 'success', 'transfer', '초기 모금액', true, '함께 응원합니다.', (now() + interval '-12 days'), (now() + interval '-12 days')),
  ('55555555-0000-4000-8000-000000000010', 'QM-SEED-010', null, '22222222-0000-4000-8000-000000000010', 'donation', 3000000, 'success', 'transfer', '초기 모금액', true, '함께 응원합니다.', (now() + interval '-31 days'), (now() + interval '-31 days'))
on conflict (id) do nothing;
