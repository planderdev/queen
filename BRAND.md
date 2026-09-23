# 퀸만덕 (QUEEN MANDEOK) 브랜드 시스템 레퍼런스

> 출처: 프로젝트 토큰 원본 `public/assets/js/design-system-foundations.js`(v1.0, 2026-09-24) + 로고 `public/assets/brand/` + 사이트 카피. 별도 무드보드 PDF는 없다.
> 웹 가이드: [public/design-system/index.html](public/design-system/index.html) (생성기 `tools/build-guide.mjs`, `npm run build:guide`) · 배포: https://queen-mandeok.vercel.app/design-system/ · 컴포넌트 카탈로그: https://queen-mandeok.vercel.app/design-system/catalog/
> 사이트·배너·에셋·PPT 등 모든 퀸만덕 작업은 이 문서를 기준으로 삼는다. 값 변경은 foundations.js에서만 하고 `npm run build`로 재생성한다.

## 공식 자산 — 반드시 자산 사용, 임의 재현 금지
- **가로형 로고** `public/assets/brand/logo.svg` (viewBox 0 0 443.9 53.2): 왕관 실루엣 + 보석 바 5색 + 워드마크 “퀸만덕”. 헤더 기본 222×27px.
- **세로형 로고** `public/assets/brand/logo2.svg` (viewBox 0 0 390.7 241.8): 왕관 + 워드마크 + 영문 “QUEEN MANDEOK”. 푸터 130×81px.
- 검정 부분은 흰색 반전만 허용, 보석 바 5색과 순서(살구·로즈·올리브·블루·라벤더)는 고정. 여백 = 왕관 높이의 1/2, 최소 가로형 120px / 세로형 64px.
- 참고 이미지 6종 `public/assets/images/{meal,child,dog,forest,community,ocean}.jpg` (Unsplash, 출처 docs/asset-sources.md). 인물은 실제 수혜자로 소개 금지, “가상 사연 · 스톡 이미지” 고지 필수. 실패 시 `fallback.svg`.

## 브랜드 코어
- **정의**: 마음이 닿는 이야기를 만나고 그 다음의 변화까지 함께하는 기부 플랫폼 (체험용 데모, 실제 결제 없음)
- **슬로건**: 작은 나눔이 모여, 더 큰 변화를 만듭니다.
- **가치**: 발견하다 → 전하다 → 함께하다
- **타겟/역할**: 기부 회원 · 모금단체 · 기업 파트너 · 운영자
- **톤앤보이스**: 따뜻하고 담백 · 존댓말(“~해주세요”) · 투명한 숫자 · 솔직한 데모 고지. 느낌표 재촉, 수혜자 대상화 표현, 검증 안 된 약속 금지.
- **키 메시지**: ① 작은 나눔이 모여, 더 큰 변화를 만듭니다. ② 마음이 닿는 이야기를 만나고, 그 다음의 변화까지 함께하세요. ③ 매달 이어지는 마음, 함께 자라는 내일. ④ 작은 마음이 모이는 곳, 퀸만덕

## 컬러
- **Primary**: 브랜드 레드 **#D73B50** (2026-09-24 변경). 로고 보석 색과 별개.
- **상태 팔레트 5색(로고 보석)**: Orange #D1936A(보완·예정) · Rose #C77991(실패·반려·추천·관심) · Olive #A3B166(승인·성공·진행·완료) · Blue #8696AD(접수·심사·처리 중) · Lavender #AC94AA(임시저장·일시중지·종료·취소). 의미 고정, 장식용 혼용 금지.
- **Primary 세트**: Normal #D73B50 · Strong #BC2B44(호버·라벨·링크) · Heavy #9E3844(프레스·어두운 배경) · Brand soft #FCEFF1(연한 배경)
- **Primary 스케일(확장 제안, 토큰 미등록)**: 50 #FDF3F5 · 100 #FAE7EA · 200 #F5CCD2 · 300 #EDA9B2 · 400 #E37685 · 500 #D73B50 · 600 #BC2B44 · 700 #9E3844 · 800 #762A33 · 900 #551F25 · 950 #3B161A
- **Label(그레이)**: Strong #000 · Normal #171719 · Neutral #46474C · Alternative #68696F · Assistive #989BA2 · Disable #C4C5C9
- **Line/Fill(알파)**: line-solid #E1E2E4 · line-normal #70737C29 · line-neutral #70737C1F · fill-normal #70737C14 · fill-strong #70737C29 · fill-alternative #70737C0A
- **Background**: normal #FFF · alternative #F7F7F8 · disabled #F4F4F5 · dimmer #17171985
- **Status**: Positive #16834B · Cautionary #976017 · Negative #C33737
- 그라데이션: Brand soft → Primary 300 → Primary → Heavy (히어로·큰 배너 한정)

