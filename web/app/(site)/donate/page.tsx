import Link from 'next/link';
import type { Metadata } from 'next';
import { Accessibility, Baby, HandHeart, HeartPulse, House, LayoutGrid, Leaf, PawPrint, Search, UsersRound } from 'lucide-react';
import { repo } from '@/lib/data';
import { PageBanner } from '@/components/site/PageBanner';
import { Cards, Field, Pagination, Select } from '@/components/ui';
import { getSavedIds } from '@/lib/actions/bookmark';

export const metadata: Metadata = { title: '기부하기' };
const icons = [LayoutGrid, Baby, HandHeart, Accessibility, House, PawPrint, Leaf, HeartPulse, UsersRound];

export default async function DonatePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  const category = q.category || '전체';
  const filter = { q: q.q, category, region: q.region, org: q.org, status: (['active','ended'].includes(q.status ?? '') ? q.status : '') as '' | 'active' | 'ended', sort: (['recommended','new','ending','popular'].includes(q.sort ?? '') ? q.sort : 'recommended') as 'recommended' | 'new' | 'ending' | 'popular', page: Number(q.page) || 1, size: 8 };
  const [list, settings, orgs, saved] = await Promise.all([repo.listFundraisers(filter), repo.settings(), repo.listOrganizations(), getSavedIds('fundraiser')]);
  const cats = ['전체', ...settings.categories];
  const href = (page: number) => { const p = new URLSearchParams(Object.entries(q).filter(([, v]) => v) as [string, string][]); p.set('page', String(page)); return `/donate?${p}`; };
  return (
    <>
      <PageBanner page="donate" />
      <div className="container">
        <nav className="category-nav" aria-label="기부 분야">
          {cats.map((c, i) => { const Icon = icons[i] ?? LayoutGrid; return <Link key={c} href={`/donate?category=${encodeURIComponent(c)}`} className={c === category ? 'active' : ''}><span className="category-icon"><Icon aria-hidden="true" /></span>{c}</Link>; })}
        </nav>
        <form className="filters" action="/donate">
          <input type="hidden" name="category" value={category} />
          <Field label="이야기 검색" name="q" type="search" defaultValue={q.q ?? ''} placeholder="어떤 이야기를 찾으세요?" />
          <Select label="진행 상태" name="status" options={[['', '전체'], ['active', '모금 중'], ['ended', '종료']]} defaultValue={filter.status} />
          <Select label="지역" name="region" options={[['', '전국'], ...settings.regions.map((r) => [r, r] as [string, string])]} defaultValue={q.region ?? ''} />
          <Select label="단체" name="org" options={[['', '전체 단체'], ...orgs.map((o) => [o.slug, o.name] as [string, string])]} defaultValue={q.org ?? ''} />
          <Select label="정렬" name="sort" options={[['recommended', '추천순'], ['new', '최신순'], ['ending', '마감 임박순'], ['popular', '참여 많은 순']]} defaultValue={filter.sort} />
          <button className="button primary"><Search aria-hidden="true" /> 검색</button>
        </form>
        <div className="list-meta"><span>마음을 기다리는 <b>{list.total}</b>개의 이야기</span><span className="muted">기부금은 계좌이체로 전달됩니다</span></div>
        <Cards items={list.items} savedIds={saved} />
        <Pagination page={list.page} pages={list.pages} href={href} />
      </div>
    </>
  );
}
