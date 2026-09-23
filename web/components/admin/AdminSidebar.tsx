'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const adminMenu: { id: string; title: string; icon: string; group: string; roles: string[] }[] = [
  { id: '', title: '운영 대시보드', icon: 'dashboard-line', group: '운영 현황', roles: ['super', 'content', 'review', 'finance'] },
  { id: 'donations', title: '기부 입금 확인', icon: 'receipt-line', group: '후원·정산', roles: ['super', 'finance'] },
  { id: 'refunds', title: '취소·환불 요청', icon: 'arrow-go-back-line', group: '후원·정산', roles: ['super', 'finance'] },
  { id: 'recurring', title: '정기기부 약정', icon: 'calendar-line', group: '후원·정산', roles: ['super', 'finance'] },
  { id: 'fundraisers', title: '모금함 관리', icon: 'hand-heart-line', group: '모금·단체', roles: ['super', 'review'] },
  { id: 'organizations', title: '단체 관리', icon: 'building-line', group: '모금·단체', roles: ['super', 'review'] },
  { id: 'content', title: '콘텐츠 관리', icon: 'layout-line', group: '콘텐츠·소통', roles: ['super', 'content'] },
  { id: 'moderation', title: '댓글 및 신고', icon: 'flag-line', group: '콘텐츠·소통', roles: ['super', 'content'] },
  { id: 'inquiries', title: '문의 관리', icon: 'mail-line', group: '콘텐츠·소통', roles: ['super', 'content', 'review', 'finance'] },
  { id: 'users', title: '회원·권한', icon: 'user-line', group: '설정', roles: ['super'] },
  { id: 'settings', title: '분야·지역·계좌', icon: 'settings-line', group: '설정', roles: ['super'] },
  { id: 'logs', title: '운영 이력', icon: 'history-line', group: '설정', roles: ['super', 'content', 'review', 'finance'] }
];

export function AdminSidebar({ adminRole }: { adminRole: string }) {
  const pathname = usePathname();
  const items = adminMenu.filter((m) => m.roles.includes(adminRole));
  const groups = [...new Set(items.map((m) => m.group))];
  const active = (id: string) => (id ? pathname.startsWith(`/admin/${id}`) : pathname === '/admin');
  return (
    <aside className="admin-sidebar">
      <div className="admin-favorites"><h2>업무 메뉴</h2></div>
      {groups.map((g) => (
        <details open key={g}><summary>{g}</summary><nav>
          {items.filter((m) => m.group === g).map((m) => (
            <div className="admin-menu-item" key={m.id}><Link href={`/admin/${m.id}`} aria-current={active(m.id) ? 'page' : undefined} title={m.title}><i className={`ri-${m.icon}`} aria-hidden="true"></i><span>{m.title}</span></Link></div>
          ))}
        </nav></details>
      ))}
    </aside>
  );
}
