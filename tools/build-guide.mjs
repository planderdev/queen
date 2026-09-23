// Builds the standalone brand / design-system guide (design-system/index.html) from the
// published token source, the brand SVG logos and the copy used on the site. Run: npm run build:guide
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {foundations} from '../public/assets/js/design-system-foundations.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const artifactIndex = process.argv.indexOf('--artifact');
const ARTIFACT = artifactIndex > -1;
const out = ARTIFACT ? resolve(process.argv[artifactIndex + 1]) : join(root, 'design-system', 'index.html');
const T = foundations.tokens;
const SITE = 'https://queen-mandeok.vercel.app';
// Artifact pages may only load stylesheets from Google Fonts and no remote images, so inline photos there.
const photo = name => ARTIFACT ? `data:image/jpeg;base64,${readFileSync(join(root, 'public/assets/images', name + '.jpg')).toString('base64')}` : `${SITE}/assets/images/${name}.jpg`;
const VERSION = '1.0';
const DATE = '2026-09-24';

/* ---------- helpers ---------- */
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const hex = h => h.replace('#', '').length === 3 ? '#' + [...h.replace('#', '')].map(c => c + c).join('') : h;
const rgb = h => { const v = hex(h).slice(1); return [0, 2, 4].map(i => parseInt(v.slice(i, i + 2), 16)); };
const toHex = ([r, g, b]) => '#' + [r, g, b].map(n => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => toHex(rgb(a).map((c, i) => c + (rgb(b)[i] - c) * t));
const upper = h => hex(h).toUpperCase();

// Rose scale (웹 시스템 확장 제안): tints toward white, shades toward the brand heavy tone.
const ROSE = T.color['--palette-rose'];
const roseScale = [
  ['50', mix(ROSE, '#ffffff', .92)], ['100', mix(ROSE, '#ffffff', .84)], ['200', mix(ROSE, '#ffffff', .68)],
  ['300', mix(ROSE, '#ffffff', .48)], ['400', mix(ROSE, '#ffffff', .24)], ['500', ROSE],
  ['600', T.color['--primary-strong']], ['700', T.color['--primary-heavy']], ['800', mix(T.color['--primary-heavy'], '#1a0a0f', .3)],
  ['900', mix(T.color['--primary-heavy'], '#1a0a0f', .55)], ['950', mix(T.color['--primary-heavy'], '#1a0a0f', .75)]
];
const palette = [
  ['orange', 'Orange · 살구', T.color['--palette-orange'], '보완 요청 · 예정 · 강조 배경'],
  ['rose', 'Rose · 로즈', T.color['--palette-rose'], 'Primary · 실패 · 반려 · 추천'],
  ['olive', 'Olive · 올리브', T.color['--palette-olive'], '승인 · 성공 · 진행 · 완료'],
  ['blue', 'Blue · 블루', T.color['--palette-blue'], '접수 · 심사 · 처리 중'],
  ['lavender', 'Lavender · 라벤더', T.color['--palette-lavender'], '임시저장 · 일시중지 · 종료 · 취소']
];
const gray = [
  ['Strong', T.color['--label-strong'], '--label-strong', '가장 강한 제목'], ['Normal', T.color['--label-normal'], '--label-normal', '본문 기본'],
  ['Neutral', T.color['--label-neutral'], '--label-neutral', '보조 본문'], ['Alternative', T.color['--label-alternative'], '--label-alternative', '설명 · 메타'],
  ['Assistive', T.color['--label-assistive'], '--label-assistive', '플레이스홀더 · 비활성 아이콘'], ['Disable', T.color['--label-disable'], '--label-disable', '비활성 텍스트'],
  ['Line solid', T.color['--line-solid'], '--line-solid', '실선 테두리'], ['Disabled', T.color['--interaction-disabled'], '--interaction-disabled', '비활성 배경'],
  ['Alt bg', T.color['--background-alternative'], '--background-alternative', '섹션 · 빈 상태 배경'], ['White', T.color['--background-normal'], '--background-normal', '기본 배경']
];
const status = [
  ['Positive', T.color['--status-positive'], '성공 · 완료 · 승인 텍스트'], ['Cautionary', T.color['--status-cautionary'], '주의 · 확인 필요'],
  ['Negative', T.color['--status-negative'], '오류 · 삭제 · 반려']
];

const typeRows = foundations.typography.map(({label, name, base}) => {
  const size = T.typography['--font-size-' + base], line = T.typography['--line-height-' + name], tracking = T.typography['--tracking-' + base];
  const weight = /display|title/i.test(label) ? 700 : /heading|headline/i.test(label) ? 600 : /label/i.test(label) ? 500 : 400;
  return {label, name, size, line, tracking, weight};
});

// Logos: inline the brand SVGs, keep the five gem colours, make the black shapes follow currentColor.
function logo(file, cls, title) {
  let svg = readFileSync(join(root, 'public/assets/brand', file), 'utf8');
  const fills = {st0: '#a3b166', st1: '#8696ad', st2: '#ac94aa', st3: '#d1936a', st4: '#c77991'};
  svg = svg.replace(/<\?xml[^>]*>/, '').replace(/<!--[\s\S]*?-->/g, '').replace(/<defs>[\s\S]*?<\/defs>/, '');
  svg = svg.replace(/class="(st\d)"/g, (_, c) => `fill="${fills[c]}"`);
  svg = svg.replace(/<(path|polygon|rect)(?![^>]*fill=)/g, '<$1 fill="currentColor"');
  svg = svg.replace(/<svg[^>]*viewBox="([^"]+)"[^>]*>/, `<svg class="${cls}" viewBox="$1" role="img" aria-label="${title}" xmlns="http://www.w3.org/2000/svg">`);
  svg = svg.replace(/ id="[^"]*"/g, '');
  return svg.trim();
}
const logoH = logo('logo.svg', 'lg-h', '퀸만덕 가로형 로고');
const logoV = logo('logo2.svg', 'lg-v', '퀸만덕 세로형 로고');

