import { adminOrganizations } from '@/lib/data/admin';
import { repo } from '@/lib/data';
import { AdminTitle, AdminTable, AdminBadge } from '@/components/admin/AdminUI';
import { ActionForm } from '@/components/site/ActionForm';
import { saveOrganization } from '@/lib/actions/admin';
import { includesQ, listState, sortRows, type ListParams } from '@/lib/admin-list';

export const metadata = { title: '단체 관리' };

export default async function AdminOrganizationsPage({ searchParams }: { searchParams: Promise<ListParams & { edit?: string }> }) {
  const sp = await searchParams;
  const edit = sp.edit;
  const s = listState('/admin/organizations', sp, { sort: 'name', dir: 'asc' });
  const [rows, settings] = await Promise.all([adminOrganizations(), repo.settings()]);
  const o = rows.find((x) => x.id === edit);
  const keys: Record<string, (r: (typeof rows)[number]) => string> = { name: (r) => r.name, category: (r) => r.category, status: (r) => r.status };
  const list = sortRows(rows.filter((r) => (!s.tab || r.status === s.tab) && includesQ(s.q, r.name, r.category)), keys[s.sort], s.dir);
  return (
    <>
      <AdminTitle eyebrow="모금·단체" title="단체 관리" text="단체를 등록하면 모금함과 정기기부 프로그램에서 선택할 수 있습니다.">{o && <a className="button small secondary" href="/admin/organizations">새 단체 등록으로</a>}</AdminTitle>
      <h2 className="qa-section-title">{o ? `‘${o.name}’ 수정` : '새 단체 등록'}</h2>
      <ActionForm action={saveOrganization} className="editor-section" submitLabel={o ? '수정 저장' : '단체 등록'} reset>
        {o && <input type="hidden" name="id" value={o.id} />}
        <div className="field-grid">
          <label className="field"><span>단체명</span><input name="name" defaultValue={o?.name ?? ''} required /></label>
          <label className="field"><span>분야</span><select name="category" defaultValue={o?.category ?? settings.categories[0]}>{settings.categories.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
          <label className="field"><span>슬러그 (URL)</span><input name="slug" defaultValue={o?.slug ?? ''} placeholder="비우면 단체명에서 생성" /></label>
          <label className="field"><span>대표 이미지 URL</span><input name="image" defaultValue={o?.image ?? '/assets/images/community.jpg'} /></label>
          <label className="field"><span>상태</span><select name="status" defaultValue={o?.status ?? 'approved'}><option value="approved">승인(공개)</option><option value="submitted">검토 요청</option><option value="rejected">반려</option><option value="draft">비공개</option></select></label>
        </div>
        <label className="field"><span>소개</span><textarea name="description" rows={4} defaultValue={o?.description ?? ''} /></label>
      </ActionForm>
      <h2 className="qa-section-title">등록된 단체</h2>
      <AdminTable
        tabs={{ items: [['', '전체'], ['approved', '공개'], ['submitted', '검토 요청'], ['draft', '비공개'], ['rejected', '반려']].map(([v, l]) => ({ value: v, label: l, count: v ? rows.filter((r) => r.status === v).length : rows.length })).filter((t) => !t.value || t.count), current: s.tab, href: (v) => s.href({ tab: v }) }}
        search={{ action: '/admin/organizations', value: s.q, placeholder: '단체명·분야', hidden: { tab: s.tab }, clearHref: s.href({ q: '' }) }}
        sort={{ key: s.sort, dir: s.dir, href: (k, d) => s.href({ sort: k, dir: d }) }}
        headers={[{ label: '단체', key: 'name' }, { label: '분야', key: 'category' }, '소개', { label: '상태', key: 'status' }, '처리']}
        rows={list.map((x) => [<b key={x.id}>{x.name}</b>, <span key="c" className="qa-nowrap">{x.category}</span>, <span key="d" className="qa-clamp">{x.description}</span>, <AdminBadge key="s" value={x.status} />, <a key="e" className="button small secondary" href={`/admin/organizations?edit=${x.id}`}>수정</a>])}
        rowClass={(i) => (list[i].id === edit ? 'is-editing' : undefined)}
        empty="조건에 맞는 단체가 없습니다." />
    </>
  );
}
