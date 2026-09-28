import type { Instrumentation } from 'next';

// 서버에서 처리하지 못한 오류(페이지 렌더링·서버 액션·라우트 핸들러)를 Rollbar로 보낸다.
// 요청 헤더(쿠키·세션)는 보내지 않는다.
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  const { reportError } = await import('./lib/report-error');
  await reportError(err, { url: request.path, method: request.method, route: context.routePath, kind: context.routeType });
};
