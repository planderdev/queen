import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import '../styles/admin/tokens.css';
import '../styles/admin/base.css';
import '../styles/admin/layout.css';
import '../styles/admin/components.css';
import '../styles/admin/controls.css';
import '../styles/admin/design-system.css';
import '../styles/admin/prose.css';
import '../styles/admin/admin-tokens.css';
import '../styles/admin/admin.css';
import '../styles/admin/admin-editor.css';
import '../styles/admin-overrides.css';
import { getSession } from '@/lib/auth';
import { hasSupabase } from '@/lib/env';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ToastProvider } from '@/components/site/Toast';
import { signOut } from '@/lib/actions/auth';

export const metadata: Metadata = { title: { default: '퀸만덕 운영 관리', template: '%s · 퀸만덕 운영 관리' }, robots: { index: false } };
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (hasSupabase && (!session || session.profile.role !== 'admin')) redirect('/my?denied=admin');
  return (
    <html lang="ko">
      <head><link rel="stylesheet" href="/assets/vendor/sports-admin/vendor/remixicon.css" /></head>
      <body data-page="admin">
        <a className="skip-link" href="#main">본문 바로가기</a>
        <ToastProvider>
          <header className="workspace-header admin-topbar">
            <Link className="workspace-brand" href="/admin"><strong>퀸만덕</strong><span>운영 관리</span></Link>
            <nav aria-label="관리자 상단 메뉴">
              <a className="admin-topbar-action" href="/" target="_blank" rel="noopener">사이트 보기 <i className="ri-external-link-line" aria-hidden="true"></i></a>
              <Link className="admin-topbar-action" href="/admin/inquiries">문의 관리</Link>
              <details className="admin-account"><summary className="admin-topbar-action">{session?.profile.name ?? '미리보기'}<i className="ri-arrow-down-s-line" aria-hidden="true"></i></summary>
                <div><span id="session-label">{session ? `${session.profile.name} · ${session.profile.admin_role ?? ''}` : '데이터베이스 연결 전'}</span><form action={signOut}><button type="submit">로그아웃</button></form></div></details>
            </nav>
          </header>
          <main id="main" tabIndex={-1}>
            <div className="admin-shell"><AdminSidebar adminRole={session?.profile.admin_role ?? 'super'} /><div className="admin-main">{children}</div></div>
          </main>
          <footer className="workspace-footer"><span>퀸만덕 · 관리자{!hasSupabase && ' · 미리보기 모드(데이터베이스 연결 전)'}</span></footer>
        </ToastProvider>
      </body>
    </html>
  );
}
