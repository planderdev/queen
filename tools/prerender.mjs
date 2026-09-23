// Pre-renders every public/**/index.php into dist/**/index.html and copies static assets.
// PHP only assembles the page shell here (no request-dependent logic), so the site can be
// served as static files. Used as the Vercel build command; also works locally (`npm run build`).
import {execFileSync, spawnSync} from 'node:child_process';
import {cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync, chmodSync} from 'node:fs';
import {dirname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'public');
const dist = join(root, 'dist');
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

const php = findPhp();
console.log(`php: ${php} (${execFileSync(php, ['-v']).toString().split('\n')[0]})`);
rmSync(dist, {recursive: true, force: true});
mkdirSync(dist, {recursive: true});

const pages = entries(publicDir).sort();
for (const file of pages) {
  const rel = relative(publicDir, dirname(file));
  const html = execFileSync(php, ['-d', 'display_errors=stderr', '-d', 'error_reporting=E_ALL', file], {cwd: root, maxBuffer: 16 * 1024 * 1024}).toString();
  if (!html.includes('</html>')) throw new Error(`${file}: 렌더 결과가 완전한 HTML이 아닙니다.`);
  const out = join(dist, rel, 'index.html');
  mkdirSync(dirname(out), {recursive: true});
  writeFileSync(out, html);
  console.log(`  /${rel ? rel + '/' : ''} ← ${relative(root, file)} (${html.length.toLocaleString()} bytes)`);
}

cpSync(join(publicDir, 'assets'), join(dist, 'assets'), {recursive: true});
for (const name of readdirSync(publicDir)) {
  const full = join(publicDir, name);
  if (statSync(full).isFile() && !name.endsWith('.php') && !existsSync(join(dist, name))) cpSync(full, join(dist, name));
}
console.log(`완료: 페이지 ${pages.length}개 → ${relative(root, dist)}/`);
