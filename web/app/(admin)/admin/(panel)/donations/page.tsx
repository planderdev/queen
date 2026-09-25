import { adminDonations } from '@/lib/data/admin';
import { money, dateTime, kindNames } from '@/lib/format';
import { AdminTitle, AdminTable, AdminBadge } from '@/components/admin/AdminUI';
import { ActionButton } from '@/components/admin/AdminActions';
import { setDonationStatus } from '@/lib/actions/admin';

export const metadata = { title: '기부 입금 확인' };

export default async function AdminDonationsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const sp = await searchParams;
  const rows = await adminDonations({ status: sp.status, q: sp.q });
  return (
    <>
      <AdminTitle title="기부 입금 확인" text="입금이 확인된 신청은 ‘입금 확인’으로 처리하면 기부 내역과 모금액에 반영됩니다." />
      <form className="admin-filters" action="/admin/donations">
        <select name="status" defaultValue={sp.status ?? ''} aria-label="상태"><option value="">전체</option><option value="pending">입금 확인 대기</option><option value="success">성공</option><option value="cancelled">취소</option><option value="failed">실패</option></select>
        <input name="q" defaultValue={sp.q ?? ''} placeholder="기부 번호 · 입금자명" aria-label="검색" />
        <button className="button small primary" type="submit">조회</button>
      </form>
      <AdminTable headers={['신청 일시', '기부 번호', '회원 / 입금자명', '대상', '유형', '금액', '상태', '처리']} rows={rows.map((d) => [
        dateTime(d.created_at), d.number,
        <><b>{(d as { profile?: { name: string } | null }).profile?.name ?? '탈퇴 회원'}</b><small>입금자명 {d.depositor_name ?? '—'}{d.anonymous ? ' · 익명' : ''}</small></>,
        d.fundraiser?.title.replace(/\n/g, ' ') ?? d.organization?.name ?? '—', kindNames[d.kind], money(d.amount), <AdminBadge value={d.status} />,
        d.status === 'pending' ? <div className="actions"><ActionButton label="입금 확인" onRun={setDonationStatus.bind(null, d.id, 'success')} confirmText={`${d.depositor_name} ${money(d.amount)} 입금을 확인 처리할까요?`} /><ActionButton label="취소" className="button small secondary" onRun={setDonationStatus.bind(null, d.id, 'cancelled')} confirmText="이 신청을 취소 처리할까요?" /></div> : d.confirmed_at ? <small>확인 {dateTime(d.confirmed_at)}</small> : null
      ])} empty="조건에 맞는 기부 내역이 없습니다." />
    </>
  );
}
