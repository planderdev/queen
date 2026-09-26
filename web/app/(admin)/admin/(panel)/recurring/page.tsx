import { adminPlans } from '@/lib/data/admin';
import { money, date } from '@/lib/format';
import { AdminTitle, AdminTable, AdminBadge } from '@/components/admin/AdminUI';
import { includesQ, listState, sortRows, type ListParams } from '@/lib/admin-list';

export const metadata = { title: '정기기부 약정' };

export default async function AdminRecurringPage({ searchParams }: { searchParams: Promise<ListParams> }) {
  const s = listState('/admin/recurring', await searchParams, { sort: 'created', dir: 'desc' });
  const all = await adminPlans();
  const tabs = [['', '전체'], ['active', '진행 중'], ['paused', '일시중지'], ['cancelled', '해지']] as const;
  const keys: Record<string, (r: (typeof all)[number]) => string | number> = { created: (r) => r.created_at, amount: (r) => r.amount, next: (r) => r.next_date ?? '', name: (r) => r.profile?.name ?? '' };
  const rows = sortRows(all.filter((r) => (!s.tab || r.status === s.tab) && includesQ(s.q, r.profile?.name, r.organization?.name)), keys[s.sort], s.dir);
  const monthly = all.filter((r) => r.status === 'active').reduce((a, r) => a + r.amount, 0);
  return (
    <>
      <AdminTitle eyebrow="후원·정산" title="정기기부 약정" text="회원이 등록한 약정 목록입니다. 매달 입금은 ‘기부 입금 확인’에서 정기기부 유형으로 확인 처리합니다." meta={<> · 진행 중 약정 월 합계 <b>{money(monthly)}</b></>} />
      <AdminTable
        tabs={{ items: tabs.map(([v, l]) => ({ value: v, label: l, count: v ? all.filter((r) => r.status === v).length : all.length })), current: s.tab, href: (v) => s.href({ tab: v }) }}
        search={{ action: '/admin/recurring', value: s.q, placeholder: '회원·단체', hidden: { tab: s.tab }, clearHref: s.href({ q: '' }) }}
        sort={{ key: s.sort, dir: s.dir, href: (k, d) => s.href({ sort: k, dir: d }) }}
        headers={[{ label: '등록일', key: 'created' }, { label: '회원', key: 'name' }, '단체', { label: '월 금액', key: 'amount' }, '결제일', { label: '다음 예정일', key: 'next' }, '상태']}
        rows={rows.map((p) => [<span key="d" className="qa-nowrap">{date(p.created_at)}</span>, p.profile?.name ?? '—', p.organization?.name ?? '—', <b key="a" className="qa-nowrap">{money(p.amount)}</b>, `매월 ${p.day}일`, <span key="n" className="qa-nowrap">{date(p.next_date)}</span>, <AdminBadge key="s" value={p.status} />])}
        empty="조건에 맞는 정기기부 약정이 없습니다."
      />
    </>
  );
}
