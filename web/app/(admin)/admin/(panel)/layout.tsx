import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { hasSupabase } from '@/lib/env';
import { AdminMenuSearch, AdminSidebar } from '@/components/admin/AdminSidebar';
import { adminSignOut } from '@/lib/actions/auth';

// 운영 관리 셸. 관리자가 아니면 사이트가 아닌 관리자 로그인으로 보낸다 (proxy.ts와 이중 확인).
export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (hasSupabase && (!session || session.profile.role !== 'admin' || session.profile.suspended)) redirect(session ? '/admin/login?denied=1' : '/admin/login');
  return (
    <>
      <header className="workspace-header admin-topbar">
        <Link className="workspace-brand" href="/admin"><strong>퀸만덕</strong><span>운영 관리</span></Link>
        <AdminMenuSearch adminRole={session?.profile.admin_role ?? 'super'} />
        <nav aria-label="관리자 상단 메뉴">
          <a className="admin-topbar-action" href="/" target="_blank" rel="noopener">사이트 보기 <i className="ri-external-link-line" aria-hidden="true"></i></a>
          <Link className="admin-topbar-action" href="/admin/inquiries">문의 관리</Link>
          <details className="admin-account"><summary className="admin-topbar-action">{session?.profile.name ?? '미리보기'}<i className="ri-arrow-down-s-line" aria-hidden="true"></i></summary>
            <div><span id="session-label">{session ? `${session.profile.name} · ${session.profile.admin_role ?? ''}` : '데이터베이스 연결 전'}</span><form action={adminSignOut}><button type="submit">로그아웃</button></form></div></details>
        </nav>
      </header>
      <main id="main" tabIndex={-1}>
        <div className="admin-shell"><AdminSidebar adminRole={session?.profile.admin_role ?? 'super'} /><div className="admin-main">{children}</div></div>
      </main>
      <footer className="workspace-footer"><span>퀸만덕 · 관리자{!hasSupabase && ' · 미리보기 모드(데이터베이스 연결 전)'}</span></footer>
    </>
  );
}
