# 변경 전 토큰 인벤토리

런타임 CSS·JS·PHP의 참조 횟수입니다. 토큰 간 참조와 유한한 동적 타이포/아이콘/아바타 참조를 포함합니다. 문서·테스트 언급은 `before.json`의 `other_mentions`에 별도 기록했습니다. 모든 선언은 변경 전 `public/assets/css/tokens.css`의 `:root`에 있습니다. 전체 사용처와 CSS 선택자·속성은 `before.json`에서 확인할 수 있습니다.

| 토큰 | 선언 줄 | 해석값 | 사용 횟수 | 사용 컴포넌트/파일 (대표 최대 4개) | 처리 |
|---|---:|---|---:|---|---|
| `--qm-chip-olive` | 3 | `#a3b166` | 5 | app.css: .badge.olive,.badge.green / --chip-color<br>design-system.css: .ds-dodont>div / border-top<br>design-system.css: .qm-chip.olive / --chip-color<br>design-system-catalog.js: nToken('--qm-label-strong')],['Inverse label',designToken('--qm-background-elevated')],['Dimmer',designToken('--qm-material- | 유지 |
| `--qm-chip-blue` | 4 | `#8696ad` | 4 | app.css: .badge.blue,.image-badge / --chip-color<br>design-system.css: .qm-chip.blue / --chip-color<br>design-system-catalog.js: ,designToken('--qm-background-elevated')],['Dimmer',designToken('--qm-material-dimmer')]]]]; export const tones=[['olive',de<br>design-system.js: </div>`)+section('status','Status mapping',table(['컬러','값','상태'],[['Olive',designToken('--qm-chip-olive'),'승인 · 성공 · 진행 · 지급 · 처리 완료 | 유지 |
| `--qm-chip-lavender` | 5 | `#ac94aa` | 5 | app.css: .badge,.image-badge / --chip-color<br>app.css: .badge.lavender,.image-badge.ended / --chip-color<br>design-system.css: .qm-chip.lavender / --chip-color<br>design-system-catalog.js: ',designToken('--qm-material-dimmer')]]]]; export const tones=[['olive',designToken('--qm-chip-olive'),'승인'],['blue',designT | 유지 |
| `--qm-chip-orange` | 6 | `#d1936a` | 4 | app.css: .badge.orange / --chip-color<br>design-system.css: .qm-chip.orange / --chip-color<br>design-system-catalog.js: nst tones=[['olive',designToken('--qm-chip-olive'),'승인'],['blue',designToken('--qm-chip-blue'),'심사 중'],['lavender',designTok<br>design-system.js: 공 · 진행 · 지급 · 처리 완료'],['Blue',designToken('--qm-chip-blue'),'접수 · 검토 요청 · 심사 · 처리 중'],['Lavender',designToken('--qm-chip-lavender'), | 유지 |
| `--qm-chip-rose` | 7 | `#c77991` | 5 | app.css: .badge.rose,.badge.red,.badge.brand / --chip-color<br>design-system.css: .ds-dodont>div+div / border-color<br>design-system.css: .qm-chip / --chip-color<br>design-system.css: .qm-chip.rose / --chip-color | 유지 |
| `--qm-chip-label` | 8 | `#171719` | 2 | design-system.css: .ds-palette>div / color<br>design-system.css: .ds-avatar / color | 유지 |
| `--qm-primary-normal` | 9 | `#c77991` | 25 | app.css: .brand / color<br>app.css: .main-nav a:hover,.main-nav [aria-current] / border-color<br>app.css: .section-head h2 span / color<br>app.css: .category-nav a.active / color | 유지 |
| `--qm-primary-strong` | 10 | `#91465e` | 20 | app.css: .field input:focus,.field textarea:focus / border-color<br>app.css: @media (max-width:800px) / .mobile-donate strong / color<br>app.css: .main-nav a:hover,.main-nav [aria-current] / color<br>app.css: .hero .button / color | 유지 |
| `--qm-primary-heavy` | 11 | `#713348` | 1 | design-system-catalog.js: eraction','WithInteraction']]]]; export const colors=[['Primary',[['Normal',designToken('--qm-primary-normal')],['Strong',de | 유지 |
| `--qm-label-normal` | 12 | `#171719` | 13 | app.css: body / color<br>app.css: dialog / color<br>app.css: h1,h2,h3 / color<br>app.css: .field input,.field select,.field textarea / color | 유지 |
| `--qm-label-strong` | 13 | `#000` | 2 | design-system-catalog.js: -normal')],['Strong',designToken('--qm-primary-strong')],['Heavy',designToken('--qm-primary-heavy')]]],['Label',[['Normal',d<br>design-system-catalog.js: ignToken('--qm-status-cautionary')],['Negative',designToken('--qm-status-negative')]]],['Static & inverse',[['White',designT | 유지 |
| `--qm-label-neutral` | 14 | `#46474c` | 21 | app.css: .image-badge / color<br>app.css: .bookmark / color<br>app.css: .impact-number / color<br>app.css: .footer-top .brand / color | 유지 |
| `--qm-label-alternative` | 15 | `#68696f` | 46 | app.css: p / color<br>app.css: .topline / color<br>app.css: .login-link / color<br>app.css: .text-link / color | 유지 |
| `--qm-label-assistive` | 16 | `#989ba2` | 5 | app.css: .field :is(input,select,textarea):hover:not(:disabled) / border-color<br>design-system.css: .ds-nav-group h2 / color<br>design-system.css: .ds-mode a / color<br>design-system-catalog.js: normal')],['Strong',designToken('--qm-label-strong')],['Neutral',designToken('--qm-label-neutral')],['Alternative',designTok | 유지 |
| `--qm-label-disable` | 17 | `#c4c5c9` | 2 | design-system.css: .qm-switch / background<br>design-system-catalog.js: ng')],['Neutral',designToken('--qm-label-neutral')],['Alternative',designToken('--qm-label-alternative')],['Assistive',desig | 유지 |
| `--qm-fill-normal` | 18 | `#70737c14` | 6 | app.css: .button.secondary:hover,.icon-button:hover / background<br>app.css: .button:disabled / background<br>app.css: .progress / background<br>design-system.css: .qm-chip / background | 유지 |
| `--qm-fill-strong` | 19 | `#70737c29` | 0 | Fill Strong 문서의 Line Normal 참조를 바로잡아 사용 | 역할 분리 유지 |
| `--qm-fill-alternative` | 20 | `#70737c0a` | 4 | app.css: tbody tr:hover / background<br>app.css: .accordion-trigger:hover / background<br>design-system.css: .ds-nav-group a:hover / background<br>design-system-catalog.js: stive')],['Disable',designToken('--qm-label-disable')]]],['Fill',[['Normal',designToken('--qm-fill-normal')],['Strong',desig | 유지 |
| `--qm-line-normal` | 21 | `#70737c29` | 3 | app.css: .qm-divider / border-top<br>design-system-catalog.js: ive')],['Assistive',designToken('--qm-label-assistive')],['Disable',designToken('--qm-label-disable')]]],['Fill',[['Normal',<br>design-system-catalog.js: Fill',[['Normal',designToken('--qm-fill-normal')],['Strong',designToken('--qm-line-normal')],['Alternative',designToken('--q | 유지 |
| `--qm-line-solid` | 22 | `#e1e2e4` | 30 | app.css: .topline / border-bottom<br>app.css: .site-header / border-bottom<br>app.css: .category-nav / border-bottom<br>app.css: .fund-card / border | 유지 |
| `--qm-background-normal` | 23 | `#fff` | 28 | app.css: body / background<br>app.css: .skip / background<br>app.css: .site-header / background<br>app.css: .hero .button / background | 유지 |
| `--qm-background-alternative` | 24 | `#f7f7f8` | 19 | app.css: .topline / background<br>app.css: .icon-button:hover / background<br>app.css: .category-nav .category-icon / background<br>app.css: .impact-strip / background | 유지 |
| `--qm-background-elevated` | 25 | `#fff` | 4 | design-system-catalog.js: )],['Neutral',designToken('--qm-color-detail-66')],['Alternative',designToken('--qm-fill-normal')],['Solid',designToken('--q<br>design-system-catalog.js: gnToken('--qm-line-solid')]]],['Background',[['Normal',designToken('--qm-background-elevated')],['Alternative',designToken('<br>design-system-catalog.js: gnToken('--qm-status-positive')],['Cautionary',designToken('--qm-status-cautionary')],['Negative',designToken('--qm-status-n<br>design-system-catalog.js: ignToken('--qm-status-negative')]]],['Static & inverse',[['White',designToken('--qm-background-elevated')],['Black',designTo | 유지 |
| `--qm-status-positive` | 26 | `#16834b` | 2 | app.css: .success-icon / color<br>design-system-catalog.js: nToken('--qm-brand-soft')]]],['Interaction',[['Inactive',designToken('--qm-label-assistive')],['Disable',designToken('--qm-c | 유지 |
| `--qm-status-cautionary` | 27 | `#976017` | 1 | design-system-catalog.js: tive',designToken('--qm-label-assistive')],['Disable',designToken('--qm-color-detail-67')]]],['Status',[['Positive',designTo | 유지 |
| `--qm-status-negative` | 28 | `#c33737` | 5 | app.css: .button.danger / color<br>app.css: .form-error / color<br>app.css: .field [aria-invalid=true] / border-color<br>app.css: .field:has([aria-invalid=true]) .help / color | 유지 |
| `--qm-material-dimmer` | 29 | `#17171985` | 2 | app.css: dialog::backdrop / background<br>design-system-catalog.js: rse',[['White',designToken('--qm-background-elevated')],['Black',designToken('--qm-label-strong')],['Inverse label',designTo | 유지 |
| `--qm-brand-soft` | 30 | `#fbf0f4` | 11 | app.css: .category-nav a:hover .category-icon,.category-nav a.active .category-icon / background<br>app.css: .story-hero / background<br>app.css: .hero / background<br>app.css: .mini-banner / background | 유지 |
| `--qm-on-primary` | 31 | `#fff` | 3 | app.css: .button.primary / color<br>app.css: .button.primary:hover / color<br>app.css: .badge,.image-badge / color | 유지 |
| `--qm-space-4` | 32 | `4px` | 5 | app.css: .impact-number small / margin-bottom<br>app.css: .ops-sidebar a / margin<br>app.css: .badge / padding<br>design-system.css: .ds-list small / margin-top | 유지 |
| `--qm-space-8` | 33 | `8px` | 27 | app.css: .image-badge / padding<br>app.css: .button / gap<br>app.css: .pagination / gap<br>app.css: .steps / gap | 유지 |
| `--qm-space-12` | 34 | `12px` | 38 | app.css: .header-tools / gap<br>app.css: .category-nav / padding<br>app.css: .mini-banner p / margin-bottom<br>app.css: .ops-sidebar h2 / padding | 유지 |
| `--qm-space-16` | 35 | `16px` | 48 | app.css: .skip / padding<br>app.css: .hero h1 / margin-bottom<br>app.css: .site-footer p / margin<br>app.css: .checkbox / margin | 유지 |
| `--qm-space-20` | 36 | `20px` | 53 | app.css: .hero .button / padding<br>app.css: .section-head / gap<br>app.css: .org-label / margin-bottom<br>app.css: .impact-strip / gap | 유지 |
| `--qm-space-24` | 37 | `24px` | 39 | app.css: .card-grid / gap<br>app.css: .impact-strip / padding<br>app.css: .split-banners / gap<br>app.css: .footer-top,.footer-bottom / gap | 유지 |
| `--qm-space-32` | 38 | `32px` | 11 | app.css: @media (max-width:1100px) / .hero-text / padding-left<br>app.css: @media (max-width:480px) / .section / padding-top<br>app.css: .dialog-head / padding<br>app.css: .dialog-body / padding | 유지 |
| `--qm-space-40` | 39 | `40px` | 11 | app.css: .hero-text / padding<br>app.css: .detail-layout / gap<br>design-system.css: .ds-doc-top / gap<br>design-system.css: .ds-sidebar / padding | 유지 |
| `--qm-space-48` | 40 | `48px` | 2 | app.css: @media (min-width:1600px) / .hero-text / padding-left<br>design-system.css: .ds-workspace / padding | 유지 |
| `--qm-radius-8` | 41 | `8px` | 11 | app.css: .progress / border-radius<br>app.css: .progress span / border-radius<br>app.css: @media (max-width:480px) / .fund-card / border-radius<br>app.css: .button.small,td .button / border-radius | 유지 |
| `--qm-radius-12` | 42 | `12px` | 18 | app.css: .detail-cover / border-radius<br>app.css: .donation-summary / border-radius<br>app.css: .panel / border-radius<br>app.css: .empty / border-radius | 유지 |
| `--qm-radius-16` | 43 | `16px` | 6 | app.css: .hero / border-radius<br>app.css: .category-nav .category-icon / border-radius<br>app.css: .mini-banner / border-radius<br>design-system.css: .ds-palette / border-radius | 유지 |
| `--qm-type-display` | 44 | `700 40px/52px 'Pretendard JP','Noto Sans KR',sans-serif` | 1 | app.css: .qm-type-display / font | 유지 |
| `--qm-type-title` | 45 | `700 32px/44px 'Pretendard JP','Noto Sans KR',sans-serif` | 1 | app.css: .qm-type-title / font | 유지 |
| `--qm-type-heading` | 46 | `600 22px/30px 'Pretendard JP','Noto Sans KR',sans-serif` | 1 | app.css: .qm-type-heading / font | 유지 |
| `--qm-type-body` | 47 | `400 16px/24px 'Pretendard JP','Noto Sans KR',sans-serif` | 1 | app.css: .qm-type-body / font | 유지 |
| `--qm-type-label` | 48 | `500 14px/20px 'Pretendard JP','Noto Sans KR',sans-serif` | 1 | app.css: .qm-type-label / font | 유지 |
| `--qm-type-caption` | 49 | `400 12px/16px 'Pretendard JP','Noto Sans KR',sans-serif` | 1 | app.css: .qm-type-caption / font | 유지 |
| `--qm-color-warm` | 50 | `#f5f5ed` | 0 | 없음 | 미사용 제거 |
| `--qm-font-size-14` | 51 | `14px` | 27 | app.css: .hero p / font-size<br>app.css: .page-heading p / font-size<br>app.css: .check-row / font-size<br>app.css: .accordion-panel / font-size | 역할명으로 변경 → `--qm-font-size-label` |
| `--qm-shadow` | 52 | `0 8px 30px #233b2910` | 2 | app.css: .fund-card:hover / box-shadow<br>app.css: #toast / box-shadow | 역할명으로 변경 → `--qm-shadow-raised` |
| `--qm-container` | 53 | `1100px` | 1 | app.css: .container / width | 역할명으로 변경 → `--qm-layout-content-width` |
| `--qm-motion` | 54 | `180ms` | 0 | 없음 | 미사용 제거 |
| `--qm-z-header` | 55 | `20` | 0 | 없음 | 미사용 제거 |
| `--qm-z-overlay` | 56 | `100` | 0 | 없음 | 미사용 제거 |
| `--qm-container-wide` | 57 | `1440px` | 1 | app.css: @media (min-width:1600px) / .container / width | 역할명으로 변경 → `--qm-layout-wide-width` |
| `--qm-font-family` | 58 | `'Pretendard JP','Noto Sans KR',Arial,sans-serif` | 1 | app.css: body / font-family | 유지 |
| `--qm-font-size-15` | 59 | `15px` | 13 | app.css: body / font-size<br>app.css: .card-numbers strong / font-size<br>app.css: .impact-strip strong / font-size<br>app.css: @media (max-width:1100px) / .card-copy h3 / font-size | 역할명으로 변경 → `--qm-font-size-body-small` |
| `--qm-size-21` | 60 | `21px` | 2 | app.css: svg / width<br>app.css: svg / height | 원값을 로컬에 유지 → `21px` |
| `--qm-font-size-36` | 61 | `36px` | 3 | app.css: h1 / font-size<br>design-system.css: .ds-document-header h1 / font-size<br>design-system.js: dynamic typography: Display 3 | 원값을 로컬에 유지 → `36px` |
| `--qm-leading-1_4` | 62 | `1.4` | 1 | app.css: h1 / line-height | 원값을 로컬에 유지 → `1.4` |
| `--qm-font-size-26` | 63 | `26px` | 2 | app.css: h2 / font-size<br>public.js: <h1 style="font-size:var( | 원값을 로컬에 유지 → `26px` |
| `--qm-leading-1_45` | 64 | `1.45` | 3 | app.css: h2 / line-height<br>app.css: .hero h1 / line-height<br>app.css: .detail-story h1 / line-height | 원값을 로컬에 유지 → `1.45` |
| `--qm-font-size-18` | 65 | `18px` | 4 | app.css: h3 / font-size<br>app.css: .ops-sidebar h2 / font-size<br>app.css: @media (max-width:480px) / .section-head h2 / font-size<br>design-system.js: dynamic typography: Headline 1 | 역할명으로 변경 → `--qm-font-size-headline` |
| `--qm-leading-1_6` | 66 | `1.6` | 2 | app.css: h3 / line-height<br>app.css: body / line-height | 역할명으로 변경 → `--qm-leading-body` |
| `--qm-size-3` | 67 | `3px` | 5 | app.css: .main-nav a / border-bottom<br>app.css: .steps li / border-bottom<br>design-system.css: .ds-dodont>div / border-top<br>design-system.css: .qm-switch.small:before / left | 원값을 로컬에 유지 → `3px` |
| `--qm-size-4` | 68 | `4px` | 3 | app.css: .progress / height<br>design-system.css: .qm-switch:before / left<br>design-system.css: .qm-switch:before / top | 원값을 로컬에 유지 → `4px` |
| `--qm-size-64` | 69 | `64px` | 3 | app.css: .container / width<br>app.css: @media (min-width:1600px) / .container / width<br>design-system-catalog.js: dynamic avatar example | 원값을 로컬에 유지 → `64px` |
| `--qm-size-negative-100` | 70 | `-100px` | 1 | app.css: .skip / top | 원값을 로컬에 유지 → `-100px` |
| `--qm-size-10` | 71 | `10px` | 2 | app.css: .skip / left<br>app.css: .bookmark / right | 원값을 로컬에 유지 → `10px` |
| `--qm-layer-1000` | 72 | `1000` | 1 | app.css: .skip / z-index | 역할명으로 변경 → `--qm-z-skip-link` |
| `--qm-size-8` | 73 | `8px` | 3 | app.css: .skip:focus / top<br>app.css: @media (max-width:480px) / .image-badge / top<br>app.css: @media (max-width:480px) / .image-badge / left | 원값을 로컬에 유지 → `8px` |
| `--qm-size-1` | 74 | `1px` | 62 | app.css: .topline / border-bottom<br>app.css: .site-header / border-bottom<br>app.css: .hero-controls / border<br>app.css: .category-nav / border-bottom | 원값을 로컬에 유지 → `1px` |
| `--qm-font-size-11` | 75 | `11px` | 29 | app.css: .topline / font-size<br>app.css: .hero-controls / font-size<br>app.css: .category-label / font-size<br>app.css: .org-label / font-size | 역할명으로 변경 → `--qm-font-size-caption-small` |
| `--qm-size-30` | 76 | `30px` | 7 | app.css: .topline .container / height<br>app.css: .bookmark / width<br>app.css: .bookmark / height<br>app.css: td .button / min-height | 원값을 로컬에 유지 → `30px` |
| `--qm-font-size-10` | 77 | `10px` | 14 | app.css: .topline span / font-size<br>app.css: .image-badge / font-size<br>app.css: .card-numbers small / font-size<br>app.css: .site-footer .fine / font-size | 역할명으로 변경 → `--qm-font-size-compact` |
| `--qm-layer-20` | 78 | `20` | 1 | app.css: .site-header / z-index | 역할명으로 변경 → `--qm-z-header` |
| `--qm-size-86` | 79 | `86px` | 2 | app.css: .header-inner / height<br>app.css: .main-nav a / height | 원값을 로컬에 유지 → `86px` |
| `--qm-space-7` | 80 | `7px` | 9 | app.css: .brand / gap<br>app.css: .hero-controls / padding<br>app.css: .section-head p / margin<br>app.css: .text-link / gap | 원값을 로컬에 유지 → `7px` |
| `--qm-font-size-27` | 81 | `27px` | 5 | app.css: .brand / font-size<br>app.css: .amount-input input / font-size<br>app.css: @media (max-width:800px) / .hero h1 / font-size<br>app.css: @media (max-width:480px) / .page-heading h1 / font-size | 원값을 로컬에 유지 → `27px` |
| `--qm-weight-900` | 82 | `900` | 1 | app.css: .brand / font-weight | 원값을 로컬에 유지 → `900` |
| `--qm-tracking-negative-1_5` | 83 | `-1.5px` | 1 | app.css: .brand / letter-spacing | 원값을 로컬에 유지 → `-1.5px` |
| `--qm-size-33` | 84 | `33px` | 0 | 없음 | 미사용 제거 |
| `--qm-size-38` | 85 | `38px` | 3 | app.css: @media (max-width:800px) / .hero .button / min-height<br>app.css: @media (max-width:480px) / .hero h1 / line-height<br>design-system.js: dynamic typography: Title 2 | 원값을 로컬에 유지 → `38px` |
| `--qm-font-size-7` | 86 | `7px` | 0 | 없음 | 미사용 제거 |
| `--qm-tracking-_5` | 87 | `.5px` | 0 | 없음 | 미사용 제거 |
| `--qm-space-3` | 88 | `3px` | 9 | app.css: .main-nav a / padding-top<br>app.css: .hero-controls / padding<br>app.css: .hero-controls button / padding<br>app.css: .image-badge / padding | 원값을 로컬에 유지 → `3px` |
| `--qm-weight-700` | 89 | `700` | 7 | app.css: .category-nav a.active / font-weight<br>app.css: .image-badge / font-weight<br>app.css: .tabs [aria-current] / font-weight<br>app.css: .steps li.active / font-weight | 역할명으로 변경 → `--qm-weight-bold` |
| `--qm-font-size-16` | 90 | `16px` | 13 | app.css: .main-nav / font-size<br>app.css: .card-copy h3 / font-size<br>app.css: .article-body / font-size<br>app.css: .field input,.field select,.field textarea / font-size | 역할명으로 변경 → `--qm-font-size-body` |
| `--qm-weight-650` | 91 | `650` | 8 | app.css: .main-nav / font-weight<br>app.css: .card-copy h3 / font-weight<br>app.css: .card-numbers b / font-weight<br>app.css: .eyebrow / font-weight | 원값을 로컬에 유지 → `650` |
| `--qm-space-6` | 92 | `6px` | 8 | app.css: .icon-button / padding<br>app.css: @media (max-width:480px) / .card-copy h3 / margin<br>app.css: @media (max-width:480px) / .image-badge / padding<br>design-system.css: .ds-toc a / padding | 원값을 로컬에 유지 → `6px` |
| `--qm-font-size-12` | 93 | `12px` | 41 | app.css: .login-link / font-size<br>app.css: .text-link / font-size<br>app.css: .category-nav a / font-size<br>app.css: .card-numbers b / font-size | 역할명으로 변경 → `--qm-font-size-caption` |
| `--qm-space-30` | 94 | `30px` | 8 | app.css: .hero-wrap / padding-top<br>app.css: .impact-strip / padding<br>app.css: .mini-banner / padding<br>app.css: .ops-sidebar / padding | 원값을 로컬에 유지 → `30px` |
| `--qm-size-340` | 95 | `340px` | 3 | app.css: .hero / min-height<br>app.css: .hero-slide / min-height<br>app.css: .detail-layout / grid-template-columns | 원값을 로컬에 유지 → `340px` |
| `--qm-space-42` | 96 | `42px` | 0 | 없음 | 미사용 제거 |
| `--qm-space-45` | 97 | `45px` | 3 | app.css: .hero-text / padding<br>app.css: .notice-row / margin-top<br>app.css: @media (max-width:480px) / .site-footer / margin-top | 원값을 로컬에 유지 → `45px` |
| `--qm-layer-2` | 98 | `2` | 1 | app.css: .hero-text / z-index | 원값을 로컬에 유지 → `2` |
| `--qm-space-17` | 99 | `17px` | 4 | app.css: .story-card img / margin-bottom<br>app.css: .donation-summary h2 / margin<br>app.css: @media (max-width:1100px) / .card-grid / gap<br>app.css: @media (max-width:480px) / .dialog-head / padding | 원값을 로컬에 유지 → `17px` |
| `--qm-font-size-35` | 100 | `35px` | 1 | app.css: .hero h1 / font-size | 원값을 로컬에 유지 → `35px` |
| `--qm-weight-750` | 101 | `750` | 3 | app.css: .hero h1 / font-weight<br>app.css: .section-head h2 / font-weight<br>app.css: .impact-number / font-weight | 원값을 로컬에 유지 → `750` |
| `--qm-tracking-negative-1_8` | 102 | `-1.8px` | 1 | app.css: .hero h1 / letter-spacing | 원값을 로컬에 유지 → `-1.8px` |
| `--qm-leading-1_9` | 103 | `1.9` | 2 | app.css: .hero p / line-height<br>app.css: .site-footer .fine / line-height | 원값을 로컬에 유지 → `1.9` |
| `--qm-space-23` | 104 | `23px` | 6 | app.css: .hero p / margin-bottom<br>app.css: .footer-top>div,.footer-bottom>div / gap<br>app.css: @media (max-width:1100px) / .main-nav / gap<br>app.css: @media (max-width:480px) / .detail-layout / padding-top | 원값을 로컬에 유지 → `23px` |
| `--qm-font-size-13` | 105 | `13px` | 27 | app.css: .hero .button / font-size<br>app.css: .section-head p / font-size<br>app.css: .checkbox / font-size<br>app.css: .list-meta / font-size | 역할명으로 변경 → `--qm-font-size-label-small` |
| `--qm-space-10` | 106 | `10px` | 23 | app.css: .hero .button / padding<br>app.css: .hero-controls / gap<br>app.css: .category-nav / gap<br>app.css: .mini-banner h3 / margin | 원값을 로컬에 유지 → `10px` |
| `--qm-size-42` | 107 | `42px` | 1 | app.css: .hero .button / min-height | 원값을 로컬에 유지 → `42px` |
| `--qm-size-24` | 108 | `24px` | 16 | app.css: .hero-controls / bottom<br>app.css: .hero-controls / right<br>app.css: .field input,.field select,.field textarea / line-height<br>app.css: .accordion-trigger / line-height | 원값을 로컬에 유지 → `24px` |
| `--qm-layer-3` | 109 | `3` | 1 | app.css: .hero-controls / z-index | 원값을 로컬에 유지 → `3` |
| `--qm-surface-glass` | 110 | `#ffffffee` | 1 | app.css: .hero-controls / background | 유지 |
| `--qm-line-on-image` | 111 | `#ffffff80` | 1 | app.css: .hero-controls / border | 유지 |
| `--qm-radius-30` | 112 | `30px` | 2 | app.css: .hero-controls / border-radius<br>app.css: .demo-launch / border-radius | 원값을 로컬에 유지 → `30px` |
| `--qm-size-25` | 113 | `25px` | 6 | app.css: .hero-controls button / width<br>app.css: .hero-controls button / height<br>app.css: .category-nav svg / width<br>app.css: .category-nav svg / height | 원값을 로컬에 유지 → `25px` |
| `--qm-size-15` | 114 | `15px` | 5 | app.css: .hero-controls svg / width<br>app.css: .hero-controls svg / height<br>app.css: #toast / transform<br>app.css: @media (max-width:800px) / .hero-controls / right | 원값을 로컬에 유지 → `15px` |
| `--qm-space-51` | 115 | `51px` | 1 | app.css: .section / padding-top | 원값을 로컬에 유지 → `51px` |
| `--qm-space-5` | 116 | `5px` | 6 | app.css: .section / padding-bottom<br>app.css: .card-numbers / gap<br>app.css: .button.small / padding<br>app.css: td .actions / gap | 원값을 로컬에 유지 → `5px` |
| `--qm-space-22` | 117 | `22px` | 15 | app.css: .section-head / margin-bottom<br>app.css: .notice-row / padding<br>app.css: .list-meta / margin<br>app.css: .notice / margin-bottom | 원값을 로컬에 유지 → `22px` |
| `--qm-font-size-24` | 118 | `24px` | 6 | app.css: .section-head h2 / font-size<br>app.css: .article-body h2 / font-size<br>app.css: @media (max-width:800px) / .brand / font-size<br>app.css: @media (max-width:800px) / .story-hero h2 / font-size | 역할명으로 변경 → `--qm-font-size-title-small` |
| `--qm-size-16` | 119 | `16px` | 19 | app.css: .text-link svg / width<br>app.css: .demo-launch svg / width<br>app.css: .demo-launch svg / height<br>app.css: .chart-bar / min-width | 원값을 로컬에 유지 → `16px` |
| `--qm-space-26` | 120 | `26px` | 3 | app.css: .category-nav / padding<br>app.css: .footer-bottom / margin-top<br>app.css: .page-heading / padding | 원값을 로컬에 유지 → `26px` |
| `--qm-space-25` | 121 | `25px` | 15 | app.css: .category-nav / padding<br>app.css: .story-grid / gap<br>app.css: .notice-row / gap<br>app.css: .filters / margin | 원값을 로컬에 유지 → `25px` |
| `--qm-space-9` | 122 | `9px` | 7 | app.css: .category-nav a / gap<br>app.css: .card-copy h3 / margin<br>app.css: .checkbox / gap<br>app.css: .article-caption / margin | 원값을 로컬에 유지 → `9px` |
| `--qm-size-65` | 123 | `65px` | 1 | app.css: .category-nav a / min-width | 원값을 로컬에 유지 → `65px` |
| `--qm-size-49` | 124 | `49px` | 3 | app.css: .category-nav .category-icon / width<br>app.css: .category-nav .category-icon / height<br>app.css: .card-copy h3 / min-height | 원값을 로컬에 유지 → `49px` |
| `--qm-duration-200` | 125 | `.2s` | 4 | app.css: .category-nav .category-icon / transition<br>app.css: .fund-card / transition<br>app.css: #toast / transition | 역할명으로 변경 → `--qm-motion-transition` |
| `--qm-duration-350` | 126 | `.35s` | 1 | app.css: .card-image img / transition | 역할명으로 변경 → `--qm-motion-image` |
| `--qm-size-13` | 127 | `13px` | 2 | app.css: .image-badge / top<br>app.css: .image-badge / left | 원값을 로컬에 유지 → `13px` |
| `--qm-radius-4` | 128 | `4px` | 3 | app.css: .image-badge / border-radius<br>design-system.css: .ds-dodont>div / border-radius<br>design-system.css: .ds-space-list span / border-radius | 유지 |
| `--qm-size-12` | 129 | `12px` | 3 | app.css: .bookmark / top<br>app.css: @media (max-width:480px) / .demo-launch / right<br>app.css: @media (max-width:480px) / .demo-launch / bottom | 원값을 로컬에 유지 → `12px` |
| `--qm-surface-bookmark` | 130 | `#ffffffde` | 1 | app.css: .bookmark / background | 유지 |
| `--qm-size-17` | 131 | `17px` | 6 | app.css: .bookmark svg / width<br>app.css: .bookmark svg / height<br>app.css: .checkbox input / width<br>app.css: .checkbox input / height | 원값을 로컬에 유지 → `17px` |
| `--qm-weight-600` | 132 | `600` | 10 | app.css: .category-label / font-weight<br>app.css: .field>span / font-weight<br>app.css: th / font-weight<br>app.css: .button / font-weight | 역할명으로 변경 → `--qm-weight-semibold` |
| `--qm-leading-1_55` | 133 | `1.55` | 1 | app.css: .card-copy h3 / line-height | 원값을 로컬에 유지 → `1.55` |
| `--qm-space-11` | 134 | `11px` | 3 | app.css: .card-numbers / margin-top<br>app.css: .field input,.field textarea,.field select / padding<br>app.css: @media (max-width:480px) / .footer-top>div / gap | 원값을 로컬에 유지 → `11px` |
| `--qm-weight-400` | 135 | `400` | 4 | app.css: .card-numbers small / font-weight<br>app.css: .impact-number small / font-weight<br>app.css: .accordion-trigger small / font-weight<br>design-system.css: .ds-font-hero small / font-weight | 역할명으로 변경 → `--qm-weight-regular` |
| `--qm-space-34` | 136 | `34px` | 4 | app.css: .impact-strip / margin-top<br>app.css: .detail-layout / padding-top<br>app.css: .article-body h2 / margin<br>app.css: .ops-sidebar / padding | 원값을 로컬에 유지 → `34px` |
| `--qm-line-soft` | 137 | `#edf0e8` | 1 | app.css: .impact-strip / border | 유지 |
| `--qm-radius-10` | 138 | `10px` | 4 | app.css: .impact-strip / border-radius<br>app.css: .filters / border-radius<br>app.css: .skeleton / border-radius<br>app.css: .preview-paper / border-radius | 원값을 로컬에 유지 → `10px` |
| `--qm-space-14` | 139 | `14px` | 9 | app.css: .impact-strip .intro / gap<br>app.css: .filters / gap<br>app.css: .detail-story h1 / margin<br>app.css: @media (max-width:480px) / .hero p / margin-bottom | 원값을 로컬에 유지 → `14px` |
| `--qm-size-32` | 140 | `32px` | 11 | app.css: .impact-strip .intro svg / width<br>app.css: .impact-strip .intro svg / height<br>app.css: .button.small / min-height<br>app.css: .button.small,td .button / min-height | 원값을 로컬에 유지 → `32px` |
| `--qm-font-size-22` | 141 | `22px` | 5 | app.css: .impact-number / font-size<br>app.css: @media (max-width:1100px) / .stat strong / font-size<br>app.css: .panel h2 / font-size<br>design-system.css: .ds-doc-section>h2 / font-size | 역할명으로 변경 → `--qm-font-size-heading` |
| `--qm-space-29` | 142 | `29px` | 1 | app.css: .mini-banner / padding | 원값을 로컬에 유지 → `29px` |
| `--qm-font-size-21` | 143 | `21px` | 3 | app.css: .mini-banner h3 / font-size<br>app.css: @media (max-width:480px) / .article-body h2 / font-size<br>design-system.css: .ds-doc-wordmark / font-size | 원값을 로컬에 유지 → `21px` |
| `--qm-size-125` | 144 | `125px` | 2 | app.css: .mini-banner img / width<br>app.css: .mini-banner img / height | 원값을 로컬에 유지 → `125px` |
| `--qm-tracking-1` | 145 | `1px` | 1 | app.css: .eyebrow / letter-spacing | 원값을 로컬에 유지 → `1px` |
| `--qm-radius-11` | 146 | `11px` | 1 | app.css: .story-card img / border-radius | 원값을 로컬에 유지 → `11px` |
| `--qm-font-size-17` | 147 | `17px` | 3 | app.css: .story-card h3 / font-size<br>app.css: @media (max-width:800px) / .card-copy h3 / font-size<br>design-system.js: dynamic typography: Headline 2 | 원값을 로컬에 유지 → `17px` |
| `--qm-label-muted` | 148 | `#8b938d` | 1 | app.css: .notice-row span / color | 유지 |
| `--qm-space-70` | 149 | `70px` | 1 | app.css: .site-footer / margin-top | 원값을 로컬에 유지 → `70px` |
| `--qm-space-37` | 150 | `37px` | 2 | app.css: .site-footer / padding<br>app.css: .donation-summary / margin-top | 원값을 로컬에 유지 → `37px` |
| `--qm-space-27` | 151 | `27px` | 2 | app.css: .site-footer / padding<br>app.css: .steps / margin | 원값을 로컬에 유지 → `27px` |
| `--qm-font-size-23` | 152 | `23px` | 4 | app.css: .footer-top .brand / font-size<br>app.css: @media (max-width:800px) / .section-head h2 / font-size<br>app.css: @media (max-width:480px) / .brand / font-size<br>public.js: <h2 style="font-size:var( | 원값을 로컬에 유지 → `23px` |
| `--qm-space-46` | 153 | `46px` | 2 | app.css: .page-heading / padding<br>design-system.css: .ds-document / padding | 원값을 로컬에 유지 → `46px` |
| `--qm-font-size-32` | 154 | `32px` | 6 | app.css: .page-heading h1 / font-size<br>app.css: @media (max-width:1100px) / .hero h1 / font-size<br>app.css: @media (max-width:767px) / .qm-type-display / font-size<br>design-system.css: @media (max-width:600px) / .ds-font-hero / font-size | 역할명으로 변경 → `--qm-font-size-title` |
| `--qm-negative-soft` | 155 | `#fff5f4` | 1 | app.css: .button.danger / background | 유지 |
| `--qm-negative-line` | 156 | `#edceca` | 1 | app.css: .button.danger / border-color | 유지 |
| `--qm-leading-1_5` | 157 | `1.5` | 2 | app.css: .badge / line-height<br>design-system.css: .ds-font-hero / line-height | 원값을 로컬에 유지 → `1.5` |
| `--qm-fill-muted` | 158 | `#f1f1ed` | 1 | app.css: .badge / background | 유지 |
| `--qm-label-muted-strong` | 159 | `#697263` | 1 | app.css: .badge / color | 유지 |
| `--qm-positive-soft` | 160 | `#e8f4eb` | 0 | 없음 | 미사용 제거 |
| `--qm-negative-tint` | 161 | `#fff0eb` | 0 | 없음 | 미사용 제거 |
| `--qm-negative-strong` | 162 | `#b24639` | 0 | 없음 | 미사용 제거 |
| `--qm-line-input` | 163 | `#dbe2da` | 1 | app.css: .field input,.field textarea,.field select / border | 유지 |
| `--qm-radius-7` | 164 | `7px` | 3 | app.css: .field input,.field textarea,.field select / border-radius<br>app.css: .upload-preview / border-radius<br>app.css: .radio-group label / border-radius | 원값을 로컬에 유지 → `7px` |
| `--qm-space-13` | 165 | `13px` | 7 | app.css: .field input,.field textarea,.field select / padding<br>app.css: .donation-summary h2 / margin<br>app.css: .summary-row / margin<br>app.css: .panel h3 / margin-bottom | 원값을 로컬에 유지 → `13px` |
| `--qm-size-45` | 166 | `45px` | 1 | app.css: .field input,.field textarea,.field select / min-height | 원값을 로컬에 유지 → `45px` |
| `--qm-size-2` | 167 | `2px` | 6 | app.css: .field input,.field textarea,.field select / outline-offset<br>app.css: .tabs a / border-bottom<br>app.css: .spinner / border<br>app.css: dialog::backdrop / backdrop-filter | 원값을 로컬에 유지 → `2px` |
| `--qm-space-35` | 168 | `35px` | 3 | app.css: .pagination / margin-top<br>app.css: .auth-box / padding<br>app.css: .ops-shell / gap | 원값을 로컬에 유지 → `35px` |
| `--qm-space-28` | 169 | `28px` | 11 | app.css: .tabs / margin-bottom<br>app.css: .stat-grid / margin-bottom<br>app.css: @media (max-width:800px) / .ops-content .page-heading / padding-top<br>app.css: @media (max-width:480px) / .hero-text / padding | 유지 |
| `--qm-font-size-34` | 170 | `34px` | 1 | app.css: .detail-story h1 / font-size | 원값을 로컬에 유지 → `34px` |
| `--qm-size-28` | 171 | `28px` | 2 | app.css: .donation-summary / top<br>design-system.js: dynamic typography: Heading 2 | 원값을 로컬에 유지 → `28px` |
| `--qm-shadow-tint-subtle` | 172 | `#233b2906` | 1 | tokens.css: :root / --qm-shadow-0 | 원값을 로컬에 유지 → `#233b2906` |
| `--qm-shadow-0` | 173 | `0 5px 25px #233b2906` | 1 | app.css: .donation-summary / box-shadow | 역할명으로 변경 → `--qm-shadow-panel` |
| `--qm-font-size-31` | 174 | `31px` | 1 | app.css: .donation-summary h2 / font-size | 원값을 로컬에 유지 → `31px` |
| `--qm-size-6` | 175 | `6px` | 3 | app.css: .donation-summary .progress / height<br>app.css: @media (max-width:480px) / .bookmark / top<br>app.css: @media (max-width:480px) / .bookmark / right | 원값을 로컬에 유지 → `6px` |
| `--qm-space-15` | 176 | `15px` | 16 | app.css: .donation-summary .progress / margin-bottom<br>app.css: .summary-row / gap<br>app.css: .amount-options / margin<br>app.css: .success-icon / margin | 원값을 로컬에 유지 → `15px` |
| `--qm-size-18` | 177 | `18px` | 6 | app.css: .notice svg / width<br>app.css: .notice svg / height<br>design-system.css: .qm-chip / line-height<br>design-system.css: .qm-switch.small:before / width | 원값을 로컬에 유지 → `18px` |
| `--qm-space-2` | 178 | `2px` | 4 | app.css: .notice svg / margin-top<br>app.css: @media (max-width:480px) / .card-numbers / gap<br>app.css: @media (max-width:480px) / .image-badge / padding<br>design-system.css: .ds-nav-group a / margin | 원값을 로컬에 유지 → `2px` |
| `--qm-size-700` | 179 | `700px` | 1 | app.css: .narrow / max-width | 원값을 로컬에 유지 → `700px` |
| `--qm-size-450` | 180 | `450px` | 1 | app.css: .auth-box / max-width | 원값을 로컬에 유지 → `450px` |
| `--qm-space-55` | 181 | `55px` | 2 | app.css: .auth-box / margin<br>design-system.css: .ds-toc / padding-top | 원값을 로컬에 유지 → `55px` |
| `--qm-radius-14` | 182 | `14px` | 1 | app.css: .auth-box / border-radius | 원값을 로컬에 유지 → `14px` |
| `--qm-line-step` | 183 | `#e9ede5` | 1 | app.css: .steps li / border-bottom | 유지 |
| `--qm-size-70` | 184 | `70px` | 2 | app.css: .success-icon / width<br>app.css: .success-icon / height | 원값을 로컬에 유지 → `70px` |
| `--qm-positive-tint` | 185 | `#e4f2e5` | 1 | app.css: .success-icon / background | 유지 |
| `--qm-size-35` | 186 | `35px` | 2 | app.css: .success-icon svg / width<br>app.css: .success-icon svg / height | 원값을 로컬에 유지 → `35px` |
| `--qm-space-58` | 187 | `58px` | 1 | app.css: .empty / padding | 원값을 로컬에 유지 → `58px` |
| `--qm-line-empty` | 188 | `#dce4d7` | 1 | app.css: .empty / border | 유지 |
| `--qm-size-40` | 189 | `40px` | 11 | app.css: .empty>svg / width<br>app.css: .empty>svg / height<br>app.css: #toast / max-width<br>app.css: @media (max-width:800px) / .container / width | 원값을 로컬에 유지 → `40px` |
| `--qm-icon-empty` | 190 | `#97aa8e` | 1 | app.css: .empty>svg / color | 유지 |
| `--qm-font-size-19` | 191 | `19px` | 4 | app.css: .empty h3 / font-size<br>app.css: @media (max-width:480px) / .mini-banner h3 / font-size<br>app.css: @media (max-width:480px) / .panel h2 / font-size<br>design-system.css: @media (max-width:600px) / .ds-doc-wordmark / font-size | 원값을 로컬에 유지 → `19px` |
| `--qm-font-size-25` | 192 | `25px` | 2 | app.css: .stat strong / font-size<br>app.css: @media (max-width:480px) / .story-hero h2 / font-size | 원값을 로컬에 유지 → `25px` |
| `--qm-size-210` | 193 | `210px` | 2 | app.css: .ops-shell / grid-template-columns<br>app.css: @media (max-width:480px) / .story-hero img / height | 원값을 로컬에 유지 → `210px` |
| `--qm-size-800` | 194 | `800px` | 1 | app.css: .ops-shell / min-height | 원값을 로컬에 유지 → `800px` |
| `--qm-space-18` | 195 | `18px` | 5 | app.css: .ops-sidebar / padding<br>app.css: @media (max-width:1100px) / .stat / padding<br>app.css: @media (max-width:800px) / .story-grid / gap<br>app.css: @media (max-width:480px) / .hero-wrap / padding-top | 원값을 로컬에 유지 → `18px` |
| `--qm-space-33` | 196 | `33px` | 1 | app.css: .ops-content .page-heading / padding-top | 원값을 로컬에 유지 → `33px` |
| `--qm-font-size-28` | 197 | `28px` | 4 | app.css: .ops-content .page-heading h1 / font-size<br>app.css: @media (max-width:480px) / .hero h1 / font-size<br>design-system.css: @media (max-width:600px) / .ds-document-header h1 / font-size<br>design-system.js: dynamic typography: Title 2 | 원값을 로컬에 유지 → `28px` |
| `--qm-radius-15` | 198 | `15px` | 1 | app.css: .story-hero / border-radius | 원값을 로컬에 유지 → `15px` |
| `--qm-space-38` | 199 | `38px` | 2 | app.css: .story-hero / margin<br>app.css: .story-hero>div / padding | 원값을 로컬에 유지 → `38px` |
| `--qm-size-310` | 200 | `310px` | 2 | app.css: .story-hero img / min-height<br>app.css: @media (max-width:1100px) / .detail-layout / grid-template-columns | 원값을 로컬에 유지 → `310px` |
| `--qm-font-size-30` | 201 | `30px` | 2 | app.css: .story-hero h2 / font-size<br>design-system.css: @media (max-width:800px) / .ds-document-header h1 / font-size | 원값을 로컬에 유지 → `30px` |
| `--qm-size-20` | 202 | `20px` | 11 | app.css: .demo-launch / right<br>app.css: .demo-launch / bottom<br>app.css: .field / line-height<br>design-system.css: .ds-nav-group a / line-height | 원값을 로컬에 유지 → `20px` |
| `--qm-layer-40` | 203 | `40` | 1 | app.css: .demo-launch / z-index | 역할명으로 변경 → `--qm-z-demo-launch` |
| `--qm-line-floating` | 204 | `#dbe3d5` | 1 | app.css: .demo-launch / border | 유지 |
| `--qm-shadow-tint-floating` | 205 | `#2b42231a` | 1 | tokens.css: :root / --qm-shadow-1 | 원값을 로컬에 유지 → `#2b42231a` |
| `--qm-shadow-1` | 206 | `0 4px 17px #2b42231a` | 1 | app.css: .demo-launch / box-shadow | 역할명으로 변경 → `--qm-shadow-floating` |
| `--qm-shadow-tint-overlay` | 207 | `#00000033` | 1 | tokens.css: :root / --qm-shadow-2 | 원값을 로컬에 유지 → `#00000033` |
| `--qm-shadow-2` | 208 | `0 24px 90px #00000033` | 1 | app.css: dialog / box-shadow | 역할명으로 변경 → `--qm-shadow-dialog` |
| `--qm-layer-1` | 209 | `1` | 1 | app.css: .dialog-head / z-index | 원값을 로컬에 유지 → `1` |
| `--qm-font-size-20` | 210 | `20px` | 5 | app.css: .dialog-head h2 / font-size<br>app.css: @media (max-width:480px) / .impact-number / font-size<br>app.css: @media (max-width:480px) / .stat strong / font-size<br>design-system.css: @media (max-width:600px) / .ds-doc-section>h2 / font-size | 역할명으로 변경 → `--qm-font-size-heading-small` |
| `--qm-size-80` | 211 | `80px` | 7 | app.css: #toast / bottom<br>design-system.css: .ds-doc-top / height<br>design-system.css: .ds-sidebar / top<br>design-system.css: .ds-sidebar / height | 원값을 로컬에 유지 → `80px` |
| `--qm-layer-10000` | 212 | `10000` | 1 | app.css: #toast / z-index | 역할명으로 변경 → `--qm-z-toast` |
| `--qm-radius-9` | 213 | `9px` | 1 | app.css: .accordion / border-radius | 원값을 로컬에 유지 → `9px` |
| `--qm-size-180` | 214 | `180px` | 8 | app.css: .upload-preview / max-width<br>app.css: @media (max-width:1100px) / .ops-shell / grid-template-columns<br>app.css: @media (min-width:768px) and (max-width:991px) / .brand-logo / width<br>app.css: @media (max-width:767px) / .brand-logo / width | 원값을 로컬에 유지 → `180px` |
| `--qm-size-120` | 215 | `120px` | 1 | app.css: .upload-preview / max-height | 원값을 로컬에 유지 → `120px` |
| `--qm-space-80` | 216 | `80px` | 1 | app.css: .loading / padding | 유지 |
| `--qm-size-135` | 217 | `135px` | 0 | 없음 | 미사용 제거 |
| `--qm-size-110` | 218 | `110px` | 0 | 없음 | 미사용 제거 |
| `--qm-size-130` | 219 | `130px` | 2 | app.css: .skeleton / height<br>app.css: .footer-brand img / width | 원값을 로컬에 유지 → `130px` |
| `--qm-duration-1400` | 220 | `1.4s` | 1 | app.css: .skeleton / animation | 역할명으로 변경 → `--qm-motion-skeleton` |
| `--qm-size-140` | 221 | `140px` | 2 | app.css: .chart / height<br>design-system.css: @media (max-width:600px) / .ds-palette>div / min-height | 원값을 로컬에 유지 → `140px` |
| `--qm-radius-5` | 222 | `5px` | 2 | app.css: .chart-bar / border-radius | 원값을 로컬에 유지 → `5px` |
| `--qm-size-355` | 223 | `355px` | 2 | app.css: @media (min-width:1440px) / .hero / min-height<br>app.css: @media (min-width:1440px) / .hero-slide / min-height | 원값을 로컬에 유지 → `355px` |
| `--qm-space-44` | 224 | `44px` | 2 | app.css: @media (min-width:1440px) / .hero-text / padding-block<br>design-system.css: .ds-mode / margin-bottom | 원값을 로컬에 유지 → `44px` |
| `--qm-font-size-37` | 225 | `37px` | 1 | app.css: @media (min-width:1440px) / .hero h1 / font-size | 원값을 로컬에 유지 → `37px` |
| `--qm-size-75` | 226 | `75px` | 1 | app.css: @media (max-width:800px) / .header-inner / height | 원값을 로컬에 유지 → `75px` |
| `--qm-size-47` | 227 | `47px` | 1 | app.css: @media (max-width:800px) / .main-nav a / height | 원값을 로컬에 유지 → `47px` |
| `--qm-size-290` | 228 | `290px` | 2 | app.css: @media (max-width:800px) / .hero-slide / min-height<br>app.css: @media (max-width:800px) / .hero / min-height | 원값을 로컬에 유지 → `290px` |
| `--qm-size-60` | 229 | `60px` | 1 | app.css: @media (max-width:800px) / .category-nav a / min-width | 원값을 로컬에 유지 → `60px` |
| `--qm-surface-sticky` | 230 | `#fffffff5` | 2 | app.css: @media (max-width:800px) / .mobile-donate / background<br>design-system.css: .ds-doc-top / background | 유지 |
| `--qm-layer-30` | 231 | `30` | 1 | app.css: @media (max-width:800px) / .mobile-donate / z-index | 역할명으로 변경 → `--qm-z-mobile-cta` |
| `--qm-space-85` | 232 | `85px` | 1 | app.css: @media (max-width:800px) / .has-mobile-cta / padding-bottom | 원값을 로컬에 유지 → `85px` |
| `--qm-size-95` | 233 | `95px` | 1 | app.css: @media (max-width:800px) / .has-mobile-cta .demo-launch / bottom | 원값을 로컬에 유지 → `95px` |
| `--qm-size-36` | 234 | `36px` | 2 | app.css: @media (max-width:480px) / .container / width<br>design-system.css: .qm-chip / min-height | 원값을 로컬에 유지 → `36px` |
| `--qm-size-460` | 235 | `460px` | 3 | app.css: @media (max-width:480px) / .hero-slide / min-height<br>app.css: @media (max-width:480px) / .hero / min-height<br>design-system.css: @media (max-width:600px) / .ds-doc-section table / min-width | 원값을 로컬에 유지 → `460px` |
| `--qm-size-195` | 236 | `195px` | 0 | 없음 | 미사용 제거 |
| `--qm-size-43` | 237 | `43px` | 3 | app.css: @media (max-width:480px) / .category-icon / width<br>app.css: @media (max-width:480px) / .category-icon / height<br>app.css: @media (max-width:480px) / .card-copy h3 / min-height | 원값을 로컬에 유지 → `43px` |
| `--qm-size-53` | 238 | `53px` | 1 | app.css: @media (max-width:480px) / .category-nav a / min-width | 원값을 로컬에 유지 → `53px` |
| `--qm-font-size-9` | 239 | `9px` | 4 | app.css: @media (max-width:480px) / .category-label / font-size<br>app.css: @media (max-width:480px) / .org-label / font-size<br>app.css: @media (max-width:480px) / .card-numbers small / font-size<br>app.css: @media (max-width:480px) / .image-badge / font-size | 원값을 로컬에 유지 → `9px` |
| `--qm-leading-1_65` | 240 | `1.65` | 1 | app.css: @media (max-width:480px) / .card-copy h3 / line-height | 원값을 로컬에 유지 → `1.65` |
| `--qm-size-14` | 241 | `14px` | 3 | app.css: @media (max-width:480px) / .bookmark svg / width<br>app.css: @media (max-width:480px) / .bookmark svg / height<br>design-system.js: dynamic typography: Caption 2 | 원값을 로컬에 유지 → `14px` |
| `--qm-size-82` | 242 | `82px` | 2 | app.css: @media (max-width:480px) / .mini-banner img / width<br>app.css: @media (max-width:480px) / .mini-banner img / height | 원값을 로컬에 유지 → `82px` |
| `--qm-size-115` | 243 | `115px` | 1 | app.css: @media (max-width:480px) / .story-card / grid-template-columns | 원값을 로컬에 유지 → `115px` |
| `--qm-size-100` | 244 | `100px` | 1 | app.css: @media (max-width:480px) / .story-card img / height | 원값을 로컬에 유지 → `100px` |
| `--qm-space-75` | 245 | `75px` | 1 | app.css: @media (max-width:480px) / .site-footer / padding-bottom | 원값을 로컬에 유지 → `75px` |
| `--qm-size-560` | 246 | `560px` | 3 | app.css: @media (max-width:480px) / table / min-width<br>app.css: dialog / width<br>design-system.css: .ds-reading / max-width | 원값을 로컬에 유지 → `560px` |
| `--qm-tracking-_0057` | 247 | `.0057em` | 1 | app.css: body / letter-spacing | 원값을 로컬에 유지 → `.0057em` |
| `--qm-tracking-negative-_0253` | 248 | `-.0253em` | 2 | app.css: h1 / letter-spacing<br>app.css: .qm-type-title / letter-spacing | 역할명으로 변경 → `--qm-tracking-title` |
| `--qm-tracking-negative-_023` | 249 | `-.023em` | 1 | app.css: h2 / letter-spacing | 원값을 로컬에 유지 → `-.023em` |
| `--qm-tracking-negative-_002` | 250 | `-.002em` | 2 | app.css: h3 / letter-spacing<br>app.css: .card-copy h3 / letter-spacing | 역할명으로 변경 → `--qm-tracking-headline` |
| `--qm-size-222` | 251 | `222px` | 1 | app.css: .brand-logo / width | 원값을 로컬에 유지 → `222px` |
| `--qm-label-brand` | 252 | `#39212b` | 1 | app.css: .hero h1 / color | 유지 |
| `--qm-size-negative-2` | 253 | `-2px` | 1 | app.css: .fund-card:hover / transform | 원값을 로컬에 유지 → `-2px` |
| `--qm-surface-lavender` | 254 | `#f2f0f6` | 1 | app.css: .mini-banner:nth-child(2) / background | 유지 |
| `--qm-size-48` | 255 | `48px` | 5 | app.css: .button / min-height<br>app.css: .field input,.field select,.field textarea / min-height<br>design-system.css: .ds-document-header h1 / line-height<br>design-system.js: dynamic typography: Display 3 | 원값을 로컬에 유지 → `48px` |
| `--qm-size-22` | 256 | `22px` | 6 | app.css: .button / line-height<br>app.css: .notice / line-height<br>app.css: .tabs a / line-height<br>app.css: #toast / line-height | 원값을 로컬에 유지 → `22px` |
| `--qm-tracking-_0096` | 257 | `.0096em` | 1 | app.css: .button / letter-spacing | 원값을 로컬에 유지 → `.0096em` |
| `--qm-duration-180` | 258 | `180ms` | 4 | app.css: .button / transition<br>design-system.css: .qm-switch / transition<br>design-system.css: .qm-switch:before / transition | 역할명으로 변경 → `--qm-motion-feedback` |
| `--qm-primary-hover` | 259 | `#bd6b84` | 2 | app.css: .button.primary:hover / background<br>app.css: .button.primary:hover / border-color | 유지 |
| `--qm-primary-pressed` | 260 | `#ae5b74` | 1 | app.css: .button.primary:active / background | 유지 |
| `--qm-interaction-pressed` | 261 | `#1717190a` | 2 | design-system.css: .ds-color-dot / border<br>tokens.css: :root / --qm-shadow-3 | 유지 |
| `--qm-shadow-3` | 262 | `inset 0 0 0 100px #1717190a` | 1 | app.css: .button:active:not(:disabled),.icon-button:active / box-shadow | 역할명으로 변경 → `--qm-shadow-pressed` |
| `--qm-size-56` | 263 | `56px` | 1 | app.css: .button.large / min-height | 원값을 로컬에 유지 → `56px` |
| `--qm-duration-900` | 264 | `900ms` | 1 | app.css: .spinner / animation | 역할명으로 변경 → `--qm-motion-spinner` |
| `--qm-focus-ring` | 265 | `#c7799133` | 1 | design-system.css: .ds-grid-preview span / border | 역할명으로 변경 → `--qm-line-brand-soft` |
| `--qm-radius-6` | 266 | `6px` | 1 | app.css: .badge / border-radius | 원값을 로컬에 유지 → `6px` |
| `--qm-leading-1_8` | 267 | `1.8` | 1 | app.css: .article-body / line-height | 원값을 로컬에 유지 → `1.8` |
| `--qm-radius-20` | 268 | `20px` | 5 | app.css: dialog / border-radius<br>design-system.css: .ds-stage / border-radius<br>design-system.css: .ds-playground / border-radius<br>design-system.css: .ds-brand-stage / border-radius | 유지 |
| `--qm-size-760` | 269 | `760px` | 1 | app.css: dialog / max-height | 원값을 로컬에 유지 → `760px` |
| `--qm-background-inverse` | 270 | `#292a2d` | 2 | app.css: #toast / background<br>design-system.css: .ds-toast / background | 유지 |
| `--qm-space-negative-1` | 271 | `-1px` | 1 | app.css: .qm-sr-only / margin | 원값을 로컬에 유지 → `-1px` |
| `--qm-tracking-negative-_0282` | 272 | `-.0282em` | 1 | app.css: .qm-type-display / letter-spacing | 원값을 로컬에 유지 → `-.0282em` |
| `--qm-tracking-negative-_0194` | 273 | `-.0194em` | 2 | app.css: .qm-type-heading / letter-spacing<br>design-system.css: .ds-doc-section>h2 / letter-spacing | 역할명으로 변경 → `--qm-tracking-heading` |
| `--qm-tracking-_0145` | 274 | `.0145em` | 1 | app.css: .qm-type-label / letter-spacing | 원값을 로컬에 유지 → `.0145em` |
| `--qm-tracking-_0252` | 275 | `.0252em` | 1 | app.css: .qm-type-caption / letter-spacing | 원값을 로컬에 유지 → `.0252em` |
| `--qm-layer-5` | 276 | `5` | 0 | 없음 | 미사용 제거 |
| `--qm-size-72` | 277 | `72px` | 4 | design-system.css: @media (max-width:800px) / .ds-doc-top / min-height<br>design-system.css: @media (max-width:800px) / .ds-sidebar / top<br>design-system.css: @media (max-width:800px) / .ds-sidebar / height<br>design-system.js: dynamic typography: Display 1 | 원값을 로컬에 유지 → `72px` |
| `--qm-font-size-40` | 278 | `40px` | 3 | app.css: @media (min-width:1600px) / .hero h1 / font-size<br>design-system.css: @media (max-width:800px) / .ds-font-hero / font-size<br>design-system.js: dynamic typography: Display 2 | 역할명으로 변경 → `--qm-font-size-display` |
| `--qm-size-52` | 279 | `52px` | 4 | app.css: @media (min-width:1600px) / .hero h1 / line-height<br>design-system.css: .ds-color-dot / width<br>design-system.css: .qm-switch / width<br>design-system.js: dynamic typography: Display 2 | 원값을 로컬에 유지 → `52px` |
| `--qm-size-88` | 280 | `88px` | 0 | 없음 | 미사용 제거 |
| `--qm-size-44` | 281 | `44px` | 2 | app.css: @media (max-width:767px) / .qm-type-display / line-height<br>design-system.js: dynamic typography: Title 1 | 원값을 로컬에 유지 → `44px` |
| `--qm-size-168` | 282 | `168px` | 1 | app.css: @media (max-width:480px) / .brand-logo / width | 원값을 로컬에 유지 → `168px` |
| `--qm-size-105` | 283 | `105px` | 2 | app.css: @media (max-width:480px) / .footer-brand img / width<br>design-system.css: @media (max-width:600px) / .ds-doc-wordmark img / width | 원값을 로컬에 유지 → `105px` |
| `--qm-size-26` | 284 | `26px` | 7 | app.css: @media (max-width:480px) / .section-head h2 / line-height<br>design-system.css: .ds-document-header>p / line-height<br>design-system.css: .ds-doc-section>p / line-height<br>design-system.css: .ds-reading / line-height | 원값을 로컬에 유지 → `26px` |
| `--qm-line-doc` | 285 | `#eeeef0` | 1 | design-system.css: .ds-workspace / --ds-border | 유지 |
| `--qm-size-1600` | 286 | `1600px` | 1 | design-system.css: .ds-workspace / max-width | 원값을 로컬에 유지 → `1600px` |
| `--qm-layer-25` | 287 | `25` | 1 | design-system.css: .ds-doc-top / z-index | 역할명으로 변경 → `--qm-z-doc-header` |
| `--qm-weight-800` | 288 | `800` | 1 | design-system.css: .ds-doc-wordmark / font-weight | 원값을 로컬에 유지 → `800` |
| `--qm-tracking-negative-_7` | 289 | `-.7px` | 1 | design-system.css: .ds-doc-wordmark / letter-spacing | 원값을 로컬에 유지 → `-.7px` |
| `--qm-weight-500` | 290 | `500` | 4 | design-system.css: .ds-doc-wordmark span / font-weight<br>design-system.css: .ds-nav-group h2 / font-weight<br>design-system.css: .ds-color-list b / font-weight<br>design-system.css: .qm-chip / font-weight | 역할명으로 변경 → `--qm-weight-medium` |
| `--qm-size-150` | 291 | `150px` | 1 | design-system.css: .ds-doc-wordmark img / width | 원값을 로컬에 유지 → `150px` |
| `--qm-size-220` | 292 | `220px` | 2 | design-system.css: .ds-doc-layout / grid-template-columns<br>design-system.js: 바뀌는 콘텐츠 경계']]],'type-utility':['Typography & Ellipsis','글자 위계와 긴 문장의 줄 수를 재사용 가능한 클래스로 관리합니다.',`<p class="qm-type-heading">작은 나눔의 시작 | 원값을 로컬에 유지 → `220px` |
| `--qm-size-820` | 293 | `820px` | 1 | design-system.css: .ds-doc-layout / grid-template-columns | 원값을 로컬에 유지 → `820px` |
| `--qm-size-154` | 294 | `154px` | 1 | design-system.css: .ds-doc-layout / grid-template-columns | 원값을 로컬에 유지 → `154px` |
| `--qm-space-56` | 295 | `56px` | 2 | design-system.css: .ds-doc-layout / gap<br>design-system.css: .ds-doc-section / margin-bottom | 유지 |
| `--qm-space-64` | 296 | `64px` | 3 | design-system.css: .ds-document / padding<br>design-system.css: @media (min-width:1600px) / .ds-workspace / padding<br>design-system.css: @media (min-width:1600px) / .ds-doc-layout / gap | 유지 |
| `--qm-tracking-negative-_027` | 297 | `-.027em` | 1 | design-system.css: .ds-document-header h1 / letter-spacing | 원값을 로컬에 유지 → `-.027em` |
| `--qm-size-740` | 298 | `740px` | 1 | design-system.css: .ds-document-header>p / max-width | 원값을 로컬에 유지 → `740px` |
| `--qm-space-108` | 299 | `108px` | 1 | design-system.css: .ds-doc-section / scroll-margin-top | 원값을 로컬에 유지 → `108px` |
| `--qm-background-preview` | 300 | `#fafafa` | 6 | design-system.css: .ds-stage / background<br>design-system.css: .ds-doc-section th / background<br>design-system.css: .ds-variant-list>div,.ds-spec-grid>div / background<br>design-system.css: .ds-dodont>div / background | 유지 |
| `--qm-size-240` | 301 | `240px` | 1 | design-system.css: .ds-playground .ds-stage / min-height | 원값을 로컬에 유지 → `240px` |
| `--qm-interaction-strong` | 302 | `#17171918` | 1 | tokens.css: :root / --qm-shadow-4 | 유지 |
| `--qm-shadow-4` | 303 | `inset 0 0 0 100px #17171918` | 1 | design-system.css: .ds-state-pressed / box-shadow | 역할명으로 변경 → `--qm-shadow-pressed-strong` |
| `--qm-background-code` | 304 | `#202124` | 1 | design-system.css: .ds-code / background | 유지 |
| `--qm-label-code` | 305 | `#e4e4e7` | 1 | design-system.css: .ds-code / color | 유지 |
| `--qm-font-size-64` | 306 | `64px` | 1 | design-system.css: .ds-font-hero / font-size | 원값을 로컬에 유지 → `64px` |
| `--qm-space-36` | 307 | `36px` | 1 | design-system.css: .ds-font-hero / padding | 유지 |
| `--qm-tracking-negative-2` | 308 | `-2px` | 1 | design-system.css: .ds-font-hero / letter-spacing | 원값을 로컬에 유지 → `-2px` |
| `--qm-size-50` | 309 | `50px` | 1 | design-system.css: .ds-space-list code / width | 원값을 로컬에 유지 → `50px` |
| `--qm-size-104` | 310 | `104px` | 2 | design-system.css: .ds-radius / width<br>design-system.css: .ds-radius / height | 원값을 로컬에 유지 → `104px` |
| `--qm-interaction-hover` | 311 | `#17171908` | 1 | tokens.css: :root / --qm-shadow-5 | 유지 |
| `--qm-shadow-5` | 312 | `inset 0 0 0 100px #17171908` | 1 | design-system.css: .qm-chip:hover / box-shadow | 역할명으로 변경 → `--qm-shadow-hover` |
| `--qm-info-soft` | 313 | `#eef0f4` | 1 | design-system.css: .ds-message / background | 유지 |
| `--qm-olive-soft` | 314 | `#f2f5e7` | 1 | design-system.css: .ds-message.tone-1 / background | 유지 |
| `--qm-caution-soft` | 315 | `#fcf2e9` | 1 | design-system.css: .ds-message.tone-2 / background | 유지 |
| `--qm-size-360` | 316 | `360px` | 1 | design-system.css: .ds-skeleton / max-width | 원값을 로컬에 유지 → `360px` |
| `--qm-size-420` | 317 | `420px` | 1 | design-system.css: .ds-switch-list / max-width | 원값을 로컬에 유지 → `420px` |
| `--qm-shadow-tint-thumb` | 318 | `#00000022` | 1 | tokens.css: :root / --qm-shadow-6 | 원값을 로컬에 유지 → `#00000022` |
| `--qm-shadow-6` | 319 | `0 1px 3px #00000022` | 1 | design-system.css: .qm-switch:before / box-shadow | 역할명으로 변경 → `--qm-shadow-thumb` |
| `--qm-size-190` | 320 | `190px` | 1 | design-system.css: @media (max-width:1250px) / .ds-doc-layout / grid-template-columns | 원값을 로컬에 유지 → `190px` |
| `--qm-size-160` | 321 | `160px` | 1 | design-system.css: @media (max-width:800px) / .ds-doc-layout / grid-template-columns | 원값을 로컬에 유지 → `160px` |
| `--qm-size-250` | 322 | `250px` | 1 | design-system.css: @media (max-width:600px) / .ds-sidebar / max-height | 원값을 로컬에 유지 → `250px` |
| `--qm-size-155` | 323 | `155px` | 1 | design-system.css: @media (max-width:600px) / .ds-nav-group / min-width | 원값을 로컬에 유지 → `155px` |
| `--qm-line-legacy` | 324 | `#e5e9e5` | 0 | 없음 | 미사용 제거 |
| `--qm-color-detail-66` | 325 | `#70737c1f` | 1 | design-system-catalog.js: al')],['Strong',designToken('--qm-line-normal')],['Alternative',designToken('--qm-fill-alternative')]]],['Line',[['Normal',d | 역할명으로 변경 → `--qm-line-neutral` |
| `--qm-color-detail-67` | 326 | `#f4f4f5` | 1 | design-system-catalog.js: ',designToken('--qm-background-elevated')],['Brand soft',designToken('--qm-brand-soft')]]],['Interaction',[['Inactive',desig | 역할명으로 변경 → `--qm-interaction-disabled` |
| `--qm-font-size-56` | 327 | `56px` | 1 | design-system.js: dynamic typography: Display 1 | 원값을 로컬에 유지 → `56px` |
| `--qm-tracking-negative-0_0319` | 328 | `-0.0319em` | 1 | design-system.js: dynamic typography: Display 1 | 원값을 로컬에 유지 → `-0.0319em` |
| `--qm-tracking-negative-0_0282` | 329 | `-0.0282em` | 1 | design-system.js: dynamic typography: Display 2 | 원값을 로컬에 유지 → `-0.0282em` |
| `--qm-tracking-negative-0_027` | 330 | `-0.027em` | 1 | design-system.js: dynamic typography: Display 3 | 원값을 로컬에 유지 → `-0.027em` |
| `--qm-tracking-negative-0_0253` | 331 | `-0.0253em` | 1 | design-system.js: dynamic typography: Title 1 | 원값을 로컬에 유지 → `-0.0253em` |
| `--qm-tracking-negative-0_0236` | 332 | `-0.0236em` | 1 | design-system.js: dynamic typography: Title 2 | 원값을 로컬에 유지 → `-0.0236em` |
| `--qm-tracking-negative-0_023` | 333 | `-0.023em` | 1 | design-system.js: dynamic typography: Title 3 | 원값을 로컬에 유지 → `-0.023em` |
| `--qm-tracking-negative-0_0194` | 334 | `-0.0194em` | 1 | design-system.js: dynamic typography: Heading 1 | 원값을 로컬에 유지 → `-0.0194em` |
| `--qm-tracking-negative-0_012` | 335 | `-0.012em` | 1 | design-system.js: dynamic typography: Heading 2 | 원값을 로컬에 유지 → `-0.012em` |
| `--qm-tracking-negative-0_002` | 336 | `-0.002em` | 1 | design-system.js: dynamic typography: Headline 1 | 원값을 로컬에 유지 → `-0.002em` |
| `--qm-tracking-0` | 337 | `0em` | 1 | design-system.js: dynamic typography: Headline 2 | 원값을 로컬에 유지 → `0em` |
| `--qm-tracking-0_0057` | 338 | `0.0057em` | 2 | design-system.js: dynamic typography: Body 1 / Normal<br>design-system.js: dynamic typography: Body 1 / Reading | 원값을 로컬에 유지 → `0.0057em` |
| `--qm-tracking-0_0096` | 339 | `0.0096em` | 2 | design-system.js: dynamic typography: Body 2 / Normal<br>design-system.js: dynamic typography: Body 2 / Reading | 원값을 로컬에 유지 → `0.0096em` |
| `--qm-tracking-0_0145` | 340 | `0.0145em` | 2 | design-system.js: dynamic typography: Label 1 / Normal<br>design-system.js: dynamic typography: Label 1 / Reading | 원값을 로컬에 유지 → `0.0145em` |
| `--qm-tracking-0_0194` | 341 | `0.0194em` | 1 | design-system.js: dynamic typography: Label 2 | 원값을 로컬에 유지 → `0.0194em` |
| `--qm-tracking-0_0252` | 342 | `0.0252em` | 1 | design-system.js: dynamic typography: Caption 1 | 원값을 로컬에 유지 → `0.0252em` |
| `--qm-tracking-0_0311` | 343 | `0.0311em` | 1 | design-system.js: dynamic typography: Caption 2 | 원값을 로컬에 유지 → `0.0311em` |

## 동일한 값 (숫자 표기 정규화)

값이 같아도 역할이 다른 색상·간격·모서리는 합치지 않았습니다.

- `#c77991`: `--qm-chip-rose`, `--qm-primary-normal`
- `#171719`: `--qm-chip-label`, `--qm-label-normal`
- `#70737c29`: `--qm-fill-strong`, `--qm-line-normal`
- `#fff`: `--qm-background-normal`, `--qm-background-elevated`, `--qm-on-primary`
- `4px`: `--qm-space-4`, `--qm-size-4`, `--qm-radius-4`
- `8px`: `--qm-space-8`, `--qm-radius-8`, `--qm-size-8`
- `12px`: `--qm-space-12`, `--qm-radius-12`, `--qm-font-size-12`, `--qm-size-12`
- `16px`: `--qm-space-16`, `--qm-radius-16`, `--qm-font-size-16`, `--qm-size-16`
- `20px`: `--qm-space-20`, `--qm-size-20`, `--qm-font-size-20`, `--qm-radius-20`
- `24px`: `--qm-space-24`, `--qm-size-24`, `--qm-font-size-24`
- `32px`: `--qm-space-32`, `--qm-size-32`, `--qm-font-size-32`
- `40px`: `--qm-space-40`, `--qm-size-40`, `--qm-font-size-40`
- `48px`: `--qm-space-48`, `--qm-size-48`
- `14px`: `--qm-font-size-14`, `--qm-space-14`, `--qm-radius-14`, `--qm-size-14`
- `180ms`: `--qm-motion`, `--qm-duration-180`
- `20`: `--qm-z-header`, `--qm-layer-20`
- `15px`: `--qm-font-size-15`, `--qm-size-15`, `--qm-space-15`, `--qm-radius-15`
- `21px`: `--qm-size-21`, `--qm-font-size-21`
- `36px`: `--qm-font-size-36`, `--qm-size-36`, `--qm-space-36`
- `26px`: `--qm-font-size-26`, `--qm-space-26`, `--qm-size-26`
- `18px`: `--qm-font-size-18`, `--qm-size-18`, `--qm-space-18`
- `3px`: `--qm-size-3`, `--qm-space-3`
- `64px`: `--qm-size-64`, `--qm-space-64`, `--qm-font-size-64`
- `10px`: `--qm-size-10`, `--qm-font-size-10`, `--qm-space-10`, `--qm-radius-10`
- `1px`: `--qm-size-1`, `--qm-tracking-1`
- `11px`: `--qm-font-size-11`, `--qm-space-11`, `--qm-radius-11`
- `30px`: `--qm-size-30`, `--qm-space-30`, `--qm-radius-30`, `--qm-font-size-30`
- `7px`: `--qm-space-7`, `--qm-font-size-7`, `--qm-radius-7`
- `27px`: `--qm-font-size-27`, `--qm-space-27`
- `33px`: `--qm-size-33`, `--qm-space-33`
- `38px`: `--qm-size-38`, `--qm-space-38`
- `6px`: `--qm-space-6`, `--qm-size-6`, `--qm-radius-6`
- `42px`: `--qm-space-42`, `--qm-size-42`
- `45px`: `--qm-space-45`, `--qm-size-45`
- `17px`: `--qm-space-17`, `--qm-size-17`, `--qm-font-size-17`
- `35px`: `--qm-font-size-35`, `--qm-space-35`, `--qm-size-35`
- `23px`: `--qm-space-23`, `--qm-font-size-23`
- `13px`: `--qm-font-size-13`, `--qm-size-13`, `--qm-space-13`
- `25px`: `--qm-size-25`, `--qm-space-25`, `--qm-font-size-25`
- `5px`: `--qm-space-5`, `--qm-radius-5`
- `22px`: `--qm-space-22`, `--qm-font-size-22`, `--qm-size-22`
- `9px`: `--qm-space-9`, `--qm-radius-9`, `--qm-font-size-9`
- `34px`: `--qm-space-34`, `--qm-font-size-34`
- `70px`: `--qm-space-70`, `--qm-size-70`
- `37px`: `--qm-space-37`, `--qm-font-size-37`
- `2px`: `--qm-size-2`, `--qm-space-2`
- `28px`: `--qm-space-28`, `--qm-size-28`, `--qm-font-size-28`
- `80px`: `--qm-size-80`, `--qm-space-80`
- `44px`: `--qm-space-44`, `--qm-size-44`
- `75px`: `--qm-size-75`, `--qm-space-75`
- `0.0057em`: `--qm-tracking-_0057`, `--qm-tracking-0_0057`
- `-0.0253em`: `--qm-tracking-negative-_0253`, `--qm-tracking-negative-0_0253`
- `-0.023em`: `--qm-tracking-negative-_023`, `--qm-tracking-negative-0_023`
- `-0.002em`: `--qm-tracking-negative-_002`, `--qm-tracking-negative-0_002`
- `-2px`: `--qm-size-negative-2`, `--qm-tracking-negative-2`
- `0.0096em`: `--qm-tracking-_0096`, `--qm-tracking-0_0096`
- `56px`: `--qm-size-56`, `--qm-space-56`, `--qm-font-size-56`
- `-0.0282em`: `--qm-tracking-negative-_0282`, `--qm-tracking-negative-0_0282`
- `-0.0194em`: `--qm-tracking-negative-_0194`, `--qm-tracking-negative-0_0194`
- `0.0145em`: `--qm-tracking-_0145`, `--qm-tracking-0_0145`
- `0.0252em`: `--qm-tracking-_0252`, `--qm-tracking-0_0252`
- `-0.027em`: `--qm-tracking-negative-_027`, `--qm-tracking-negative-0_027`

## 미사용 변수

- `--qm-fill-strong`
- `--qm-color-warm`
- `--qm-motion`
- `--qm-z-header`
- `--qm-z-overlay`
- `--qm-size-33`
- `--qm-font-size-7`
- `--qm-tracking-_5`
- `--qm-space-42`
- `--qm-positive-soft`
- `--qm-negative-tint`
- `--qm-negative-strong`
- `--qm-size-135`
- `--qm-size-110`
- `--qm-size-195`
- `--qm-layer-5`
- `--qm-size-88`
- `--qm-line-legacy`

## 미정의 참조

`--qm-palette-40`: `public/assets/js/app.js`의 데모 설정 모달 HR 테두리. 기존에는 invalid-at-computed-value가 되어 선이 표시되지 않았습니다. 잘못된 선언만 제거하여 선이 없는 모습을 유지했습니다.

중복 선언: 0. 순환 참조: 0.
