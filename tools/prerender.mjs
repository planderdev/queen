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
const dist = join(root, 'dist');
const BASE = (process.env.DEMO_BASE ?? '/demo').replace(/\/$/, ''); // '' = serve at the domain root
const STATIC_PHP = 'https://dl.static-php.dev/static-php-cli/common/php-8.3.32-cli-linux-x86_64.tar.gz';

function works(bin) {
  try { return spawnSync(bin, ['-v'], {stdio: 'pipe'}).status === 0; } catch { return false; }
}

// Resolution order: PHP_BIN env, php on PATH, a project-local copy in tools/php, then a
// one-time download of a static Linux build (the Vercel build image ships without PHP).
function findPhp() {
  const local = join(root, 'tools', 'php', process.platform === 'win32' ? 'php.exe' : 'php');
  for (const bin of [process.env.PHP_BIN, 'php', local].filter(Boolean)) if (works(bin)) return bin;
  if (process.platform !== 'linux' || process.arch !== 'x64') {
    throw new Error('php를 찾을 수 없습니다. PHP 8.1+를 설치하거나 PHP_BIN 환경 변수로 경로를 지정하세요.');
  }
  console.log(`php 없음 → static-php 다운로드: ${STATIC_PHP}`);
  mkdirSync(dirname(local), {recursive: true});
  execFileSync('bash', ['-c', `curl -fsSL "${STATIC_PHP}" | tar -xz -C "${dirname(local)}"`], {stdio: 'inherit'});
  chmodSync(local, 0o755);
  if (!works(local)) throw new Error('다운로드한 php 실행 파일이 동작하지 않습니다.');
  return local;
}

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
console.log(`php: ${php} (${execFileSync(php, ['-v']).toString().split('\n')[0]})`);
console.log(`base path: ${BASE || '/'}`);
rmSync(dist, {recursive: true, force: true});
const demoDir = join(dist, BASE.replace(/^\//, ''));
mkdirSync(demoDir, {recursive: true});

const pages = entries(publicDir).sort();
for (const file of pages) {
  const rel = relative(publicDir, dirname(file));
  let html = execFileSync(php, ['-d', 'display_errors=stderr', '-d', 'error_reporting=E_ALL', file], {cwd: root, maxBuffer: 16 * 1024 * 1024}).toString();
  if (!html.includes('</html>')) throw new Error(`${file}: 렌더 결과가 완전한 HTML이 아닙니다.`);
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
