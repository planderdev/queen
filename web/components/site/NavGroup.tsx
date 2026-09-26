'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

// 주 메뉴 그룹. 데스크톱(마우스·1100px 이상)은 호버로 열고, 한 번에 하나만 열린다.
// 모바일 메뉴에서는 기존처럼 눌러서 펼친다. 바깥 클릭·Esc·페이지 이동 시 닫힌다.
const DESKTOP = '(min-width: 1100px) and (hover: hover)';

export function NavGroup({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const closeOthers = () => document.querySelectorAll<HTMLDetailsElement>('.nav-group[open]').forEach((d) => { if (d !== ref.current) d.open = false; });

  useEffect(() => { if (ref.current) ref.current.open = false; }, [pathname]);
  useEffect(() => {
    // 다른 메뉴 그룹을 누른 경우는 닫지 않는다: 먼저 닫히면 모바일에서 아래 메뉴가 위로 밀려 탭이 빗나간다. (전환은 onToggle의 closeOthers가 처리)
    const onDown = (e: PointerEvent) => { const t = e.target as Element; if (ref.current?.open && !ref.current.contains(t) && !t.closest?.('.nav-group')) ref.current.open = false; };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && ref.current?.open) { ref.current.open = false; ref.current.querySelector('summary')?.focus(); } };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); if (timer.current) clearTimeout(timer.current); };
  }, []);

  const isDesktop = () => window.matchMedia(DESKTOP).matches;
  return (
    <details
      ref={ref}
      className="nav-group"
      onToggle={(e) => { if ((e.currentTarget as HTMLDetailsElement).open) closeOthers(); }}
      onMouseEnter={() => { if (!isDesktop() || !ref.current) return; if (timer.current) clearTimeout(timer.current); closeOthers(); ref.current.open = true; }}
      onMouseLeave={() => { if (!isDesktop()) return; timer.current = setTimeout(() => { if (ref.current) ref.current.open = false; }, 160); }}
    >
      {/* 데스크톱 마우스 클릭은 호버로 이미 열린 메뉴를 닫지 않게 한다. 키보드(Enter·Space, detail 0)는 기본 토글 유지 */}
      <summary onClick={(e) => { if (isDesktop() && e.detail > 0) { e.preventDefault(); if (ref.current) { closeOthers(); ref.current.open = true; } } }}>{label}<ChevronDown aria-hidden="true" /></summary>
      {children}
    </details>
  );
}
