# 퀸만덕 실서비스 (Next.js + Supabase)

기부자와 운영자가 실제로 사용하는 버전입니다. 데모(`/demo/`)와 브랜드 가이드(`/design-system/`)는 빌드 시 `../tools/prerender.mjs`가 `public/`에 정적 파일로 넣어 같은 도메인에서 함께 서빙됩니다.

## 1차 범위

- 기부자: 회원가입·로그인(이메일), 모금함 탐색·상세, 일시기부 신청(계좌이체 입금 확인 방식), 정기기부 약정, 관심 저장, 응원 댓글·신고, 캠페인 응원 참여, 행사 캠페인 참가 신청(비회원 가능), 나의 후원(내역·CSV·환불 요청·약정 관리·문의·알림·프로필)
- 운영자: 입금 확인, 환불 처리, 모금함·단체·콘텐츠(공지·FAQ·스토리·소식·배너·추천) 관리, 캠페인 공개·참가 신청자 명단(확정·취소·CSV), 문의 답변, 댓글 신고 처리, 회원 권한, 분야·지역·계좌 설정, 운영 이력
- 결제(PG)와 자동결제, 기부금 영수증은 2차 범위입니다.

## 로컬 실행

```bash
cd web
cp .env.example .env.local   # Supabase 값을 채우지 않으면 미리보기(시드) 모드로 실행됩니다
npm install
npm run dev                   # http://localhost:3000
```

미리보기 모드에서는 공개 화면을 시드 데이터로 볼 수 있고, 로그인·저장이 필요한 기능은 "데이터베이스 연결 전" 안내를 표시합니다.

## Supabase 연결 (클라이언트 프로젝트)

1. Supabase 프로젝트 생성 (리전 `ap-northeast-2` 권장).
2. SQL Editor에서 `../supabase/migrations/` 파일을 번호 순서대로 실행하거나, Supabase CLI로 `supabase link` 후 `supabase db push`.
   - `..._init.sql`: 테이블·RLS·집계 뷰·프로필 자동 생성 트리거
   - `..._seed.sql`: 예시 단체·모금함·콘텐츠·계좌 설정 (`npm run seed:sql`로 재생성)
   - `..._campaign_type_event.sql` · `..._event_campaigns.sql` · `..._registration_count_column.sql`: 행사(참가 신청) 캠페인 유형과 신청자 테이블
   - `..._salvation_run_campaign.sql`: 첫 실제 캠페인 “[우리도 오늘은 구세군] 기부런” (구글 폼 참가 신청서 이관). 예시 캠페인 2건은 숨김(draft) 처리
3. Authentication → URL Configuration: Site URL을 배포 주소로, Redirect URLs에 `https://<도메인>/auth/callback`(로컬 테스트 시 `http://localhost:3000/auth/callback`) 추가. 이메일 템플릿의 확인 링크는 기본값을 사용합니다.
   - Supabase 기본 메일러는 시간당 발송 한도가 매우 낮아(수 건) 가입 테스트 중 “email rate limit exceeded”가 납니다. 운영 전 Authentication → SMTP Settings에 자체 SMTP(예: Resend, AWS SES)를 연결하세요. 내부 테스트만 급하면 Authentication → Providers → Email에서 “Confirm email”을 잠시 끌 수 있습니다.
   - `example.com`, `.test` 같은 예약 도메인 주소는 Supabase가 가입을 거부합니다. 테스트에도 실제 도메인 이메일을 쓰세요.
3-1. 운영용 메일 발송(Resend → Supabase SMTP) — 클라이언트 계정으로 진행
   1. https://resend.com 가입(클라이언트 계정) → API Keys → “Create API Key”(권한 Sending access). 키는 한 번만 표시되니 바로 복사.
   2. Supabase 대시보드 → Authentication → SMTP Settings → “Enable Custom SMTP” 켜고 입력:
      - Sender email: 도메인 연결 전에는 `onboarding@resend.dev`, 연결 후에는 `no-reply@<도메인>`
      - Sender name: 퀸만덕
      - Host: `smtp.resend.com` · Port: `465` · Username: `resend` · Password: 위에서 만든 API 키
      - Minimum interval between emails: 기본값(60초) 유지
   3. 도메인 연결 전 제한: Resend는 `onboarding@resend.dev` 발신으로는 **Resend 계정 소유자 이메일에만** 메일을 보냅니다. 따라서 도메인 연결 전 가입 테스트는 그 이메일로만 가능합니다. 실제 사용자에게 보내려면 Resend → Domains에 도메인을 추가하고 안내되는 DNS 레코드(SPF·DKIM·DMARC)를 등록한 뒤 Sender email을 그 도메인 주소로 바꿉니다.
   4. Supabase → Authentication → Rate Limits에서 “Rate limit for sending emails”를 운영 수준(예: 시간당 100)으로 올립니다. 커스텀 SMTP를 켜야 올릴 수 있습니다.
   5. 테스트: 사이트에서 회원가입 → 인증 메일 링크 클릭 → `/my`로 돌아오면 정상.
