import { adminLogs } from '@/lib/data/admin';
import { dateTime } from '@/lib/format';
import { AdminTitle, AdminTable } from '@/components/admin/AdminUI';
import { includesQ, listState, sortRows, type ListParams } from '@/lib/admin-list';

export const metadata = { title: '운영 이력' };

export default async function AdminLogsPage({ searchParams }: { searchParams: Promise<ListParams> }) {
  const s = listState('/admin/logs', await searchParams, { sort: 'created', dir: 'desc' });
  const all = await adminLogs();
  const keys: Record<string, (r: (typeof all)[number]) => string> = { created: (r) => r.created_at, actor: (r) => r.actor_name ?? '', action: (r) => r.action };
  const rows = sortRows(all.filter((r) => includesQ(s.q, r.action, r.actor_name, r.target_type, JSON.stringify(r.detail ?? ''))), keys[s.sort], s.dir);
  const detail = (d: unknown) => (d && typeof d === 'object' ? Object.entries(d as Record<string, unknown>).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`).join(' · ') : '');
  return (
    <>
      <AdminTitle eyebrow="설정" title="운영 이력" text="관리자가 처리한 작업이 순서대로 기록됩니다. 기록은 수정할 수 없습니다." />
      <AdminTable
        search={{ action: '/admin/logs', value: s.q, placeholder: '작업·작업자·내용', clearHref: s.href({ q: '' }) }}
        sort={{ key: s.sort, dir: s.dir, href: (k, d) => s.href({ sort: k, dir: d }) }}
        headers={[{ label: '일시', key: 'created' }, { label: '작업자', key: 'actor' }, { label: '작업', key: 'action' }, '대상', '상세']}
        rows={rows.map((l) => [<span key="t" className="qa-nowrap">{dateTime(l.created_at)}</span>, l.actor_name ?? '—', <b key="a">{l.action}</b>, <span key="g" className="qa-nowrap">{l.target_type ?? '—'}</span>, <span key="d" className="qa-clamp qa-mono">{detail(l.detail)}</span>])}
        empty="조건에 맞는 운영 이력이 없습니다."
        foot={`${rows.length}건 표시`} />
    </>
  );
}
