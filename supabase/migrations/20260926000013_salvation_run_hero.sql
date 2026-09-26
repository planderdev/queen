-- 기부런을 홈 메인 배너 첫 슬라이드로 노출 (details.hero)
update public.campaigns set details = details || jsonb_build_object('hero', jsonb_build_object('heading', jsonb_build_array('함께 달리고,', '함께 나누는 하루.'), 'description', jsonb_build_array('10월 10일(토) 오전 8시', '제주 해안도로 기부런'), 'cta', '기부런 참가 신청')) where id = '33333333-0000-4000-8000-000000000010';
