import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Building2 } from 'lucide-react';
import { repo, canDonate, total } from '@/lib/data';
import { getSession } from '@/lib/auth';
import { money, percent, date, daysLeft, flatTitle } from '@/lib/format';
import { PageBanner } from '@/components/site/PageBanner';
import { Badge, Empty, Progress, Table, Tabs, Title, Area, Notice } from '@/components/ui';
import { BookmarkButton } from '@/components/site/BookmarkButton';
import { ShareButton } from '@/components/site/ShareButton';
import { ActionForm } from '@/components/site/ActionForm';
import { addComment } from '@/lib/actions/community';
import { getSavedIds } from '@/lib/actions/bookmark';
import { ReportButton } from '@/components/site/ReportButton';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ view?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const f = await repo.getFundraiser((await params).slug);
  return { title: f ? flatTitle(f.title) : '모금함' };
}

export default async function FundraiserPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { view = 'story' } = await searchParams;
  const f = await repo.getFundraiser(slug);
  if (!f) notFound();
  const [org, session, saved] = await Promise.all([repo.getOrganization(f.organization_id), getSession(), getSavedIds('fundraiser')]);
  const amount = total(f.stats), pct = percent(amount, f.target), open = canDonate(f);
  const base = `/donate/${f.slug}`;
  let content: React.ReactNode = null;
  if (view === 'story') content = (
    <>
      <div className="article-body">
        <h2>작은 마음이 모이면,<br />평범한 하루를 지킬 수 있어요.</h2>
        {f.story.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
        <h2>소중한 마음, 이렇게 전하겠습니다</h2>
        <p>함께 보내주신 마음은 필요한 물품과 활동 지원에 사용됩니다. 전달 이후 소식과 결과보고를 이 모금함에 공개하겠습니다.</p>
      </div>
      <Table headers={['사용 계획', '예산']} rows={f.budget.map((b) => [b.label, money(b.amount)])} />
      <div className="notice">목표 {money(f.target)} · 사용 계획 합계 {money(f.budget.reduce((a, b) => a + b.amount, 0))}</div>
    </>
  );
  if (view === 'donors') {
    const donors = await repo.publicDonations(f.id);
    content = <Table headers={['참여자', '기부금액', '응원 메시지']} rows={donors.map((d) => [d.anonymous || !d.donor_name ? '익명의 기부자' : d.donor_name, money(d.amount), d.message])} empty={<Empty title="아직 참여 내역이 없어요" text="첫 번째 마음을 전해주세요." cta={false} />} />;
  }
  if (view === 'news') {
    const [news, reports] = await Promise.all([repo.newsOf(f.id), repo.impactReportsOf(f.id)]);
    content = news.length || reports.length ? (
      <>
        {reports.map((r) => (
          <article className="panel" key={r.id}><Badge tone="olive">승인된 결과보고</Badge><h2>{r.title}</h2><p>{date(r.created_at)}</p>
            <div className="stat-grid">{[['모금액', amount], ['지급액', f.stats.paid], ['집행액', r.spent], ['미집행 잔액', f.stats.paid - r.spent]].map(([k, v]) => <div className="stat" key={k as string}><span>{k}</span><strong>{money(v as number)}</strong></div>)}</div>
            <p className="article-body">{r.body}</p></article>
        ))}
        {news.map((n) => <div className="panel" key={n.id}><h2>{n.title}</h2><p className="help">{date(n.created_at)}</p><p>{n.body}</p></div>)}
      </>
    ) : <Empty title="아직 공개된 소식이 없어요" text="단체가 전하는 소식과 결과보고가 이곳에 공개됩니다." cta={false} />;
  }
  if (view === 'comments') {
    const comments = await repo.comments(f.id);
    content = (
      <>
        {session ? (
          <ActionForm action={addComment} submitLabel="응원 남기기" reset>
            <input type="hidden" name="fundraiser_id" value={f.id} /><input type="hidden" name="path" value={`${base}?view=comments`} />
            <Area label="따뜻한 응원의 한마디" name="body" maxLength={200} required placeholder="서로를 존중하는 마음으로 응원해주세요." />
            <p className="help">댓글은 금전 기부로 환산되지 않습니다.</p>
          </ActionForm>
        ) : <Notice>로그인하면 응원 댓글을 남길 수 있어요. <Link href={`/auth/login?next=${encodeURIComponent(`${base}?view=comments`)}`}>로그인</Link></Notice>}
        {comments.length ? comments.map((c) => (
          <div className="comment" key={c.id}><b>{c.author_name ?? '기부자'}</b><p>{c.body}</p><div className="actions"><small>{date(c.created_at)}</small><ReportButton commentId={c.id} /></div></div>
        )) : <Empty title="아직 응원 댓글이 없어요" text="첫 응원을 남겨주세요." cta={false} />}
      </>
    );
  }
  return (
    <>
      <PageBanner page="donate" />
      <div className="container detail-layout">
        <article className="detail-story">
          <div className="breadcrumb"><Link href="/donate">기부하기</Link> / {f.category}</div>
          <Badge tone="olive">{f.category}</Badge> <span className="muted">{org?.name}</span>
          <h1><Title title={f.title} /></h1>
          <img className="detail-cover" src={f.image ?? '/assets/images/fallback.svg'} alt={`${f.category} 활동 사진`} width={730} height={440} />
          <p className="article-caption">단체가 제공한 활동 사진입니다.</p>
          <Tabs items={[['story', '모금 이야기', base], ['donors', '참여 내역', `${base}?view=donors`], ['news', '소식·결과보고', `${base}?view=news`], ['comments', '응원 댓글', `${base}?view=comments`]]} current={view} />
          {content}
          {org && <div className="panel"><h3>{org.name}</h3><p>{org.description}</p><Link className="button secondary" href={`/organizations/${org.slug}`}>단체 소개 보기</Link></div>}
        </article>
        <aside className="donation-summary">
          <Badge tone={open ? 'olive' : ''}>{open ? `모금 중 · ${daysLeft(f.end_at)}일 남음` : '새 기부 접수 종료'}</Badge>
          <h2>{money(amount)}</h2>
          <Progress pct={pct} />
          <div className="summary-row"><strong className="donation-rate">{pct}% 달성</strong><span>{money(f.target)} 목표</span></div>
          <div className="summary-row"><span>직접 기부금</span><strong>{money(f.stats.direct)}</strong></div>
          <div className="summary-row"><span>기업 지원금</span><strong>{money(f.stats.matching)}</strong></div>
          <div className="summary-row"><span>함께한 분</span><strong>{f.stats.donors.toLocaleString('ko-KR')}명</strong></div>
          <div className="summary-row"><span>모금 기간</span><strong>{date(f.start_at)}<br />~ {date(f.end_at)}</strong></div>
          {open ? <Link className="button primary wide" href={`${base}/checkout`}>기부하기</Link> : <button className="button secondary wide" type="button" disabled>모금이 종료되었어요</button>}
          <div className="actions summary-actions">
            <BookmarkButton targetType="fundraiser" targetId={f.id} saved={saved.includes(f.id)} label={`${flatTitle(f.title)} 관심 등록`} path={base} className="button secondary" />
            <ShareButton />
          </div>
          <div className="summary-org"><Building2 aria-hidden="true" /> {org?.name}<p className="help">퀸만덕 운영팀 검토를 거쳐 공개된 단체입니다.</p></div>
        </aside>
      </div>
      {open && <div className="mobile-donate"><strong>{pct}% 달성</strong><Link className="button primary" href={`${base}/checkout`}>마음 전하기</Link></div>}
    </>
  );
}
