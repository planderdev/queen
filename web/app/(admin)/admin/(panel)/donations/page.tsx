import { adminDonations } from '@/lib/data/admin';
import { money, dateTime, kindNames } from '@/lib/format';
import { AdminTitle, AdminTable, AdminBadge } from '@/components/admin/AdminUI';
import { ActionButton } from '@/components/admin/AdminActions';
import { setDonationStatus } from '@/lib/actions/admin';
import { includesQ, listState, sortRows, type ListParams } from '@/lib/admin-list';
import type { Donation } from '@/lib/data/types';

export const metadata = { title: '기부 입금 확인' };
type Row = Donation & { profile?: { name: string } | null };

export default async function AdminDonationsPage({ searchParams }: { searchParams: Promise<ListParams & { status?: string }> }) {
  const sp = await searchParams;
  const s = listState('/admin/donations', { ...sp, tab: sp.tab ?? sp.status }, { sort: 'created', dir: 'desc' });
  const all = (await adminDonations({})) as Row[];
  const tabs = [['', '전체'], ['pending', '입금 대기'], ['success', '입금 확인'], ['cancelled', '취소'], ['failed', '실패']] as const;
  const keys: Record<string, (r: Row) => string | number> = { created: (r) => r.created_at, amount: (r) => r.amount, name: (r) => r.depositor_name ?? '', status: (r) => r.status };
  const rows = sortRows(all.filter((r) => (!s.tab || r.status === s.tab) && includesQ(s.q, r.number, r.depositor_name, r.profile?.name)), keys[s.sort], s.dir);
  return (
    <>
      <AdminTitle eyebrow="후원·정산" title="기부 입금 확인" text="통장 입금을 확인한 신청은 ‘입금 확인’으로 처리하면 기부 내역과 모금액에 반영됩니다." />
      <AdminTable
        tabs={{ items: tabs.map(([v, l]) => ({ value: v, label: l, count: v ? all.filter((r) => r.status === v).length : all.length })), current: s.tab, href: (v) => s.href({ tab: v }) }}
        search={{ action: '/admin/donations', value: s.q, placeholder: '기부 번호·입금자명·회원', hidden: { tab: s.tab }, clearHref: s.href({ q: '' }) }}
        sort={{ key: s.sort, dir: s.dir, href: (k, d) => s.href({ sort: k, dir: d }) }}
        rowClass={(i) => (rows[i].status === 'pending' ? 'is-pending' : rows[i].status === 'cancelled' ? 'is-cancelled' : undefined)}
        headers={[{ label: '신청 일시', key: 'created' }, '기부 번호', { label: '회원 / 입금자명', key: 'name' }, '대상', '유형', { label: '금액', key: 'amount' }, { label: '상태', key: 'status' }, '처리']}
        rows={rows.map((d) => [
          <span key="t" className="qa-nowrap">{dateTime(d.created_at)}</span>, <span key="n" className="qa-nowrap">{d.number}</span>,
          <><b>{d.profile?.name ?? '비회원·탈퇴 회원'}</b><small>입금자명 {d.depositor_name ?? '—'}{d.anonymous ? ' · 익명' : ''}</small></>,
          d.fundraiser?.title.replace(/\n/g, ' ') ?? d.organization?.name ?? '—', kindNames[d.kind], <b key="a" className="qa-nowrap">{money(d.amount)}</b>, <AdminBadge key="s" value={d.status} />,
          d.status === 'pending' ? <span key="x" className="qa-actions"><ActionButton label="입금 확인" onRun={setDonationStatus.bind(null, d.id, 'success')} confirmText={`${d.depositor_name} ${money(d.amount)} 입금을 확인 처리할까요?`} /><ActionButton label="취소" className="button small ghost" onRun={setDonationStatus.bind(null, d.id, 'cancelled')} confirmText="이 신청을 취소 처리할까요?" /></span> : d.confirmed_at ? <small key="x">확인 {dateTime(d.confirmed_at)}</small> : null
        ])}
        empty={s.q ? `‘${s.q}’에 맞는 기부 내역이 없습니다.` : '조건에 맞는 기부 내역이 없습니다.'}
        foot={`${rows.length}건 표시 · 최근 300건 기준`}
      />
    </>
  );
}
