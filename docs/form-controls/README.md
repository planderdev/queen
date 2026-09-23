# 셀렉트·날짜 입력

- 셀렉트: 네이티브 선택 동작을 유지하고 appearance를 제거, Lucide chevron-down으로 표시합니다.
- 날짜 입력: 로컬 Flatpickr 4.6.13 + 한국어 로케일. date / datetime-local을 공통 hydrate에서 처리합니다.
- 날짜 데이터: YYYY-MM-DD, 날짜·시간: YYYY-MM-DDTHH:mm. 폼 필드 이름, required/min/max와 reset 동작을 유지합니다.
- 테마: 현재 디자인시스템 색상·간격·폰트·모서리·그림자 토큰만 사용합니다. Lucide calendar-days/chevron-left/chevron-right를 사용합니다.
- 모달 내부 달력, 모바일 화면 내 위치, 비활성 상태, Escape, 월 이동 키보드 조작을 확인했습니다.
- 디자인시스템: `/design-system/?topic=datepicker`.
- 브라우저 검증: `node docs/form-controls/check.cjs` (Playwright 필요). 1440px/390px에서 선택·직접 입력·폼 값·datetime·required/min/max·reset·반복 hydrate·비활성 상태·키보드 조작을 확인합니다.
- Flatpickr 파일과 MIT 라이선스는 `public/assets/vendor/flatpickr/`에 포함했습니다. 구현 옵션 근거: https://flatpickr.js.org/options/ , 한국어 로케일: https://flatpickr.js.org/localization/ .
