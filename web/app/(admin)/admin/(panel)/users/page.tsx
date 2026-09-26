import { adminUsers } from '@/lib/data/admin';
import { date } from '@/lib/format';
import { AdminTitle, AdminTable, AdminNotice } from '@/components/admin/AdminUI';
import { UserRoleControls } from '@/components/admin/UserRoleControls';
import { includesQ, listState, sortRows, type ListParams } from '@/lib/admin-list';

export const metadata = { title: '회원·권한' };
const roleNames: Record<string, string> = { super: '최고', content: '콘텐츠', review: '심사', finance: '정산' };

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<ListParams> }) {
  const s = listState('/admin/users', await searchParams, { sort: 'created', dir: 'desc' });
  const all = await adminUsers();
  const group = (u: (typeof all)[number]) => (u.suspended ? 'suspended' : u.role === 'admin' ? 'admin' : 'donor');
  const keys: Record<string, (r: (typeof all)[number]) => string> = { created: (r) => r.created_at, name: (r) => r.name, email: (r) => r.email ?? '' };
  const rows = sortRows(all.filter((r) => (!s.tab || group(r) === s.tab) && includesQ(s.q, r.name, r.email)), keys[s.sort], s.dir);
  return (
    <>
      <AdminTitle eyebrow="설정" title="회원·권한" text="관리자 지정은 최고 관리자만 할 수 있습니다. 역할: 최고 · 콘텐츠 · 심사 · 정산." />
      <AdminNotice>새 관리자를 추가하려면 먼저 그 사람이 사이트에서 회원가입한 뒤 여기서 역할을 관리자로 바꿉니다.</AdminNotice>
      <AdminTable
        tabs={{ items: [['', '전체'], ['donor', '기부 회원'], ['admin', '관리자'], ['suspended', '이용중지']].map(([v, l]) => ({ value: v, label: l, count: v ? all.filter((r) => group(r) === v).length : all.length })), current: s.tab, href: (v) => s.href({ tab: v }) }}
        search={{ action: '/admin/users', value: s.q, placeholder: '이름·이메일', hidden: { tab: s.tab }, clearHref: s.href({ q: '' }) }}
        sort={{ key: s.sort, dir: s.dir, href: (k, d) => s.href({ sort: k, dir: d }) }}
        rowClass={(i) => (rows[i].suspended ? 'is-cancelled' : undefined)}
        headers={[{ label: '가입일', key: 'created' }, { label: '이름', key: 'name' }, { label: '이메일', key: 'email' }, '역할', '상태', '변경']}
        rows={rows.map((u) => [
          <span key="d" className="qa-nowrap">{date(u.created_at)}</span>, <b key="n">{u.name}</b>, u.email ?? '—', u.role === 'admin' ? <span key="r" className="badge status-received">관리자 · {roleNames[u.admin_role ?? ''] ?? '—'}</span> : '기부 회원',
          u.suspended ? <span key="s" className="badge status-rejected">이용중지</span> : <span key="s" className="badge status-approved">활성</span>,
          <UserRoleControls key="c" id={u.id} role={u.role} adminRole={u.admin_role} suspended={u.suspended} />
        ])}
        empty="조건에 맞는 회원이 없습니다." />
    </>
  );
}
