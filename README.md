# 퀸만덕 · PHP 프론트엔드 데모

한국어 기부 플랫폼. PHP는 공통 레이아웃과 URL별 진입점을 조립하고, ES Modules가 공통 목업 저장소와 도메인 서비스를 이용합니다. React / JSX / 실제 DB / 서버 비즈니스 API는 없습니다.

## 실행

PHP 8.1+가 설치되어 있다면:

```powershell
php -S 127.0.0.1:8080 -t public
```

이 작업 환경에는 공식 PHP 8.4.26을 프로젝트 내부에 내려받아 체크섬을 확인했습니다:

```powershell
.\tools\php\php.exe -S 127.0.0.1:8080 -t public
```

벤더 JS/CSS와 이미지가 포함되어 있어 실행 시 npm 설치는 필요 없습니다. 공개 사이트의 Pretendard 웹폰트는 jsDelivr CDN 연결이 필요하며 실패 시 Noto Sans KR·시스템 글꼴로 표시됩니다. 관리자 화면은 로컬 `PretendardVariable.woff2`를 사용합니다. PHP 내장 서버는 개발용입니다.

## 시작 URL

| 역할 | URL |
|---|---|
| 사용자 | http://127.0.0.1:8080/ |
| 모금 목록 | http://127.0.0.1:8080/donate/ |
| 정기기부 | http://127.0.0.1:8080/monthly/ |
| 나의 나눔 | http://127.0.0.1:8080/my/ |
| 관리자 | http://127.0.0.1:8080/admin/ |
| 디자인시스템 | http://127.0.0.1:8080/design-system/ |

오른쪽 아래 **데모 설정**에서 역할, 회원, 관리자 권한, 기준 시각, 빈/오류/로딩 상태를 변경합니다. 관리자는 `/admin/` 첫 화면에서도 역할 전환이 가능합니다. 역할 전환은 보안 기능이 아닙니다.

모금단체 센터(`/partner/`)와 기업 파트너 센터(`/corporate/`) 화면은 2026-09-23 정리에서 제거했습니다. 단체 신청·모금 작성·결과보고 작성·기업 제안의 상태 전이는 `services/domain.js`와 도메인 테스트에 남아 있고, 관리자 심사 흐름은 초기 데이터에 포함된 검토 요청 항목(단체 신청 1건, 새 모금함 1건, 공개 모금 수정안 1건, 결과보고 1건, 환불 요청 1건)으로 체험합니다. 데모 데이터 구조(schema)가 바뀌면 기존 브라우저 저장소는 새 데모로 자동 교체됩니다.

## 연결된 주요 흐름

- 단체 신청 심사(보완 요청·승인·반려) → 모금함 심사 → 공개, 공개 모금 수정안 재심사 (관리자 화면; 신청·작성은 초기 데이터와 도메인 서비스로 유지)
- 금액/익명/응원 → 결제 수단 → 확인 → 성공·실패·취소·처리 중 → 재시도/완료 → 거래 내역
- 정기 약정 → 기준일 이동 → 회차 실패/성공 → 금액 변경·중지·재개·해지
- 종료 → 지급 예정 → 지급 승인 → 지급 완료 데모 → 결과보고 심사 → 승인·공개 (결과보고 작성은 초기 데이터로 제공)
- 기업 캠페인 심사 → 직접 기부 매칭 → 한도 검증 → 별도 지원금
- 환불 요청 → 승인/반려 → 원거래 연결 환불 → 순기부액 갱신
- 댓글 신고 → 유지/숨김 → 공개 화면 반영
- 관심 저장, 검색/필터/정렬/페이지 URL, 회원별 내역/CSV, 문의·답변, 콘텐츠 운영

테스트와 화면 목록, 시나리오 상세는 `docs/qa-report.md`, `docs/screen-inventory.md`, `docs/user-flows.md`를 참고하세요.

## 검증

```bash
npm test            # 도메인·스토리지 테스트 (node --test)
npm run check:styles  # 토큰 계약 검사 + 공개/관리자 CSS 캐스케이드 감사
npm run build:tokens  # design-system-foundations.js → tokens.css 재생성
```

Node 16 초기 버전에서 세부 테스트 출력을 보려면 `node tests/domain.test.js`를 직접 실행합니다.

PHP 문법 검사:

```bash
find public app -name '*.php' -exec php -l {} \;
```

```powershell
Get-ChildItem public,app -Filter *.php -Recurse | ForEach-Object { php -l $_.FullName }
```

## 배포 (Vercel)

PHP는 페이지 셸만 조립하고 요청별 로직이 없어서, 배포 시에는 `tools/prerender.mjs`가 모든 `public/**/index.php`를 정적 HTML로 미리 렌더링해 `dist/`에 두고 Vercel이 정적 파일로 서빙합니다. Vercel 빌드 이미지에는 PHP가 없어 스크립트가 static-php 빌드(PHP 8.3, Linux x86_64)를 `tools/php/`에 내려받아 사용합니다. 로컬에서는 설치된 `php`를 그대로 씁니다.

