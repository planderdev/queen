import { adminPlans } from '@/lib/data/admin';
import { money, date } from '@/lib/format';
import { AdminTitle, AdminTable, AdminBadge } from '@/components/admin/AdminUI';

export const metadata = { title: '정기기부 약정' };

export default async function AdminRecurringPage() {
  const rows = await adminPlans();
  return (
    <>
      <AdminTitle title="정기기부 약정" text="회원이 등록한 약정 목록입니다. 매달 입금은 ‘기부 입금 확인’에서 정기기부 유형으로 확인 처리합니다." />
      <AdminTable headers={['등록일', '회원', '단체', '월 금액', '결제일', '다음 예정일', '상태']} rows={rows.map((p) => [date(p.created_at), p.profile?.name ?? '—', p.organization?.name ?? '—', money(p.amount), `매월 ${p.day}일`, date(p.next_date), <AdminBadge value={p.status} />])} empty="등록된 정기기부 약정이 없습니다." />
    </>
  );
}
