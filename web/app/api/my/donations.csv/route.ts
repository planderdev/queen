import { getSession } from '@/lib/auth';
import { myDonations } from '@/lib/data/me';
import { dateTime, kindNames, statusNames } from '@/lib/format';

// CSV export of the member's own donations. Cells starting with formula characters are escaped.
const cell = (v: unknown) => { let s = String(v ?? ''); if (/^[=+\-@]/.test(s)) s = `'${s}`; return `"${s.replace(/"/g, '""')}"`; };

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return new Response('로그인이 필요합니다.', { status: 401 });
  const url = new URL(request.url);
  const rows = await myDonations(session.user.id, { status: url.searchParams.get('status') ?? undefined, from: url.searchParams.get('from') ?? undefined, to: url.searchParams.get('to') ?? undefined });
  const header = ['일시', '기부 번호', '모금함', '유형', '금액', '상태', '입금자명', '공개'];
  const lines = rows.map((d) => [dateTime(d.created_at), d.number, d.fundraiser?.title.replace(/\n/g, ' ') ?? d.organization?.name ?? '', kindNames[d.kind], d.kind === 'refund' ? -d.amount : d.amount, statusNames[d.status], d.depositor_name ?? '', d.anonymous ? '익명' : '공개'].map(cell).join(','));
  const csv = '﻿' + [header.map(cell).join(','), ...lines].join('\r\n');
  return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="queen-mandeok-donations.csv"` } });
}
