import { adminRefunds } from '@/lib/data/admin';
import { money, dateTime } from '@/lib/format';
import { AdminTitle, AdminTable, AdminBadge } from '@/components/admin/AdminUI';
import { ReasonAction } from '@/components/admin/AdminActions';
import { resolveRefund } from '@/lib/actions/admin';

export const metadata = { title: '취소·환불 요청' };

export default async function AdminRefundsPage() {
  const rows = await adminRefunds();
  return (
    <>
      <AdminTitle title="취소·환불 요청" text="승인하면 원거래는 그대로 두고 별도 환불 거래가 기록되어 순기부액에서 차감됩니다. 실제 송금은 별도로 진행해주세요." />
      <AdminTable headers={['요청일', '회원', '원거래', '금액', '사유', '상태', '처리']} rows={rows.map((r) => [
        dateTime(r.created_at), r.profile?.name ?? '—',
        <><b>{r.donation?.number}</b><small>{(r.donation as unknown as { fundraiser?: { title: string } | null })?.fundraiser?.title.replace(/\n/g, ' ')}</small></>,
        r.donation ? money(r.donation.amount) : '—', r.reason, <AdminBadge value={r.status} />,
        r.status === 'requested' ? <div className="actions"><ReasonAction label="승인" onRun={(reason) => resolveRefund(r.id, 'approved', reason)} /><ReasonAction label="반려" className="button small secondary" onRun={(reason) => resolveRefund(r.id, 'rejected', reason)} /></div> : <small>{r.review_reason}</small>
      ])} empty="접수된 환불 요청이 없습니다." />
    </>
  );
}
