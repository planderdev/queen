'use client';
import { Share2 } from 'lucide-react';
import { useToast } from './Toast';

export function ShareButton({ className = 'button secondary' }: { className?: string }) {
  const toast = useToast();
  return (
    <button type="button" className={className} onClick={async () => {
      const url = location.origin + location.pathname;
      try { await navigator.clipboard.writeText(url); toast('공유 링크를 복사했습니다.'); }
      catch { window.prompt('공유 링크', url); }
    }}><Share2 aria-hidden="true" /> 공유</button>
  );
}
