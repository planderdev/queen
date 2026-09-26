'use client';
import { Share2 } from 'lucide-react';
import { useToast } from './Toast';

// 공유: 휴대폰은 기본 공유 시트(카카오톡·문자 등), 지원하지 않으면 링크 복사, 그것도 막히면 링크를 보여 준다.
export function ShareButton({ className = 'button secondary', label = '공유', title, text, path, iconOnly = false }: { className?: string; label?: string; title?: string; text?: string; path?: string; iconOnly?: boolean }) {
  const toast = useToast();
  return (
    <button type="button" className={className} onClick={async () => {
      const url = location.origin + (path ?? location.pathname);
      if (navigator.share) {
        try { await navigator.share({ title: title ?? document.title, text, url }); return; }
        catch (e) { if ((e as DOMException)?.name === 'AbortError') return; }
      }
      try { await navigator.clipboard.writeText(url); toast('공유 링크를 복사했습니다. 원하는 곳에 붙여넣어 주세요.'); }
      catch { window.prompt('아래 링크를 복사해 공유해주세요', url); }
    }} aria-label={iconOnly ? `${title ?? ''} ${label}`.trim() : undefined} title={iconOnly ? label : undefined}><Share2 aria-hidden="true" />{!iconOnly && <> {label}</>}</button>
  );
}
