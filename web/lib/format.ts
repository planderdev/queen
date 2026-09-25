// Notation rules from the brand guide: integer KRW with 원, floor percent, D-day, Korean dates.
export const money = (n: number) => `${Math.round(n).toLocaleString('ko-KR')}원`;
export const percent = (amount: number, target: number) => (target > 0 ? Math.floor((amount / target) * 100) : 0);
export const clampPct = (pct: number) => Math.min(100, Math.max(0, pct));

const KST = 'Asia/Seoul';
export function date(value: string | Date) {
  const d = new Date(value);
  const parts = new Intl.DateTimeFormat('ko-KR', { timeZone: KST, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('year')}. ${get('month')}. ${get('day')}.`;
}
export function dateTime(value: string | Date) {
  const d = new Date(value);
  const time = new Intl.DateTimeFormat('ko-KR', { timeZone: KST, hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
  return `${date(d)} ${time}`;
}

export function daysLeft(endAt: string, now = new Date()) {
  return Math.max(0, Math.ceil((new Date(endAt).getTime() - now.getTime()) / 86400000));
}

export const brTitle = (title: string) => title.split('\n');
export const flatTitle = (title: string) => title.replace(/\n/g, ' ');

export const statusNames: Record<string, string> = {
  draft: '임시저장', submitted: '검토 요청', reviewing: '심사 중', revision: '보완 요청', approved: '승인', rejected: '반려',
  active: '진행 중', paused: '일시중지', ended: '종료', scheduled: '예정',
  pending: '입금 확인 대기', processing: '처리 중', success: '성공', failed: '실패', cancelled: '취소',
  requested: '접수', paid: '지급 완료', resolved: '처리 완료',
  confirmed: '입금 확인'
};
export const statusTone: Record<string, 'olive' | 'blue' | 'lavender' | 'orange' | 'rose'> = {
  approved: 'olive', success: 'olive', active: 'olive', paid: 'olive', resolved: 'olive', confirmed: 'olive',
  submitted: 'blue', reviewing: 'blue', processing: 'blue', requested: 'blue', pending: 'blue',
  draft: 'lavender', paused: 'lavender', ended: 'lavender', cancelled: 'lavender',
  revision: 'orange', scheduled: 'orange',
  failed: 'rose', rejected: 'rose'
};
export const kindNames: Record<string, string> = { donation: '일시기부', recurring: '정기기부', refund: '환불' };
export const campaignTypeNames: Record<string, string> = { matching: '기업 매칭', cheer: '응원 참여', event: '참가 신청' };
