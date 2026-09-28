// 행사 참가 신청 규칙(순수 함수). 서버 액션과 자동 점검이 같은 규칙을 쓴다.
export type Question = { key: string; label: string; short?: string; required?: boolean; options: string[] };
export type RegistrationInput = { get: (k: string) => string; has: (k: string) => boolean };
export type Applicant = { name: string; phone: string; email: string; gender: string; age_group: string; depositor_name: string };

export const AGE_GROUPS = ['10대', '20대', '30대', '40대', '50대', '60대 이상'];
export const GENDERS = ['남자', '여자'];
export const PRIVACY_CONSENT = '[필수] 개인정보 수집·이용 동의';
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE = /^0\d{1,2}-?\d{3,4}-?\d{4}$/;

// 기본 인적 사항 6개. 브라우저 검사를 우회한 요청도 여기서 막는다.
export function checkApplicant(input: RegistrationInput): { error: string } | { applicant: Applicant } {
  const get = (k: string) => input.get(k).trim();
  const name = get('name'), phone = get('phone'), email = get('email').toLowerCase(), gender = get('gender'), ageGroup = get('age_group'), depositor = get('depositor_name');
  if (name.length < 1 || name.length > 50) return { error: '성함을 입력해주세요.' };
  if (!PHONE.test(phone)) return { error: '연락처를 010-0000-0000 형식으로 입력해주세요.' };
  if (!EMAIL.test(email)) return { error: '이메일을 정확히 입력해주세요. 행사 안내 연락에 사용합니다.' };
  if (!AGE_GROUPS.includes(ageGroup)) return { error: '연령대를 선택해주세요.' };
  if (!GENDERS.includes(gender)) return { error: '성별을 선택해주세요.' };
  if (depositor.length < 1 || depositor.length > 50) return { error: '참가비 입금자명을 입력해주세요.' };
  return { applicant: { name, phone, email, gender, age_group: ageGroup, depositor_name: depositor } };
}

// 추가 질문(보기 안의 값만)·참여 확인 항목(모두 체크)·개인정보 동의(필수).
export function checkAnswers(input: RegistrationInput, details: { questions?: Question[]; agreements?: string[] } | null | undefined): { error: string } | { answers: Record<string, string>; agreements: string[] } {
  const answers: Record<string, string> = {};
  for (const q of details?.questions ?? []) {
    const v = input.get(`q_${q.key}`).trim();
    if (!v) return { error: `${q.label} 항목을 선택해주세요.` };
    if (!q.options.includes(v)) return { error: `${q.label} 값이 올바르지 않습니다.` };
    answers[q.key] = v;
  }
  const required = details?.agreements ?? [];
  const agreed = required.filter((_, i) => input.has(`agree_${i}`));
  if (agreed.length < required.length) return { error: '참여 확인 항목에 모두 체크해주세요.' };
  if (!input.has('privacy_consent')) return { error: '개인정보 수집·이용에 동의해야 참가 신청을 할 수 있습니다.' };
  return { answers, agreements: [...agreed, PRIVACY_CONSENT] };
}

// 모집 상태: 공개된 행사이고, 신청을 받는 중이고, 마감 전이고, 정원(입금 확인 기준)이 남았는지.
export function registrationClosedReason(
  c: { type: string; review: string; registration_open: boolean; end_at: string; capacity: number | null; confirmed_count: number | null } | null,
  now = Date.now()
): string | null {
  if (!c || c.type !== 'event' || c.review !== 'approved') return '참가 신청을 받는 캠페인이 아닙니다.';
  if (!c.registration_open || new Date(c.end_at).getTime() <= now) return '참가 신청이 마감되었습니다.';
  if (c.capacity != null && (c.confirmed_count ?? 0) >= c.capacity) return `선착순 ${c.capacity}명 모집이 마감되었습니다. 함께해주셔서 감사합니다.`;
  return null;
}

// 관리자 캠페인 편집의 추가 질문: 한 줄에 "질문 | 보기1, 보기2, …".
// 기존 질문 순서의 key는 유지해 이미 받은 답변과 연결을 지킨다.
export function parseQuestions(text: string, oldQs: { key: string }[] = []): { error: string } | { questions: Question[] } {
  const questions: Question[] = [];
  const rows = text.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  for (const [i, line] of rows.entries()) {
    const [label, opts = ''] = line.split('|').map((x) => x.trim());
    const options = opts.split(',').map((x) => x.trim()).filter(Boolean);
    if (!label || options.length < 2) return { error: `질문 ${i + 1}번째 줄은 "질문 | 보기1, 보기2" 형식으로 보기를 2개 이상 적어주세요.` };
    questions.push({ key: oldQs[i]?.key ?? `q${i + 1}`, label, short: label.replace(/\s*\(.*\)\s*$/, '').slice(0, 12), required: true, options });
  }
  return { questions };
}

// 관리자 화면의 datetime-local 값(YYYY-MM-DDTHH:mm)은 한국 시간으로 입력된다. 서버(UTC)에서 그대로 new Date() 하면
// 9시간 밀리므로 +09:00을 붙여 해석한다.
export const kst = (v: string) => new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(v) ? v : `${v.length === 16 ? `${v}:00` : v}+09:00`);
