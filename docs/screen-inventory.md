# 화면 URL 목록

URL의 query로 화면과 상태가 구분됩니다. 각각 PHP 진입점에 직접 접근/새로고침할 수 있습니다.

| 영역 | URL / query |
|---|---|
| 홈 | `/` |
| 목록/검색 | `/donate/?q=&category=전체&region=&org=&status=&sort=recommended&page=1`, `/search/` |
| 상세 | `/donate/?id=fund-1&view=story` (`donors`, `news`, `comments`) |
| 기부 | `/donate/?id=fund-1&view=checkout&step=1` (1~3; 성공 시 완료) |
| 정기기부 | `/monthly/`, `/monthly/?id=org-1` |
| 캠페인 | `/campaigns/`, `/campaigns/?id=campaign-1` |
| 스토리 | `/stories/?category=`, `/stories/?id=story-1` |
| 단체 | `/organizations/`, `/organizations/?id=org-1` |
| 소개 | `/about/` |
| 인증 UI | `/auth/?view=login`, `signup`, `reset` |
| 회원 | `/my/?view=summary`, `donations`, `monthly`, `bookmarks`, `campaigns`, `comments`, `notifications`, `profile`, `inquiries` |
| 고객센터 | `/support/?view=faq`, `notices`, `inquiry`, `terms`, `privacy` |
| 관리자 | `/admin/?view=dashboard`, `users`, `organizations`, `fundraisers`, `transactions`, `recurring`, `refunds`, `payouts`, `reports`, `campaigns`, `content`, `moderation`, `inquiries`, `settings`, `permissions`, `logs` |
| 브랜드 가이드 | `/design-system/` (정적 생성 페이지) |
| 디자인시스템 카탈로그 | `/design-system/catalog/?topic=button&mode=web` |

모달: 역할/시간/초기화, 심사, 상태 변경, 환불, 정기 변경·해지·회차, 신고, 문의 답변, 신청 미리보기, 거래 상세, 영수증 상태, 공유 복사 실패 시 링크.

제거된 화면: 단체 센터 `/partner/`(대시보드·신청·프로필·모금함·7단계 작성·소식·지급·보고·문의)와 기업 센터 `/corporate/`(대시보드·프로필·제안·캠페인·후원금·문의)는 2026-09-23 정리에서 삭제했다. 해당 흐름의 상태 전이는 `services/domain.js`에 남아 있다. 신청·작성 화면이 없으므로 관리자 심사 대기열은 초기 데이터의 검토 요청 항목(`org-4`, `fund-11`, `fund-3` 수정안, `impact-seed-fund-10`, `refund-seed-1`)으로 채우며, 심사·지급·매칭·환불·신고·문의는 관리자 화면에서 처리한다.

예외: 잘못된 ID → 찾을 수 없음, 미승인 비공개 → 공개 전 안내, 종료 → 기부 차단, 비회원 → 로그인, 권한 불일치 → 역할 안내, 빈 목록 → 빈 상태, 데모 오류/로딩 → 설정으로 복원.
