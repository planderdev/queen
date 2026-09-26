import { adminReports } from '@/lib/data/admin';
import { dateTime } from '@/lib/format';
import { AdminTitle, AdminTable, AdminBadge } from '@/components/admin/AdminUI';
import { ReasonAction } from '@/components/admin/AdminActions';
import { moderateComment } from '@/lib/actions/admin';
import { includesQ, listState, sortRows, type ListParams } from '@/lib/admin-list';

export const metadata = { title: '댓글 및 신고' };

export default async function AdminModerationPage({ searchParams }: { searchParams: Promise<ListParams> }) {
  const s = listState('/admin/moderation', await searchParams, { sort: 'created', dir: 'desc' });
  const all = await adminReports();
  const keys: Record<string, (r: (typeof all)[number]) => string> = { created: (r) => r.created_at, status: (r) => r.status };
  const rows = sortRows(all.filter((r) => (!s.tab || r.status === s.tab) && includesQ(s.q, r.comment?.body, r.reason, r.profile?.name)), keys[s.sort], s.dir);
  return (
    <>
      <AdminTitle eyebrow="콘텐츠·소통" title="댓글 및 신고" text="숨김 처리하면 공개 화면에서 즉시 사라집니다. 처리 사유는 운영 이력에 남습니다." />
      <AdminTable
        tabs={{ items: [['', '전체'], ['requested', '검토 대기'], ['resolved', '처리 완료']].map(([v, l]) => ({ value: v, label: l, count: v ? all.filter((r) => r.status === v).length : all.length })), current: s.tab, href: (v) => s.href({ tab: v }) }}
        search={{ action: '/admin/moderation', value: s.q, placeholder: '댓글 내용·사유·신고자', hidden: { tab: s.tab }, clearHref: s.href({ q: '' }) }}
        sort={{ key: s.sort, dir: s.dir, href: (k, d) => s.href({ sort: k, dir: d }) }}
        rowClass={(i) => (rows[i].status === 'requested' ? 'is-pending' : undefined)}
        headers={[{ label: '신고일', key: 'created' }, '신고 댓글', '신고자', '사유', { label: '상태', key: 'status' }, '처리']}
        rows={rows.map((r) => [
          <span key="t" className="qa-nowrap">{dateTime(r.created_at)}</span>, <><span className="qa-clamp">{r.comment?.body ?? '(삭제된 댓글)'}</span>{r.comment?.hidden && <small>현재 숨김</small>}</>, r.profile?.name ?? '—', r.reason, <AdminBadge key="s" value={r.status} label={r.status === 'requested' ? '검토 대기' : undefined} />,
          r.status === 'requested' ? <span key="x" className="qa-actions"><ReasonAction label="숨김" onRun={(reason) => moderateComment(r.id, true, reason)} /><ReasonAction label="유지" className="button small secondary" onRun={(reason) => moderateComment(r.id, false, reason)} /></span> : <small key="x">{r.resolution}</small>
        ])}
        empty="조건에 맞는 신고가 없습니다." />
    </>
  );
}
