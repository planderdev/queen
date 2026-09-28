import { describe, expect, it } from 'vitest';
import { buildItem, pathOnly } from '@/lib/rollbar-payload';

const opts = { platform: 'node' as const, environment: 'production', codeVersion: 'abc123' };

describe('오류 알림: 개인정보 제외', () => {
  it('메시지 속 이메일·전화번호를 가린다', () => {
    const item = buildItem(new Error('중복 신청 runner@example.com / 010-1234-5678'), {}, opts);
    const body = item.data.body as { trace: { exception: { message: string } } };
    expect(body.trace.exception.message).toBe('중복 신청 [이메일] / [전화번호]');
  });
  it('주소에서 검색어·해시를 뺀다', () => {
    expect(pathOnly('/admin/campaigns?q=홍길동&tab=pending#top')).toBe('/admin/campaigns');
  });
  it('스택을 읽어 오래된 호출부터 보낸다', () => {
    const e = new Error('x');
    e.stack = 'Error: x\n    at inner (/app/a.js:1:2)\n    at outer (/app/b.js:3:4)';
    const body = buildItem(e, {}, opts).data.body as { trace: { frames: { method: string }[] } };
    expect(body.trace.frames.map((f) => f.method)).toEqual(['outer', 'inner']);
  });
  it('스택이 없으면 메시지 형식으로 보내고 digest를 남긴다', () => {
    const item = buildItem(Object.assign(new Error('render failed'), { stack: '', digest: '123' }), { kind: 'render' }, opts);
    expect(item.data.body).toEqual({ message: { body: 'Error: render failed' } });
    expect(item.data.custom).toEqual({ kind: 'render', digest: '123' });
  });
});
