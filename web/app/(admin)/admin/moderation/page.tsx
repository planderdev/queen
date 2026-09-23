import { adminReports } from '@/lib/data/admin';
import { dateTime } from '@/lib/format';
import { AdminTitle, AdminTable, AdminBadge } from '@/components/admin/AdminUI';
import { ReasonAction } from '@/components/admin/AdminActions';
import { moderateComment } from '@/lib/actions/admin';

export const metadata = { title: '댓글 및 신고' };

export default async function AdminModerationPage() {
  const rows = await adminReports();
  return (
    <>
      <AdminTitle title="댓글 및 신고" text="숨김 처리하면 공개 화면에서 즉시 사라집니다. 처리 사유는 운영 이력에 남습니다." />
      <AdminTable headers={['신고일', '신고 댓글', '신고자', '사유', '상태', '처리']} rows={rows.map((r) => [
        dateTime(r.created_at), <>{r.comment?.body ?? '(삭제된 댓글)'}{r.comment?.hidden && <small>현재 숨김</small>}</>, r.profile?.name ?? '—', r.reason, <AdminBadge value={r.status} />,
        r.status === 'requested' ? <div className="actions"><ReasonAction label="숨김" onRun={(reason) => moderateComment(r.id, true, reason)} /><ReasonAction label="유지" className="button small secondary" onRun={(reason) => moderateComment(r.id, false, reason)} /></div> : <small>{r.resolution}</small>
      ])} empty="접수된 신고가 없습니다." />
    </>
  );
}
