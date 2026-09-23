> 후속 요청으로 정책이 변경되었습니다. 현재 기준과 명령은 [디자인시스템 단일 기준 적용](system-policy.md)을 확인하세요. 아래는 이전 작업의 기록입니다.

# 디자인 토큰·CSS 정리 결과

기존 디자인을 유지하며 전역 토큰을 **341개 → 133개**로 정리했습니다. 작업 시작 시 이미 있던 로고, 히어로, 버튼 색상, 포커스 변경을 기준으로 비교했습니다. 이 작업에서 로고 파일은 수정하지 않았습니다.

## 조사 범위와 근거

`ui-ux-pro-max`의 표적 검색은 이 토큰 정리 작업에 직접 맞는 결과를 주지 않았습니다. 새 시각 방향을 적용하지 않고 사용자 기준과 실제 코드 사용처를 판단 근거로 삼았습니다.

- `public`, `app`의 CSS·JS·PHP를 조사하고 저장소 문서·테스트의 언급을 별도로 기록했습니다. 외부 vendor 코드는 수정 대상에서 제외했습니다. 전체 조사 파일은 `before.json`의 `scanned_files`입니다.
- [변경 전 전체 인벤토리](inventory.md): 341개 변수의 선언 줄, 값, 사용 횟수, 대표 컴포넌트, 처리 결정.
- [원본 사용처](before.json) / [최종 사용처](after.json): 모든 참조 위치와 CSS 선택자·속성. 사용 횟수에는 토큰 간 참조, `designToken()` 호출, 유한한 동적 타이포·아이콘·아바타 참조를 포함합니다. 문서·테스트 언급은 런타임 횟수와 분리합니다.
- [변수별 처리 계획](plan.json), [선언별 이관 기록](migration.json): CSS는 선택자·미디어 조건·속성 단위로 방문하여 수정했고, JS는 해당 템플릿의 `var()` 사용만 옮겼습니다. 사용처를 먼저 수정한 뒤 정의를 정리했습니다. 이후 보완한 의미 분리와 우선순위 변경은 아래에 설명합니다.
- 변경 전 미사용 18개, 미정의 1개, 중복 선언 0개, 순환 참조 0개. 미사용 중 Fill Strong은 실제 문서에서 잘못 참조하던 Line Normal을 바로잡아 유지했고, 나머지 17개는 제거했습니다.

## 전후 수량

| 분류 | 변경 전 | 변경 후 | 처리 기준 |
|---|---:|---:|---|
| 전체 전역 `--qm-*` | 341 | 133 | 역할이 명확한 디자인 결정만 유지 |
| `size-*` | 90 | 0 | 너비·높이·위치·선 두께 등을 각 규칙에 원값으로 유지 |
| `space-*` | 51 | 14 | 4/8/12/16/20/24/28/32/36/40/48/56/64/80px |
| `font-size-*` | 31 | 13 | 실제 반복되는 compact/caption/label/body/headline/heading/title/display 역할 |
| `tracking-*` | 32 | 3 | 반복되는 title/headline/heading만 유지, 나머지 지역 값 |
| `layer-*` + `z-*` | 12 | 6 | 전역 적층은 `z-*` 역할명으로, 지역 1/2/3은 CSS에 직접 명시 |
| 숫자형 `color-detail-*` | 2 | 0 | 중립 경계·비활성 배경으로 명명 |
| 미사용 | 18 | 0 | 문서·동적 참조 확인 후 처리 |
| 미정의 참조 | 1 | 0 | 데모 모달의 무효한 테두리 선언 제거 |
| 토큰 중복 선언 / 순환 | 0 / 0 | 0 / 0 | 모든 간접 참조 포함 검사 |

## 토큰 구조와 대표 결정

