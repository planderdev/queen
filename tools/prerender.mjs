// Pre-renders every public/**/index.php into dist/<base>/**/index.html and copies static assets.
// PHP only assembles the page shell here (no request-dependent logic), so the site can be
// served as static files. Used as the Vercel build command; also works locally (`npm run build`).
//
// The demo is published under a base path (default /demo) so the root of the domain stays free
// for the production service. Every absolute URL the PHP shell, the JS modules and the CSS emit is
// rewritten to that base at build time; the source keeps plain root paths so `php -S` still works.
import {execFileSync, spawnSync} from 'node:child_process';
import {cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync, chmodSync} from 'node:fs';
import {dirname, extname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'public');
// Output root: the Next.js app's public folder (served as static files at /demo and /design-system).
const dist = resolve(root, process.env.DEMO_OUT ?? 'web/public');
const BASE = (process.env.DEMO_BASE ?? '/demo').replace(/\/$/, ''); // '' = serve at the domain root
const STATIC_PHP = 'https://dl.static-php.dev/static-php-cli/common/php-8.3.32-cli-linux-x86_64.tar.gz';

function works(bin) {
  try { return spawnSync(bin, ['-v'], {stdio: 'pipe'}).status === 0; } catch { return false; }
}

// Resolution order: PHP_BIN env, php on PATH, a project-local copy in tools/php, then a
// one-time download of a static Linux build (the Vercel build image ships without PHP).
// The download is retried; if it still fails (e.g. dl.static-php.dev returns 500) this returns null and
// the build falls back to the committed snapshot in tools/demo-snapshot, so an outage there never blocks
// a production deploy of the real service.
function findPhp() {
  const local = join(root, 'tools', 'php', process.platform === 'win32' ? 'php.exe' : 'php');
  for (const bin of [process.env.PHP_BIN, 'php', local].filter(Boolean)) if (works(bin)) return bin;
  if (process.platform !== 'linux' || process.arch !== 'x64') {
    console.warn('php를 찾을 수 없습니다 → 저장된 데모 스냅샷을 사용합니다. (PHP 8.1+ 설치 또는 PHP_BIN 지정 시 다시 렌더)');
    return null;
  }
  mkdirSync(dirname(local), {recursive: true});
  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log(`php 없음 → static-php 다운로드 (${attempt}/3): ${STATIC_PHP}`);
    try {
      execFileSync('bash', ['-c', `curl -fsSL --retry 2 --retry-delay 3 --retry-all-errors "${STATIC_PHP}" | tar -xz -C "${dirname(local)}"`], {stdio: 'inherit'});
      chmodSync(local, 0o755);
      if (works(local)) return local;
    } catch (error) {
      console.warn(`다운로드 실패: ${error.message.split('\n')[0]}`);
    }
    if (attempt < 3) spawnSync('sleep', [String(attempt * 5)]);
  }
  console.warn('static-php 다운로드 불가 → 저장된 데모 스냅샷(tools/demo-snapshot)을 사용합니다.');
  return null;
}
const snapshotDir = join(root, 'tools', 'demo-snapshot');

function entries(dir) {
  return readdirSync(dir).flatMap(name => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return name === 'assets' ? [] : entries(full);
    return name === 'index.php' ? [full] : [];
  });
}

