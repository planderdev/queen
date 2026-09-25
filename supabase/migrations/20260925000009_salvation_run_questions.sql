-- 기부런: 러닝 페이스·코스 질문, 선착순 50명(입금 확인 기준), 참가비 입금 계좌
update public.campaigns set
  capacity = 50,
  details = details || jsonb_build_object(
    'course', '해변공연장 앞 집결 → 탑동 → 동한두기 → 구름다리 → 용담해안도로 → 어영공원 (왕복) · 10km 완주 / 5km 완주 중 선택',
    'questions', jsonb_build_array(
      jsonb_build_object('key', 'pace', 'label', '평소 러닝 페이스 (1km당)', 'short', '페이스', 'required', true,
        'options', jsonb_build_array('3~4분대', '4~5분대', '5~6분대', '6~7분대', '7~8분대', '8분 이상')),
      jsonb_build_object('key', 'course', 'label', '코스 선택', 'short', '코스', 'required', true,
        'options', jsonb_build_array('10km 완주', '5km 완주'))
    ),
    'bank', jsonb_build_object('bank', 'MG새마을금고', 'account', '9003-2958-3986-3', 'holder', '현소영')
  )
where id = '33333333-0000-4000-8000-000000000010';
