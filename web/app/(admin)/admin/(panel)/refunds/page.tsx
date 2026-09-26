import { adminRefunds } from '@/lib/data/admin';
import { money, dateTime } from '@/lib/format';
import { AdminTitle, AdminTable, AdminBadge } from '@/components/admin/AdminUI';
import { ReasonAction } from '@/components/admin/AdminActions';
import { resolveRefund } from '@/lib/actions/admin';
import { includesQ, listState, sortRows, type ListParams } from '@/lib/admin-list';

export const metadata = { title: '취소·환불 요청' };

export default async function AdminRefundsPage({ searchParams }: { searchParams: Promise<ListParams> }) {
  const s = listState('/admin/refunds', await searchParams, { sort: 'created', dir: 'desc' });
  const all = await adminRefunds();
  const tabs = [['', '전체'], ['requested', '접수'], ['approved', '승인'], ['rejected', '반려']] as const;
  const keys: Record<string, (r: (typeof all)[number]) => string | number> = { created: (r) => r.created_at, amount: (r) => r.donation?.amount ?? 0, status: (r) => r.status };
  const rows = sortRows(all.filter((r) => (!s.tab || r.status === s.tab) && includesQ(s.q, r.profile?.name, r.donation?.number, r.reason)), keys[s.sort], s.dir);
  return (
    <>
      <AdminTitle eyebrow="후원·정산" title="취소·환불 요청" text="승인하면 원거래는 그대로 두고 별도 환불 거래가 기록되어 순기부액에서 차감됩니다. 실제 송금은 별도로 진행해주세요." />
      <AdminTable
        tabs={{ items: tabs.map(([v, l]) => ({ value: v, label: l, count: v ? all.filter((r) => r.status === v).length : all.length })), current: s.tab, href: (v) => s.href({ tab: v }) }}
        search={{ action: '/admin/refunds', value: s.q, placeholder: '회원·기부 번호·사유', hidden: { tab: s.tab }, clearHref: s.href({ q: '' }) }}
        sort={{ key: s.sort, dir: s.dir, href: (k, d) => s.href({ sort: k, dir: d }) }}
        rowClass={(i) => (rows[i].status === 'requested' ? 'is-pending' : undefined)}
        headers={[{ label: '요청일', key: 'created' }, '회원', '원거래', { label: '금액', key: 'amount' }, '사유', { label: '상태', key: 'status' }, '처리']}
        rows={rows.map((r) => [
          <span key="t" className="qa-nowrap">{dateTime(r.created_at)}</span>, r.profile?.name ?? '—',
          <><b>{r.donation?.number}</b><small>{(r.donation as unknown as { fundraiser?: { title: string } | null })?.fundraiser?.title.replace(/\n/g, ' ')}</small></>,
          <b key="a" className="qa-nowrap">{r.donation ? money(r.donation.amount) : '—'}</b>, r.reason, <AdminBadge key="s" value={r.status} />,
          r.status === 'requested' ? <span key="x" className="qa-actions"><ReasonAction label="승인" onRun={(reason) => resolveRefund(r.id, 'approved', reason)} /><ReasonAction label="반려" className="button small secondary" onRun={(reason) => resolveRefund(r.id, 'rejected', reason)} /></span> : <small key="x">{r.review_reason}</small>
        ])}
        empty="조건에 맞는 환불 요청이 없습니다."
      />
    </>
  );
}