```bash
npm run build      # dist/ 생성 (로컬 확인용)
vercel deploy      # 프리뷰 배포
vercel deploy --prod
```

- 프로젝트: `planderdevs-projects/queen-mandeok`, 프로덕션 https://queen-mandeok.vercel.app
- GitHub `planderdev/queen`의 `main` 브랜치가 연결되어 있어 푸시하면 자동으로 프로덕션에 배포됩니다.
- 설정은 `vercel.json`(빌드 명령, 출력 폴더, trailing slash, 정적 자산 캐시 헤더)에 있습니다.

## 구조

- `app/layout.php`: 공개 사이트 공통 헤더/푸터/페이지 셸
- `app/admin-layout.php`: 관리자 전용 셸 (상단 바, 메뉴 검색, 사이드바 슬롯)
- `public/{도메인}/index.php`: 직접 접근 가능한 PHP 페이지
- `public/assets/js/design-system-foundations.js`: 디자인 토큰의 단일 원본. `tools/build-tokens.mjs`가 `tokens.css`를 생성
- `public/assets/css/`: `tokens.css`(생성물) → `app.css`(공통) → `site.css`(공개 셸) → 페이지별 `home.css`, `community.css`, `programs.css`, `design-system.css`
- `public/assets/js/data.js`, `fixtures/catalog.js`: 설정/연결된 초기 데이터
- `stores/repository.js`: 버전 있는 localStorage 어댑터, 메모리 폴백
- `services/domain.js`: 검증, 상태 전이, 금액 집계, 멱등 결제
- `pages/`: 화면별 뷰 (`home`, `public`, `programs`, `community`, `account`, `operations`, `design-system`)
- `components/ui.js`: 공유 컴포넌트, 접근성 아코디언, 모달, CSV
- `components/site.js`, `scroll-motion.js`, `form-controls.js`: 캐러셀, 스크롤 등장, 날짜 선택 등 공개 사이트 상호작용
- `components/admin-*.js`: 관리자 셸, 표, 조회 조건, 렌더러, 개인화 설정
- `app.js`: 화면 조립, 사용자 이벤트, 서비스 연결
- `assets/vendor`: 로컬 Lucide, Swiper, AOS, flatpickr, 관리자용 `sports-admin` 스타일 (라이선스 파일 동봉)
- `tools/`: 토큰 빌드, CSS 캐스케이드 감사
- `docs/`: 조사, 매핑, 모델, API 인수인계와 검증 증거

## 데모 범위

실제 인증/인가, 결제, 자동결제 스케줄러, 이메일, 파일 업로드 저장, 송금, 공식 영수증 발급은 없습니다. 비밀번호·결제정보·주민등록번호를 입력받지 않습니다. 브라우저 파일 선택은 로컬 미리보기와 메타데이터만 사용합니다. 영수증 화면은 **데모·법적 효력 없음** 상태 안내입니다.

localStorage 데이터는 사용자가 변경할 수 있으며 여러 기기/사용자 간 공유되지 않습니다. 다중 탭의 경쟁 상태에 대한 서버 수준 트랜잭션 보장은 없으므로 실제 서비스에서는 API의 원자적 멱등성·정산 잠금이 필수입니다.

모든 단체와 기업, 사연, 실적은 가상 예시입니다. 원본 서비스와 공식 관계가 없습니다. 스톡사진 속 인물을 실제 수혜자로 소개하지 않습니다.


## 브랜드 업데이트 (2026-09-23)

- 서체를 Pretendard(jsDelivr dynamic subset)로 전환했습니다. `--font-family` 폴백 순서는 Pretendard → Noto Sans KR → Arial → sans-serif입니다.
- 로고 2종(`public/assets/brand/logo.svg`, `logo2.svg`)을 새 브랜드 시안으로 교체했습니다. 헤더는 가로형, 푸터는 세로형을 사용합니다.
- 메인 컬러 `#c77991`(Rose)을 기준으로 팔레트 5색(Olive, Blue, Lavender, Orange, Rose)을 `--palette-*` 토큰으로 정리하고, 상태 칩 색상을 이 팔레트에 매핑했습니다.
- 토큰 이름의 `--qm-` 접두사를 제거하고 `design-system-foundations.js` 한 곳에서 색상·간격·라운드·타이포그래피를 관리합니다. `tokens.css`는 생성물이므로 직접 수정하지 않습니다.
- 공개 사이트 스타일을 `app.css` 하나에서 `site.css`와 페이지별 파일로 분리하고, 관리자 화면은 `sports-admin` 스타일과 flatpickr 날짜 선택기로 재구성했습니다.
- 홈 히어로 문구가 순차 등장하고 공개 콘텐츠 섹션은 AOS로 1회 스크롤 등장합니다. `prefers-reduced-motion`에서는 정적으로 표시합니다.
- 상세 내역과 감사 기록은 `docs/design-system.md`, `docs/token-audit/README.md`, `docs/css-cascade-audit.md`를 참고하세요.
