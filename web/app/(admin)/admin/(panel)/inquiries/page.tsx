import { adminInquiries } from '@/lib/data/admin';
import { dateTime } from '@/lib/format';
import { AdminTitle, AdminTable } from '@/components/admin/AdminUI';
import { ActionForm } from '@/components/site/ActionForm';
import { answerInquiry } from '@/lib/actions/admin';
import { includesQ, listState, sortRows, type ListParams } from '@/lib/admin-list';

export const metadata = { title: '문의 관리' };

export default async function AdminInquiriesPage({ searchParams }: { searchParams: Promise<ListParams & { answer?: string }> }) {
  const sp = await searchParams;
  const s = listState('/admin/inquiries', sp, { sort: 'created', dir: 'desc' });
  const all = await adminInquiries();
  const target = all.find((r) => r.id === sp.answer);
  const state = (q: (typeof all)[number]) => (q.answer ? 'answered' : 'open');
  const keys: Record<string, (r: (typeof all)[number]) => string> = { created: (r) => r.created_at, category: (r) => r.category, status: (r) => state(r) };
  const rows = sortRows(all.filter((r) => (!s.tab || state(r) === s.tab) && includesQ(s.q, r.title, r.body, r.email, r.profile?.name)), keys[s.sort], s.dir);
  return (
    <>
      <AdminTitle eyebrow="콘텐츠·소통" title="문의 관리" text="답변을 저장하면 회원에게 알림이 가고 나의 후원 > 문의 내역에 표시됩니다. 비회원 문의는 이메일로 별도 회신해주세요." />
      {target && (
        <section className="qa-answer">
          <div className="qa-answer-q"><p className="qa-eyebrow">{target.category} · {dateTime(target.created_at)} · {target.profile?.name ?? `${target.email ?? '—'} (비회원)`}</p><h2>{target.title}</h2><p>{target.body}</p></div>
          <ActionForm action={answerInquiry} className="editor-section" submitLabel={target.answer ? '답변 수정' : '답변 저장'}>
            <input type="hidden" name="id" value={target.id} />
            <label className="field"><span>답변</span><textarea name="answer" rows={6} defaultValue={target.answer ?? ''} required /></label>
          </ActionForm>
        </section>
      )}
      <AdminTable
        tabs={{ items: [['', '전체'], ['open', '미답변'], ['answered', '답변 완료']].map(([v, l]) => ({ value: v, label: l, count: v ? all.filter((r) => state(r) === v).length : all.length })), current: s.tab, href: (v) => s.href({ tab: v }) }}
        search={{ action: '/admin/inquiries', value: s.q, placeholder: '제목·내용·작성자', hidden: { tab: s.tab }, clearHref: s.href({ q: '' }) }}
        sort={{ key: s.sort, dir: s.dir, href: (k, d) => s.href({ sort: k, dir: d }) }}
        rowClass={(i) => (rows[i].id === sp.answer ? 'is-editing' : !rows[i].answer ? 'is-pending' : undefined)}
        headers={[{ label: '접수일', key: 'created' }, { label: '문의', key: 'category' }, '작성자', '내용', { label: '답변', key: 'status' }, '처리']}
        rows={rows.map((q) => [
          <span key="t" className="qa-nowrap">{dateTime(q.created_at)}</span>, <><b>{q.title}</b><small>{q.category}</small></>, q.profile?.name ?? `${q.email ?? '—'} (비회원)`, <span key="b" className="qa-clamp">{q.body}</span>,
          q.answer ? <span key="s" className="badge status-approved">답변 완료</span> : <span key="s" className="badge status-pending">미답변</span>,
          <a key="x" className={`button small ${q.answer ? 'secondary' : 'primary'}`} href={s.href({ answer: q.id } as ListParams)}>{q.answer ? '답변 수정' : '답변'}</a>
        ])}
        empty="조건에 맞는 문의가 없습니다." />
    </>
  );
}
