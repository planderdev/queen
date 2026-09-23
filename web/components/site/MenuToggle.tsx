'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

// Mobile menu button. Mirrors the demo behaviour: toggles body.menu-open and closes on Escape / route change.
export function MenuToggle({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); document.body.classList.remove('menu-open'); };
  }, [open]);
  return (
    <button className="menu-toggle" id="menu-toggle" type="button" aria-expanded={open} aria-controls="site-menu" aria-label={open ? '메뉴 닫기' : '메뉴 열기'} onClick={() => setOpen((v) => !v)}>
      {children}
    </button>
  );
}
