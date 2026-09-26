import Link from 'next/link';
import { ArrowRight, ArrowUpRight, BookOpen, Building2, Globe, HandHeart, NotebookPen, Plus, UsersRound } from 'lucide-react';
import { repo } from '@/lib/data';
import { campaignTypeNames } from '@/lib/format';
import { HeroSlider, type HeroSlide } from '@/components/site/HeroSlider';
import { Rail } from '@/components/site/Rail';
import { Title } from '@/components/ui';

const photos = { meal: '/assets/images/meal.jpg', child: '/assets/images/child.jpg', forest: '/assets/images/forest.jpg', community: '/assets/images/community.jpg' };

function SectionHeading({ eyebrow, heading, href }: { eyebrow: string; heading: string; href?: string }) {
  return (
    <div className="home-section-heading">
      <div><span className="home-kicker">{eyebrow}</span><h2><Title title={heading} /></h2></div>
      {href && <Link className="home-more" href={href} aria-label={`${eyebrow} 전체보기`}><Plus aria-hidden="true" /></Link>}
    </div>
  );
}

export default async function HomePage() {
  const [stories, campaigns, funds, notices, banners] = await Promise.all([
    repo.listContent('story', 6), repo.listCampaigns(), repo.featuredFundraisers(2), repo.listContent('notice', 3), repo.listContent('banner', 3)
  ]);
  // 모집 중인 행사 캠페인은 메인 배너 첫 슬라이드로 올린다 (종료·정원 마감 시 자동으로 빠짐)
  const now = Date.now();
  const eventSlides: HeroSlide[] = campaigns
    .filter((c) => c.type === 'event' && c.details.hero && c.registration_open && new Date(c.start_at).getTime() <= now && now < new Date(c.end_at).getTime() && (c.capacity == null || (c.confirmed_count ?? 0) < c.capacity))
    .map((c) => {
      const hero = c.details.hero!;
      const left = c.capacity != null ? c.capacity - (c.confirmed_count ?? 0) : null;
      return { image: c.image ?? photos.community, scrim: true, heading: hero.heading, description: [...(hero.description ?? []), ...(left != null ? [`선착순 ${c.capacity}명 모집 · 잔여 ${left}석`] : [])], href: `/campaigns/${c.slug}#register`, cta: hero.cta ?? '참가 신청하기' };
    });
  const guide: [string, string, string, string][] = [['정기후원', '매달 이어지는 따뜻한 약속', photos.child, '/monthly'], ['일시후원', '지금 필요한 곳에 전하는 마음', photos.meal, '/donate'], ['기업후원', '함께할수록 더 커지는 변화', photos.community, '/campaigns']];
  return (
    <div className="home-page">
      <HeroSlider slides={[
        ...eventSlides,
        { image: photos.meal, light: true, heading: ['작은 나눔이 모여,', '더 큰 변화를 만듭니다.'], description: ['마음이 닿는 이야기를 만나고,', '그 다음의 변화까지 함께하세요.'], href: '/donate', cta: '마음 전하기' },
        { image: photos.forest, heading: ['매달 이어지는 마음,', '함께 자라는 내일.'], description: ['우리의 작은 약속이', '누군가의 든든한 일상이 됩니다.'], href: '/monthly', cta: '정기후원 알아보기' }
      ]} />
      <aside className="home-donation-callout">
        <div><h2>당신의 마음이 변화의 시작입니다</h2><p>오늘의 나눔으로 더 나은 내일을 함께 만들어요.</p></div>
        <div className="home-donation-actions"><Link className="button primary" href="/monthly">정기후원 <ArrowRight aria-hidden="true" /></Link><Link className="button secondary" href="/donate">일시후원 <ArrowRight aria-hidden="true" /></Link></div>
      </aside>

      <section className="home-section home-container" data-carousel="stories">
        <SectionHeading eyebrow="나눔이야기" heading="나눔이 만들어낸 놀라운 변화" href="/stories" />
        <Rail label="나눔이야기" className="home-story-rail" items={stories.map((st) => (
          <Link key={st.id} className="home-story" href={`/stories/${st.slug ?? st.id}`}>
            <div className="home-image"><img src={st.image ?? photos.community} width={480} height={360} alt={`${st.category} 활동 참고 이미지`} loading="lazy" /></div>
            <span>{st.category} 리포트</span><h3>{st.title}</h3>
          </Link>
        ))} />
      </section>

      <section className="home-transparency"><div className="home-container">
        <div className="home-centered-heading"><SectionHeading eyebrow="투명한 나눔" heading="퀸만덕을 소개합니다" /></div>
        <div className="home-values">
          <Link href="/about"><HandHeart aria-hidden="true" /><h3>가장 가까이</h3><p>작은 관심에서 시작하는<br />우리 이웃을 위한 나눔</p></Link>
          <Link href="/stories"><NotebookPen aria-hidden="true" /><h3>더 투명하게</h3><p>모금부터 결과보고까지<br />나눔의 모든 과정을 함께</p></Link>
          <Link href="/organizations"><Globe aria-hidden="true" /><h3>함께 더 멀리</h3><p>뜻을 함께하는 단체와<br />지속 가능한 변화를 만듭니다</p></Link>
        </div>
      </div></section>

      <section className="home-work-section"><div className="home-section home-container">
        <div className="home-centered-heading"><SectionHeading eyebrow="사업안내" heading={'세상을 바꾸는 첫걸음,\n퀸만덕의 나눔을 소개합니다'} /></div>
        <div className="home-work-grid">
          <Link className="home-work-card" href={`/donate?category=${encodeURIComponent('아동·청소년')}`}><img src={photos.child} width={700} height={620} alt="아이들의 배움 활동 참고 이미지" loading="lazy" /><div><HandHeart aria-hidden="true" /><h3>이웃을 위한 나눔</h3><p>아동과 청소년, 어르신과 위기가정까지<br />우리 곁의 평범한 일상을 지킵니다.</p><span className="home-work-more">더보기 <ArrowRight aria-hidden="true" /></span></div><span className="home-work-corner" aria-hidden="true"></span></Link>
          <Link className="home-work-card" href={`/donate?category=${encodeURIComponent('환경')}`}><img src={photos.forest} width={700} height={620} alt="함께 지켜가는 숲" loading="lazy" /><div><Globe aria-hidden="true" /><h3>내일을 위한 나눔</h3><p>생명과 환경, 지속 가능한 지역사회<br />함께 살아갈 내일을 준비합니다.</p><span className="home-work-more">더보기 <ArrowRight aria-hidden="true" /></span></div><span className="home-work-corner" aria-hidden="true"></span></Link>
        </div>
      </div></section>

      <section className="home-campaign-section"><div className="home-container" data-carousel="campaigns">
        <SectionHeading eyebrow="캠페인" heading="진행 중인 캠페인" href="/campaigns" />
        <Rail label="캠페인" className="home-campaign-rail" items={[
          ...campaigns.map((c) => (
            <Link key={c.id} className="home-campaign-card" href={`/campaigns/${c.slug}`}>
              <div className="home-image"><img src={c.image ?? photos.community} width={440} height={480} loading="lazy" alt="캠페인 활동 참고 이미지" /></div>
              <span>{campaignTypeNames[c.type]} 캠페인</span><div className="home-campaign-copy"><h3>{c.title}</h3><p>{c.description}</p></div>
            </Link>
          )),
          ...funds.map((f) => (
            <Link key={f.id} className="home-campaign-card" href={`/donate/${f.slug}`}>
              <div className="home-image"><img src={f.image ?? photos.meal} width={440} height={480} loading="lazy" alt={`${f.category} 활동 참고 이미지`} /></div>
              <span>{f.category} 캠페인</span><div className="home-campaign-copy"><h3><Title title={f.title} /></h3><p>우리의 작은 관심이 든든한 힘이 됩니다.</p></div>
            </Link>
          ))
        ]} />
      </div></section>

      <section className="home-section home-container home-guide" data-carousel="guide">
        <div><SectionHeading eyebrow="후원안내" heading={'후원이 처음\n이신가요?'} /><p>나에게 맞는 방법으로<br />나눔의 첫걸음을 함께해요.</p><Link className="home-text-link" href="/support">후원 안내 <ArrowRight aria-hidden="true" /></Link></div>
        <Rail label="후원안내" className="home-guide-rail" items={guide.map(([label, description, image, href]) => (
          <Link key={label} className="home-guide-card" href={href}>
            <div className="home-image"><img src={image} alt={`${label} 안내 이미지`} width={600} height={500} loading="lazy" /></div>
            <div className="home-guide-copy"><h3>{label}<ArrowRight aria-hidden="true" /></h3><p>{description}</p></div>
          </Link>
        ))} />
      </section>

      {banners.length > 0 && (
        <section className="home-section home-container" aria-label="운영자 안내">
          <SectionHeading eyebrow="퀸만덕 소식" heading="지금 함께하면 좋은 나눔" />
          {banners.map((b) => <div className="panel" key={b.id}><h2>{b.title}</h2><p>{b.body}</p></div>)}
        </section>
      )}

      <section className="home-section home-container">
        <SectionHeading eyebrow="소식" heading="퀸만덕 소식" href="/support?view=notices" />
        <div className="home-news-grid">
          <div className="home-news-list">
            {notices.map((n) => <Link key={n.id} href={`/support/notices/${n.slug ?? n.id}`}><span className="home-news-category">공지사항</span><h3>{n.title}</h3><span className="home-news-date">안내</span></Link>)}
            {stories.slice(0, 3).map((st) => <Link key={st.id} href={`/stories/${st.slug ?? st.id}`}><span className="home-news-category">나눔이야기</span><h3>{st.title}</h3><span className="home-news-date">리포트</span></Link>)}
          </div>
          <div className="home-promos">
            <Link href="/organizations"><div><span>함께하는 단체</span><h3>변화를 만드는 사람들</h3></div><UsersRound aria-hidden="true" /><ArrowUpRight aria-hidden="true" /></Link>
            <Link href="/stories"><div><span>나눔 결과보고</span><h3>마음이 전해진 그 이후</h3></div><BookOpen aria-hidden="true" /><ArrowUpRight aria-hidden="true" /></Link>
            <Link href="/campaigns"><div><span>나눔 캠페인</span><h3>더 큰 나눔의 가능성</h3></div><Building2 aria-hidden="true" /><ArrowUpRight aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
