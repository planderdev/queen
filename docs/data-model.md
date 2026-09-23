# 공통 데이터 및 계산 계약

초기 데이터는 첫 로드 기준 시각에서 생성하고 즉시 저장한다. 새로고침마다 날짜/값을 재생성하지 않는다. 키 `queen-mandeok:v1`, schema=2, 안정적 ID 사용. 초기화는 명시적인 데모 설정 작업이며, 저장된 schema가 현재 값과 다르면 읽을 때 새 초기 데이터로 교체하고 안내 문구를 표시한다. 초기 데이터에는 관리자 심사 데모용 검토 요청 항목(단체 신청, 새 모금함, 공개 모금 수정안, 지급 완료 모금의 결과보고, 환불 요청)이 포함된다.

| 모델 | 주요 필드 / 연결 |
|---|---|
| User | id, name, email(데모), interests, public, suspended |
| Organization | id, name, category, description, status, reason, file metadata |
| Fundraiser | id, organizationId, title, story, image, category, region, target, start, end, budget[], review, publication, pending |
| Donation | id, key, userId, fundraiserId 또는 organizationId/planId, kind, amount, status, anonymous, message, createdAt, originalId |
| RecurringPlan | id, userId, organizationId, amount, day, nextDate, status |
| RecurringPayment | id, key, planId, userId, amount, status, createdAt |
| CorporatePartner | id, name, description |
| Campaign | id, partnerId, fundraiserId, type, rate, limit, start, end, review |
| Participation | id, campaignId, userId, createdAt |
| MatchingContribution | id, campaignId, donationId, fundraiserId, amount, status |
| Payout | id, fundraiserId, amount, status, createdAt |
| ImpactReport | id, fundraiserId, title, body, spent, file metadata, status, reason |
| Comment | id, fundraiserId, userId, text, hidden |
| Bookmark | id, userId, targetId |
| Notification | id, userId, text, read, createdAt |
| Inquiry | id, userId, role, title, category, body, answer |
| ModerationReport | id, commentId, reason, status, resolution |
| AuditLog | id, actor, userId, action, targetId, createdAt |
| RefundRequest | id, donationId, reason, reviewReason, status |

## 집계

모든 금액은 **정수 원(KRW)** 단위입니다.

- direct = 성공 donation/recurring 합계 − 성공 refund 합계.
- matching = approved MatchingContribution 합계. 직접 기부와 분리.
- total = direct + matching
- paid = status=paid인 Payout 합계
- spent = status=approved인 ImpactReport.spent 합계
- balance = paid − spent

집계는 `services/domain.js::totals`에서 단일 계산한다. 카드·상세·마이페이지·운영 화면에서 같은 데이터 참조. seed도 초기 성공 거래이므로 별도의 하드코딩 모금액 합산이 없다. 퍼센트= floor(total/target*100). target<=0은 0. 막대만 100%로 제한.

결제는 초안의 key로 멱등 처리. 실패/취소/처리 중은 미합산. 성공 키는 재시도 시 기존 결과 반환. 환불은 원 성공 금액 수정 없이 kind=refund, originalId 연결. 기업 매칭은 원거래별 1회, 잔여 한도 이내. 이 데모에서는 이미 승인된 기업 후원금을 개인 환불과 자동 연동 취소하지 않는다. 실제 매칭 약관은 서버 인수인계에서 확정할 것.

## 상태와 공개 조건

- 단체: draft → submitted → reviewing / revision / approved / rejected. 보완·반려 후 재제출.
- 모금 심사: draft → submitted → reviewing / revision / approved / rejected.
- 모금 게시: scheduled / active / paused / ended. 심사와 다른 필드.
- 최초 공개: 단체 approved + 모금 approved + start<=clock + active/paused/ended.
- 기부 가능: 공개 + active + clock<end. 목표 달성과 종료를 동일시하지 않음.
- 승인본 변경: pending에 수정안 저장, 기존 공개 필드 유지. 심사 중에도 기존 승인본 열람. 수정 승인 시 pending 승격.
- 지급: scheduled → approved → paid. 종료 모금만, 미처리 환불 먼저 해결. 동일 모금 중복 지급 차단.
- 결과보고: submitted → reviewing / revision / approved / rejected. approved만 공개·집행 집계.
- 정기: active ↔ paused → cancelled. 약정 등록은 거래가 아님.

## 날짜

모든 표시 Asia/Seoul. 사용자 작성 모금의 시작은 00:00:00+09:00, 종료는 23:59:59+09:00. 종료 시각에 도달하면 새 기부 차단. demo clock은 설정에서 직접 변경. 기간이 끝나도 상세 접근 가능.

정기 결제일은 다음 달의 선택일, 해당 날짜가 없으면 말일. 데모 실행 시각은 12:00 KST. 예정일 이전 결제 차단. 실패는 같은 회차 key로 재시도; 성공하면 다음 달로 이동. 자동 반복 작업 없음.

## 저장과 교체

UI → 서비스 함수 → repository.write → localStorage. 파일 원본·blob URL·비밀번호·결제정보는 저장 안 함. 파일 메타데이터는 name/size/type만. 손상 감지 시 새로운 메모리 데이터로 회복하며 경고 표시. 용량 오류는 메모리 폴백과 경고. storage 이벤트로 다른 탭의 변경 시 뷰 갱신.

실서비스에서는 read/write를 HTTP 저장소로 교체하고, 현재 클라이언트 함수의 권한·금액·상태 검증을 서버에서 다시 수행해야 한다. localStorage는 신뢰할 수 있는 금융 원장이 아니다.
