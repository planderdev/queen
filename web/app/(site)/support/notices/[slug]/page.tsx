import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { repo } from '@/lib/data';
import { date } from '@/lib/format';
import { PageBanner } from '@/components/site/PageBanner';
import { ShareButton } from '@/components/site/ShareButton';

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const c = await repo.getContent((await params).slug); return { title: c?.title ?? '공지사항' }; }

export default async function NoticePage({ params }: Props) {
  const item = await repo.getContent((await params).slug);
  if (!item || item.type !== 'notice') notFound();
  const all = await repo.listContent('notice');
  const i = all.findIndex((x) => x.id === item.id);
  const nav: [string, typeof item | undefined][] = [['이전 글', all[i - 1]], ['다음 글', all[i + 1]]];
  return (
    <>
      <PageBanner page="support" view="notices" />
      <div className="container community-page">
        <article className="community-article">
          <header><span className="community-kicker">공지사항</span><h2>{item.title}</h2><p>{date(item.created_at)}</p><div className="community-article-share"><ShareButton /></div></header>
          <div className="community-article-body">{item.body.split(/\n{2,}/).map((p, k) => <p key={k} style={{ whiteSpace: 'pre-line' }}>{p}</p>)}</div>
        </article>
        <nav className="community-article-nav" aria-label="게시글 이동">
          {nav.map(([label, post]) => <div key={label}><span>{label}</span>{post ? <Link href={`/support/notices/${post.slug ?? post.id}`}>{post.title}</Link> : <span className="community-muted">게시글이 없습니다.</span>}</div>)}
        </nav>
        <div className="community-back"><Link className="button secondary" href="/support?view=notices">목록으로</Link></div>
      </div>
    </>
  );
}
