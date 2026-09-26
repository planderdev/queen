import type { ReactNode } from 'react';
import { statusNames, statusTone } from '@/lib/format';

const toneClass: Record<string, string> = { olive: 'status-approved', blue: 'status-received', lavender: 'status-draft', orange: 'status-pending', rose: 'status-rejected' };

export function AdminTitle({ title, text, children }: { title: string; text?: string; children?: ReactNode }) {
  return <div className="admin-title"><div><h1>{title}</h1><p>{text ?? '목록을 검색하고 필요한 항목을 선택해 처리하세요.'}</p></div>{children}</div>;
}
export const AdminBadge = ({ value, tone, label }: { value: string; tone?: string; label?: string }) => <span className={`badge ${toneClass[tone ?? statusTone[value] ?? 'lavender']}`}>{label ?? statusNames[value] ?? value}</span>;

export function AdminTable({ headers, rows, empty = '표시할 내역이 없습니다.' }: { headers: string[]; rows: ReactNode[][]; empty?: string }) {
  if (!rows.length) return <section className="admin-dashboard-section"><p className="muted">{empty}</p></section>;
  return (
    <section className="admin-data-card"><div className="data-table-wrap admin-table-scroll" tabIndex={0} aria-label="관리 목록 · 가로 스크롤 가능">
      <table className="data-table"><thead><tr>{headers.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody></table>
    </div></section>
  );
}

export function AdminNotice({ children }: { children: ReactNode }) { return <section className="admin-dashboard-section"><p>{children}</p></section>; }