| 영역 | 대표 항목 | 결정 |
|---|---|---|
| 기본값 | `color-rose`, `space-*`, `font-size-body`, `weight-semibold`, `radius-*`, `shadow-*`, `motion-*`, `z-*` | 공유할 디자인 값 |
| 의미별 | `primary-*`, `label-*`, `background-*`, `line-*`, `status-*`, `interaction-*` | 값이 같아도 역할별 변경 가능성 유지 |
| 레이아웃 계약 | `layout-content-width`, `layout-wide-width` | 사이트 공통 1100/1440px 컨테이너 |
| 컴포넌트 | `badge-label`, 기존 칩 팔레트 / 지역 `--sample-*`, `--avatar-size`, `--ds-icon` | 실제 컴포넌트별 필요가 있는 경우만 사용 |
| `primary-normal → chip-rose` | 양쪽 모두 `color-rose` 참조 | 카탈로그의 로고 5색 설명과 Rose의 브랜드 추천 사용이 공유 근거. 브랜드가 칩 역할에 종속되던 관계를 해소하고 #c77991 유지 |
| `color-detail-66` | `line-neutral` | 카탈로그 Line/Neutral: #70737c1f 유지 |
| `color-detail-67` | `interaction-disabled` | 카탈로그 Interaction/Disable: #f4f4f5 유지 |
| `focus-ring` | `line-brand-soft` | 현재 실제 용도는 그리드 문서 샘플의 테두리. 포커스 용도가 아님 |
| `line-legacy` | 제거 | #e5e9e5, 런타임·동적 사용 없음 |
| `fill-strong`, `line-normal` | 각각 유지 | 둘 다 #70737c29이나 채움과 경계는 다른 역할. 카탈로그 Fill/Strong의 참조를 수정 |
| `on-primary`, `badge-label`, `chip-label` | 역할 분리 | 기본 버튼·배지는 흰 글자, 칩은 기존 검정 글자를 유지. 배지가 버튼 토큰에 종속되지 않도록 변경 |
| `shadow-0…6` | panel/floating/dialog/pressed/pressed-strong/hover/thumb | 그림자는 전체 효과 단위로 관리. 한 번 쓰던 그림자 색 조각은 효과 안에 병합 |
| `size-340`, `size-355`, `size-290`, `size-460` | 원래 히어로 CSS의 px 값 | 실제 미디어 조건과 높이를 그대로 유지 |
| `space-45`, `space-25`, `tracking-negative-1_8` 등 | 지역 값 | 특정 레이아웃·광학 예외를 8px로 반올림하지 않음 |

기본 간격은 8px 중심이며 4px 보조 척도를 사용합니다. 28/36px은 반복되는 중간 간격으로 남겼습니다. 그 밖의 2/6/7/10/15/25/45px 등의 예외는 값 자체를 없애지 않고 원래 규칙에 두었습니다. 역할이 다른 radius/space/font-size가 같은 수치라고 하나로 합치지 않았습니다.

6개 `type-*` 유틸리티는 이미 공개된 디자인시스템의 공통 타이포 스타일이므로 유지했습니다. 19개 타이포 표의 개별 크기·행간·자간은 카탈로그의 지역 샘플 값으로 유지해 숫자마다 전역 토큰을 만들지 않습니다. 색상도 브랜드·상태·경계·표면처럼 테마 관리에 필요한 의미가 있으면 사용 횟수만으로 제거하지 않았습니다.

## CSS 우선순위

- Swiper CSS가 app.css 뒤에 로딩되므로 `.swiper-slide { display:block }`을 이겨야 합니다. `.hero .hero-slide`에는 `display:flex`만 두어 `!important`를 제거했습니다. 높이·배경은 기존 `.hero-slide`에 두어 미디어 규칙의 우선순위를 유지합니다.
- 모바일 카테고리 아이콘은 기본 `.category-nav .category-icon`과 선택자 우선순위를 맞춰 43px을 유지했습니다.
- 읽기 예시는 `.ds-doc-section>p`와 충돌하므로 `.ds-doc-section .ds-reading`으로 범위를 명시했습니다.
- 타이포 표는 인라인 `font-size` 대신 지역 `--sample-font-size/line-height/tracking`을 전달합니다. 모바일 규칙이 일반 캐스케이드로 덮어쓸 수 있어 `!important`가 필요 없습니다.
- 접근성 설정인 `prefers-reduced-motion`의 animation/transition/scroll-behavior 3개 `!important`는 다른 효과를 확실하게 중지하기 위해 유지했습니다. 나머지 7개는 제거했습니다.
- 기존 기본 스타일 → 반응형 → 브랜드 보완 → 추가 반응형의 순서를 보존했습니다. 서로 다른 선택자 그룹을 무리하게 합치면 우선순위가 바뀔 수 있으므로 의도적인 보완 규칙은 설명 주석과 함께 유지했습니다. 같은 선택자·미디어 조건·속성의 중복 선언은 없습니다.
- 포커스 외곽선을 없앤 기존 요청은 그대로 유지했습니다.

## 글꼴 확인

