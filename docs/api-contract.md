# 제안 API 계약 — 미구현 서버 인수인계

아래 엔드포인트는 **향후 서버 계약 제안**이며, 현재 서버에 구현되어 있지 않습니다. PHP는 템플릿만 조립합니다.

## 공통 규칙

HTTPS, JSON, UTF-8, KRW 정수, ISO8601(+09:00 또는 UTC). 서버 시각으로 기간 판정. 인증은 HttpOnly/Secure/SameSite 세션과 CSRF 보호 제안. 클라이언트 역할 토글은 서버에서 무시. 모든 변경은 사용자·역할·대상 소유권을 서버에서 검증.

성공: `{ "data": {...}, "meta": { "requestId": "req-..." } }`

목록: `{ "data": [...], "page": { "cursor": "...", "nextCursor": null, "limit": 20, "total": 42 } }`

오류: `{ "error": { "code": "VALIDATION_ERROR", "message": "입력을 확인해주세요", "fields": { "amount": "최소 금액 미만" } }, "requestId": "..." }`

HTTP: 400 잘못된 요청, 401 비인증, 403 역할/소유권 위반, 404 ID 없음, 409 상태 충돌/멱등 키 payload 불일치, 422 필드 검증, 429 제한, 500 서버 오류. 변경은 version 또는 If-Match로 경쟁 수정 방지.

## 사용자·기부

인증 연결 지점: POST /v1/auth/login, POST /v1/auth/register, POST /v1/auth/password-reset, POST /v1/auth/logout, GET/PATCH /v1/me. 비밀번호와 재설정 토큰은 현재 프론트 목업에 저장하지 않으며 실제 연동 시 서버의 해시·만료·이메일 인증·속도 제한이 필요하다. OAuth는 검증된 redirect URI와 state/PKCE를 적용한다.

| Method / endpoint | 요청 | 응답 / 권한 |
|---|---|---|
| GET /v1/fundraisers | q,category,status,region,organizationId,sort,cursor,limit | 공개 모금 요약과 직접/매칭 합계. 비회원 가능 |
| GET /v1/fundraisers/:id | - | 승인 공개본, 단체, budget, totals, canDonate. 비공개는 소유 단체/심사만 |
| POST /v1/donation-intents | fundraiserId, amount, anonymous, message, method | intentId, immutable amount, expiry. 회원 |
| POST /v1/donation-intents/:id/confirm | Idempotency-Key 헤더; PSP token (실서비스) | donationId, processing/success/failed/cancelled. 회원 |
| GET /v1/donations/:id | - | 본인 또는 정산 관리자. 공개 API는 userId/email 제거 |
| GET /v1/me/donations | from,to,status,fundraiserId,cursor | 본인 거래 목록, 원거래/환불 관계 |
| GET /v1/me/donations.csv | 동일 필터 | 서버에서 CSV formula injection 방지 |
| POST /v1/donations/:id/refund-requests | reason | requestId, requested. 본인, 환불 규정 검증 |
| POST /v1/recurring-plans | organizationId,amount,day | planId,status,nextDate. 약정만 생성 |
| PATCH /v1/recurring-plans/:id | action=amount/pause/resume/cancel, amount?,version | 변경된 약정. 소유자 |
| GET /v1/recurring-plans/:id/payments | cursor | 실제 결제 회차, 실패 내역 |
| POST /v1/bookmarks | targetType,targetId | bookmark, 사용자별 unique |
| DELETE /v1/bookmarks/:id | - | 204, 소유자 |
| POST /v1/comments | fundraiserId,text | comment, 회원; XSS escaping / moderation |
| POST /v1/comments/:id/reports | reason | reportId, 회원 |
| POST /v1/campaigns/:id/participations | type=cheer | participation, 계정당 unique, 금전 거래 없음 |

PSP webhook 검증·서명·금액 비교를 통과한 이벤트만 성공 원장 기록. 프론트의 success 선택값은 실서버에서 신뢰하지 않음. intent 단위 멱등 키에 unique constraint와 트랜잭션 적용. 프론트가 성공 화면 새로고침해도 새 결제가 발생하면 안 됨.

## 단체·기업

| Endpoint | 요청 / 응답 | 권한 |
|---|---|---|
| POST /v1/organizations/applications | name,category,description,documentIds → application | 단체 담당자 |
| PATCH /v1/organizations/:id/application | version,보완 필드 → submitted | 소유자, 보완 가능 상태 |
| POST /v1/fundraisers | 기본/사연/목표/기간/budget/documentIds → draft | 승인 단체 |
| PATCH /v1/fundraisers/:id | version,변경안 → draftVersion | 소유 단체; 공개본과 별도 |
| POST /v1/fundraisers/:id/submit | version → submitted | 필수·기간·budget 합계 검증 |
| POST /v1/fundraisers/:id/impact-reports | title,body,spent,usageItems,documentIds → submitted | 지급 완료된 소유 모금 |
| POST /v1/corporate/campaigns | type,title,description,limit,rate,start,end,fundraiserId,assetIds → submitted | 기업 담당자 |
| GET /v1/corporate/campaigns/:id/metrics | 참여·직접기부·지원금 각각 반환 | 소유 기업 |

파일은 별도 pre-signed 업로드 URL/악성파일 검사/형식 검증/접근제어와 만료 다운로드를 구현. 현재 데모는 해당 API 없이 로컬 미리보기만 제공.

## 관리자

| Endpoint | 요청 | 권한 / 검증 |
|---|---|---|
| POST /v1/admin/reviews/:type/:id | decision,reason,version | 최고/심사, 상태 전이 허용 목록 |
| POST /v1/admin/refunds/:id/decision | decision,reason | 최고/정산; 원거래 그대로, 별도 환불 원장 |
| POST /v1/admin/payouts | fundraiserId | 최고/정산; 종료·미지급·환불 해결 확인 |
| POST /v1/admin/payouts/:id/approve | version | 최고/정산; 실제 지급은 별도 승인 체계 권장 |
| POST /v1/admin/matching-contributions | campaignId,donationId | 최고/정산; 캠페인 한도 행 잠금과 unique |
| POST /v1/admin/moderation/:id | hide,reason | 최고/콘텐츠 |
| POST /v1/admin/inquiries/:id/answer | body | 허용 운영 권한 |
| POST/PATCH /v1/admin/content | type,title,body,published | 최고/콘텐츠 |
| PATCH /v1/admin/settings | categories,regions,version | 최고 |
| GET /v1/admin/audit-logs | actor,type,from,to,cursor | 권한별 범위; 변경 불가능 로그 |

실제 회차 결제는 서버 스케줄러와 PSP 토큰 보관 정책 필요. 사용자/관리자가 임의로 결제 결과를 지정하는 데모 기능은 운영 환경에서 제거. 세무/환불/보관 정책은 법률·기관 검토 후 별도 확정.
