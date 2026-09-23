import type { Fundraiser, FundraiserCard, FundraiserFilter, ListPage, Organization } from './types';

export const PAGE_SIZE = 12;

export function isPublic(f: Fundraiser, organizations: Pick<Organization, 'id' | 'status'>[], now = new Date()) {
  const org = organizations.find((o) => o.id === f.organization_id);
  return f.review === 'approved' && ['active', 'paused', 'ended'].includes(f.publication) && new Date(f.start_at) <= now && org?.status === 'approved';
}

export function canDonate(f: Pick<Fundraiser, 'publication' | 'end_at' | 'start_at'>, now = new Date()) {
  return f.publication === 'active' && new Date(f.end_at) > now && new Date(f.start_at) <= now;
}

export function filterFundraisers(list: FundraiserCard[], filter: FundraiserFilter) {
  const q = (filter.q ?? '').trim();
  return list.filter((f) =>
    (!filter.category || filter.category === '전체' || f.category === filter.category) &&
    (!q || `${f.title} ${f.story} ${f.organization.name}`.includes(q)) &&
    (!filter.region || f.region === filter.region) &&
    (!filter.org || f.organization_id === filter.org || f.organization.slug === filter.org) &&
    (!filter.status || (filter.status === 'active' ? canDonate(f) : !canDonate(f)))
  );
}

export function sortFundraisers(list: FundraiserCard[], sort: FundraiserFilter['sort'] = 'recommended') {
  const rows = [...list];
  if (sort === 'ending') rows.sort((a, b) => new Date(a.end_at).getTime() - new Date(b.end_at).getTime());
  else if (sort === 'new') rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  else if (sort === 'popular') rows.sort((a, b) => b.stats.donors - a.stats.donors || b.stats.direct - a.stats.direct);
  else rows.sort((a, b) => Number(canDonate(b)) - Number(canDonate(a)) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return rows;
}

export function paginate<T>(rows: T[], page = 1, size = PAGE_SIZE): ListPage<T> {
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const current = Math.min(Math.max(1, page), pages);
  return { items: rows.slice((current - 1) * size, current * size), total: rows.length, page: current, pages };
}

export const total = (s: { direct: number; matching: number }) => s.direct + s.matching;
