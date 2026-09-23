// In-memory repository backed by seed-data.mjs. Read-only: used while no Supabase project is
// connected so the production UI can be reviewed end to end. Writes are refused by lib/data/index.ts.
import * as seed from './seed-data.mjs';
import type { Campaign, Content, Fundraiser, FundraiserCard, FundraiserFilter, FundraiserStats, ListPage, Organization, PublicDonation, Settings } from './types';
import { isPublic, sortFundraisers, filterFundraisers, paginate } from './shared';

const organizations = seed.organizations as Organization[];
const fundraisers = (seed.fundraisers as (Fundraiser & { seedAmount: number })[]).map(({ seedAmount, ...f }) => ({ f: f as Fundraiser, seedAmount }));
const campaigns = seed.campaigns as Campaign[];
const content = seed.content as Content[];

const statsOf = (id: string): FundraiserStats => {
  const row = fundraisers.find((x) => x.f.id === id);
  return { fundraiser_id: id, direct: row?.seedAmount ?? 0, matching: 0, donors: row && row.seedAmount > 0 ? 1 : 0, paid: row?.f.publication === 'ended' ? row.seedAmount : 0 };
};
const card = (f: Fundraiser): FundraiserCard => {
  const org = organizations.find((o) => o.id === f.organization_id)!;
  return { ...f, organization: { id: org.id, slug: org.slug, name: org.name }, stats: statsOf(f.id) };
};
const publicCards = () => fundraisers.map((x) => x.f).filter((f) => isPublic(f, organizations)).map(card);

export const memoryRepo = {
  mode: 'seed' as const,
  async settings(): Promise<Settings> { return { categories: seed.categories, regions: seed.regions, bank: seed.bank }; },
  async listFundraisers(filter: FundraiserFilter): Promise<ListPage<FundraiserCard>> {
    return paginate(sortFundraisers(filterFundraisers(publicCards(), filter), filter.sort), filter.page, filter.size);
  },
  async featuredFundraisers(limit = 8) { return sortFundraisers(publicCards().filter((f) => f.publication === 'active'), 'recommended').slice(0, limit); },
  async getFundraiser(slug: string): Promise<FundraiserCard | null> {
    const f = fundraisers.map((x) => x.f).find((x) => x.slug === slug || x.id === slug);
    return f && isPublic(f, organizations) ? card(f) : null;
  },
  async fundraisersOf(organizationId: string) { return publicCards().filter((f) => f.organization_id === organizationId); },
  async publicDonations(fundraiserId: string): Promise<PublicDonation[]> {
    const row = fundraisers.find((x) => x.f.id === fundraiserId);
    return row && row.seedAmount > 0 ? [{ id: `seed-${fundraiserId}`, fundraiser_id: fundraiserId, amount: row.seedAmount, anonymous: true, message: '함께 응원합니다.', created_at: row.f.created_at, donor_name: null }] : [];
  },
  async comments() { return []; },
  async listOrganizations(): Promise<Organization[]> { return organizations.filter((o) => o.status === 'approved'); },
  async getOrganization(slug: string) { return organizations.find((o) => (o.slug === slug || o.id === slug) && o.status === 'approved') ?? null; },
  async listCampaigns(): Promise<Campaign[]> { return campaigns.filter((c) => c.review === 'approved').map((c) => ({ ...c, participations: 0 })); },
  async getCampaign(slug: string) { return campaigns.find((c) => (c.slug === slug || c.id === slug) && c.review === 'approved') ?? null; },
  async listContent(type: Content['type'], limit?: number): Promise<Content[]> {
    const rows = content.filter((c) => c.type === type && c.published).sort((a, b) => b.created_at.localeCompare(a.created_at));
    return limit ? rows.slice(0, limit) : rows;
  },
  async getContent(slugOrId: string) { return content.find((c) => c.published && (c.slug === slugOrId || c.id === slugOrId)) ?? null; },
  async newsOf(fundraiserId: string) { return content.filter((c) => c.type === 'news' && c.published && c.fundraiser_id === fundraiserId); },
  async impactReportsOf() { return []; }
};
