import { requireAdmin } from '@/lib/auth';
import { adminCampaigns, adminRegistrations } from '@/lib/data/admin';
import { dateTime, statusNames } from '@/lib/format';

// 행사 캠페인 참가 신청자 명단 CSV (관리자 전용). 수식 문자로 시작하는 셀은 이스케이프한다.
const cell = (v: unknown) => { let s = String(v ?? ''); if (/^[=+\-@]/.test(s)) s = `'${s}`; return `"${s.replace(/"/g, '""')}"`; };

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(['review']); } catch (e) { return new Response(e instanceof Error ? e.message : '권한이 없습니다.', { status: 403 }); }
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response('잘못된 요청입니다.', { status: 400 });
  const [rows, campaigns] = await Promise.all([adminRegistrations(id), adminCampaigns()]);
  const questions = campaigns.find((c) => c.id === id)?.details.questions ?? [];
  const header = ['No.', '신청일시', '성함', '연락처', '이메일', '성별', '연령대', ...questions.map((q) => q.short ?? q.label), '참가비 입금자명', '회원 여부', '상태', '메모'];
  const lines = rows.map((r, i) => [i + 1, dateTime(r.created_at), r.name, r.phone ?? '', r.email, r.gender ?? '', r.age_group ?? '', ...questions.map((q) => r.answers?.[q.key] ?? ''), r.depositor_name ?? '', r.user_id ? '회원' : '비회원', statusNames[r.status] ?? r.status, r.note ?? ''].map(cell).join(','));
  const csv = '﻿' + [header.map(cell).join(','), ...lines].join('\r\n');
  return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="registrations-${id.slice(0, 8)}.csv"` } });
}
