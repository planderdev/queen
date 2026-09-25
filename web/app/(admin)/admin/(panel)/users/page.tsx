import { adminUsers } from '@/lib/data/admin';
import { date } from '@/lib/format';
import { AdminTitle, AdminTable, AdminNotice } from '@/components/admin/AdminUI';
import { UserRoleControls } from '@/components/admin/UserRoleControls';

export const metadata = { title: '회원·권한' };

export default async function AdminUsersPage() {
  const rows = await adminUsers();
  return (
    <>
      <AdminTitle title="회원·권한" text="관리자 지정은 최고 관리자만 할 수 있습니다. 역할: 최고 · 콘텐츠 · 심사 · 정산." />
      <AdminNotice>새 관리자를 추가하려면 먼저 그 사람이 사이트에서 회원가입한 뒤 여기서 역할을 관리자로 바꿉니다.</AdminNotice>
      <AdminTable headers={['가입일', '이름', '이메일', '역할', '상태', '변경']} rows={rows.map((u) => [
        date(u.created_at), u.name, u.email ?? '—', u.role === 'admin' ? `관리자 · ${u.admin_role ?? '—'}` : '기부 회원',
        u.suspended ? <span className="badge status-rejected">이용중지</span> : <span className="badge status-approved">활성</span>,
        <UserRoleControls id={u.id} role={u.role} adminRole={u.admin_role} suspended={u.suspended} />
      ])} empty="회원이 없습니다." />
    </>
  );
}
