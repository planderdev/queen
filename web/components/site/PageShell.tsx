import type { ReactNode } from 'react';
import { hasSupabase } from '@/lib/env';

export function PageShell({ header, footer, children }: { header: ReactNode; footer: ReactNode; children: ReactNode }) {
  return (
    <>
      {header}
      <main id="main" tabIndex={-1}>{children}</main>
      {footer}
      {!hasSupabase && <div className="seed-note" role="status">미리보기 모드 · 데이터베이스 연결 전이라 조회만 가능합니다</div>}
    </>
  );
}
