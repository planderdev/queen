'use client';
import type { ReactNode } from 'react';

export function BackToTop({ children }: { children: ReactNode }) {
  return (
    <button type="button" id="back-to-top" aria-label="상단으로 이동" onClick={() => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}>
      {children}
    </button>
  );
}
