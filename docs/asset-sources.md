# 이미지·라이브러리 출처

2026-09-23에 아래 Unsplash 이미지 URL을 실제 다운로드하고 브라우저에서 로딩을 확인했다. 프로젝트의 `public/assets/images/`에 저장해 런타임 이미지 외부 의존을 제거했다. 인물/활동을 실제 지원 대상의 사진이라고 소개하지 않는다. Pixabay 및 비디오는 사용하지 않았다.

| 로컬 파일 | 확인한 원본 이미지 URL | 사용 위치 |
|---|---|---|
| meal.jpg | https://images.unsplash.com/photo-1547592180-85f173990554 | 홈 히어로, 식사 모금, 식사 이야기 |
| child.jpg | https://images.unsplash.com/photo-1503676260728-1c00da094a0b | 교육 모금, 정기기부 |
| dog.jpg | https://images.unsplash.com/photo-1543466835-00a7907e9de1 | 동물 모금 |
| forest.jpg | https://images.unsplash.com/photo-1441974231531-c6227db76b6e | 숲 모금, 정기 배너, 소개 |
| community.jpg | https://images.unsplash.com/photo-1511632765486-a01980e01a18 | 가족·지역사회, 기업 캠페인 |
| ocean.jpg | https://images.unsplash.com/photo-1484291470158-b8f8d608850d | 재난·긴급지원 참고 이미지 |

다운로드 파라미터: `auto=format&fit=crop&w=1200&q=85`. 실제 사진의 저자 및 Unsplash의 사진 상세 페이지 permalink는 확인하지 못했다. 존재하지 않는 상세 페이지를 만들지 않았으며, 공개 배포 전 원본 상세 페이지/저작자 출처를 보완해야 한다. 현재 제공하는 출처는 실제 접근한 이미지 원본 URL이다.

`fallback.svg`는 프로젝트에서 직접 작성한 기본 이미지다. 외부 이미지 로딩 실패 시 적용된다.

Pretendard: jsDelivr CDN dynamic subset 스타일시트(공개 사이트), 관리자 화면은 `public/assets/vendor/sports-admin/vendor/PretendardVariable.woff2` 로컬 파일. Noto Sans KR은 폴백 서체. Lucide/Swiper 라이선스는 vendor 폴더에 포함. 상세 컴포넌트 출처는 component-sources.md.
