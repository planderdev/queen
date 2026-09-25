import type { Metadata } from 'next';
import { Search } from 'lucide-react';
import { repo } from '@/lib/data';
import { campaignTypeNames } from '@/lib/format';
import { PageBanner } from '@/components/site/PageBanner';
import { Chips, Empty, Tabs } from '@/components/ui';
import { ImageCard } from '@/components/site/ImageCard';

export const metadata: Metadata = { title: '나눔 캠페인' };

export default async function CampaignsPage({ searchParams }: { searchParams: Promise<{ view?: string; category?: string; q?: string }> }) {
  const sp = await searchParams;
  const view = sp.view === 'ended' ? 'ended' : 'ongoing';
  const category = ['matching', 'cheer', 'event'].includes(sp.category ?? '') ? sp.category! : '';
  const q = (sp.q ?? '').trim();
  const now = Date.now();
  const all = await repo.listCampaigns();
  const items = all.filter((c) => (view === 'ended' ? new Date(c.end_at).getTime() <= now : new Date(c.end_at).getTime() > now) && (!category || c.type === category) && (!q || `${c.title} ${c.description}`.includes(q)));
  const url = (v: Record<string, string>) => `/campaigns?${new URLSearchParams({ view, category, q, ...v })}`;
  return (
    <>
      <PageBanner page="campaigns" />
      <div className="container program-page">
        <Tabs items={[['ongoing', '진행중인 캠페인', url({ view: 'ongoing' })], ['ended', '종료된 캠페인', url({ view: 'ended' })]]} current={view} />
        <div className="program-toolbar">
          <Chips items={[['', '전체', url({ category: '' })], ['matching', '기업 매칭', url({ category: 'matching' })], ['cheer', '응원 참여', url({ category: 'cheer' })], ['event', '참가 신청', url({ category: 'event' })]]} current={category} label="캠페인 유형" />
          <form className="program-search" action="/campaigns"><input type="hidden" name="view" value={view} /><input type="hidden" name="category" value={category} /><label className="qm-sr-only" htmlFor="campaign-query">캠페인 검색</label><input id="campaign-query" name="q" defaultValue={q} placeholder="검색어를 입력해주세요" /><button type="submit" className="icon-button" aria-label="캠페인 검색"><Search aria-hidden="true" /></button></form>
        </div>
        <div className="program-results" aria-live="polite">총 <strong>{items.length}</strong>개의 캠페인</div>
        {items.length ? <div className="program-grid">{items.map((c) => <ImageCard key={c.id} image={c.image ?? '/assets/images/community.jpg'} category={campaignTypeNames[c.type]} title={c.title} body={c.description} href={`/campaigns/${c.slug}`} cta={view === 'ended' ? '캠페인 살펴보기' : c.type === 'event' ? (c.capacity != null && (c.confirmed_count ?? 0) >= c.capacity ? '모집 마감' : '참가 신청하기') : '함께 참여하기'} />)}</div> : <Empty title="해당하는 캠페인이 없습니다" text="검색어 또는 캠페인 유형을 변경해보세요." cta={false} />}
      </div>
    </>
  );
}