// Icon set: Lucide-style primitives redrawn as inline SVG (24 grid, 1.7 stroke, round caps).
const icons = {
  'heart': '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A4.5 4.5 0 0 0 12 6a4.5 4.5 0 0 0-10 2.5C2 11 3.5 12.5 5 14l7 7Z"/>',
  'hand-heart': '<path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16"/><path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2L21 12"/><path d="m2 15 6 6"/><path d="M19.5 8.5c.7-.7 1.5-1.6 1.5-2.7A2.7 2.7 0 0 0 16 4a2.7 2.7 0 0 0-5 1.8c0 1.1.8 2 1.5 2.7L16 12Z"/>',
  'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  'calendar': '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  'user': '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  'bell': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  'share': '<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'check': '<path d="M20 6 9 17l-5-5"/>',
  'x': '<path d="M18 6 6 18M6 6l12 12"/>',
  'info': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  'alert': '<path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3"/><path d="M12 9v4M12 17h.01"/>',
  'inbox': '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1"/>',
  'leaf': '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10"/><path d="M2 21c0-3 1.9-5.5 5-7"/>',
  'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
  'building': '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
  'arrow-right': '<path d="M5 12h14M12 5l7 7-7 7"/>',
  'send': '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  'plus': '<path d="M5 12h14M12 5v14"/>',
  'clock': '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'
};
const ic = (name, size = 24) => `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;

/* ---------- CSS ---------- */
const css = `
  :root{
    --orange:${T.color['--palette-orange']}; --rose:${T.color['--palette-rose']}; --olive:${T.color['--palette-olive']}; --blue:${T.color['--palette-blue']}; --lavender:${T.color['--palette-lavender']};
    --primary:${T.color['--palette-rose']}; --primary-strong:${T.color['--primary-strong']}; --primary-heavy:${T.color['--primary-heavy']};
    --brand-soft:${T.color['--brand-soft']};
    ${roseScale.map(([k, v]) => `--rose-${k}:${v};`).join(' ')}
    --label-strong:${T.color['--label-strong']}; --label-normal:${T.color['--label-normal']}; --label-neutral:${T.color['--label-neutral']}; --label-alternative:${T.color['--label-alternative']}; --label-assistive:${T.color['--label-assistive']}; --label-disable:${T.color['--label-disable']};
    --fill-normal:${T.color['--fill-normal']}; --fill-strong:${T.color['--fill-strong']}; --fill-alternative:${T.color['--fill-alternative']};
    --line-normal:${T.color['--line-normal']}; --line-neutral:${T.color['--line-neutral']}; --line-solid:${T.color['--line-solid']};
    --bg:${T.color['--background-normal']}; --bg-alt:${T.color['--background-alternative']}; --disabled:${T.color['--interaction-disabled']};
    --positive:${T.color['--status-positive']}; --cautionary:${T.color['--status-cautionary']}; --negative:${T.color['--status-negative']};
    --font:'Pretendard','Noto Sans KR','Apple SD Gothic Neo',-apple-system,sans-serif;
    --r4:4px; --r8:8px; --r12:12px; --r16:16px; --r20:20px;
    --shadow-low:${T.elevation['--shadow-low']}; --shadow-raised:${T.elevation['--shadow-raised']}; --shadow-dialog:${T.elevation['--shadow-dialog']};
    --motion:${T.motion['--motion-feedback']};
    --rail:248px; --maxw:1080px;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  @media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{animation:none!important;transition:none!important}}
  body{font-family:var(--font);color:var(--label-normal);background:var(--bg);line-height:1.6;letter-spacing:-.005em;-webkit-font-smoothing:antialiased;word-break:keep-all}
  ::selection{background:var(--rose-200);color:var(--rose-950)}
  a{color:inherit}
  a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
  .shell{display:flex;min-height:100vh}
  nav.rail{position:fixed;inset:0 auto 0 0;width:var(--rail);border-right:1px solid var(--line-solid);background:var(--bg);padding:28px 20px 40px;overflow-y:auto;z-index:50}
  main{margin-left:var(--rail);flex:1;min-width:0}
  .content{max-width:var(--maxw);margin:0 auto;padding:0 48px 120px}
  .rail .wordmark{display:block;width:150px;color:var(--label-normal);margin-bottom:6px}
  .rail .wordmark svg{width:100%;height:auto;display:block}
  .rail .railsub{font-size:12px;color:var(--label-alternative);margin-bottom:26px}
  .navgroup{margin-bottom:20px}
  .navgroup h5{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--label-assistive);margin-bottom:6px}
  .navgroup a{display:flex;gap:8px;align-items:baseline;padding:6px 10px;border-radius:8px;font-size:14px;color:var(--label-neutral);text-decoration:none}
  .navgroup a .no{font-size:11px;color:var(--label-assistive);font-variant-numeric:tabular-nums;min-width:20px}
  .navgroup a:hover,.navgroup a.on{background:var(--brand-soft);color:var(--primary-strong)}
  .navgroup a.on{font-weight:600}
  .rail .railfoot{margin-top:24px;font-size:12px;color:var(--label-assistive);line-height:1.7}
  .rail .railfoot a{color:var(--primary-strong);text-decoration:none}

  /* hero */
  header.hero{background:var(--brand-soft);border-bottom:1px solid var(--rose-100);position:relative;overflow:hidden}
  .hero-inner{max-width:var(--maxw);margin:0 auto;padding:84px 48px 68px;position:relative}
  .eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--primary-strong);margin-bottom:22px}
  .eyebrow::before{content:"";width:26px;height:4px;border-radius:99px;background:var(--primary)}
  .hero h1{margin-bottom:26px;color:var(--label-normal)}
  .hero h1 svg{width:min(460px,80vw);height:auto;display:block}
  .hero .slogan{font-size:clamp(22px,2.8vw,32px);font-weight:700;line-height:1.35;letter-spacing:-.03em;color:var(--label-strong);margin-bottom:14px}
  .hero p.desc{max-width:58ch;color:var(--label-neutral);font-size:15px;margin-bottom:36px}
  .meta{display:flex;flex-wrap:wrap;gap:10px}
  .meta span{font-size:12.5px;font-weight:600;color:var(--primary-heavy);background:#fff;border:1px solid var(--rose-200);border-radius:99px;padding:7px 14px;display:inline-flex;align-items:center;gap:8px}
  .meta i{width:10px;height:10px;border-radius:50%;display:inline-block}
  .hero .crownart{position:absolute;right:-30px;bottom:-40px;width:420px;opacity:.16;pointer-events:none;color:var(--primary-heavy)}
  @media(max-width:900px){.hero .crownart{display:none}}

  /* sections */
  section{padding-top:96px}
  .sec-head{margin-bottom:36px;border-bottom:2px solid var(--label-strong);padding-bottom:18px}
  .sec-head .no{font-size:12px;font-weight:700;letter-spacing:.14em;color:var(--primary-strong);display:block;margin-bottom:8px;font-variant-numeric:tabular-nums}
  .sec-head h2{font-weight:700;font-size:clamp(28px,4vw,40px);line-height:1.25;letter-spacing:-.03em;text-wrap:balance}
  .sec-head p{margin-top:10px;color:var(--label-neutral);font-size:15px;max-width:68ch}
  h3.sub{font-size:19px;font-weight:700;letter-spacing:-.02em;margin:52px 0 8px;display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
  h3.sub small{font-size:13px;font-weight:500;color:var(--label-alternative)}
  p.note{color:var(--label-neutral);font-size:14px;max-width:72ch;margin-bottom:20px}
  .tag{display:inline-block;font-size:11px;font-weight:700;border-radius:99px;padding:2px 10px;vertical-align:2px;background:var(--rose-100);color:var(--primary-heavy)}
  .tag.ext{background:#e9eef5;color:#4a5c78}
  .rulebox{border:1px solid var(--rose-200);background:var(--brand-soft);border-radius:var(--r16);padding:16px 20px;font-size:13.5px;color:var(--label-neutral);margin:24px 0 4px}
  .rulebox b{color:var(--primary-heavy)}
  .grid{display:grid;gap:16px}
  .grid.c2{grid-template-columns:repeat(2,1fr)}.grid.c3{grid-template-columns:repeat(3,1fr)}.grid.c4{grid-template-columns:repeat(4,1fr)}.grid.c5{grid-template-columns:repeat(5,1fr)}
  @media(max-width:1100px){.grid.c4,.grid.c5{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:900px){.grid.c3{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:640px){.grid.c2,.grid.c3,.grid.c4,.grid.c5{grid-template-columns:1fr}}
  .panel{border:1px solid var(--line-solid);border-radius:var(--r16);background:var(--bg);overflow:hidden}
  .panel .demo{padding:36px;display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:center;background:var(--bg)}
  .panel .demo.left{justify-content:flex-start}.panel .demo.tint{background:var(--brand-soft)}.panel .demo.gray{background:var(--bg-alt)}.panel .demo.dark{background:var(--primary-heavy)}.panel .demo.col{flex-direction:column;align-items:stretch}
  .panel .caption{border-top:1px solid var(--line-solid);padding:12px 20px;font-size:13px;color:var(--label-alternative);background:var(--bg-alt)}
  .card{border:1px solid var(--line-solid);border-radius:var(--r16);padding:24px;background:var(--bg)}
  .card h4{font-size:16px;font-weight:700;margin-bottom:6px;letter-spacing:-.02em}
  .card p{font-size:13.5px;color:var(--label-neutral)}
  .card .kicker{display:block;font-size:12px;font-weight:700;letter-spacing:.06em;color:var(--primary-strong);margin-bottom:10px;text-transform:uppercase}
  .card .vic{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:var(--brand-soft);color:var(--primary-strong);margin-bottom:14px}
  .msg{border:1px solid var(--line-solid);border-radius:var(--r16);padding:26px 24px}
  .msg .lab{font-size:12px;font-weight:700;color:var(--primary-strong);letter-spacing:.06em;margin-bottom:10px;text-transform:uppercase}
  .msg h4{font-size:22px;font-weight:700;letter-spacing:-.03em;line-height:1.35;margin-bottom:10px;text-wrap:balance}
  .msg p{font-size:13.5px;color:var(--label-neutral)}
  .tone-row{display:flex;flex-wrap:wrap;gap:12px}
  .tone-row .tone{flex:1;min-width:200px;border-radius:var(--r16);background:var(--brand-soft);border:1px solid var(--rose-100);padding:20px 22px}
  .tone b{display:block;font-size:15px;color:var(--primary-heavy);margin-bottom:4px}
  .tone span{font-size:13.5px;color:var(--label-neutral)}
  .spec-list{list-style:none;display:flex;flex-direction:column;gap:10px}
  .spec-list li{display:flex;gap:12px;font-size:14px;color:var(--label-neutral);border-bottom:1px dashed var(--line-solid);padding-bottom:10px}
  .spec-list li b{color:var(--label-normal);min-width:104px;font-weight:600;flex:none}
  .dont{list-style:none;display:flex;flex-direction:column;gap:8px}
  .dont li{font-size:14px;color:var(--label-neutral);display:flex;gap:8px}
  .dont li::before{content:"✕";color:var(--negative);font-weight:700}
  .do li::before{content:"✓";color:var(--positive)}

  /* logo */
  .lg-h,.lg-v{display:block;height:auto}
  .logo-stage .half{padding:52px 32px;display:flex;align-items:center;justify-content:center;min-height:180px}
  .logo-stage .half:first-child{border-bottom:1px solid var(--line-solid)}
  .logo-stage .lg-h{width:min(360px,80%)}.logo-stage .lg-v{width:min(220px,60%)}
  .on-rose,.panel .demo.on-rose,.logo-stage .half.on-rose{background:var(--primary);color:#fff}.on-heavy,.panel .demo.on-heavy,.logo-stage .half.on-heavy{background:var(--primary-heavy);color:#fff}.on-dark,.panel .demo.on-dark{background:var(--label-normal);color:#fff}
  .clearspace{position:relative;display:inline-block;padding:44px;border:1px dashed var(--rose-400);border-radius:8px;color:var(--label-normal)}
  .clearspace .lg-h{width:min(300px,56vw)}
  .clearspace i{position:absolute;font-size:11px;font-style:normal;color:var(--primary-strong);font-weight:700}
  .minsize{display:flex;gap:40px;align-items:flex-end;flex-wrap:wrap;color:var(--label-normal)}
  .minsize figure{text-align:center}.minsize figcaption{font-size:12px;color:var(--label-alternative);margin-top:10px}
  .anatomy{display:grid;grid-template-columns:1.2fr 1fr;gap:24px;align-items:center}
  @media(max-width:760px){.anatomy{grid-template-columns:1fr}}
  .anatomy .lg-h{width:100%;color:var(--label-normal)}
  .gem-list{list-style:none;display:flex;flex-direction:column;gap:8px}
  .gem-list li{display:flex;align-items:center;gap:10px;font-size:14px}
  .gem-list i{width:14px;height:26px;border-radius:2px;display:inline-block;flex:none}

  /* color */
  .swatch{cursor:pointer;border:0;background:none;text-align:left;font-family:inherit;padding:0;width:100%}
  .scale{display:grid;grid-template-columns:repeat(11,1fr);border-radius:12px;overflow:hidden;border:1px solid var(--line-solid)}
  @media(max-width:900px){.scale{grid-template-columns:repeat(6,1fr)}}@media(max-width:560px){.scale{grid-template-columns:repeat(4,1fr)}}
  .scale .swatch .swc{height:72px;position:relative;display:block}
  .scale .swatch.primary .swc::after{content:"PRIMARY";position:absolute;top:6px;left:6px;font-size:8.5px;font-weight:800;letter-spacing:.08em;background:rgba(255,255,255,.92);color:var(--primary-heavy);border-radius:4px;padding:2px 5px}
  .scale .swatch .lab{padding:8px 8px 10px;background:var(--bg);display:block}
  .lab .step{font-size:12px;font-weight:700;display:block;font-variant-numeric:tabular-nums}
  .lab .hex{font-size:11px;color:var(--label-alternative);display:block;letter-spacing:0}
  .swatch:hover .hex{color:var(--primary-strong)}
  .bigswatch{border:1px solid var(--line-solid);border-radius:var(--r16);overflow:hidden}
  .bigswatch .swc{display:block;height:118px;position:relative}
  .bigswatch .swc.checker{background-image:linear-gradient(45deg,#e6e6e6 25%,transparent 25%),linear-gradient(-45deg,#e6e6e6 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e6e6e6 75%),linear-gradient(-45deg,transparent 75%,#e6e6e6 75%);background-size:16px 16px;background-position:0 0,0 8px,8px -8px,-8px 0}
  .bigswatch .swc.checker::after{content:"";position:absolute;inset:0;background:var(--c)}
  .bigswatch .lab{display:block;padding:14px 16px;background:var(--bg)}
  .bigswatch .lab b{display:block;font-size:15px;margin-bottom:2px}
  .bigswatch .lab span{display:block;font-size:12.5px;color:var(--label-alternative);line-height:1.5}
  .bigswatch .lab code{font-size:11.5px;color:var(--label-assistive)}
  .gradientbar{height:120px;border-radius:var(--r16);border:1px solid var(--rose-100);background:linear-gradient(90deg,var(--brand-soft) 0%,var(--rose-300) 35%,var(--primary) 70%,var(--primary-heavy) 100%)}
  .gembar{display:flex;gap:6px;height:64px}
  .gembar i{flex:1;border-radius:4px}
  table.tbl{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums;font-size:14px}
  table.tbl th{text-align:left;font-size:11.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--label-alternative);border-bottom:1px solid var(--label-strong);padding:10px 12px}
  table.tbl td{border-bottom:1px solid var(--line-solid);padding:12px;vertical-align:middle}
  table.tbl td code{font-size:12.5px;background:var(--bg-alt);border-radius:6px;padding:2px 6px}
  table.tbl td .dot{display:inline-block;width:14px;height:14px;border-radius:4px;border:1px solid var(--line-normal);vertical-align:-2px;margin-right:8px}
  .tablewrap{overflow-x:auto}

  /* typography */
  .font-card{border:1px solid var(--line-solid);border-radius:var(--r16);padding:28px;background:var(--bg);display:flex;flex-direction:column}
  .font-card .role{font-size:11.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--primary-strong);margin-bottom:14px}
  .font-card .spec{font-size:clamp(24px,3vw,34px);line-height:1.3;letter-spacing:-.03em;margin-bottom:16px;text-wrap:balance}
  .font-card .meta2{font-size:13px;color:var(--label-alternative);display:flex;flex-direction:column;gap:3px;margin-top:auto}
  .font-card .meta2 a{color:var(--primary-strong);text-decoration:none;font-weight:600}
  table.typescale td.sample{line-height:1.25}
  table.typescale td.name{font-size:12.5px;font-weight:600;color:var(--label-neutral);white-space:nowrap}
  table.typescale td.num{font-size:12.5px;color:var(--label-alternative);white-space:nowrap}
  .weights{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
  @media(max-width:760px){.weights{grid-template-columns:repeat(2,1fr)}}
  .weights div{border:1px solid var(--line-solid);border-radius:12px;padding:18px}
  .weights div b{display:block;font-size:28px;letter-spacing:-.03em;line-height:1.2}
  .weights div span{font-size:12px;color:var(--label-alternative)}

  /* notation */
  .notate{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  @media(max-width:760px){.notate{grid-template-columns:1fr}}
  .notate .box{border:1px solid var(--line-solid);border-radius:var(--r16);padding:24px}
  .notate .box .t{font-size:12px;font-weight:700;color:var(--label-alternative);letter-spacing:.1em;text-transform:uppercase;margin-bottom:12px}
  .notate .big{font-size:32px;font-weight:700;letter-spacing:-.03em;line-height:1.2}
  .notate .big small{display:block;font-size:14px;font-weight:500;color:var(--label-alternative);letter-spacing:0;margin-top:4px}
  .notate .amount{font-variant-numeric:tabular-nums}

  /* image direction */
  .imgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
  @media(max-width:760px){.imgrid{grid-template-columns:1fr}}
  .imgrid figure{border:1px solid var(--line-solid);border-radius:var(--r16);overflow:hidden;background:var(--bg)}
  .imgrid img{display:block;width:100%;aspect-ratio:1.56;object-fit:cover}
  .imgrid figcaption{padding:12px 14px;font-size:12.5px;color:var(--label-neutral)}
  .imgrid figcaption b{display:block;color:var(--label-normal);margin-bottom:2px}
  .ratio-row{display:flex;gap:16px;flex-wrap:wrap;align-items:flex-end}
  .ratio-row div{background:var(--brand-soft);border:1px dashed var(--rose-400);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:var(--primary-heavy)}

  /* motif */
  .motif-stage{display:flex;align-items:center;justify-content:center;min-height:200px}
  .crown{color:var(--label-normal)}
  .crown-bars{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;width:100%}
  .crown-bars i{display:block;height:80px;border-radius:6px}
  .stripe{width:100%;height:64px;border-radius:12px;background:repeating-linear-gradient(90deg,var(--orange) 0 20px,transparent 20px 34px,var(--rose) 34px 54px,transparent 54px 68px,var(--olive) 68px 88px,transparent 88px 102px,var(--blue) 102px 122px,transparent 122px 136px,var(--lavender) 136px 156px,transparent 156px 170px)}
  .divider-gem{display:flex;gap:8px;align-items:center;width:100%}
  .divider-gem::before,.divider-gem::after{content:"";flex:1;height:1px;background:var(--line-solid)}
  .divider-gem i{width:8px;height:16px;border-radius:2px;display:inline-block}
  .progress-gem{width:100%;height:10px;border-radius:99px;background:var(--fill-normal);overflow:hidden;display:flex}
  .progress-gem i{display:block;height:100%}

  /* icons */
  .icon-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:12px}
  @media(max-width:900px){.icon-grid{grid-template-columns:repeat(4,1fr)}}@media(max-width:560px){.icon-grid{grid-template-columns:repeat(3,1fr)}}
  .icon-grid figure{border:1px solid var(--line-solid);border-radius:12px;padding:18px 8px 12px;display:flex;flex-direction:column;align-items:center;gap:10px;color:var(--label-normal)}
  .icon-grid figcaption{font-size:11.5px;color:var(--label-alternative)}
  .icon-sizes{display:flex;gap:28px;align-items:flex-end;color:var(--label-normal)}
  .icon-sizes figure{text-align:center}.icon-sizes figcaption{font-size:11.5px;color:var(--label-alternative);margin-top:6px}

  /* tokens */
  pre.vars{background:#1b1b1f;color:#e6e6ea;font-size:12.5px;line-height:1.65;border-radius:var(--r16);padding:22px 24px;overflow:auto;max-height:520px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
  .copybar{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px;flex-wrap:wrap}
  .space-row{display:flex;flex-wrap:wrap;gap:14px;align-items:flex-end}
  .space-row figure{text-align:center}
  .space-row i{display:block;background:var(--rose-300);border-radius:3px}
  .space-row figcaption{font-size:11.5px;color:var(--label-alternative);margin-top:6px}
  .radius-row{display:flex;flex-wrap:wrap;gap:16px}
  .radius-row figure{text-align:center}.radius-row i{display:block;width:72px;height:72px;background:var(--brand-soft);border:1.5px solid var(--primary)}
  .radius-row figcaption{font-size:11.5px;color:var(--label-alternative);margin-top:6px}
  .shadow-row{display:flex;flex-wrap:wrap;gap:24px}
  .shadow-row figure{text-align:center}.shadow-row i{display:block;width:120px;height:80px;background:#fff;border-radius:12px}
  .shadow-row figcaption{font-size:11.5px;color:var(--label-alternative);margin-top:10px}

  /* components (mirrors app.css) */
  .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid var(--line-solid);min-height:48px;border-radius:var(--r12);padding:12px 20px;font:inherit;font-size:15px;font-weight:600;line-height:22px;background:var(--bg);color:var(--label-normal);cursor:pointer;transition:background var(--motion),color var(--motion),border-color var(--motion);text-decoration:none}
  .btn.primary{background:var(--primary);border-color:var(--primary);color:#fff}
  .btn.primary:hover{background:var(--primary-strong);border-color:var(--primary-strong)}
  .btn.outlined{color:var(--primary-strong);border-color:var(--primary)}
  .btn.outlined:hover{background:var(--brand-soft)}
  .btn.secondary:hover{background:var(--fill-normal)}
  .btn.danger{color:var(--negative);background:var(--bg-alt);border-color:var(--negative)}
  .btn.small{min-height:32px;border-radius:var(--r8);padding:8px 12px;font-size:14px}
  .btn.large{min-height:56px;padding:16px 28px;font-size:16px}
  .btn:disabled,.btn[aria-disabled="true"]{background:var(--disabled);border-color:var(--disabled);color:var(--label-disable);cursor:not-allowed}
  .iconbtn{display:inline-flex;align-items:center;justify-content:center;border:0;background:none;border-radius:50%;width:40px;height:40px;color:var(--label-normal);cursor:pointer}
  .iconbtn:hover{background:var(--fill-normal)}.iconbtn.filled{background:var(--brand-soft);color:var(--primary-strong)}.iconbtn.outlined{border:1px solid var(--line-solid)}
  .iconbtn:disabled{color:var(--label-disable);cursor:not-allowed}
  .field{display:flex;flex-direction:column;gap:6px;font-size:14px;min-width:220px;flex:1}
  .field>span{font-weight:600}
  .field :is(input,select,textarea){width:100%;background:var(--bg);border:1px solid var(--line-solid);border-radius:var(--r12);min-height:48px;padding:12px 16px;font:inherit;font-size:16px;line-height:24px;color:var(--label-normal)}
  .field :is(input,select,textarea):focus{border-color:var(--primary);outline:2px solid var(--primary);outline-offset:0}
  .field input[aria-invalid="true"]{border-color:var(--negative)}
  .field :is(input,select,textarea):disabled{background:var(--disabled);color:var(--label-disable)}
  .field input[readonly]{background:var(--bg-alt)}
  .field small{font-size:12.5px;color:var(--label-alternative)}.field small.err{color:var(--negative)}
  .field textarea{resize:vertical;min-height:100px}
  .check,.radio{display:flex;align-items:center;gap:9px;font-size:14px;min-height:28px}
  .check input,.radio input{width:17px;height:17px;accent-color:var(--primary)}
  .tgl{appearance:none;width:52px;height:32px;border-radius:99px;background:var(--label-disable);position:relative;cursor:pointer;transition:background var(--motion);flex:none}
  .tgl::after{content:"";position:absolute;top:3px;left:3px;width:26px;height:26px;border-radius:50%;background:#fff;box-shadow:var(--shadow-low);transition:transform var(--motion)}
  .tgl:checked{background:var(--primary)}.tgl:checked::after{transform:translateX(20px)}
  .tgl.small{width:40px;height:24px}.tgl.small::after{width:18px;height:18px}.tgl.small:checked::after{transform:translateX(16px)}
  .tgl:disabled{opacity:.5;cursor:not-allowed}
  .switch-row{display:flex;justify-content:space-between;align-items:center;gap:16px;width:100%;padding:12px 0;border-bottom:1px solid var(--line-solid);font-size:14px}
  .qchip{--c:var(--rose);border:1px solid transparent;border-radius:var(--r8);display:inline-flex;align-items:center;gap:8px;padding:8px 12px;min-height:36px;font:inherit;font-size:14px;font-weight:600;background:var(--bg);color:var(--label-neutral);cursor:pointer;box-shadow:inset 0 0 0 1px var(--line-solid)}
  .qchip[aria-pressed="true"]{background:var(--c);color:#fff;box-shadow:none}
  .qchip.orange{--c:var(--orange)}.qchip.olive{--c:var(--olive)}.qchip.blue{--c:var(--blue)}.qchip.lavender{--c:var(--lavender)}
  .qbadge{display:inline-block;--c:var(--lavender);background:var(--c);color:#fff;font-weight:600;border-radius:var(--r8);font-size:13px;line-height:18px;padding:4px 10px;white-space:nowrap}
  .qbadge.orange{--c:var(--orange)}.qbadge.rose{--c:var(--rose)}.qbadge.olive{--c:var(--olive)}.qbadge.blue{--c:var(--blue)}
  .qbadge.outlined{background:transparent;color:var(--c);box-shadow:inset 0 0 0 1px var(--c)}
  .qtabs{display:flex;gap:24px;border-bottom:1px solid var(--line-solid);width:100%}
  .qtabs button{font:inherit;font-size:16px;font-weight:600;color:var(--label-alternative);background:none;border:0;border-bottom:2px solid transparent;padding:16px 0;min-height:48px;cursor:pointer;margin-bottom:-1px}
  .qtabs button[aria-selected="true"]{color:var(--label-strong);border-bottom-color:var(--primary)}
  .qtab-panel{padding:20px 0 4px;font-size:14px;color:var(--label-neutral);width:100%}
  .qtoast{display:inline-flex;align-items:center;gap:10px;background:var(--label-normal);color:#fff;font-size:14px;border-radius:12px;padding:14px 24px;box-shadow:var(--shadow-raised)}
  .qtoast .ico{color:var(--olive)}
  .qmsg{display:flex;gap:12px;align-items:flex-start;border-radius:var(--r12);padding:14px 16px;font-size:14px;width:100%;border:1px solid var(--line-solid);background:var(--bg-alt)}
  .qmsg b{display:block;margin-bottom:2px}.qmsg p{color:var(--label-neutral);font-size:13.5px}
  .qmsg.info{color:var(--blue)}.qmsg.positive{color:var(--positive);background:#eef7f1;border-color:#cfe6d8}.qmsg.caution{color:var(--cautionary);background:#fbf4e8;border-color:#efdcb8}.qmsg.negative{color:var(--negative);background:#fdf0f0;border-color:#f2c9c9}
  .qmsg b,.qmsg p{color:var(--label-normal)}
  .empty{padding:40px 24px;text-align:center;background:var(--bg-alt);border:1px dashed var(--line-solid);border-radius:var(--r12);width:100%}
  .empty .ico{color:var(--label-assistive);width:32px;height:32px}.empty h4{margin:10px 0 4px;font-size:16px}.empty p{font-size:13.5px;color:var(--label-alternative)}
  .qprogress{display:block;height:4px;width:100%;border-radius:8px;background:var(--fill-normal);overflow:hidden}
  .qprogress i{display:block;height:100%;background:var(--primary);border-radius:8px}
  .fund{position:relative;width:272px;overflow:hidden;background:var(--bg);border:1px solid var(--line-solid);border-radius:var(--r12);transition:transform var(--motion),box-shadow var(--motion);text-align:left}
  .fund:hover{transform:translateY(-2px);box-shadow:var(--shadow-raised)}
  .fund .img{position:relative;aspect-ratio:1.56;background:linear-gradient(135deg,var(--rose-200),var(--brand-soft));display:flex;align-items:center;justify-content:center;color:var(--primary-strong)}
  .fund .img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  .fund .dday{position:absolute;top:13px;left:13px;padding:4px 8px;border-radius:4px;font-size:13px;background:var(--rose);color:#fff;font-weight:600}
  .fund .dday.ended{background:var(--lavender)}
  .fund .bm{position:absolute;top:8px;right:8px;width:36px;height:36px;border-radius:50%;border:0;background:rgba(255,255,255,.9);color:var(--label-neutral);display:flex;align-items:center;justify-content:center;cursor:pointer}
  .fund .bm[aria-pressed="true"]{color:var(--rose)}
  .fund .copy{padding:16px 18px 18px}
  .fund .cat{font-size:13px;color:var(--primary-strong);font-weight:600}
  .fund h4{font-size:17px;line-height:1.4;letter-spacing:-.02em;margin:4px 0 2px;font-weight:600}
  .fund .org{font-size:13px;color:var(--label-alternative);margin-bottom:12px}
  .fund .nums{display:flex;justify-content:space-between;align-items:baseline;margin-top:8px;font-size:13px;color:var(--label-alternative)}
  .fund .nums strong{font-size:16px;color:var(--primary-strong)}.fund .nums b{color:var(--label-normal)}
  .banner{width:100%;border-radius:var(--r16);background:var(--brand-soft);border:1px solid var(--rose-100);padding:28px 32px;display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap}
  .banner h4{font-size:20px;font-weight:700;letter-spacing:-.02em;margin-bottom:4px}.banner p{font-size:14px;color:var(--label-neutral)}
  .banner .acts{display:flex;gap:10px}
  .qaccordion{width:100%;border:1px solid var(--line-solid);border-radius:12px;overflow:hidden}
  .qaccordion button{width:100%;display:flex;align-items:center;justify-content:space-between;gap:20px;text-align:left;border:0;background:var(--bg);font:inherit;font-weight:600;font-size:15px;padding:20px;cursor:pointer;min-height:64px}
  .qaccordion button small{display:block;font-size:12.5px;color:var(--label-alternative);font-weight:400;margin-top:2px}
  .qaccordion button .ico{transition:transform var(--motion);flex:none}
  .qaccordion button[aria-expanded="true"] .ico{transform:rotate(180deg)}
  .qaccordion .body{padding:0 20px 20px;font-size:14px;color:var(--label-neutral);border-bottom:1px solid var(--line-solid)}
  .qaccordion .body[hidden]{display:none}
  .pager{display:flex;gap:8px;align-items:center}
  .pager button{min-width:32px;height:32px;border-radius:8px;border:1px solid var(--line-solid);background:var(--bg);font:inherit;font-size:13px;cursor:pointer}
  .pager button[aria-current="page"]{background:var(--primary);border-color:var(--primary);color:#fff}
  .pager button:disabled{color:var(--label-disable);cursor:not-allowed}

  /* layout section */
  .bp-row{display:flex;gap:12px;flex-wrap:wrap}
  .bp-row div{border:1px solid var(--line-solid);border-radius:12px;padding:14px 16px;font-size:13px;min-width:150px}
  .bp-row b{display:block;font-size:18px;letter-spacing:-.02em}
  .colgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
  .colgrid i{display:block;height:64px;border-radius:8px;background:var(--rose-200)}

  footer{border-top:1px solid var(--line-solid);margin-top:110px;background:var(--bg-alt)}
  .foot-inner{max-width:var(--maxw);margin:0 auto;padding:44px 48px 60px;display:flex;flex-wrap:wrap;gap:28px;justify-content:space-between;align-items:flex-start}
  .foot-inner .lg-v{width:110px;color:var(--label-normal)}
  .foot-inner .info{font-size:12.5px;color:var(--label-alternative);line-height:1.8}
  .foot-inner .info b{color:var(--label-neutral)}
  #copytoast{position:fixed;bottom:28px;left:50%;transform:translate(-50%,16px);background:var(--label-normal);color:#fff;font-size:13.5px;border-radius:99px;padding:10px 20px;opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;z-index:99}
  #copytoast.show{opacity:1;transform:translate(-50%,0)}

  @media(max-width:1023px){
    nav.rail{position:sticky;top:0;inset:auto;width:auto;height:auto;display:flex;align-items:center;gap:14px;overflow-x:auto;overflow-y:hidden;border-right:0;border-bottom:1px solid var(--line-solid);padding:12px 20px;white-space:nowrap}
    nav.rail .railsub,nav.rail .railfoot,.navgroup h5,.navgroup a .no{display:none}
    nav.rail .wordmark{width:110px;margin:0;flex:none}
    .navgroup{margin:0;display:flex;align-items:center;gap:2px}
    .navgroup a{padding:6px 10px}
    main{margin-left:0}.shell{display:block}
    .content{padding:0 22px 90px}.hero-inner{padding:56px 22px 48px}.foot-inner{padding:36px 22px 48px}
    section{padding-top:72px}
  }
`;

/* ---------- HTML fragments ---------- */
const navItems = [
  ['Brand', [['overview', '00', '브랜드 개요'], ['logo', '01', '로고'], ['color', '02', '컬러'], ['type', '03', '타이포그래피'], ['notation', '04', '표기법']]],
  ['Visual', [['image', '05', '이미지 디렉션'], ['motif', '06', '그래픽 모티프'], ['icon', '07', '아이콘']]],
  ['Web', [['tokens', '08', '웹 토큰'], ['components', '09', '컴포넌트'], ['layout', '10', '레이아웃 · 그리드']]]
];
const nav = navItems.map(([g, items]) => `<div class="navgroup"><h5>${g}</h5>${items.map(([id, no, t]) => `<a href="#${id}"><span class="no">${no}</span>${t}</a>`).join('')}</div>`).join('');

const secHead = (no, title, desc) => `<div class="sec-head"><span class="no">${no}</span><h2>${title}</h2>${desc ? `<p>${desc}</p>` : ''}</div>`;
const swatchBtn = (label, value, sub = '', cls = '') => {
  const alpha = /^#[0-9a-f]{8}$/i.test(value);
  return `<div class="bigswatch ${cls}"><button class="swatch" data-copy="${upper(value)}" aria-label="${esc(label)} ${upper(value)} 복사"><span class="swc ${alpha ? 'checker' : ''}" style="${alpha ? `--c:${value}` : `background:${value}`}"></span><span class="lab"><b>${esc(label)}</b><span>${esc(sub)}</span><code>${upper(value)}</code></span></button></div>`;
};

const scaleHtml = `<div class="scale">${roseScale.map(([k, v]) => `<button class="swatch ${k === '500' ? 'primary' : ''}" data-copy="${upper(v)}" aria-label="Rose ${k} ${upper(v)} 복사"><span class="swc" style="background:${v}"></span><span class="lab"><span class="step">${k}</span><span class="hex">${upper(v)}</span></span></button>`).join('')}</div>`;

const typeTable = `<div class="tablewrap"><table class="tbl typescale"><thead><tr><th>스타일</th><th>예시</th><th>크기 / 행간</th><th>자간</th><th>굵기</th><th>토큰</th></tr></thead><tbody>${typeRows.map(r => `<tr><td class="name">${esc(r.label)}</td><td class="sample" style="font-size:${r.size};line-height:${r.line};letter-spacing:${r.tracking};font-weight:${r.weight}">작은 나눔이 모여</td><td class="num">${r.size} / ${r.line}</td><td class="num">${r.tracking}</td><td class="num">${r.weight}</td><td class="num"><code>--font-size-${r.name.replace(/-reading$/, '')}</code></td></tr>`).join('')}</tbody></table></div>`;

const tokenRows = (obj, note = {}) => Object.entries(obj).map(([k, v]) => `<tr><td><code>${k}</code></td><td>${/^#|^var\(/.test(v) ? `<span class="dot" style="background:${v.startsWith('var') ? T.color[v.slice(4, -1)] || v : v}"></span>` : ''}${esc(v)}</td><td>${esc(note[k] || '')}</td></tr>`).join('');
const colorNotes = {
  '--primary-normal': '주요 버튼 · 진행률 · 활성 상태', '--primary-strong': '호버 · 분류 라벨 · 링크', '--primary-heavy': '프레스 · 강한 강조',
  '--label-normal': '본문', '--label-strong': '제목', '--label-neutral': '보조 본문', '--label-alternative': '설명 · 메타', '--label-assistive': '플레이스홀더', '--label-disable': '비활성 텍스트',
  '--fill-normal': '호버 배경 · 진행률 트랙', '--fill-strong': '프레스 배경', '--fill-alternative': '아주 옅은 채움',
  '--line-normal': '구분선(알파)', '--line-neutral': '옅은 구분선', '--line-solid': '입력창 · 카드 테두리',
  '--background-normal': '기본 배경', '--background-alternative': '섹션 · 빈 상태', '--background-elevated': '팝업 · 카드', '--brand-soft': '브랜드 연한 배경',
  '--interaction-disabled': '비활성 배경', '--status-positive': '성공', '--status-cautionary': '주의', '--status-negative': '오류', '--material-dimmer': '팝업 스크림',
  '--palette-olive': '승인 · 성공', '--palette-blue': '접수 · 심사', '--palette-lavender': '종료 · 취소', '--palette-orange': '보완 · 예정', '--palette-rose': 'Primary', '--static-white': '항상 흰색'
};
const cssVars = readFileSync(join(root, 'public/assets/css/tokens.css'), 'utf8').trim();

const head = ARTIFACT ? `<title>퀸만덕 디자인 시스템</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap">
<style>${css}</style>` : `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>퀸만덕 디자인 시스템</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="퀸만덕 기부 플랫폼의 브랜드 · 디자인 시스템 가이드. 로고, 컬러, 타이포그래피, 표기법, 토큰, 컴포넌트.">
<meta name="theme-color" content="${T.color['--palette-rose']}">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css">
<style>${css}</style>
</head>
<body>`;
const html = `${head}
<div class="shell">
<nav class="rail" aria-label="목차">
  <a class="wordmark" href="#top" aria-label="퀸만덕 디자인 시스템 처음으로">${logoH}</a>
  <div class="railsub">Design System · v${VERSION}</div>
  ${nav}
  <div class="railfoot">사이트 <a href="${SITE}/" target="_blank" rel="noopener">queen-mandeok.vercel.app</a><br>컴포넌트 카탈로그 <a href="${SITE}/design-system/" target="_blank" rel="noopener">/design-system/</a></div>
</nav>
<main id="top">
<header class="hero">
  <div class="hero-inner">
    <span class="eyebrow">Queen Mandeok · Brand &amp; Design System</span>
    <h1>${logoH}</h1>
    <p class="slogan">작은 나눔이 모여,<br>더 큰 변화를 만듭니다.</p>
    <p class="desc">퀸만덕은 마음이 닿는 이야기를 만나고 그 다음의 변화까지 함께하는 기부 플랫폼입니다. 이 문서는 로고, 컬러, 타이포그래피, 표기법, 웹 토큰과 컴포넌트를 한곳에 모은 단일 기준입니다. 기부자, 모금단체, 기업 파트너, 운영자가 같은 언어로 서비스를 이해하도록 설계합니다.</p>
    <div class="meta"><span>Ver ${VERSION} · ${DATE}</span><span>Pretendard</span><span><i style="background:${T.color['--palette-rose']}"></i>Primary ${upper(T.color['--palette-rose'])}</span><span>${palette.map(p => `<i style="background:${p[2]}"></i>`).join('')} 5 Palette</span></div>
  </div>
  <svg class="crownart" viewBox="0 0 168 51" aria-hidden="true"><path fill="currentColor" d="M141.4,1.7l-4.4.2-4.4.2c0,.6.2,5.2,1.4,11.3H34.4c1.1-6.2,1.3-10.8,1.4-11.3l-8.9-.3C26.8,2.1,25,42.6,0,42.6v8.9c19.2,0,28.1-15.6,32.2-29.2h103.7c4.1,13.7,13,29.2,32.2,29.2v-8.9c-25,0-26.8-40.5-26.8-40.9h0Z"/></svg>
</header>

<div class="content">

<!-- 00 -->
<section id="overview">
  ${secHead('00 · Brand overview', '브랜드 개요', '퀸만덕은 도움이 필요한 순간과 마음을 전하고 싶은 사람을 연결하고, 나눔이 만들어내는 변화까지 함께 살펴보는 기부 플랫폼입니다.')}
  <h3 class="sub">브랜드 가치 <small>이야기를 발견하고, 마음을 전하고, 변화를 함께합니다</small></h3>
  <div class="grid c3">
    <div class="card"><div class="vic">${ic('search')}</div><h4>발견하다</h4><p>따뜻한 한 끼, 새로운 배움, 곁을 지켜주는 관심. 누군가에게 평범한 일상은 또 다른 누군가에게 간절한 바람입니다. 퀸만덕은 그 이야기에 귀 기울이는 데서 시작합니다.</p></div>
    <div class="card"><div class="vic">${ic('hand-heart')}</div><h4>전하다</h4><p>일시 기부, 정기 기부, 응원 참여까지. 나에게 맞는 방법으로 부담 없이 마음을 전할 수 있도록 과정을 짧고 투명하게 만듭니다.</p></div>
    <div class="card"><div class="vic">${ic('leaf')}</div><h4>함께하다</h4><p>지급, 집행, 결과보고까지 나눔 이후의 변화를 수치와 이야기로 공개합니다. 작은 실천이 모여 이웃의 든든한 오늘을 만듭니다.</p></div>
  </div>
  <h3 class="sub">타겟과 역할</h3>
  <div class="grid c4">
    <div class="card"><span class="kicker">Donor</span><h4>기부 회원</h4><p>이야기를 읽고 공감하는 순간부터 꾸준히 마음을 전하는 약속까지. 내역과 영수증, 결과보고를 한곳에서 확인합니다.</p></div>
    <div class="card"><span class="kicker">Organization</span><h4>모금단체</h4><p>신청, 심사, 모금함 작성, 소식과 결과보고를 통해 신뢰를 쌓습니다.</p></div>
    <div class="card"><span class="kicker">Corporate</span><h4>기업 파트너</h4><p>매칭 캠페인과 응원 캠페인으로 개인의 나눔에 힘을 보탭니다.</p></div>
    <div class="card"><span class="kicker">Admin</span><h4>운영자</h4><p>심사, 지급·정산, 환불, 신고, 콘텐츠를 일관된 기준으로 처리합니다.</p></div>
  </div>
  <h3 class="sub">톤 앤 보이스</h3>
  <div class="tone-row">
    <div class="tone"><b>따뜻하고 담백하게</b><span>감정을 과장하지 않습니다. “마음을 전하다”, “함께하다”처럼 부드러운 동사로 행동을 안내합니다.</span></div>
    <div class="tone"><b>존중하는 존댓말</b><span>모든 문구는 “~해주세요”, “~할 수 있어요” 형태의 존댓말을 사용합니다. 명령형과 느낌표 남용을 피합니다.</span></div>
    <div class="tone"><b>투명한 숫자</b><span>모금액, 달성률, 지급액은 정수 원 단위로 정확히 표기하고, 초과 달성도 숨기지 않습니다.</span></div>
    <div class="tone"><b>솔직한 고지</b><span>가상 사연·스톡 이미지·데모 결제는 화면에서 그 사실을 분명히 밝힙니다. 사진 속 인물을 실제 수혜자로 소개하지 않습니다.</span></div>
  </div>
  <h3 class="sub">키 메시지</h3>
  <div class="grid c2">
    <div class="msg"><div class="lab">Brand</div><h4>작은 나눔이 모여,<br>더 큰 변화를 만듭니다.</h4><p>홈 히어로와 푸터에 사용하는 대표 슬로건입니다.</p></div>
    <div class="msg"><div class="lab">Discovery</div><h4>마음이 닿는 이야기를 만나고,<br>그 다음의 변화까지 함께하세요.</h4><p>탐색·검색 화면과 메타 설명에 사용합니다.</p></div>
    <div class="msg"><div class="lab">Monthly</div><h4>매달 이어지는 마음,<br>함께 자라는 내일.</h4><p>정기기부 안내에 사용합니다. 우리의 작은 약속이 누군가의 든든한 일상이 됩니다.</p></div>
    <div class="msg"><div class="lab">Place</div><h4>작은 마음이 모이는 곳,<br>퀸만덕</h4><p>브랜드를 장소로 표현할 때 사용합니다.</p></div>
  </div>
</section>

<!-- 01 -->
<section id="logo">
  ${secHead('01 · Logo', '로고', '퀸만덕 로고는 왕관(Queen)의 실루엣과 다섯 가지 색의 보석 바, 그리고 “퀸만덕” 워드마크로 구성됩니다. 다섯 색은 그대로 브랜드 팔레트가 됩니다.')}
  <h3 class="sub">구성 요소</h3>
  <div class="anatomy">
    <div class="panel"><div class="demo">${logoH}</div></div>
    <ul class="gem-list">
      <li><i style="background:var(--label-normal);width:26px;height:10px;border-radius:99px"></i>왕관 실루엣 — 가장 중요한 형태. 색을 바꾸지 않습니다(검정 또는 흰색 반전)</li>
      ${palette.map(p => `<li><i style="background:${p[2]}"></i>${p[1].split(' · ')[1]} 보석 바 · ${upper(p[2])}</li>`).join('')}
      <li><i style="background:var(--label-normal);width:26px;height:10px;border-radius:2px"></i>워드마크 “퀸만덕” — 왕관과 같은 색을 사용합니다</li>
    </ul>
  </div>
  <h3 class="sub">가로형 · 세로형</h3>
  <div class="grid c2">
    <div class="panel logo-stage"><div class="half">${logoH}</div><div class="half on-rose">${logoH}</div><div class="caption">가로형(기본) — 헤더, 문서 상단, 가로 공간이 넓은 곳. 원본 <code>logo.svg</code></div></div>
    <div class="panel logo-stage"><div class="half">${logoV}</div><div class="half on-heavy">${logoV}</div><div class="caption">세로형 — 푸터, 정사각 프로필, 인쇄물. 영문 “QUEEN MANDEOK” 포함. 원본 <code>logo2.svg</code></div></div>
  </div>
  <h3 class="sub">배경별 사용</h3>
  <div class="grid c4">
    <div class="panel"><div class="demo">${logoH}</div><div class="caption">흰 배경 — 검정 + 보석 5색</div></div>
    <div class="panel"><div class="demo tint">${logoH}</div><div class="caption">브랜드 소프트 배경 — 검정 + 보석 5색</div></div>
    <div class="panel"><div class="demo on-rose">${logoH}</div><div class="caption">Rose 배경 — 흰색 반전, 보석 유지</div></div>
    <div class="panel"><div class="demo on-dark">${logoH}</div><div class="caption">어두운 배경 — 흰색 반전, 보석 유지</div></div>
  </div>
  <h3 class="sub">최소 여백 · 최소 크기 <span class="tag ext">웹 시스템 확장 제안</span></h3>
  <div class="grid c2">
    <div class="panel"><div class="demo"><span class="clearspace"><i style="top:14px;left:50%;transform:translateX(-50%)">½ H</i><i style="bottom:14px;left:50%;transform:translateX(-50%)">½ H</i><i style="left:10px;top:50%;transform:translateY(-50%)">½ H</i><i style="right:10px;top:50%;transform:translateY(-50%)">½ H</i>${logoH}</span></div><div class="caption">사방 최소 여백 = 왕관 높이(H)의 1/2. 이 안에 다른 요소를 두지 않습니다.</div></div>
    <div class="panel"><div class="demo minsize"><figure><div style="width:120px">${logoH}</div><figcaption>가로형 최소 120px</figcaption></figure><figure><div style="width:64px">${logoV}</div><figcaption>세로형 최소 64px</figcaption></figure><figure><div style="width:222px">${logoH}</div><figcaption>헤더 기본 222 × 27px</figcaption></figure></div><div class="caption">보석 바가 구분되지 않는 크기로 줄이지 않습니다. 인쇄 시 가로형 최소 25mm.</div></div>
  </div>
  <h3 class="sub">금지 사항</h3>
  <div class="grid c2">
    <ul class="dont"><li>보석 바의 순서(살구·로즈·올리브·블루·라벤더)나 색을 바꾸지 않습니다</li><li>왕관과 워드마크를 검정·흰색 외의 색으로 칠하지 않습니다</li><li>비율을 늘리거나 기울이지 않습니다</li><li>그림자, 외곽선, 그라데이션 효과를 더하지 않습니다</li></ul>
    <ul class="dont"><li>왕관만, 워드마크만 떼어 로고 대용으로 쓰지 않습니다(모티프 규정 참고)</li><li>사진처럼 복잡한 배경 위에 여백 없이 올리지 않습니다</li><li>명도 40~60%의 중간 회색 배경에서는 검정·흰색 어느 쪽도 대비가 부족하므로 피합니다</li><li>다른 서체로 “퀸만덕”을 조판해 로고를 흉내내지 않습니다</li></ul>
  </div>
</section>

<!-- 02 -->
<section id="color">
  ${secHead('02 · Color', '컬러', '로고의 보석 다섯 색이 브랜드 팔레트이며, 그중 Rose가 Primary입니다. 각 색은 상태 의미를 고정으로 가지므로 장식용으로 섞어 쓰지 않습니다.')}
  <h3 class="sub">브랜드 팔레트 <small>클릭하면 HEX가 복사됩니다</small></h3>
  <div class="grid c5">${palette.map(p => swatchBtn(p[1], p[2], p[3])).join('')}</div>
  <div class="rulebox"><b>의미 고정 규칙.</b> Olive = 승인·성공·진행·완료 / Blue = 접수·심사·처리 중 / Lavender = 임시저장·일시중지·종료·취소 / Orange = 보완 요청·예정 / Rose = Primary, 실패·반려·추천. 상태 배지, 칩, 관리자 화면의 색은 모두 이 표에서 정합니다.</div>
  <h3 class="sub">Primary 세트</h3>
  <div class="grid c3">${swatchBtn('Primary · Normal', T.color['--palette-rose'], '기본 버튼, 진행률, 활성 상태')}${swatchBtn('Primary · Strong', T.color['--primary-strong'], '호버, 분류 라벨, 텍스트 링크')}${swatchBtn('Primary · Heavy', T.color['--primary-heavy'], '프레스, 어두운 배경, 강한 강조')}</div>
  <h3 class="sub">Rose 스케일 <span class="tag ext">웹 시스템 확장 제안</span> <small>500 = Primary, 600·700 = Strong·Heavy 토큰과 동일</small></h3>
  ${scaleHtml}
  <p class="note" style="margin-top:12px">토큰 원본에는 Normal·Strong·Heavy 세 단계만 있습니다. 50~400은 흰색과 혼합한 배경·테두리용 틴트, 800~950은 Heavy를 어둡게 한 텍스트용 제안값입니다. 새 화면에서 필요하면 <code>design-system-foundations.js</code>에 등록한 뒤 사용합니다.</p>
  <h3 class="sub">그레이스케일 <small>Label · Line · Background 토큰</small></h3>
  <div class="grid c5">${gray.map(g => swatchBtn(g[0], g[1], g[3])).join('')}</div>
  <h3 class="sub">상태 컬러</h3>
  <div class="grid c3">${status.map(s => swatchBtn(s[0], s[1], s[2])).join('')}</div>
  <h3 class="sub">알파 채움 · 선 <small>배경 위에 겹쳐 쓰는 반투명 토큰</small></h3>
  <div class="grid c5">${swatchBtn('Fill normal', T.color['--fill-normal'], '호버 배경, 트랙')}${swatchBtn('Fill strong', T.color['--fill-strong'], '프레스 배경')}${swatchBtn('Fill alternative', T.color['--fill-alternative'], '옅은 채움')}${swatchBtn('Line normal', T.color['--line-normal'], '구분선')}${swatchBtn('Brand soft', T.color['--brand-soft'], '브랜드 연한 배경')}</div>
  <h3 class="sub">그라데이션 · 보석 바</h3>
  <div class="grid c2"><div><div class="gradientbar"></div><p class="note" style="margin-top:10px">Brand soft → Rose 300 → Rose → Heavy. 히어로 오버레이와 큰 배너에만 제한적으로 사용합니다.</p></div><div><div class="gembar">${palette.map(p => `<i style="background:${p[2]}"></i>`).join('')}</div><p class="note" style="margin-top:10px">다섯 색을 나란히 두는 보석 바는 로고 순서를 지킵니다. 순서를 바꾸면 로고와 어긋납니다.</p></div></div>
  <h3 class="sub">대비 원칙</h3>
  <ul class="spec-list"><li><b>텍스트</b>본문은 Label normal(#171719) 이상, 보조 텍스트는 Label alternative(#68696F)까지만 사용합니다. Assistive(#989BA2)는 플레이스홀더와 비활성 전용입니다.</li><li><b>흰 글자</b>팔레트 5색 위의 흰 글자는 배지·칩처럼 짧은 굵은 글자(13px 600 이상)에만 사용합니다. 긴 본문은 올리지 않습니다.</li><li><b>의미 전달</b>색만으로 상태를 전달하지 않고 항상 상태명 텍스트를 함께 둡니다.</li></ul>
</section>

<!-- 03 -->
<section id="type">
  ${secHead('03 · Typography', '타이포그래피', '국문·영문·숫자 모두 Pretendard 한 서체로 통일합니다. 위계는 크기와 굵기, 행간·자간 토큰으로만 만듭니다.')}
  <div class="grid c2">
    <div class="font-card"><div class="role">Primary · 국문 · 영문 · 숫자</div><div class="spec">작은 나눔이 모여,<br>더 큰 변화를 만듭니다.<br><span style="font-weight:400">Queen Mandeok 1,234,567원</span></div><div class="meta2"><span>Pretendard Regular 400 · Medium 500 · SemiBold 600 · Bold 700</span><span>웹: jsDelivr dynamic subset · 관리자: PretendardVariable.woff2 로컬</span><a href="https://github.com/orioncactus/pretendard" target="_blank" rel="noopener">github.com/orioncactus/pretendard ↗</a></div></div>
    <div class="font-card"><div class="role">Fallback</div><div class="spec" style="font-family:'Noto Sans KR',sans-serif">작은 나눔이 모여,<br>더 큰 변화를 만듭니다.</div><div class="meta2"><span>Noto Sans KR → Arial → sans-serif</span><span>CDN 연결 실패 시 자동 대체. 글자폭이 조금 넓어지므로 고정폭 레이아웃을 피합니다.</span><a href="https://fonts.google.com/noto/specimen/Noto+Sans+KR" target="_blank" rel="noopener">fonts.google.com ↗</a></div></div>
  </div>
  <h3 class="sub">굵기</h3>
  <div class="weights"><div><b style="font-weight:400">가나다 Aa</b><span>Regular 400 · 본문, 캡션</span></div><div><b style="font-weight:500">가나다 Aa</b><span>Medium 500 · 라벨, 입력값</span></div><div><b style="font-weight:600">가나다 Aa</b><span>SemiBold 600 · 헤딩, 버튼, 배지</span></div><div><b style="font-weight:700">가나다 Aa</b><span>Bold 700 · 디스플레이, 타이틀</span></div></div>
  <h3 class="sub">타입 스케일 <small>실제 크기로 렌더링 · 값은 tokens.css와 동일</small></h3>
  ${typeTable}
  <div class="rulebox"><b>운용 규칙.</b> Reading 변형은 같은 크기에서 행간만 2px 넓힌 값으로 긴 본문에 사용합니다. 제목의 자간은 음수(-0.019~-0.032em), 본문·라벨·캡션은 양수 자간을 씁니다. 줄바꿈은 <code>word-break: keep-all</code>로 어절 단위를 지키고, 제목은 <code>&lt;br&gt;</code>로 의미 단위에서 끊습니다.</div>
</section>

<!-- 04 -->
<section id="notation">
  ${secHead('04 · Notation', '표기법', '브랜드명, 금액, 날짜, 상태처럼 화면마다 반복되는 표기를 하나로 맞춥니다.')}
  <div class="notate">
    <div class="box"><div class="t">브랜드명 · 국문</div><div class="big">퀸만덕<small>붙여 쓰고 띄어쓰기·한자·기호를 넣지 않습니다. “퀸 만덕”, “Queen만덕” ✕</small></div></div>
    <div class="box"><div class="t">브랜드명 · 영문</div><div class="big">QUEEN MANDEOK<small>로고와 같이 대문자 두 단어. 문장 중에는 Queen Mandeok. “Queenmandeok” ✕</small></div></div>
    <div class="box"><div class="t">서비스 설명</div><div class="big" style="font-size:22px">퀸만덕 기부 플랫폼<small>첫 언급에는 “퀸만덕 기부 플랫폼”, 이후 “퀸만덕”. 저작권 표기 © 2026 QUEEN MANDEOK. ALL RIGHTS RESERVED.</small></div></div>
    <div class="box"><div class="t">데모 고지</div><div class="big" style="font-size:18px;line-height:1.5">본 사이트는 체험용 데모입니다.<br>실제 기부·결제·송금은 이루어지지 않습니다.<small>푸터 고정 문구. 단체·사연·수치는 가상 예시이며 사진은 활동을 설명하는 스톡 이미지입니다.</small></div></div>
    <div class="box"><div class="t">금액</div><div class="big amount">3,240,000원<small>정수 원 단위, 천 단위 쉼표, 단위 “원”을 붙여 씁니다. “₩”, “KRW”, 소수점 ✕. 표에서는 숫자를 오른쪽 정렬합니다.</small></div></div>
    <div class="box"><div class="t">달성률 · 남은 기간</div><div class="big amount">64% · D-12<small>달성률은 내림(floor) 정수, 100% 초과도 그대로 표기(128%). 막대만 100%로 제한. 종료는 “모금 종료”.</small></div></div>
    <div class="box"><div class="t">날짜 · 시각</div><div class="big amount">2026. 09. 23.<small>연. 월. 일. 두 자리, 마침표 뒤 한 칸. 시각은 24시간제 “14:30”. 기준 시간대는 Asia/Seoul.</small></div></div>
    <div class="box"><div class="t">상태명</div><div class="big" style="font-size:20px"><span class="qbadge olive">승인</span> <span class="qbadge blue">검토 요청</span> <span class="qbadge orange">보완 요청</span> <span class="qbadge lavender">종료</span> <span class="qbadge rose">반려</span><small>임시저장 · 검토 요청 · 심사 중 · 보완 요청 · 승인 · 반려 · 진행 중 · 일시중지 · 종료 · 예정 · 성공 · 실패 · 취소 · 처리 중 · 접수 · 지급 완료 · 처리 완료. 영문 원값(submitted 등)을 화면에 노출하지 않습니다.</small></div></div>
  </div>
  <h3 class="sub">문구 원칙</h3>
  <div class="grid c2">
    <ul class="dont do"><li>행동 버튼은 동사형: “마음 전하기”, “정기후원 알아보기”, “결과보고 보기”</li><li>오류는 원인과 다음 행동을 함께: “1,000원 이상 입력해주세요.”</li><li>빈 상태는 이유와 경로를 함께: “아직 나눔 내역이 없어요. 마음이 닿는 이야기를 찾아 첫 나눔을 시작해보세요.”</li></ul>
    <ul class="dont"><li>“기부하세요!”처럼 느낌표로 재촉하지 않습니다</li><li>“불쌍한”, “가난한” 등 수혜자를 대상화하는 표현을 쓰지 않습니다</li><li>“100% 전달”, “세액공제 보장”처럼 검증되지 않은 약속을 쓰지 않습니다</li></ul>
  </div>
</section>

<!-- 05 -->
<section id="image">
  ${secHead('05 · Image direction', '이미지 디렉션', '사진은 “도움을 구하는 장면”이 아니라 “함께 이어가는 일상”을 보여줍니다. 자연광, 손과 식탁, 숲과 동네처럼 가까운 풍경을 고릅니다.')}
  <div class="grid c4">
    <div class="card"><h4>Warm · 따뜻함</h4><p>자연광, 살구·로즈 톤의 난색 계열. 차가운 형광등 톤은 보정으로 걷어냅니다.</p></div>
    <div class="card"><h4>Everyday · 일상</h4><p>식사, 책, 산책, 이웃과의 대화. 특별한 이벤트보다 반복되는 하루를 담습니다.</p></div>
    <div class="card"><h4>Hands · 손과 관계</h4><p>무언가를 건네고 받는 손, 나란히 앉은 어깨. 얼굴 클로즈업보다 관계가 보이는 구도.</p></div>
    <div class="card"><h4>Nature · 초록</h4><p>숲, 바다, 텃밭. 올리브·블루 팔레트와 어울리는 풍경으로 환경·지역 분야를 표현합니다.</p></div>
  </div>
  <h3 class="sub">현재 사용 중인 참고 이미지 <small>Unsplash 원본 · 로컬 저장 · 출처는 docs/asset-sources.md</small></h3>
  <div class="imgrid">
    ${[['meal', '식사 나눔', '홈 히어로, 어르신·지역사회 모금'], ['child', '아동·교육', '교육 모금, 정기기부'], ['forest', '숲·환경', '환경 모금, 정기 배너, 소개'], ['community', '가족·지역사회', '위기가정, 기업 캠페인'], ['dog', '동물', '유기동물 모금'], ['ocean', '재난·긴급지원', '재난 모금 참고 이미지']].map(([f, t, u]) => `<figure><img src="${photo(f)}" alt="${t} 참고 이미지" loading="lazy" width="600" height="385"><figcaption><b>${t}</b>${u}</figcaption></figure>`).join('')}
  </div>
  <h3 class="sub">비율</h3>
  <div class="ratio-row"><div style="width:156px;height:100px">카드 1.56 : 1</div><div style="width:160px;height:120px">스토리 4 : 3</div><div style="width:110px;height:120px">캠페인 11 : 12</div><div style="width:180px;height:75px">히어로 12 : 5 이상</div><div style="width:100px;height:100px">단체 1 : 1</div></div>
  <div class="grid c2" style="margin-top:28px">
    <ul class="dont do"><li>인물이 나오면 반드시 “가상 사연 · 스톡 이미지” 고지를 붙입니다</li><li>이미지 로딩 실패 시 <code>fallback.svg</code>를 표시합니다</li><li>썸네일은 <code>object-fit: cover</code>로 비율을 유지합니다</li></ul>
    <ul class="dont"><li>실제 수혜자 사진, 눈물·상처 등 연민을 자극하는 장면을 쓰지 않습니다</li><li>사진 위에 로고를 여백 없이 올리거나 색을 강하게 입히지 않습니다</li><li>AI 생성 인물 사진을 실제 활동처럼 제시하지 않습니다</li></ul>
  </div>
</section>

<!-- 06 -->
<section id="motif">
  ${secHead('06 · Graphic motif', '그래픽 모티프', '왕관 실루엣과 다섯 색 보석 바가 유일한 그래픽 모티프입니다. 로고에서 떼어낸 형태를 배경, 구분선, 진행률 같은 보조 요소에만 제한적으로 씁니다.')}
  <div class="grid c2">
    <div class="panel"><div class="demo motif-stage tint"><svg class="crown" viewBox="0 0 168 51" width="320" aria-hidden="true"><path fill="currentColor" d="M141.4,1.7l-4.4.2-4.4.2c0,.6.2,5.2,1.4,11.3H34.4c1.1-6.2,1.3-10.8,1.4-11.3l-8.9-.3C26.8,2.1,25,42.6,0,42.6v8.9c19.2,0,28.1-15.6,32.2-29.2h103.7c4.1,13.7,13,29.2,32.2,29.2v-8.9c-25,0-26.8-40.5-26.8-40.9h0Z"/></svg></div><div class="caption">왕관 라인 — 히어로 코너나 빈 상태 배경에 16% 이하의 투명도로 큰 크기로 배치합니다. 워드마크와 함께 쓰지 않습니다.</div></div>
    <div class="panel"><div class="demo motif-stage"><div class="crown-bars">${palette.map(p => `<i style="background:${p[2]}"></i>`).join('')}</div></div><div class="caption">보석 바 — 다섯 색을 로고 순서대로. 세로 막대 비율은 약 1 : 2.4(로고 기준 8.9 × 21).</div></div>
    <div class="panel"><div class="demo"><div class="stripe"></div></div><div class="caption">패턴 — 보석 바 반복. 인쇄물 뒷면, 소셜 커버, 로딩 배경에 사용합니다. 텍스트 위에는 올리지 않습니다.</div></div>
    <div class="panel"><div class="demo col" style="gap:28px"><div class="divider-gem">${palette.map(p => `<i style="background:${p[2]}"></i>`).join('')}</div><div class="progress-gem"><i style="width:64%;background:var(--primary)"></i></div><div class="progress-gem">${palette.map((p, i) => `<i style="width:${[20, 24, 12, 18, 10][i]}%;background:${p[2]}"></i>`).join('')}</div></div><div class="caption">응용 — 섹션 구분선, 진행률(기본은 Rose 단색), 분야별 비중 막대(5색 분할).</div></div>
  </div>
  <div class="rulebox"><b>사용 한도.</b> 한 화면에 모티프는 한 번만 등장시킵니다. 왕관을 아이콘 크기(32px 이하)로 줄여 버튼·탭에 넣지 않습니다. 보석 바의 색을 상태 의미와 다르게(예: 오류를 올리브로) 쓰지 않습니다.</div>
</section>

<!-- 07 -->
<section id="icon">
  ${secHead('07 · Iconography', '아이콘', '시스템 아이콘은 Lucide를 사용합니다. 24px 그리드, 1.7px 선 굵기, 둥근 끝과 모서리. 채움 아이콘은 쓰지 않고 색은 텍스트 색을 따릅니다.')}
  <div class="icon-grid">
    ${[['heart', '관심'], ['hand-heart', '후원'], ['search', '검색'], ['calendar', '정기'], ['user', '회원'], ['bell', '알림'], ['share', '공유'], ['chevron-right', '이동'], ['chevron-down', '펼침'], ['check', '완료'], ['x', '닫기'], ['info', '안내'], ['alert', '주의'], ['inbox', '빈 상태'], ['leaf', '환경'], ['users', '지역사회'], ['building', '단체'], ['arrow-right', '더보기'], ['send', '정기후원'], ['plus', '전체보기']].map(([n, t]) => `<figure>${ic(n)}<figcaption>${t}</figcaption></figure>`).join('')}
  </div>
  <h3 class="sub">크기</h3>
  <div class="panel"><div class="demo left icon-sizes">${[16, 20, 24, 32].map(s => `<figure>${ic('heart', s)}<figcaption>${s}px</figcaption></figure>`).join('')}<figure><span class="iconbtn outlined">${ic('search', 21)}</span><figcaption>아이콘 버튼 40px</figcaption></figure></div><div class="caption">16 = 인라인 텍스트 · 20 = 버튼·칩 · 24 = 기본 · 32 = 빈 상태·안내. 라이브러리 <code>lucide 1.47.0</code>, <code>stroke-width 1.7</code>.</div></div>
  <div class="grid c2" style="margin-top:28px">
    <ul class="dont do"><li>의미가 같은 행동에는 항상 같은 아이콘을 씁니다(관심 = heart, 공유 = share-2)</li><li>아이콘만 있는 버튼에는 <code>aria-label</code>을 붙입니다</li><li>관리자 화면은 Remix Icon(line 계열)을 쓰되 같은 굵기·크기 규칙을 따릅니다</li></ul>
    <ul class="dont"><li>브랜드 팔레트 5색으로 아이콘을 칠하지 않습니다(칩·배지 안에서는 흰색)</li><li>이모지를 아이콘 대용으로 쓰지 않습니다</li><li>채움(filled) 스타일과 선 스타일을 한 화면에 섞지 않습니다</li></ul>
  </div>
</section>

<!-- 08 -->
<section id="tokens">
  ${secHead('08 · Web tokens', '웹 토큰', '전역 디자인 값은 design-system-foundations.js 한 곳에서만 정의하고, npm run build:tokens로 tokens.css를 생성합니다. 컴포넌트는 var()만 참조합니다.')}
  <h3 class="sub">시맨틱 컬러</h3>
  <div class="tablewrap"><table class="tbl"><thead><tr><th>토큰</th><th>값</th><th>용도</th></tr></thead><tbody>${tokenRows(T.color, colorNotes)}</tbody></table></div>
  <h3 class="sub">Spacing <small>4px 기반 12단계</small></h3>
  <div class="space-row">${foundations.spacing.map(n => `<figure><i style="width:${n}px;height:${n}px"></i><figcaption>${n}</figcaption></figure>`).join('')}</div>
  <h3 class="sub">Radius</h3>
  <div class="radius-row">${foundations.radius.map(n => `<figure><i style="border-radius:${n}px"></i><figcaption>--radius-${n}</figcaption></figure>`).join('')}<figure><i style="border-radius:50px;width:120px"></i><figcaption>--card-radius 50 (히어로 카드)</figcaption></figure></div>
  <h3 class="sub">Elevation · Motion</h3>
  <div class="shadow-row">${Object.entries(T.elevation).map(([k, v]) => `<figure><i style="box-shadow:${v}"></i><figcaption>${k}</figcaption></figure>`).join('')}</div>
  <div class="tablewrap" style="margin-top:20px"><table class="tbl"><thead><tr><th>토큰</th><th>값</th><th>용도</th></tr></thead><tbody>${tokenRows(T.motion, {'--motion-feedback': '호버·프레스·토글', '--motion-image': '이미지 확대', '--motion-card-image': '카드 이미지 느린 줌', '--motion-skeleton': '스켈레톤 반짝임'})}${tokenRows(T.layer, {'--z-header': '헤더', '--z-mobile-cta': '모바일 하단 CTA', '--z-demo-launch': '데모 설정 버튼', '--z-toast': '토스트'})}</tbody></table></div>
  <h3 class="sub">Layout · Component</h3>
  <div class="tablewrap"><table class="tbl"><thead><tr><th>토큰</th><th>값</th><th>용도</th></tr></thead><tbody>${tokenRows(T.layout, {'--layout-content-width': '콘텐츠 최대 폭', '--layout-gutter': '좌우 여백(반응형)'})}${tokenRows(T.component, {'--carousel-gap': '캐러셀 간격(반응형)', '--card-radius': '홈 히어로·가이드 카드', '--card-radius-compact': '모바일 카드', '--button-height-small': '버튼 S', '--button-height-medium': '버튼 M', '--button-height-large': '버튼 L'})}</tbody></table></div>
  <h3 class="sub">복사용 CSS 변수 <small>public/assets/css/tokens.css 전문</small></h3>
  <div class="copybar"><span class="note" style="margin:0">아래 블록은 생성물입니다. 값 변경은 <code>design-system-foundations.js</code>에서 하고 다시 빌드합니다.</span><button class="btn small outlined" id="copycss" type="button">${ic('check', 16)} CSS 변수 복사</button></div>
  <pre class="vars" id="cssvars">${esc(cssVars)}</pre>
</section>

<!-- 09 -->
<section id="components">
  ${secHead('09 · Components', '컴포넌트', '실제 사이트(app.css)의 규격을 그대로 옮긴 동작 데모입니다. 24개 컴포넌트의 상세 사양은 사이트 안 컴포넌트 카탈로그(/design-system/)에서 확인합니다.')}
  <h3 class="sub">Button <small>Solid · Outlined · Assistive · Destructive / 32 · 48 · 56</small></h3>
  <div class="panel"><div class="demo left"><button class="btn primary" type="button">마음 전하기</button><button class="btn outlined" type="button">미리보기</button><button class="btn secondary" type="button">취소</button><button class="btn danger" type="button">삭제</button><button class="btn primary" type="button" disabled>비활성</button></div><div class="demo left gray"><button class="btn primary small" type="button">Small 32</button><button class="btn primary" type="button">Medium 48</button><button class="btn primary large" type="button">Large 56</button><button class="btn primary" type="button">${ic('hand-heart', 20)} 아이콘 포함</button></div><div class="caption">한 액션 영역에 Primary는 하나만. 기부하기 = Solid, 미리보기 = Outlined, 취소 = Assistive. 라운드 12px, 글자 15px 600.</div></div>
  <h3 class="sub">Icon button</h3>
  <div class="panel"><div class="demo left"><button class="iconbtn" type="button" aria-label="검색">${ic('search', 21)}</button><button class="iconbtn filled" type="button" aria-label="관심">${ic('heart', 21)}</button><button class="iconbtn outlined" type="button" aria-label="공유">${ic('share', 21)}</button><button class="iconbtn" type="button" aria-label="닫기">${ic('x', 21)}</button><button class="iconbtn" type="button" aria-label="비활성 검색" disabled>${ic('search', 21)}</button></div><div class="caption">40 × 40 원형 터치 영역, 아이콘 21px. 접근 가능한 이름 필수.</div></div>
  <h3 class="sub">Text field · Select · Text area</h3>
  <div class="panel"><div class="demo left" style="align-items:flex-start"><label class="field"><span>이야기 제목</span><input placeholder="제목을 입력해주세요"></label><label class="field"><span>입력 완료</span><input value="따뜻한 한 끼"></label><label class="field"><span>기부 금액</span><input value="500" aria-invalid="true" aria-describedby="err1"><small class="err" id="err1">1,000원 이상 입력해주세요.</small></label><label class="field"><span>비활성</span><input value="검토 중" disabled></label><label class="field"><span>읽기 전용</span><input value="QM-2026-001" readonly></label><label class="field"><span>관심 분야</span><select><option>전체</option><option>아동·청소년</option><option>어르신</option><option>환경</option></select></label><label class="field" style="flex-basis:100%"><span>응원 메시지</span><textarea maxlength="200" placeholder="따뜻한 응원의 마음을 남겨주세요" data-counter="cnt1"></textarea><small id="cnt1">0 / 200</small></label></div><div class="caption">최소 높이 48, 라운드 12, 글자 16/24. 레이블은 항상 표시하고 오류는 입력창에 연결(aria-describedby)합니다.</div></div>
  <h3 class="sub">Selection <small>Checkbox · Radio · Switch</small></h3>
  <div class="panel"><div class="demo left" style="align-items:flex-start;gap:40px"><div><label class="check"><input type="checkbox"> 선택하지 않음</label><label class="check"><input type="checkbox" checked> 선택됨</label><label class="check"><input type="checkbox" disabled> 비활성</label></div><fieldset style="border:0"><legend style="font-size:13px;font-weight:600;margin-bottom:6px">기부 방식</legend><label class="radio"><input type="radio" name="r1" checked> 일시 기부</label><label class="radio"><input type="radio" name="r1"> 정기 기부</label><label class="radio"><input type="radio" name="r1" disabled> 준비 중</label></fieldset><div style="flex:1;min-width:240px"><div class="switch-row"><span>나눔 소식 알림</span><input class="tgl" type="checkbox" role="switch" checked aria-label="나눔 소식 알림"></div><div class="switch-row"><span>작은 스위치 (표 안)</span><input class="tgl small" type="checkbox" role="switch" aria-label="작은 스위치"></div><div class="switch-row" style="border:0"><span>비활성 설정</span><input class="tgl" type="checkbox" role="switch" disabled aria-label="비활성 설정"></div></div></div><div class="caption">accent-color를 Primary로 통일. 필수 동의를 미리 선택해 두지 않습니다. 스위치는 즉시 적용 설정에만.</div></div>
  <h3 class="sub">Chip · Badge <small>다섯 색은 상태 의미를 따릅니다</small></h3>
  <div class="panel"><div class="demo left" data-chips>${palette.map((p, i) => `<button class="qchip ${p[0]}" type="button" aria-pressed="${i === 1}">${ic(['clock', 'heart', 'check', 'info', 'x'][i], 18)} ${['예정', '관심', '승인', '심사 중', '취소'][i]}</button>`).join('')}</div><div class="demo left gray"><span class="qbadge olive">승인</span><span class="qbadge blue">심사 중</span><span class="qbadge lavender">일시중지</span><span class="qbadge orange">보완 요청</span><span class="qbadge rose">실패</span><span class="qbadge olive outlined">승인</span><span class="qbadge blue outlined">심사 중</span><span class="qbadge rose outlined">실패</span></div><div class="caption">Chip = 선택·필터(aria-pressed 토글, 36px). Badge = 읽기 전용 상태(26px, 클릭 없음). 배지 사이 8px, 작은 배지 6px.</div></div>
  <h3 class="sub">Tabs · Pagination</h3>
  <div class="panel"><div class="demo col left"><div class="qtabs" role="tablist" aria-label="나눔 정보 예시"><button role="tab" aria-selected="true" data-tab="0">모금 이야기</button><button role="tab" aria-selected="false" data-tab="1">참여 내역</button><button role="tab" aria-selected="false" data-tab="2">결과보고</button></div><div class="qtab-panel" data-tab-panel>작은 나눔으로 만드는 따뜻한 이야기입니다.</div><div class="pager" data-pager><button type="button" disabled>이전</button><button type="button" aria-current="page">1</button><button type="button">2</button><button type="button">3</button><button type="button">다음</button></div></div><div class="caption">탭은 최상위 구분(높이 58, 간격 24, 선택 밑줄 2px Rose). 세부 필터는 Chip으로 분리. 현재 페이지는 aria-current와 색으로 함께 표시.</div></div>
  <h3 class="sub">Section message · Toast · Empty</h3>
  <div class="panel"><div class="demo col left"><div class="qmsg info">${ic('info', 20)}<div><b>안내</b><p>기부 내역은 나의 나눔에서 확인할 수 있습니다.</p></div></div><div class="qmsg positive">${ic('check', 20)}<div><b>완료</b><p>요청이 정상적으로 접수되었습니다.</p></div></div><div class="qmsg caution">${ic('alert', 20)}<div><b>확인 필요</b><p>제출 전에 사용 계획을 확인해주세요.</p></div></div><div class="qmsg negative">${ic('x', 20)}<div><b>오류</b><p>금액을 확인하고 다시 입력해주세요.</p></div></div></div><div class="demo left gray"><div class="qtoast">${ic('check', 18)} 변경사항이 저장되었습니다.</div><button class="btn outlined small" type="button" data-toast="공유 링크를 복사했습니다.">토스트 실행</button></div><div class="demo"><div class="empty">${ic('inbox', 32)}<h4>아직 나눔 내역이 없어요</h4><p>마음이 닿는 이야기를 찾아 첫 나눔을 시작해보세요.</p><div style="margin-top:14px"><button class="btn secondary small" type="button">모금함 둘러보기</button></div></div></div><div class="caption">메시지는 아이콘 + 제목 + 해결 방법. 토스트 4초 노출, 하단 80px. 빈 상태는 이유와 다음 경로를 함께.</div></div>
  <h3 class="sub">Accordion</h3>
  <div class="panel"><div class="demo"><div class="qaccordion" data-accordion><button type="button" aria-expanded="false" aria-controls="acc1"><span>기부금은 어떻게 전달되나요?<small>전달 과정 확인</small></span>${ic('chevron-down', 20)}</button><div class="body" id="acc1" hidden>승인된 사용 계획에 따라 전달되며 결과보고가 공개됩니다.</div><button type="button" aria-expanded="false" aria-controls="acc2"><span>나의 기부 내역은 어디에서 보나요?<small>기부 내역 안내</small></span>${ic('chevron-down', 20)}</button><div class="body" id="acc2" hidden>나의 나눔에서 성공한 기부 내역과 영수증을 확인할 수 있습니다.</div></div></div><div class="caption">트리거 최소 64px, 20px 인셋. Enter/Space로 열고 ArrowUp/Down으로 다음 제목 이동. 중요한 결제 조건은 접힌 곳에만 두지 않습니다.</div></div>
  <h3 class="sub">Fund card <small>이미지 1.56:1 · D-day 배지 · 관심 · 진행률</small></h3>
  <div class="panel"><div class="demo"><article class="fund"><div class="img"><img src="${photo('meal')}" alt="" loading="lazy"><span class="dday">D-12</span><button class="bm" type="button" aria-label="관심 등록" aria-pressed="false" data-bookmark>${ic('heart', 18)}</button></div><div class="copy"><span class="cat">어르신</span><h4>어르신의 하루에<br>따뜻한 한 끼를 전해주세요</h4><p class="org">온기나눔</p><span class="qprogress"><i style="width:64%"></i></span><div class="nums"><strong>64%</strong><b>3,240,000원 <span style="font-weight:400;font-size:12px">모금</span></b></div></div></article><article class="fund"><div class="img"><img src="${photo('child')}" alt="" loading="lazy"><span class="dday ended">모금 종료</span><button class="bm" type="button" aria-label="관심 등록" aria-pressed="true" data-bookmark>${ic('heart', 18)}</button></div><div class="copy"><span class="cat">아동·청소년</span><h4>겨울방학에도 멈추지 않는<br>아이들의 든든한 한 끼</h4><p class="org">온기나눔</p><span class="qprogress"><i style="width:100%"></i></span><div class="nums"><strong>100%</strong><b>3,000,000원 <span style="font-weight:400;font-size:12px">모금</span></b></div></div></article></div><div class="caption">제목이 상세로 가는 링크, 관심은 별도 버튼(aria-pressed). 카드 전체 링크 안에 버튼을 중첩하지 않습니다. 4열 272px → 2열 → 모바일 2열 148px.</div></div>
  <h3 class="sub">Campaign banner</h3>
  <div class="panel"><div class="demo"><div class="banner"><div><span class="qbadge rose" style="margin-bottom:10px">기업 매칭 캠페인</span><h4>함께하면 두 배가 되는 마음</h4><p>여러분의 나눔에 초록내일 컴퍼니가 같은 마음을 보탭니다. 한도 1,000,000원.</p></div><div class="acts"><button class="btn secondary" type="button">자세히</button><button class="btn primary" type="button">함께 참여하기 ${ic('arrow-right', 18)}</button></div></div></div><div class="caption">Brand soft 배경 + 라운드 16. 제목 20/700, 설명 14. 행동 버튼은 오른쪽, 주 행동은 하나.</div></div>
</section>

<!-- 10 -->
<section id="layout">
  ${secHead('10 · Layout & grid', '레이아웃 · 그리드', '콘텐츠 최대 폭 1560px, 브레이크포인트별 좌우 여백과 캐러셀 간격은 토큰으로 자동 전환됩니다.')}
  <h3 class="sub">브레이크포인트 · 여백</h3>
  <div class="bp-row">${foundations.layoutBreakpoints.map(b => `<div><b>≤ ${b.max}px</b>좌우 여백 ${b.gutter}px</div>`).join('')}<div><b>&gt; 1440px</b>좌우 여백 60px · 최대 1560px</div></div>
  <h3 class="sub">카드 그리드 <small>QA 실측 기준</small></h3>
  <div class="tablewrap"><table class="tbl"><thead><tr><th>뷰포트</th><th>콘텐츠 폭</th><th>카드</th><th>캐러셀 간격</th></tr></thead><tbody><tr><td>1440</td><td>1160px</td><td>4열 · 272px</td><td>40px</td></tr><tr><td>1024</td><td>945px</td><td>4열 · 223.5px</td><td>30px</td></tr><tr><td>768</td><td>713px</td><td>2열 · 345.5px</td><td>30px</td></tr><tr><td>390</td><td>339px</td><td>2열 · 163.5px</td><td>20px</td></tr><tr><td>360</td><td>309px</td><td>2열 · 148.5px</td><td>20px</td></tr></tbody></table></div>
  <div class="colgrid" style="margin-top:20px"><i></i><i></i><i></i><i></i></div>
  <div class="rulebox"><b>원칙.</b> 문서 전체에 가로 스크롤을 만들지 않습니다(표는 자체 스크롤). 모바일 상세 화면의 CTA는 하단 고정 + safe-area. 헤더는 sticky, 데모 설정 버튼은 우하단 고정.</div>
</section>

</div>
</main>
</div>

<footer>
  <div class="foot-inner">
    <div>${logoV}</div>
    <div class="info"><b>퀸만덕 디자인 시스템 v${VERSION}</b> · ${DATE}<br>토큰 원본 <code>public/assets/js/design-system-foundations.js</code> · 로고 원본 <code>public/assets/brand/</code><br>이 문서는 <code>tools/build-guide.mjs</code>가 생성합니다. 값을 바꾸려면 원본을 수정하고 다시 빌드하세요.<br>© 2026 QUEEN MANDEOK. ALL RIGHTS RESERVED. 본 사이트는 체험용 데모입니다.</div>
  </div>
</footer>
<div id="copytoast" role="status" aria-live="polite"></div>

<script>
(function(){
  "use strict";
  var toast=document.getElementById("copytoast"),timer=null;
  function show(msg){toast.textContent=msg;toast.classList.add("show");clearTimeout(timer);timer=setTimeout(function(){toast.classList.remove("show")},1400);}
  function copy(text,label){
    function done(){show((label||text)+" 복사되었습니다");}
    function fallback(){try{var ta=document.createElement("textarea");ta.value=text;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();document.execCommand("copy");document.body.removeChild(ta);done();}catch(e){show("복사에 실패했습니다. 직접 선택해주세요");}}
    try{if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(done,fallback);else fallback();}catch(e){fallback();}
  }
  document.addEventListener("click",function(ev){
    var t=ev.target.closest?ev.target.closest("[data-copy]"):null;if(t)copy(t.getAttribute("data-copy"));
    var chip=ev.target.closest("[data-chips] .qchip");if(chip)chip.setAttribute("aria-pressed",chip.getAttribute("aria-pressed")!=="true");
    var tab=ev.target.closest(".qtabs [role=tab]");if(tab){var list=tab.parentNode;list.querySelectorAll("[role=tab]").forEach(function(b){b.setAttribute("aria-selected","false")});tab.setAttribute("aria-selected","true");var panel=list.parentNode.querySelector("[data-tab-panel]");if(panel)panel.textContent=["작은 나눔으로 만드는 따뜻한 이야기입니다.","익명의 기부자 외 12명이 함께했습니다.","지급 완료 후 결과보고가 공개됩니다."][Number(tab.getAttribute("data-tab"))];}
    var pg=ev.target.closest("[data-pager] button");if(pg&&!pg.disabled&&/^\\d+$/.test(pg.textContent)){pg.parentNode.querySelectorAll("button").forEach(function(b){b.removeAttribute("aria-current")});pg.setAttribute("aria-current","page");}
    var tb=ev.target.closest("[data-toast]");if(tb)show(tb.getAttribute("data-toast"));
    var bm=ev.target.closest("[data-bookmark]");if(bm)bm.setAttribute("aria-pressed",bm.getAttribute("aria-pressed")!=="true");
    var acc=ev.target.closest("[data-accordion] button");if(acc){var open=acc.getAttribute("aria-expanded")==="true";acc.setAttribute("aria-expanded",String(!open));var body=document.getElementById(acc.getAttribute("aria-controls"));if(body)body.hidden=open;}
  });
  document.addEventListener("keydown",function(ev){
    var acc=ev.target.closest&&ev.target.closest("[data-accordion] button");if(!acc)return;
    var all=Array.prototype.slice.call(acc.parentNode.querySelectorAll("button")),i=all.indexOf(acc),n=null;
    if(ev.key==="ArrowDown")n=(i+1)%all.length;if(ev.key==="ArrowUp")n=(i-1+all.length)%all.length;if(ev.key==="Home")n=0;if(ev.key==="End")n=all.length-1;
    if(n!==null){ev.preventDefault();all[n].focus();}
  });
  document.querySelectorAll("[data-counter]").forEach(function(ta){var out=document.getElementById(ta.getAttribute("data-counter"));ta.addEventListener("input",function(){out.textContent=ta.value.length+" / "+ta.maxLength;});});
  var cssBtn=document.getElementById("copycss");if(cssBtn)cssBtn.addEventListener("click",function(){copy(document.getElementById("cssvars").textContent,"CSS 변수");});
  var links=Array.prototype.slice.call(document.querySelectorAll(".navgroup a")),map={};
  links.forEach(function(a){map[(a.getAttribute("href")||"").slice(1)]=a;});
  var sections=Array.prototype.slice.call(document.querySelectorAll("section[id]"));
  function spy(){var pos=window.scrollY+160,cur=null;sections.forEach(function(s){if(s.offsetTop<=pos)cur=s.id;});links.forEach(function(a){a.classList.remove("on")});if(cur&&map[cur])map[cur].classList.add("on");}
  window.addEventListener("scroll",spy,{passive:true});spy();
})();
</script>
${ARTIFACT ? '' : '</body>\n</html>'}
`;

mkdirSync(dirname(out), {recursive: true});
writeFileSync(out, html);
console.log(`${ARTIFACT ? out : 'design-system/index.html'} 생성 (${(html.length / 1024).toFixed(1)} KB, 타입 스케일 ${typeRows.length}개, 컬러 토큰 ${Object.keys(T.color).length}개)`);