`app/layout.php`는 Pretendard JP v1.3.9 동적 서브셋을 실제 로딩하고 있고, 폰트 토큰·타이포 문서·`ss05` 설정도 JP를 명시합니다. 브라우저 검사에서도 Pretendard JP가 로딩되었습니다. README의 Noto Sans KR 설명은 현재 구현과 맞지 않습니다.

[공식 Pretendard 문서](https://github.com/orioncactus/pretendard#패밀리)는 JP를 일본 환경에 적합한 패밀리로 구분합니다. 다만 저장소에는 한국어 UI에 JP를 선택한 이유가 없습니다. **현재 화면을 보존하기 위해 글꼴과 로딩 경로는 변경하지 않았습니다.** 한국어 중심 패밀리로 바꾸려면 별도 작업에서 원래 선택 의도를 확인하고 한글 자폭·줄바꿈·영문 숫자·`ss05`를 비교해야 합니다.

## 검증

- `npm test`: 기존 기능·저장소 테스트 **15개 통과**.
- `npm run check:styles`: **133개 토큰, 31개 소스 파일**, 미사용·미정의·중복 선언·간접 순환 0.
- PHP 진입점과 공통 레이아웃 **17개 문법 검사 통과**, 변경 JS 문법 검사 통과.
- CSS **1,835개 선언의 해석값이 모두 동일**. 추가한 3개 선언은 인라인에서 이동한 타이포 샘플 스타일입니다.
- 1440×900 / 390×900에서 홈, 모금 목록, 정기기부, 로그인, 모금단체, 관리자, 기업, 나의 나눔, 타이포·버튼·아바타 문서 **22개 조건**을 비교했습니다. 역할별 화면은 격리된 브라우저 저장소의 데모 역할로 진입했습니다.
- **22개 모두 DOM 요소 수·계산 스타일·요소 위치/크기 차이 0**. 런타임 오류와 가로 넘침도 0. 20개 캡처는 픽셀까지 일치하고, 나머지 2개는 사진 래스터화의 미세 차이 및 1단계 채널값 차이입니다. 이미지 로딩 실패 캡처는 검출 후 재촬영했습니다.
- 결과: [comparison.json](comparison.json). 로컬 전체 캡처: `before/`, `after/` (생성물이라 Git에서 제외). 예: [홈 데스크톱 전](before/1440-0.png) / [후](after/1440-0.png), [홈 모바일 전](before/390-0.png) / [후](after/390-0.png).
- 별도 빌드 스크립트가 없는 PHP + ES Modules 프로젝트이므로 기존 검증 명령과 PHP·JS 검사로 확인했습니다. 전 브라우저·모든 사용자 데이터·모든 상호작용 상태를 망라한 검증은 아닙니다. 미디어 조건 자체와 원값은 선언 비교로 모두 확인했습니다.

## 변경 파일

- `public/assets/css/tokens.css`: 분류·명명·전역 값 축소.
- `public/assets/css/app.css`, `design-system.css`: 사용처 이관, 불필요한 important 제거, 우선순위 명시.
- `public/assets/js/app.js`: 데모 모달의 미정의 테두리 참조 제거 (원래처럼 선 없음).
- `public/assets/js/pages/account.js`, `operations.js`, `public.js`: 인라인 스타일의 지역 값/새 토큰 이관.
- `public/assets/js/pages/design-system.js`, `design-system-catalog.js`: 샘플 지역 값, 의미별 참조 수정.
- `tests/style-contract.cjs`: 모든 px의 토큰화를 강제하던 검사를 제거하고 전체 런타임 참조·미사용·간접 순환 검사로 강화.
- `docs/token-audit/*`: 조사·변경 계획·사용처·비교 결과 및 재검증 도구.

## 재검증

프로젝트 루트에서 `npm test`, `npm run check:styles`를 실행합니다. `python docs/token-audit/audit.py docs/token-audit/after.json`으로 사용처를 재생성할 수 있습니다 (`tinycss2` 필요).

화면 재검증은 `node docs/token-audit/visual.cjs before` / `after`, `python docs/token-audit/compare.py`입니다. `PLAYWRIGHT_MODULE`, `BROWSER_CHANNEL`, `BASELINE_ROOT` 환경변수로 실행 환경을 바꿀 수 있습니다. 변경 전 소스는 이 작업의 임시 디렉터리 `C:/Users/pc/AppData/Local/Temp/queen-token-baseline`에 보관했으며, 장기 재현에는 이 디렉터리를 함께 보존해야 합니다. `before.json`에는 변경 전 토큰 정의·참조가 별도로 남아 있습니다.
