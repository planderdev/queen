import { ROLLBAR_ENDPOINT, buildItem, pathOnly, type ErrorContext } from '@/lib/rollbar-payload';

// 서버 오류를 Rollbar로 보낸다. 토큰이 없으면(로컬 개발·미리보기 모드) 아무것도 하지 않는다.
// 토큰 이름은 Vercel 마켓플레이스 연동이 만든 그대로다.
const TOKEN = process.env.ROLLBAR_QUEEN_MANDEOK_SERVER_TOKEN_1790591993;

export async function reportError(err: unknown, ctx: ErrorContext = {}) {
  if (!TOKEN) return;
  const item = buildItem(err, { ...ctx, url: ctx.url && pathOnly(ctx.url) }, {
    platform: 'node',
    environment: process.env.VERCEL_ENV ?? 'development',
    codeVersion: process.env.VERCEL_GIT_COMMIT_SHA
  });
  try {
    await fetch(ROLLBAR_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Rollbar-Access-Token': TOKEN },
      body: JSON.stringify(item),
      signal: AbortSignal.timeout(3000)
    });
  } catch {
    // 보고 실패가 사용자 요청을 막으면 안 된다.
  }
}
