# 컴포넌트 출처

조사: 2026-09-23. 페이지와 표시된 코드를 브라우저에서 직접 읽음.

## Origin UI — Accordion (W/ sub-header and chevron)

- 실제 URL: https://21st.dev/@originui/components/accordion/w-sub-header-and-chevron
- 페이지 표기 라이선스: MIT License
- 원본 의존성: React, @radix-ui/react-accordion, @radix-ui/react-icons, lucide-react, Tailwind 유틸리티
- 원본 구조: Accordion / AccordionItem / AccordionTrigger / AccordionContent, 제목+보조설명, chevron, 펼침 상태
- 적용: 고객센터 FAQ, 정기기부 FAQ, 디자인시스템
- 이식: `components/ui.js`의 `accordion`, `hydrate`; React/Radix 상태를 HTML button + aria-expanded + aria-controls + hidden으로 전환. ArrowUp/Down, Home/End, Enter/Space를 지원. ID는 화면 내 고유 항목 번호로 생성. 기본 형상은 퀸만덕 border/spacing/color 토큰으로 교체.
- 이식된 코드는 원본 문구나 클래스명을 복사하지 않고, 확인한 구조와 동작을 순수 JS로 재구현했다. 원본 고유 코드의 대량 복사는 없다.
- 다른 컴포넌트(카드·표·모달·스텝퍼·폼·업로드·토스트)는 이 프로젝트에서 직접 작성. 21st.dev에서 실제 도입하지 않은 항목을 사용했다고 주장하지 않는다.

## 공식 라이브러리

- Lucide: https://lucide.dev/icons/ — npm `lucide`, 로컬 UMD, ISC 라이선스 파일 `public/assets/vendor/LUCIDE-LICENSE`.
- Swiper: https://swiperjs.com/ — npm `swiper`, 로컬 ES Modules와 CSS, MIT 라이선스 파일 `public/assets/vendor/SWIPER-LICENSE`. 홈 배너만 제어. 일시정지, reduced-motion, 키보드 버튼 제공.
- 복잡한 모션 필요성이 없어 GSAP/AOS/Lenis는 사용하지 않는다. 스크롤 가로채기 없음.

설치 버전은 package.json / package-lock.json에 고정되어 있다.