// Top-level routes of the demo. Only absolute URLs that start with one of these (or the bare root)
// are rewritten, so unrelated slashes in code stay untouched.
const segments = ['assets', ...readdirSync(publicDir).filter(n => statSync(join(publicDir, n)).isDirectory() && n !== 'assets')];
const seg = segments.join('|');
const rewriters = {
  html: s => s.replace(new RegExp(`((?:href|src|action|content)=")/(?=(?:${seg})(?:[/?"])|")`, 'g'), `$1${BASE}/`),
  js: s => s
    .replace(new RegExp(`(['"\`])/(?=(?:${seg})/)`, 'g'), `$1${BASE}/`)
    .replace(/(link\([^)]*?,)'\/'/g, `$1'${BASE}/'`)                 // link('홈으로', '/', …)
    .replace(/href="\/"(?=\s+aria-label)/g, `href="${BASE}/"`)     // breadcrumb home link
    .replace(/:'\/my\/'/g, `:'${BASE}/my/'`),
  css: s => s.replace(new RegExp(`url\\((['"]?)/(?=(?:${seg})/)`, 'g'), `url($1${BASE}/`)
};
const kind = file => ({'.html': 'html', '.php': 'html', '.js': 'js', '.mjs': 'js', '.css': 'css'})[extname(file)];
const rewrite = (text, type) => BASE && rewriters[type] ? rewriters[type](text) : text;

function copyTree(from, to) {
  for (const name of readdirSync(from)) {
    const src = join(from, name), out = join(to, name);
    if (statSync(src).isDirectory()) { mkdirSync(out, {recursive: true}); copyTree(src, out); continue; }
    const type = kind(name);
    if (type) writeFileSync(out, rewrite(readFileSync(src, 'utf8'), type));
    else cpSync(src, out);
  }
}

const php = findPhp();
console.log(php ? `php: ${php} (${execFileSync(php, ['-v']).toString().split('\n')[0]})` : 'php: 없음 (스냅샷 사용)');
console.log(`base path: ${BASE || '/'}`);
const demoDir = join(dist, BASE.replace(/^\//, ''));
rmSync(demoDir, {recursive: true, force: true});
rmSync(join(dist, 'design-system'), {recursive: true, force: true});
mkdirSync(demoDir, {recursive: true});

const pages = entries(publicDir).sort();
for (const file of pages) {
  const rel = relative(publicDir, dirname(file));
  // PHP가 있으면 렌더하고 스냅샷을 갱신한다(커밋해 둔다). 없으면 마지막 스냅샷을 쓴다.
  const snap = join(snapshotDir, rel, 'index.html');
  let html;
  if (php) {
    html = execFileSync(php, ['-d', 'display_errors=stderr', '-d', 'error_reporting=E_ALL', file], {cwd: root, maxBuffer: 16 * 1024 * 1024}).toString();
    if (!html.includes('</html>')) throw new Error(`${file}: 렌더 결과가 완전한 HTML이 아닙니다.`);
    mkdirSync(dirname(snap), {recursive: true});
    writeFileSync(snap, html);
  } else {
    if (!existsSync(snap)) throw new Error(`${file}: php가 없고 스냅샷(${relative(root, snap)})도 없습니다. 로컬에서 한 번 빌드해 스냅샷을 커밋하세요.`);
    html = readFileSync(snap, 'utf8');
  }
  html = rewrite(html, 'html');
  const out = join(demoDir, rel, 'index.html');
  mkdirSync(dirname(out), {recursive: true});
  writeFileSync(out, html);
  console.log(`  ${BASE}/${rel ? rel + '/' : ''} ← ${relative(root, file)} (${html.length.toLocaleString()} bytes)`);
}

mkdirSync(join(demoDir, 'assets'), {recursive: true});
copyTree(join(publicDir, 'assets'), join(demoDir, 'assets'));
for (const name of readdirSync(publicDir)) {
  const full = join(publicDir, name);
  if (statSync(full).isFile() && !name.endsWith('.php') && !existsSync(join(demoDir, name))) cpSync(full, join(demoDir, name));
}

// Standalone brand / design-system guide (generated by tools/build-guide.mjs) stays at the domain
// root: it documents the brand, not the demo.
const guide = join(publicDir, 'design-system', 'index.html');
if (existsSync(guide)) { mkdirSync(join(dist, 'design-system'), {recursive: true}); cpSync(guide, join(dist, 'design-system', 'index.html')); console.log('  /design-system/ ← public/design-system/index.html'); }
console.log(`완료: 페이지 ${pages.length}개 → ${relative(root, dist)}${BASE}/`);
