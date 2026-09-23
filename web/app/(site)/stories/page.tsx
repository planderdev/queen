import Link from 'next/link';
import type { Metadata } from 'next';
import { Search } from 'lucide-react';
import { repo } from '@/lib/data';
import { date } from '@/lib/format';
import { PageBanner } from '@/components/site/PageBanner';
import { EmptyResult, Tabs } from '@/components/ui';
import { CommunityPagination } from '@/components/site/CommunityPagination';

export const metadata: Metadata = { title: '나눔이야기' };

export default async function StoriesPage({ searchParams }: { searchParams: Promise<{ category?: string; search?: string; page?: string }> }) {
  const sp = await searchParams;
  const category = sp.category ?? '', search = (sp.search ?? '').trim();
  const all = await repo.listContent('story');
  const cats = [...new Set(all.map((c) => c.category ?? '나눔 소식'))];
  const filtered = all.filter((c) => (!category || (c.category ?? '나눔 소식') === category) && (!search || `${c.title} ${c.body}`.toLocaleLowerCase('ko').includes(search.toLocaleLowerCase('ko'))));
  const per = 9, pages = Math.max(1, Math.ceil(filtered.length / per)), page = Math.min(pages, Math.max(1, Number(sp.page) || 1));
  const items = filtered.slice((page - 1) * per, page * per);
  const url = (v: Record<string, string>) => `/stories?${new URLSearchParams(Object.entries({ category, search, ...v }).filter(([, x]) => x))}`;
  return (
    <>
      <PageBanner page="stories" />
      <div className="container community-page">
        <Tabs items={[['', '전체', url({ category: '' })], ...cats.map((c) => [c, c, url({ category: c })] as [string, string, string])]} current={category} label="게시물 분류" />
        <div className="community-toolbar"><p>전체 <strong>{filtered.length}</strong>건</p>
          <form className="community-search" action="/stories" role="search"><input type="hidden" name="category" value={category} /><label><span className="qm-sr-only">제목 또는 내용 검색</span><input type="search" name="search" defaultValue={search} placeholder="검색어를 입력해 주세요" /></label><button type="submit" aria-label="검색"><Search aria-hidden="true" /></button></form></div>
        <div className="community-story-grid">
          {items.map((c) => (
            <article className="community-story-card" key={c.id}><Link href={`/stories/${c.slug ?? c.id}`}>
              <div className="community-story-image"><img src={c.image ?? '/assets/images/community.jpg'} alt={`${c.category} 활동 참고 이미지`} loading="lazy" width={600} height={400} /></div>
              <div className="community-story-copy"><span className="community-kicker">{c.category ?? '나눔 소식'}</span><h2>{c.title}</h2><p className="community-muted">{date(c.created_at)}</p></div>
            </Link></article>
          ))}
        </div>
        {!filtered.length && <EmptyResult />}
        <CommunityPagination page={page} pages={pages} href={(n) => url({ page: String(n) })} />
      </div>
    </>
  );
}
