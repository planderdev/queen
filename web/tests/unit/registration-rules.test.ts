import { describe, expect, it } from 'vitest';
import { checkAnswers, checkApplicant, kst, parseQuestions, PRIVACY_CONSENT, registrationClosedReason } from '@/lib/registration-rules';

// 기부런 신청서와 같은 모양의 입력
const valid: Record<string, string> = {
  name: '홍길동', phone: '010-1234-5678', email: 'Runner@Example.com', gender: '여자', age_group: '30대', depositor_name: '홍길동',
  q_pace: '5~6분대', q_course: '10km 완주', agree_0: 'on', agree_1: 'on', privacy_consent: 'on'
};
const input = (patch: Record<string, string | undefined> = {}) => {
  const v = { ...valid, ...patch };
  return { get: (k: string) => v[k] ?? '', has: (k: string) => Boolean(v[k]) };
};
const details = {
  questions: [
    { key: 'pace', label: '평소 러닝 페이스', options: ['3~4분대', '5~6분대', '8분 이상'] },
    { key: 'course', label: '코스 선택', options: ['10km 완주', '5km 완주'] }
  ],
  agreements: ['행사 안전 수칙을 지키겠습니다.', '참가비 환불 규정을 확인했습니다.']
};

describe('참가 신청: 인적 사항', () => {
  it('모두 채우면 통과하고 이메일은 소문자로 저장한다', () => {
    const r = checkApplicant(input());
    expect(r).toEqual({ applicant: { name: '홍길동', phone: '010-1234-5678', email: 'runner@example.com', gender: '여자', age_group: '30대', depositor_name: '홍길동' } });
  });
  it.each([
    ['name', '', '성함'],
    ['phone', '1234', '연락처'],
    ['email', 'not-an-email', '이메일'],
    ['age_group', '70대', '연령대'],
    ['gender', '', '성별'],
    ['depositor_name', '   ', '입금자명']
  ])('%s 값이 "%s"이면 막는다', (field, value, word) => {
    const r = checkApplicant(input({ [field]: value }));
    expect('error' in r && r.error).toContain(word);
  });
  it('하이픈 없는 전화번호도 받는다', () => {
    expect('applicant' in checkApplicant(input({ phone: '01012345678' }))).toBe(true);
  });
});

describe('참가 신청: 추가 질문·동의', () => {
  it('모두 답하고 동의하면 개인정보 동의가 기록에 붙는다', () => {
    const r = checkAnswers(input(), details);
    expect(r).toEqual({ answers: { pace: '5~6분대', course: '10km 완주' }, agreements: [...details.agreements, PRIVACY_CONSENT] });
  });
  it('질문을 비우면 막는다', () => {
    const r = checkAnswers(input({ q_course: '' }), details);
    expect('error' in r && r.error).toBe('코스 선택 항목을 선택해주세요.');
  });
  it('보기에 없는 값은 막는다', () => {
    const r = checkAnswers(input({ q_pace: '1분대' }), details);
    expect('error' in r && r.error).toBe('평소 러닝 페이스 값이 올바르지 않습니다.');
  });
  it('참여 확인 항목 하나라도 빠지면 막는다', () => {
    const r = checkAnswers(input({ agree_1: undefined }), details);
    expect('error' in r && r.error).toContain('참여 확인');
  });
  it('개인정보 동의 없이는 막는다', () => {
    const r = checkAnswers(input({ privacy_consent: undefined }), details);
    expect('error' in r && r.error).toContain('개인정보');
  });
});

describe('참가 신청: 모집 상태', () => {
  const open = { type: 'event', review: 'approved', registration_open: true, end_at: '2026-10-09T23:00:00Z', capacity: 50, confirmed_count: 49 };
  const now = Date.parse('2026-09-28T00:00:00Z');
  it('정원이 남았으면 열려 있다', () => expect(registrationClosedReason(open, now)).toBeNull());
  it('입금 확인이 정원에 닿으면 마감한다', () => expect(registrationClosedReason({ ...open, confirmed_count: 50 }, now)).toContain('선착순 50명'));
  it('정원이 없으면 인원 제한이 없다', () => expect(registrationClosedReason({ ...open, capacity: null, confirmed_count: 999 }, now)).toBeNull());
  it('신청 받기를 끄면 마감한다', () => expect(registrationClosedReason({ ...open, registration_open: false }, now)).toBe('참가 신청이 마감되었습니다.'));
  it('마감일이 지나면 마감한다', () => expect(registrationClosedReason(open, Date.parse('2026-10-10T00:00:00Z'))).toBe('참가 신청이 마감되었습니다.'));
  it('숨긴 캠페인·행사가 아닌 캠페인은 받지 않는다', () => {
    expect(registrationClosedReason({ ...open, review: 'draft' }, now)).toContain('캠페인이 아닙니다');
    expect(registrationClosedReason({ ...open, type: 'matching' }, now)).toContain('캠페인이 아닙니다');
    expect(registrationClosedReason(null, now)).toContain('캠페인이 아닙니다');
  });
});

describe('관리자: 추가 질문 입력', () => {
  it('"질문 | 보기1, 보기2" 줄을 질문으로 바꾸고 기존 key를 유지한다', () => {
    const r = parseQuestions('평소 러닝 페이스 (1km당) | 3~4분대, 5~6분대\r\n\n코스 선택 | 10km 완주, 5km 완주\n새 질문 | 예, 아니오', [{ key: 'pace' }, { key: 'course' }]);
    expect('questions' in r && r.questions.map((q) => [q.key, q.short, q.options.length])).toEqual([['pace', '평소 러닝 페이스', 2], ['course', '코스 선택', 2], ['q3', '새 질문', 2]]);
  });
  it('보기가 2개 미만이면 몇 번째 줄인지 알려준다', () => {
    const r = parseQuestions('코스 선택 | 10km 완주\n', []);
    expect('error' in r && r.error).toContain('질문 1번째 줄');
  });
});

describe('관리자: 한국 시간 입력', () => {
  it('datetime-local 값을 한국 시간으로 해석한다', () => expect(kst('2026-10-10T08:00').toISOString()).toBe('2026-10-09T23:00:00.000Z'));
  it('시간대가 붙은 값은 그대로 둔다', () => expect(kst('2026-10-10T08:00:00Z').toISOString()).toBe('2026-10-10T08:00:00.000Z'));
});
