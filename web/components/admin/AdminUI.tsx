import type { ReactNode } from 'react';
import Link from 'next/link';
import { statusNames, statusTone } from '@/lib/format';
import type { SortDir } from '@/lib/admin-list';

const toneClass: Record<string, string> = { olive: 'status-approved', blue: 'status-received', lavender: 'status-draft', orange: 'status-pending', rose: 'status-rejected' };

// 페이지 머리: 분류(eyebrow) · 제목 · 설명 · 오른쪽 작업 버튼 — 신청자 명단 화면과 같은 구성
export function AdminTitle({ title, text, eyebrow, meta, children }: { title: string; text?: string; eyebrow?: string; meta?: ReactNode; children?: ReactNode }) {
  return (
    <header className="qa-head">
      <div className="qa-head-copy">
        {eyebrow && <p className="qa-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p className="qa-meta">{text ?? '목록을 검색하고 필요한 항목을 선택해 처리하세요.'}{meta}</p>
      </div>
      {children && <div className="qa-head-actions">{children}</div>}
    </header>
  );
}
export const AdminBadge = ({ value, tone, label }: { value: string; tone?: string; label?: string }) => <span className={`badge ${toneClass[tone ?? statusTone[value] ?? 'lavender']}`}>{label ?? statusNames[value] ?? value}</span>;

export type Col = string | { label: string; key?: string; className?: string };
export interface TableTabs { items: { value: string; label: string; count?: number }[]; current: string; href: (value: string) => string; label?: string }
export interface TableSearch { action: string; value: string; placeholder: string; hidden?: Record<string, string | undefined>; clearHref: string }
export interface TableSort { key: string; dir: SortDir; href: (key: string, dir: SortDir) => string }

// 목록 카드: 상태 탭 · 검색 · 정렬 머리글 · 빈 상태 · 하단 안내를 한 카드 안에
export function AdminTable({ headers, rows, empty = '표시할 내역이 없습니다.', tabs, search, sort, foot, rowClass }: {
  headers: Col[]; rows: ReactNode[][]; empty?: string; tabs?: TableTabs; search?: TableSearch; sort?: TableSort; foot?: ReactNode; rowClass?: (i: number) => string | undefined;
}) {
  const cols = headers.map((h) => (typeof h === 'string' ? { label: h } : h));
  const last = cols.length - 1;
  return (
    <section className="qa-board">
      {(tabs || search) && (
        <div className="qa-toolbar">
          {tabs ? <nav className="qa-tabs" aria-label={tabs.label ?? '상태'}>{tabs.items.map((t) => <Link key={t.value || 'all'} href={tabs.href(t.value)} aria-current={tabs.current === t.value ? 'page' : undefined}>{t.label}{t.count != null && <span>{t.count}</span>}</Link>)}</nav> : <span />}
          {search && (
            <form action={search.action} className="qa-search" role="search">
              {Object.entries(search.hidden ?? {}).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
              <i className="ri-search-line" aria-hidden="true"></i>
              <label className="sr-only" htmlFor="qa-q">검색</label>
              <input id="qa-q" name="q" type="search" defaultValue={search.value} placeholder={search.placeholder} />
              {search.value && <Link className="qa-search-clear" href={search.clearHref} aria-label="검색 지우기"><i className="ri-close-line" aria-hidden="true"></i></Link>}
            </form>
          )}
        </div>
      )}
      {rows.length ? (
        <div className="data-table-wrap admin-table-scroll qa-table-wrap" tabIndex={0} aria-label="관리 목록 · 가로 스크롤 가능">
          <table className="data-table qa-table">
            <thead><tr>{cols.map((c, i) => {
              const cls = [c.className, i === last && !c.key ? 'qa-col-actions' : ''].filter(Boolean).join(' ') || undefined;
              if (!c.key || !sort) return <th key={c.label + i} scope="col" className={cls}>{c.label}</th>;
              const active = sort.key === c.key;
              const next: SortDir = active && sort.dir === 'asc' ? 'desc' : 'asc';
              return (
                <th key={c.key} scope="col" className={cls} aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <Link className={`qa-sort${active ? ' is-active' : ''}`} href={sort.href(c.key, next)} title={`${c.label} ${next === 'asc' ? '오름차순' : '내림차순'} 정렬`}>{c.label}<i className={`ri-${active ? (sort.dir === 'asc' ? 'arrow-up-line' : 'arrow-down-line') : 'arrow-up-down-line'}`} aria-hidden="true"></i></Link>
                </th>
              );
            })}</tr></thead>
            <tbody>{rows.map((r, i) => <tr key={i} className={rowClass?.(i)}>{r.map((c, j) => <td key={j} className={j === last && !cols[j]?.key ? 'qa-col-actions' : cols[j]?.className}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
      ) : (
        <div className="qa-empty"><i className="ri-inbox-2-line" aria-hidden="true"></i><p>{empty}</p>{(search?.value || (tabs && tabs.current)) && <Link className="button small secondary" href={tabs?.href('') ?? search?.clearHref ?? '#'}>전체 보기</Link>}</div>
      )}
      {foot && <p className="qa-foot">{foot}</p>}
    </section>
  );
}

export function AdminNotice({ children }: { children: ReactNode }) { return <p className="qa-bank"><i className="ri-information-line" aria-hidden="true"></i> {children}</p>; }
