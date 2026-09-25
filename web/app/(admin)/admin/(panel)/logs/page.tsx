import { adminLogs } from '@/lib/data/admin';
import { dateTime } from '@/lib/format';
import { AdminTitle, AdminTable } from '@/components/admin/AdminUI';

export const metadata = { title: '운영 이력' };

export default async function AdminLogsPage() {
  const rows = await adminLogs();
  return (
    <>
      <AdminTitle title="운영 이력" text="관리자가 처리한 작업이 순서대로 기록됩니다. 기록은 수정할 수 없습니다." />
      <AdminTable headers={['일시', '작업자', '작업', '대상', '상세']} rows={rows.map((l) => [dateTime(l.created_at), l.actor_name ?? '—', l.action, `${l.target_type ?? ''} ${l.target_id ?? ''}`.trim(), <code key={l.id}>{l.detail ? JSON.stringify(l.detail) : ''}</code>])} empty="기록된 운영 이력이 없습니다." />
    </>
  );
}