## 타이포그래피
- **Pretendard** 단일 서체(국문·영문·숫자). 웹: jsDelivr `pretendard-dynamic-subset.min.css` · 관리자: `PretendardVariable.woff2` 로컬. 폴백 Noto Sans KR → Arial → sans-serif.
- 굵기: 400 본문·캡션 / 500 라벨·입력값 / 600 헤딩·버튼·배지 / 700 디스플레이·타이틀
- 스케일(px 크기/행간): Display 56/72 · 40/52 · 36/48 · Title 32/44 · 28/38 · 24/32 · Heading 22/30 · 20/28 · Headline 18/26 · 17/26 · Body 16/24(reading 26) · 15/22(reading 24) · Label 14/20(reading 22) · 13/18 · Caption 12/16 · 11/14
- 자간: 제목 음수(-0.019~-0.032em), 본문 이하 양수. `word-break: keep-all`.

## 표기법
- 국문 “퀸만덕”(붙여 씀), 영문 “QUEEN MANDEOK”(로고·저작권) / 문장 중 “Queen Mandeok”. 첫 언급 “퀸만덕 기부 플랫폼”.
- 금액: 정수 원, 천 단위 쉼표, “원” 접미(3,240,000원). ₩·KRW·소수점 금지. 달성률 내림 정수, 초과 그대로(128%), 막대만 100% 제한. 남은 기간 “D-12”, 종료 “모금 종료”.
- 날짜 “2026. 09. 23.”, 시각 24시간제, Asia/Seoul.
- 상태명은 한국어만 노출(승인·검토 요청·보완 요청·종료·반려 …). 영문 원값 노출 금지.
- 데모 고지: “본 사이트는 체험용 데모입니다. 실제 기부·결제·송금은 이루어지지 않습니다.” © 2026 QUEEN MANDEOK. ALL RIGHTS RESERVED.

## 그래픽 모티프
- 왕관 라인(로고 왕관 path 단독, 16% 이하 투명도, 큰 크기, 워드마크와 분리) · 보석 바(5색 순서 고정, 막대 비율 약 1:2.4) · 보석 바 패턴 · 구분선·분야별 비중 막대 응용.
- 한 화면에 한 번만. 32px 이하 아이콘화 금지. 색을 상태 의미와 다르게 쓰지 않음.

## 아이콘
- 공개 사이트 Lucide 1.47.0 (`stroke-width 1.7`, 24 그리드, 16/20/24/32), 관리자 Remix Icon line 계열. 채움 스타일 금지, 팔레트 색으로 칠하지 않음(칩·배지 안은 흰색). 아이콘 버튼 40px 원형, `aria-label` 필수.

## 웹 토큰 (tokens.css 요약)
- spacing 4·8·12·16·20·24·32·40·48·56·64·80 · radius 4·8·12·16·20(+ card 50/30) · shadow low/raised/dialog · motion feedback 180ms, image 350ms, card-image 3000ms, skeleton 1400ms
- layout: 콘텐츠 최대 1560px, 여백 60→50(≤1440)→40(≤1280)→30(≤768)→20(≤425). 캐러셀 간격 20/30/40.
- 버튼 높이 32/48/56, 아이콘 16/20/24/32. z: header 20 · mobile-cta 30 · demo 40 · toast 10000.

## 컴포넌트 규격 (app.css 기준)
- Button: 라운드 12, 15px/600, primary #D73B50→hover Strong, outlined(Strong 글자·Primary 테두리), secondary, danger(Negative). 한 영역에 Primary 하나.
- 입력: 높이 48, 라운드 12, 글자 16/24, 오류 `aria-describedby`. 체크·라디오 accent Primary, 스위치 52×32(작은 40×24).
- Chip 36px 토글(aria-pressed) · Badge 26px 읽기 전용, 간격 8/6. Tabs 높이 58, 간격 24, 밑줄 2px Primary. 토스트 4초, 하단 80px.
- Fund card: 이미지 1.56:1, D-day 배지 Primary(종료 Lavender), 관심 버튼 별도, 진행률 4px. 4열 272px → 2열 → 모바일 2열 148px.
- 캠페인 배너: Brand soft 배경, 라운드 16, 제목 20/700.
