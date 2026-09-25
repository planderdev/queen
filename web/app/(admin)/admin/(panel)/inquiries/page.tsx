import { adminInquiries } from '@/lib/data/admin';
import { dateTime } from '@/lib/format';
import { AdminTitle, AdminTable } from '@/components/admin/AdminUI';
import { ActionForm } from '@/components/site/ActionForm';
import { answerInquiry } from '@/lib/actions/admin';

export const metadata = { title: '문의 관리' };

export default async function AdminInquiriesPage({ searchParams }: { searchParams: Promise<{ answer?: string }> }) {
  const { answer } = await searchParams;
  const rows = await adminInquiries();
  const target = rows.find((r) => r.id === answer);
  return (
    <>
      <AdminTitle title="문의 관리" text="답변을 저장하면 회원에게 알림이 가고 나의 후원 > 문의 내역에 표시됩니다. 비회원 문의는 이메일로 별도 회신해주세요." />
      {target && (
        <ActionForm action={answerInquiry} className="editor-section" submitLabel="답변 저장">
          <input type="hidden" name="id" value={target.id} />
          <p><b>{target.title}</b> · {target.profile?.name ?? target.email} · {target.category}</p>
          <p style={{ whiteSpace: 'pre-wrap' }}>{target.body}</p>
          <label className="field"><span>답변</span><textarea name="answer" rows={6} defaultValue={target.answer ?? ''} required /></label>
        </ActionForm>
      )}
      <AdminTable headers={['접수일', '문의', '작성자', '내용', '답변', '작업']} rows={rows.map((q) => [
        dateTime(q.created_at), <><b>{q.title}</b><small>{q.category}</small></>, q.profile?.name ?? `${q.email ?? '—'} (비회원)`, <span style={{ whiteSpace: 'pre-wrap' }}>{q.body}</span>,
        q.answer ? <span className="badge status-approved">답변 완료</span> : <span className="badge status-pending">미답변</span>,
        <a className="button small" href={`/admin/inquiries?answer=${q.id}`}>{q.answer ? '답변 수정' : '답변'}</a>
      ])} empty="접수된 문의가 없습니다." />
    </>
  );
}
