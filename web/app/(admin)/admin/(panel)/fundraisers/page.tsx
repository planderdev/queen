import Link from 'next/link';
import { adminFundraisers } from '@/lib/data/admin';
import { money, date, flatTitle } from '@/lib/format';
import { AdminTitle, AdminTable, AdminBadge } from '@/components/admin/AdminUI';
import { includesQ, listState, sortRows, type ListParams } from '@/lib/admin-list';

export const metadata = { title: '모금함 관리' };

export default async function AdminFundraisersPage({ searchParams }: { searchParams: Promise<ListParams> }) {
  const s = listState('/admin/fundraisers', await searchParams, { sort: 'created', dir: 'desc' });
  const all = await adminFundraisers();
  const tabs = [['', '전체'], ['submitted', '검토 요청'], ['reviewing', '심사 중'], ['approved', '승인'], ['revision', '보완 요청'], ['draft', '임시저장']] as const;
  const keys: Record<string, (r: (typeof all)[number]) => string | number> = { created: (r) => r.created_at, title: (r) => flatTitle(r.title), target: (r) => r.target, end: (r) => r.end_at, category: (r) => r.category };
  const rows = sortRows(all.filter((r) => (!s.tab || r.review === s.tab) && includesQ(s.q, flatTitle(r.title), r.organization?.name, r.category)), keys[s.sort], s.dir);
  return (
    <>
      <AdminTitle eyebrow="모금·단체" title="모금함 관리" text="모금함을 등록·수정하고 심사·게시 상태를 관리합니다."><Link className="button small primary" href="/admin/fundraisers/new"><i className="ri-add-line" aria-hidden="true"></i> 새 모금함</Link></AdminTitle>
      <AdminTable
        tabs={{ items: tabs.map(([v, l]) => ({ value: v, label: l, count: v ? all.filter((r) => r.review === v).length : all.length })).filter((t) => !t.value || t.count), current: s.tab, href: (v) => s.href({ tab: v }), label: '심사 상태' }}
        search={{ action: '/admin/fundraisers', value: s.q, placeholder: '모금함·단체·분야', hidden: { tab: s.tab }, clearHref: s.href({ q: '' }) }}
        sort={{ key: s.sort, dir: s.dir, href: (k, d) => s.href({ sort: k, dir: d }) }}
        headers={[{ label: '모금함 / 단체', key: 'title' }, { label: '분야', key: 'category' }, { label: '목표', key: 'target' }, { label: '기간', key: 'end' }, '심사 / 게시', '처리']}
        rows={rows.map((f) => [
          <><b>{flatTitle(f.title)}</b><small>{f.organization?.name}</small></>, f.category, <b key="t" className="qa-nowrap">{money(f.target)}</b>, <span key="p" className="qa-nowrap">{date(f.start_at)} ~ {date(f.end_at)}</span>,
          <span key="b" className="qa-actions"><AdminBadge value={f.review} /><AdminBadge value={f.publication} /></span>,
          <span key="x" className="qa-actions"><Link className="button small secondary" href={`/admin/fundraisers/${f.id}`}>수정</Link><a className="button small ghost" href={`/donate/${f.slug}`} target="_blank" rel="noopener">보기</a></span>
        ])}
        empty="조건에 맞는 모금함이 없습니다."
      />
    </>
  );
}
