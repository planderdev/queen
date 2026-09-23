# 퀸만덕 디자인시스템

## 스타일 구조

1. `public/assets/css/tokens.css`: 전역 디자인 값의 유일한 선언 위치.
2. `public/assets/css/app.css`: 사이트 레이아웃, 공통 컴포넌트, 상태와 반응형 규칙.
3. `public/assets/css/design-system.css`: 디자인시스템 문서 페이지에만 로드되는 레이아웃.

이전 별도 오버라이드 스타일시트는 제거했다. 동일 선택자·동일 미디어 조건에서 중복된 속성 선언을 제거했으며, 전역 토큰을 컴포넌트 파일에서 다시 선언하지 않는다. 상태 선택자와 미디어쿼리는 의도적인 표현 변형이다.

## 토큰 사용

- 색상: primary, label, background, line, fill, status, chip, interaction.
- 규격: font-size, weight, leading, tracking, space, size, radius.
- 효과: shadow, duration, layer.
- 전역 토큰은 tokens.css에서만 변경한다. 컴포넌트는 `var(--qm-...)`를 사용한다.
- `--chip-color`, `--avatar-size` 등은 컴포넌트 내부 값 전달용 속성이다. 전역 토큰을 덮어쓰지 않는다.
- 미디어쿼리 경계는 CSS 사용자 정의 속성을 사용할 수 없어 조건식의 숫자를 유지한다.
- 진행률, 사용자 입력, 예시 선택 크기 등 데이터로 결정되는 값은 런타임 계산을 유지한다.
- 디자인시스템 컬러 예시는 `components/tokens.js`의 designToken()으로 실제 CSS 토큰을 읽는다. 타이포그래피 예시도 font-size, line-height, tracking 토큰을 참조한다.

## 브랜드

Primary 컬러 #d73b50(Strong #bc2b44, Heavy #9e3844, Brand soft #fceff1). 로고 보석 5색은 상태 팔레트이며 Primary와 별개다. 로고 2종은 `public/assets/brand/`에 원본으로 보관한다.

| 칩 색상 | 값 | 상태 |
|---|---|---|
| Olive | #a3b166 | 승인·성공·진행·완료 |
| Blue | #8696ad | 접수·심사·처리 중 |
| Lavender | #ac94aa | 임시저장·일시중지·종료·취소 |
| Orange | #d1936a | 보완 요청·예정 |
| Rose | #c77991 | 실패·반려·추천·관심 |

## 문서

`/design-system/?topic=button`과 `&mode=web`으로 탐색한다. 파운데이션 8개, 컴포넌트 24개, 유틸리티 5개. 문서 검색, 상태 비교, 버튼 프리뷰, 칩 선택, 탭 키보드 이동, 스위치, 팝업 예시를 제공한다.

화면의 외부 디자인 출처 섹션·링크와 비교 조사 자료를 제거했다. 배포 라이브러리의 라이선스 파일은 각 vendor 파일과 함께 보관한다.

## 검사

`npm run check:styles`는 토큰 중복, 누락·자기참조, 토큰 외 색상·규격, 동일 조건의 중복 속성, 이전 오버라이드 파일 로딩, 제거된 출처 UI의 재유입을 검사한다.
