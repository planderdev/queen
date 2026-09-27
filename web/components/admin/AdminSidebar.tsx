'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { SHOW_DONATIONS } from '@/lib/features';

// donation: true 인 메뉴는 lib/features.ts의 SHOW_DONATIONS가 꺼져 있으면 숨긴다(주소로는 계속 접근 가능)
const allAdminMenu: { id: string; title: string; icon: string; group: string; roles: string[]; keywords?: string; donation?: boolean }[] = [
  { id: '', title: '운영 대시보드', icon: 'dashboard-line', group: '운영 현황', roles: ['super', 'content', 'review', 'finance'] },
  { donation: true, id: 'donations', title: '기부 입금 확인', icon: 'receipt-line', group: '후원·정산', roles: ['super', 'finance'] },
  { donation: true, id: 'refunds', title: '취소·환불 요청', icon: 'arrow-go-back-line', group: '후원·정산', roles: ['super', 'finance'] },
  { donation: true, id: 'recurring', title: '정기기부 약정', icon: 'calendar-line', group: '후원·정산', roles: ['super', 'finance'] },
  { donation: true, id: 'fundraisers', title: '모금함 관리', icon: 'hand-heart-line', group: '모금·단체', roles: ['super', 'review'] },
  { donation: true, id: 'organizations', title: '단체 관리', icon: 'building-line', group: '모금·단체', roles: ['super', 'review'] },
  { id: 'campaigns', title: '캠페인·참가 신청', icon: 'run-line', group: '캠페인', roles: ['super', 'review'], keywords: '행사 기부런 참가비 입금 확인 신청자 명단' },
  { id: 'content', title: '콘텐츠 관리', icon: 'layout-line', group: '콘텐츠·소통', roles: ['super', 'content'] },
  { id: 'moderation', title: '댓글 및 신고', icon: 'flag-line', group: '콘텐츠·소통', roles: ['super', 'content'] },
  { id: 'inquiries', title: '문의 관리', icon: 'mail-line', group: '콘텐츠·소통', roles: ['super', 'content', 'review', 'finance'] },
  { id: 'users', title: '회원·권한', icon: 'user-line', group: '설정', roles: ['super'] },
  { id: 'settings', title: '분야·지역·계좌', icon: 'settings-line', group: '설정', roles: ['super'] },
  { id: 'logs', title: '운영 이력', icon: 'history-line', group: '설정', roles: ['super', 'content', 'review', 'finance'] }
];
export const adminMenu = allAdminMenu.filter((m) => SHOW_DONATIONS || !m.donation);

// 관리자 개인 설정(즐겨찾기·사이드바 접힘)은 이 브라우저에만 저장한다. 저장소가 막혀 있어도 화면은 그대로 동작한다.
const PREF_KEY = 'qm-admin-prefs';
type Prefs = { favorites: string[]; collapsed: boolean };
const readPrefs = (): Prefs => { try { const v = JSON.parse(localStorage.getItem(PREF_KEY) ?? '{}'); return { favorites: Array.isArray(v.favorites) ? v.favorites : [], collapsed: Boolean(v.collapsed) }; } catch { return { favorites: [], collapsed: false }; } };
const writePrefs = (p: Prefs) => { try { localStorage.setItem(PREF_KEY, JSON.stringify(p)); } catch { /* 저장 불가 환경은 무시 */ } };

