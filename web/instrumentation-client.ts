import { ROLLBAR_ENDPOINT, buildItem, pathOnly } from '@/lib/rollbar-payload';

// 브라우저에서 난 오류를 Rollbar로 보낸다. 무료 한도(월 5천 건)를 아끼려고 같은 오류는 한 번만,
// 한 페이지에서 최대 5건만 보내고, 확장 프로그램·외부 스크립트 오류는 건너뛴다.
const TOKEN = process.env.NEXT_PUBLIC_ROLLBAR_QUEEN_MANDEOK_CLIENT_TOKEN_1790591993;
const ENVIRONMENT = process.env.NEXT_PUBLIC_VERCEL_ENV ?? 'development';
const IGNORE = /ResizeObserver loop|^Script error\.?$|NEXT_REDIRECT|NEXT_NOT_FOUND/;

if (TOKEN && ENVIRONMENT !== 'development') {
  const seen = new Set<string>();
  const send = (err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    if (seen.size >= 5 || seen.has(message) || IGNORE.test(message)) return;
    if (err instanceof Error && err.stack && !err.stack.includes(location.origin) && /https?:\/\//.test(err.stack)) return;
    seen.add(message);
    const item = buildItem(err, { url: pathOnly(location.href), method: 'GET', route: location.pathname, kind: 'browser' }, {
      platform: 'browser',
      environment: ENVIRONMENT,
      codeVersion: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
    });
    fetch(ROLLBAR_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Rollbar-Access-Token': TOKEN },
      body: JSON.stringify(item),
      keepalive: true
    }).catch(() => {});
  };
  window.addEventListener('error', (e) => send(e.error ?? e.message));
  window.addEventListener('unhandledrejection', (e) => send(e.reason));
}
