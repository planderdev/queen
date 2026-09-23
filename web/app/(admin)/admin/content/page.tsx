import { adminContent, adminContentItem, adminFundraisers } from '@/lib/data/admin';
import { date, flatTitle } from '@/lib/format';
import { AdminTitle, AdminTable } from '@/components/admin/AdminUI';
import { ActionForm } from '@/components/site/ActionForm';
import { ActionButton } from '@/components/admin/AdminActions';
import { saveContent, toggleContent } from '@/lib/actions/admin';
import { ContentTypeFields } from '@/components/admin/ContentTypeFields';

export const metadata = { title: '콘텐츠 관리' };
const typeNames: Record<string, string> = { notice: '공지사항', faq: 'FAQ', story: '나눔 스토리', news: '모금 소식', banner: '홈 배너', recommend: '추천 모금' };

export default async function AdminContentPage({ searchParams }: { searchParams: Promise<{ edit?: string; type?: string }> }) {
  const sp = await searchParams;
  const [rows, funds, item] = await Promise.all([adminContent(sp.type), adminFundraisers(), sp.edit ? adminContentItem(sp.edit) : null]);
  return (
    <>
      <AdminTitle title="콘텐츠 관리" text="공지, FAQ, 나눔 스토리, 모금 소식, 홈 배너, 추천 모금을 등록합니다." />
      <ActionForm action={saveContent} className="editor-section" submitLabel={item ? '수정 저장' : '콘텐츠 저장'} reset>
        {item && <input type="hidden" name="id" value={item.id} />}
        <ContentTypeFields item={item} fundraisers={funds.map((f) => [f.id, `${flatTitle(f.title)} · ${f.organization?.name ?? ''}`])} />
      </ActionForm>
      <form className="admin-filters" action="/admin/content"><select name="type" defaultValue={sp.type ?? ''} aria-label="유형"><option value="">전체 유형</option>{Object.entries(typeNames).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select><button className="button small primary" type="submit">조회</button></form>
      <AdminTable headers={['유형', '제목', '분류 / 연결', '등록일', '공개', '작업']} rows={rows.map((c) => [
        typeNames[c.type], c.title, c.fundraiser_id ? flatTitle(funds.find((f) => f.id === c.fundraiser_id)?.title ?? c.fundraiser_id) : c.category ?? '—', date(c.created_at),
        c.published ? <span className="badge status-approved">공개</span> : <span className="badge status-draft">비공개</span>,
        <div className="actions"><a className="button small" href={`/admin/content?edit=${c.id}`}>수정</a><ActionButton label={c.published ? '숨김' : '공개'} className="button small secondary" onRun={toggleContent.bind(null, c.id)} /></div>
      ])} empty="등록된 콘텐츠가 없습니다." />
    </>
  );
}