4. `.env.local` 또는 Vercel 환경 변수에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` 설정.
5. 첫 관리자 지정: Supabase 대시보드 → Authentication → Users → Add user(“Auto Confirm User” 체크)로 계정을 만든 뒤 SQL Editor에서
   ```sql
   update public.profiles set role = 'admin', admin_role = 'super' where email = 'admin@example.com';
   ```
   (SQL Editor처럼 직접 DB 세션에서만 가능합니다. 앱 API로는 관리자만 권한 필드를 바꿀 수 있습니다.)
   이후 관리자는 `/admin/users`에서 다른 회원을 관리자로 지정할 수 있습니다.
   - 관리자 화면은 사이트와 분리된 `/admin/login`으로 로그인합니다(사이트 어디에도 링크하지 않음). 관리자 권한이 없는 계정은 로그인 직후 로그아웃되고, 로그인하지 않은 채 `/admin/...`에 들어오면 관리자 로그인으로 이동합니다.
6. `/admin/settings`에서 실제 입금 계좌(은행·계좌번호·예금주)를 입력합니다. 시드의 계좌는 자리표시자입니다.

## Vercel 배포

- Root Directory: `web` (프로젝트 설정). “Include source files outside of the Root Directory”가 켜져 있어야 `../tools`와 `../public`(데모 원본)을 빌드에서 읽을 수 있습니다.
- Build Command는 `npm run build`(기본). `prebuild`가 데모와 가이드를 `public/`에 생성한 뒤 `next build`가 실행됩니다. 빌드 이미지에 PHP가 없으면 `tools/prerender.mjs`가 static-php를 내려받습니다.
- 환경 변수 3개(위 4번)를 Production/Preview에 추가합니다.

## 구조

- `app/(site)/…` 공개 사이트와 회원 화면, `app/(admin)/admin/(panel)/…` 운영 관리 화면(셸·권한 확인), `app/(admin)/admin/login` 관리자 전용 로그인 (별도 루트 레이아웃)
- `lib/data/` 데이터 계층: `supabase.ts`(실서비스) · `memory.ts`(미리보기) · `seed-data.mjs`(시드 원본) · `me.ts` · `admin.ts`
- `lib/actions/` 서버 액션: `auth` · `donation` · `community` · `bookmark` · `admin`
- `lib/auth.ts` 세션·권한 헬퍼, `proxy.ts` 세션 갱신과 `/my`, `/admin` 보호
- `app/styles/` 데모에서 가져온 디자인 시스템 CSS (토큰 원본은 `../public/assets/js/design-system-foundations.js`)
- `components/` 사이트·관리자 UI

## 행사 캠페인 (참가 신청)

- `campaigns.type = 'event'`인 캠페인은 상세 페이지에 행사 안내(`details` JSON: intro·event_name·schedule·course·benefits·agreements·complete)와 참가 신청서를 보여줍니다. 신청서 항목은 원본 구글 폼과 같습니다(성함·연락처·성별·이메일·연령대·참여 확인 3항목·참가비 입금자명).
- 신청은 로그인 없이도 가능하며 `campaign_registrations`에 저장됩니다(캠페인당 이메일 1회). 회원이 신청하면 `user_id`가 함께 기록됩니다.
- 운영자는 `/admin/campaigns`에서 신청자 명단을 보고 입금 확인 후 ‘참가 확정’, 필요 시 ‘취소’로 바꾸며 CSV로 내려받습니다. ‘신청 마감/재개’와 캠페인 ‘공개/숨기기’도 같은 화면에서 처리합니다.
- 참가비 금액은 `campaigns.fee_amount`(0이면 “신청 후 개별 안내”), 정원은 `capacity`(null이면 무제한)로 관리합니다. 새 행사 캠페인은 SQL로 추가합니다(편집 화면은 2차).

## 운영 흐름 (계좌이체)

1. 회원이 모금함에서 금액·입금자명을 입력해 기부를 신청하면 `donations.status = pending`으로 기록되고 입금 계좌가 안내됩니다.
2. 운영자가 `/admin/donations`에서 입금을 확인하면 `success`로 바뀌고 모금액·참여 내역·회원 알림에 반영됩니다. 입금 전에는 회원이 직접 취소할 수 있습니다.
3. 입금 확인 후 7일 안에 회원이 환불을 요청하면 `/admin/refunds`에서 승인·반려합니다. 승인 시 원거래는 그대로 두고 `kind = refund` 거래가 추가되어 순기부액에서 차감됩니다.
4. 정기기부는 약정만 기록하고 매달 입금은 운영자가 정기기부 유형으로 확인 처리합니다. 자동결제는 PG 도입 후 연결합니다.