export function AdminSidebar({ adminRole, account }: { adminRole: string; account?: ReactNode }) {
  const pathname = usePathname();
  const [prefs, setPrefs] = useState<Prefs>({ favorites: [], collapsed: false });
  useEffect(() => { setPrefs(readPrefs()); }, []);
  useEffect(() => { document.querySelector('.admin-shell')?.classList.toggle('sidebar-collapsed', prefs.collapsed); }, [prefs.collapsed]);
  const update = (next: Prefs) => { setPrefs(next); writePrefs(next); };
  const items = adminMenu.filter((m) => m.roles.includes(adminRole));
  const groups = [...new Set(items.map((m) => m.group))];
  const favorites = items.filter((m) => prefs.favorites.includes(m.id || 'dashboard'));
  const active = (id: string) => (id ? pathname.startsWith(`/admin/${id}`) : pathname === '/admin');
  const key = (id: string) => id || 'dashboard';
  const toggleFavorite = (id: string) => update({ ...prefs, favorites: prefs.favorites.includes(key(id)) ? prefs.favorites.filter((f) => f !== key(id)) : [...prefs.favorites, key(id)] });
  const link = (m: (typeof adminMenu)[number]) => <Link href={`/admin/${m.id}`} aria-current={active(m.id) ? 'page' : undefined} title={m.title}><i className={`ri-${m.icon}`} aria-hidden="true"></i><span>{m.title}</span></Link>;
  return (
    <aside id="admin-drawer" className={`admin-sidebar${prefs.collapsed ? ' is-collapsed' : ''}`}>
      <button type="button" className="admin-collapse" aria-expanded={!prefs.collapsed} aria-label={prefs.collapsed ? '사이드바 펼치기' : '사이드바 접기'} onClick={() => update({ ...prefs, collapsed: !prefs.collapsed })}><i className="ri-side-bar-line" aria-hidden="true"></i><span>업무 메뉴</span></button>
      <div className="admin-favorites"><h2>즐겨찾기</h2>
        {favorites.length ? favorites.map((m) => <div className="admin-menu-item" key={m.id}>{link(m)}</div>) : <small>별표로 메뉴를 추가하세요.</small>}
      </div>
      {groups.map((g) => (
        <details open key={g}><summary>{g}</summary><nav>
          {items.filter((m) => m.group === g).map((m) => {
            const on = prefs.favorites.includes(key(m.id));
            return <div className="admin-menu-item" key={m.id}>{link(m)}<button type="button" aria-pressed={on} aria-label={`${m.title} 즐겨찾기${on ? ' 해제' : ''}`} onClick={() => toggleFavorite(m.id)}><i className={`ri-star-${on ? 'fill' : 'line'}`} aria-hidden="true"></i></button></div>;
          })}
        </nav></details>
      ))}
      {account && <div className="admin-drawer-account">{account}</div>}
    </aside>
  );
}

// 상단 업무 메뉴 검색: 그룹명·메뉴명으로 찾고 Enter로 첫 결과, Esc로 닫기
export function AdminMenuSearch({ adminRole }: { adminRole: string }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const q = query.trim();
  const results = q ? adminMenu.filter((m) => m.roles.includes(adminRole) && `${m.group} ${m.title} ${m.keywords ?? ''}`.includes(q)) : [];
  const go = (id: string) => { setQuery(''); router.push(`/admin/${id}`); };
  return (
    <div className="admin-menu-search">
      <label className="sr-only" htmlFor="admin-menu-search">메뉴 검색</label>
      <input id="admin-menu-search" type="search" placeholder="업무 메뉴 검색" autoComplete="off" value={query} role="combobox" aria-expanded={Boolean(q)} aria-controls="admin-menu-results"
        onChange={(e) => { setQuery(e.target.value); setCursor(0); }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setQuery('');
          if (e.key === 'ArrowDown' && results.length) { e.preventDefault(); setCursor((c) => (c + 1) % results.length); }
          if (e.key === 'ArrowUp' && results.length) { e.preventDefault(); setCursor((c) => (c - 1 + results.length) % results.length); }
          if (e.key === 'Enter' && results[cursor]) { e.preventDefault(); go(results[cursor].id); }
        }} />
      {q && (
        <div id="admin-menu-results" role="listbox">
          {results.length ? results.map((m, i) => <a key={m.id} href={`/admin/${m.id}`} role="option" aria-selected={i === cursor} onClick={(e) => { e.preventDefault(); go(m.id); }}>{m.group} / {m.title}</a>) : <p>일치하는 메뉴가 없습니다.</p>}
        </div>
      )}
    </div>
  );
}

// 모바일(768px 이하) 메뉴 버튼: 사이드바를 서랍처럼 연다. 페이지 이동·배경 클릭·Esc로 닫힌다.
export function AdminDrawerToggle() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.classList.toggle('admin-drawer-open', open);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); document.body.classList.remove('admin-drawer-open'); };
  }, [open]);
  return (
    <>
      <button type="button" className="admin-drawer-toggle" aria-expanded={open} aria-controls="admin-drawer" aria-label={open ? '메뉴 닫기' : '메뉴 열기'} onClick={() => setOpen((v) => !v)}><i className={open ? 'ri-close-line' : 'ri-menu-line'} aria-hidden="true"></i></button>
      {open && <div className="admin-drawer-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />}
    </>
  );
}
