-- 참여형(행사) 캠페인 유형 추가. 새 enum 값은 커밋 후에만 쓸 수 있어 별도 마이그레이션으로 분리.
alter type public.campaign_type add value if not exists 'event';
