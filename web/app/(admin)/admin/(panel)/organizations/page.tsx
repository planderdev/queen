import { adminOrganizations } from '@/lib/data/admin';
import { repo } from '@/lib/data';
import { AdminTitle, AdminTable, AdminBadge } from '@/components/admin/AdminUI';
import { ActionForm } from '@/components/site/ActionForm';
import { saveOrganization } from '@/lib/actions/admin';

export const metadata = { title: '단체 관리' };

export default async function AdminOrganizationsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  const [rows, settings] = await Promise.all([adminOrganizations(), repo.settings()]);
  const o = rows.find((x) => x.id === edit);
  return (
    <>
      <AdminTitle title="단체 관리" text="단체를 등록하면 모금함과 정기기부 프로그램에서 선택할 수 있습니다." />
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
      <AdminTable headers={['단체', '분야', '소개', '상태', '작업']} rows={rows.map((x) => [<b key={x.id}>{x.name}</b>, x.category, x.description, <AdminBadge value={x.status} />, <a className="button small" href={`/admin/organizations?edit=${x.id}`}>수정</a>])} empty="등록된 단체가 없습니다." />
    </>
  );
}
