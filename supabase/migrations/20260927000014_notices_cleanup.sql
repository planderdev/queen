-- 공지사항 정리: 후원(기부) 메뉴를 숨긴 기간이라 기부금 입금 안내는 비공개, 기부런 모집 마감 공지 추가
update public.content set published = false where id = '44444444-0000-4000-8000-000000000012';
insert into public.content (id, slug, type, title, body, category, published)
values ('44444444-0000-4000-8000-000000000013', 'notice-salvation-run-closed', 'notice', '[기부런] 선착순 50명 참가 모집 마감 안내',
E'‘우리도 오늘은 구세군’ 기부런 참가 신청이 선착순 50명 모두 입금 확인되어 마감되었습니다. 함께해주신 모든 분께 감사드립니다.\n\n행사 안내\n· 일시: 2026년 10월 10일(토) 오전 8시 ~ 10시\n· 집결: 해변공연장 앞\n· 코스: 탑동 → 동한두기 → 구름다리 → 용담해안도로 → 어영공원 (왕복), 10km 완주 · 5km 완주 중 선택\n· 함께하는 곳: 아식스 구제주 칠성점 × 제주야미소영\n\n본인의 건강 상태를 고려해 무리하지 말고 안전하게 참여해주세요. 행사 관련 문의는 1:1 문의로 남겨주세요.',
'공지사항', true)
on conflict (id) do update set title = excluded.title, body = excluded.body, published = excluded.published;
