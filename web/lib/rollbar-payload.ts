// Rollbar 보고 형식(서버·브라우저 공용). 개인정보가 섞이지 않게 메시지·스택·경로(쿼리 제외)만 담고,
// 메시지 안의 이메일·전화번호는 지운다. https://docs.rollbar.com/reference/create-item
export const ROLLBAR_ENDPOINT = 'https://api.rollbar.com/api/1/item/';

type Frame = { filename: string; lineno?: number; colno?: number; method?: string };
export type ErrorContext = { url?: string; method?: string; route?: string; kind?: string };

const scrub = (s: string) =>
  s.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[이메일]').replace(/\b0\d{1,2}[-\s.]?\d{3,4}[-\s.]?\d{4}\b/g, '[전화번호]').slice(0, 1000);

// V8("at fn (file:1:2)")과 Safari·Firefox("fn@file:1:2") 스택을 모두 읽는다. Rollbar는 오래된 호출이 앞에 오길 기대한다.
function parseStack(stack?: string): Frame[] {
  if (!stack) return [];
  const frames: Frame[] = [];
  for (const line of stack.split('\n')) {
    const m = line.match(/^\s*at (?:(.+?) \()?(.+?):(\d+):(\d+)\)?$/) ?? line.match(/^(.*?)@(.+?):(\d+):(\d+)$/);
    if (m) frames.push({ method: m[1] || '(anonymous)', filename: m[2], lineno: Number(m[3]), colno: Number(m[4]) });
  }
  return frames.slice(0, 40).reverse();
}

export function buildItem(err: unknown, ctx: ErrorContext, opts: { platform: 'node' | 'browser'; environment: string; codeVersion?: string }) {
  const e = err instanceof Error ? err : new Error(typeof err === 'string' ? err : JSON.stringify(err ?? null));
  const digest = typeof err === 'object' && err && 'digest' in err ? String((err as { digest: unknown }).digest) : undefined;
  const message = scrub(e.message || '(메시지 없음)');
  const frames = parseStack(e.stack);
  return {
    data: {
      environment: opts.environment,
      platform: opts.platform,
      language: 'javascript',
      framework: 'next.js',
      level: 'error',
      code_version: opts.codeVersion,
      context: ctx.route,
      request: ctx.url ? { url: ctx.url, method: ctx.method } : undefined,
      body: frames.length
        ? { trace: { frames, exception: { class: e.name || 'Error', message } } }
        : { message: { body: `${e.name || 'Error'}: ${message}` } },
      custom: { kind: ctx.kind, digest }
    }
  };
}

// 쿼리·해시에는 검색어·이름이 들어갈 수 있어 경로만 남긴다.
export const pathOnly = (url: string) => url.split(/[?#]/)[0];
