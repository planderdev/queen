import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { repo } from '@/lib/data';
import { date } from '@/lib/format';
import { PageBanner } from '@/components/site/PageBanner';
import { ShareButton } from '@/components/site/ShareButton';
import { BookmarkButton } from '@/components/site/BookmarkButton';
import { getSavedIds } from '@/lib/actions/bookmark';

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const c = await repo.getContent((await params).slug); return { title: c?.title ?? '나눔이야기' }; }

export default async function StoryPage({ params }: Props) {
  const item = await repo.getContent((await params).slug);
  if (!item || item.type !== 'story') notFound();
  const [all, saved] = await Promise.all([repo.listContent('story'), getSavedIds('story')]);
  const i = all.findIndex((x) => x.id === item.id);
  const fund = item.fundraiser_id ? await repo.getFundraiser(item.fundraiser_id) : null;
  const nav: [string, typeof item | undefined][] = [['이전 글', all[i - 1]], ['다음 글', all[i + 1]]];
  return (
    <>
      <PageBanner page="stories" />
      <div className="container community-page">
        <article className="community-article">
          <header><span className="community-kicker">{item.category ?? '나눔 소식'}</span><h2>{item.title}</h2><p>{date(item.created_at)} · 단체가 전한 활동 이야기</p></header>
          <div className="community-article-body">
            <img src={item.image ?? '/assets/images/community.jpg'} alt={`${item.category} 활동 참고 이미지`} width={1200} height={800} />
            <h3>여러분의 마음이 모여 만든 일상</h3>
            {item.body.split(/\n{2,}/).map((p, k) => <p key={k}>{p}</p>)}
            <p>나눔 이후에도 연결은 계속됩니다. 전달 내역과 결과보고는 관련 모금함에서 확인할 수 있습니다.</p>
            <div className="actions">
              {fund && <Link className="button primary" href={`/donate/${fund.slug}?view=news`}>관련 모금함과 결과보고</Link>}
              <BookmarkButton targetType="story" targetId={item.id} saved={saved.includes(item.id)} label="관심 이야기 저장" path={`/stories/${item.slug ?? item.id}`} className="button secondary" />
              <ShareButton />
            </div>
          </div>
        </article>
        <nav className="community-article-nav" aria-label="게시글 이동">
          {nav.map(([label, post]) => <div key={label}><span>{label}</span>{post ? <Link href={`/stories/${post.slug ?? post.id}`}>{post.title}</Link> : <span className="community-muted">게시글이 없습니다.</span>}</div>)}
        </nav>
        <div className="community-back"><Link className="button secondary" href="/stories">목록으로</Link></div>
      </div>
    </>
  );
}
