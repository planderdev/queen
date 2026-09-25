import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
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
import { ToastProvider } from '@/components/site/Toast';

// 관리자 영역 루트 레이아웃: 스타일과 토스트만 담당한다.
// 운영 화면 셸과 권한 확인은 admin/(panel)/layout.tsx, 관리자 로그인은 admin/login에 따로 있다.
export const metadata: Metadata = { title: { default: '퀸만덕 운영 관리', template: '%s · 퀸만덕 운영 관리' }, robots: { index: false, follow: false } };
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head><link rel="stylesheet" href="/assets/vendor/sports-admin/vendor/remixicon.css" /></head>
      <body data-page="admin">
        <a className="skip-link" href="#main">본문 바로가기</a>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
