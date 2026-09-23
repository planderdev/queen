import Link from 'next/link';
import type { ReactNode } from 'react';
import { Info, Inbox, Search } from 'lucide-react';
import { money, percent, clampPct, daysLeft, statusNames, statusTone, brTitle } from '@/lib/format';
import { canDonate, total, type FundraiserCard } from '@/lib/data';
import { BookmarkButton } from '@/components/site/BookmarkButton';

export const Badge = ({ children, tone = '' }: { children: ReactNode; tone?: string }) => <span className={`badge ${tone}`}>{children}</span>;
export const State = ({ value }: { value: string }) => <Badge tone={statusTone[value] ?? 'lavender'}>{statusNames[value] ?? value}</Badge>;
export const Notice = ({ children }: { children: ReactNode }) => <div className="notice"><Info aria-hidden="true" /><span>{children}</span></div>;

export function Empty({ title = '아직 내역이 없어요', text = '새로운 나눔을 시작하면 이곳에서 확인할 수 있어요.', cta = true }: { title?: string; text?: string; cta?: boolean }) {
  return (
    <div className="empty">
      <Inbox aria-hidden="true" />
      <h3>{title}</h3>
      <p>{text}</p>
      {cta && <Link className="button secondary" href="/donate">모금함 둘러보기</Link>}
    </div>
  );
}

export const EmptyResult = () => (
  <div className="community-empty"><Search aria-hidden="true" /><h3>검색 결과가 없습니다</h3><p>다른 검색어나 분류를 선택해 주세요.</p></div>
);

export const Progress = ({ pct }: { pct: number }) => (
  <progress className="progress" max={100} value={clampPct(pct)} aria-label="목표 대비 달성률" aria-valuetext={`${pct}%`}>{pct}%</progress>
);

export function Tabs({ items, current, label = '하위 메뉴' }: { items: [string, string, string][]; current: string; label?: string }) {
  return (
    <nav className="tabs" aria-label={label}>
      {items.map(([id, text, href]) => <Link key={id} href={href} aria-current={current === id ? 'page' : undefined}>{text}</Link>)}
    </nav>
  );
}

export function Chips({ items, current, label = '분류 필터' }: { items: [string, string, string][]; current: string; label?: string }) {
  return (
    <nav className="filter-chips" aria-label={label}>
      {items.map(([id, text, href]) => <Link key={id} className="qm-chip" href={href} aria-current={current === id ? 'page' : undefined}>{text}</Link>)}
    </nav>
  );
}

export function Field({ label, name, type = 'text', defaultValue, help, error, children, ...rest }: { label: string; name: string; type?: string; defaultValue?: string | number; help?: string; error?: string; children?: ReactNode } & Record<string, unknown>) {
  return (
    <label className="field">
      <span>{label}</span>
      {children ?? <input id={name} name={name} type={type} defaultValue={defaultValue} aria-invalid={error ? true : undefined} {...rest} />}
      {help && <small className="help">{help}</small>}
      {error && <small className="help form-error">{error}</small>}
    </label>
  );
}

export function Select({ label, name, options, defaultValue, ...rest }: { label: string; name: string; options: ([string, string] | string)[]; defaultValue?: string } & Record<string, unknown>) {
  return (
    <label className="field">
      <span>{label}</span>
      <select id={name} name={name} defaultValue={defaultValue} {...rest}>
        {options.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; return <option key={v} value={v}>{l}</option>; })}
      </select>
    </label>
  );
}

export function Area({ label, name, defaultValue, ...rest }: { label: string; name: string; defaultValue?: string } & Record<string, unknown>) {
  return <label className="field"><span>{label}</span><textarea id={name} name={name} rows={5} defaultValue={defaultValue} {...rest} /></label>;
}

export function Title({ title, children }: { title: string; children?: ReactNode }) {
  return <>{brTitle(title).map((line, i) => <span key={i}>{i > 0 && <br />}{line}</span>)}{children}</>;
}

export function SectionTitle({ title, text }: { title: ReactNode; text?: ReactNode }) {
  return <div className="program-section-title"><h2>{title}</h2>{text && <p>{text}</p>}</div>;
}

export function FundCardView({ f, saved = false, bookmark }: { f: FundraiserCard; saved?: boolean; bookmark?: ReactNode }) {
  const amount = total(f.stats);
  const pct = percent(amount, f.target);
  const open = canDonate(f);
  return (
    <article className="fund-card">
      <Link href={`/donate/${f.slug}`} className="card-image">
        <img src={f.image ?? '/assets/images/fallback.svg'} alt={`${f.category} 활동 참고 이미지`} loading="lazy" width={600} height={400} />
        <span className={`image-badge ${open ? '' : 'ended'}`}>{open ? `D-${daysLeft(f.end_at)}` : '모금 종료'}</span>
      </Link>
      {bookmark ?? <BookmarkButton targetType="fundraiser" targetId={f.id} saved={saved} label={`${f.title.replace(/\n/g, ' ')} 관심 등록`} path="/donate" />}
      <div className="card-copy">
        <span className="category-label">{f.category}</span>
        <Link href={`/donate/${f.slug}`}><h3><Title title={f.title} /></h3></Link>
        <p className="org-label">{f.organization.name}</p>
        <Progress pct={pct} />
        <div className="card-numbers"><strong>{pct}%</strong><b>{money(amount)} <small>모금</small></b></div>
      </div>
    </article>
  );
}

export function Cards({ items, savedIds = [] }: { items: FundraiserCard[]; savedIds?: string[] }) {
  if (!items.length) return <Empty />;
  return <div className="card-grid">{items.map((f) => <FundCardView key={f.id} f={f} saved={savedIds.includes(f.id)} />)}</div>;
}

export function Table({ headers, rows, empty }: { headers: string[]; rows: ReactNode[][]; empty?: ReactNode }) {
  if (!rows.length) return <>{empty ?? <Empty title="표시할 내역이 없습니다" text="조건을 변경하거나 새로운 항목을 등록해주세요." cta={false} />}</>;
  return (
    <div className="table-wrap qm-scroll" tabIndex={0} role="region" aria-label="데이터 표, 좌우로 스크롤할 수 있습니다">
      <table><thead><tr>{headers.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody></table>
    </div>
  );
}

export function Pagination({ page, pages, href }: { page: number; pages: number; href: (n: number) => string }) {
  if (pages <= 1) return null;
  return (
    <nav className="pagination" aria-label="목록 페이지">
      {Array.from({ length: pages }, (_, i) => <Link key={i} className={`button ${i + 1 === page ? 'primary' : 'secondary'}`} href={href(i + 1)} aria-current={i + 1 === page ? 'page' : undefined}>{i + 1}</Link>)}
    </nav>
  );
}
