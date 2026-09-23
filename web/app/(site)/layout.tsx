import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '../styles/tokens.css';
import '../styles/app.css';
import '../styles/site.css';
import '../styles/home.css';
import '../styles/community.css';
import '../styles/programs.css';
import '../styles/overrides.css';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { PageShell } from '@/components/site/PageShell';
import { ToastProvider } from '@/components/site/Toast';

export const metadata: Metadata = {
  title: { default: '퀸만덕 · 작은 나눔, 더 큰 변화', template: '%s · 퀸만덕' },
  description: '마음이 닿는 이야기를 만나고, 그 다음의 변화까지 함께하세요. 퀸만덕 기부 플랫폼.'
};
export const viewport: Viewport = { themeColor: '#d73b50', width: 'device-width', initialScale: 1 };

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css" />
      </head>
      <body className="public-site">
        <a className="skip" href="#main">본문 바로가기</a>
        <ToastProvider><PageShell header={<Header page="" />} footer={<Footer />}>{children}</PageShell></ToastProvider>
      </body>
    </html>
  );
}
