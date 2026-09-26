import { adminContent, adminContentItem, adminFundraisers } from '@/lib/data/admin';
import { date, flatTitle } from '@/lib/format';
import { AdminTitle, AdminTable } from '@/components/admin/AdminUI';
import { ActionForm } from '@/components/site/ActionForm';
import { ActionButton } from '@/components/admin/AdminActions';
import { saveContent, toggleContent } from '@/lib/actions/admin';
import { ContentTypeFields } from '@/components/admin/ContentTypeFields';
import { includesQ, listState, sortRows, type ListParams } from '@/lib/admin-list';

export const metadata = { title: '콘텐츠 관리' };
const typeNames: Record<string, string> = { notice: '공지사항', faq: 'FAQ', story: '나눔 스토리', news: '모금 소식', banner: '홈 배너', recommend: '추천 모금' };

export default async function AdminContentPage({ searchParams }: { searchParams: Promise<ListParams & { edit?: string; type?: string }> }) {
  const sp = await searchParams;
  const s = listState('/admin/content', { ...sp, tab: sp.tab ?? sp.type }, { sort: 'created', dir: 'desc' });
  const [rows, funds, item] = await Promise.all([adminContent(), adminFundraisers(), sp.edit ? adminContentItem(sp.edit) : null]);
  const keys: Record<string, (r: (typeof rows)[number]) => string | number> = { created: (r) => r.created_at, title: (r) => r.title, type: (r) => typeNames[r.type] ?? r.type, published: (r) => (r.published ? 0 : 1) };
  const list = sortRows(rows.filter((r) => (!s.tab || r.type === s.tab) && includesQ(s.q, r.title, r.category)), keys[s.sort], s.dir);
  return (
    <>
      <AdminTitle eyebrow="콘텐츠·소통" title="콘텐츠 관리" text="공지, FAQ, 나눔 스토리, 모금 소식, 홈 배너, 추천 모금을 등록합니다.">{item && <a className="button small secondary" href="/admin/content">새 콘텐츠 작성으로</a>}</AdminTitle>
      <h2 className="qa-section-title">{item ? `‘${item.title}’ 수정` : '새 콘텐츠'}</h2>
      <ActionForm action={saveContent} className="editor-section" submitLabel={item ? '수정 저장' : '콘텐츠 저장'} reset>
        {item && <input type="hidden" name="id" value={item.id} />}
        <ContentTypeFields item={item} fundraisers={funds.map((f) => [f.id, `${flatTitle(f.title)} · ${f.organization?.name ?? ''}`])} />
      </ActionForm>
      <h2 className="qa-section-title">등록된 콘텐츠</h2>
      <AdminTable
        tabs={{ items: [['', '전체'], ...Object.entries(typeNames)].map(([v, l]) => ({ value: v, label: l, count: v ? rows.filter((r) => r.type === v).length : rows.length })), current: s.tab, href: (v) => s.href({ tab: v }), label: '콘텐츠 유형' }}
        search={{ action: '/admin/content', value: s.q, placeholder: '제목·분류', hidden: { tab: s.tab }, clearHref: s.href({ q: '' }) }}
        sort={{ key: s.sort, dir: s.dir, href: (k, d) => s.href({ sort: k, dir: d }) }}
        headers={[{ label: '유형', key: 'type' }, { label: '제목', key: 'title' }, '분류 / 연결', { label: '등록일', key: 'created' }, { label: '공개', key: 'published' }, '처리']}
        rowClass={(i) => (list[i].id === sp.edit ? 'is-editing' : undefined)}
        rows={list.map((c) => [
          <span key="t" className="qa-nowrap">{typeNames[c.type]}</span>, <b key="n">{c.title}</b>, c.fundraiser_id ? flatTitle(funds.find((f) => f.id === c.fundraiser_id)?.title ?? c.fundraiser_id) : c.category ?? '—', <span key="d" className="qa-nowrap">{date(c.created_at)}</span>,
          c.published ? <span key="p" className="badge status-approved">공개</span> : <span key="p" className="badge status-draft">비공개</span>,
          <span key="x" className="qa-actions"><a className="button small secondary" href={`/admin/content?edit=${c.id}`}>수정</a><ActionButton label={c.published ? '숨김' : '공개'} className="button small ghost" onRun={toggleContent.bind(null, c.id)} /></span>
        ])}
        empty="조건에 맞는 콘텐츠가 없습니다." />
    </>
  );
}
