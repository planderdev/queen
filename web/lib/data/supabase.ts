// Supabase-backed repository. Read functions run with the caller's session (RLS applies), so
// anonymous visitors see only public rows and members see their own rows.
import { createClient } from '@/lib/supabase/server';
import type { Campaign, Comment, Content, Fundraiser, FundraiserCard, FundraiserFilter, FundraiserStats, ListPage, Organization, PublicDonation, Settings } from './types';
import { filterFundraisers, paginate, sortFundraisers } from './shared';
import * as seed from './seed-data.mjs';

type Row = Fundraiser & { organization: Pick<Organization, 'id' | 'slug' | 'name'> | null };

async function withStats(rows: Row[]): Promise<FundraiserCard[]> {
  if (!rows.length) return [];
  const supabase = await createClient();
  const { data: stats } = await supabase.from('fundraiser_stats').select('*').in('fundraiser_id', rows.map((r) => r.id));
  const byId = new Map<string, FundraiserStats>((stats ?? []).map((s) => [s.fundraiser_id, s]));
  return rows.filter((r) => r.organization).map((r) => ({ ...r, organization: r.organization!, stats: byId.get(r.id) ?? { fundraiser_id: r.id, direct: 0, matching: 0, donors: 0, paid: 0 } }));
}

const FUND_SELECT = '*, organization:organizations(id, slug, name)';

export const supabaseRepo = {
  mode: 'supabase' as const,
  async settings(): Promise<Settings> {
    const supabase = await createClient();
    const { data } = await supabase.from('settings').select('key, value');
    const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
    return { categories: map.categories ?? seed.categories, regions: map.regions ?? seed.regions, bank: map.bank ?? seed.bank };
  },
  async listFundraisers(filter: FundraiserFilter): Promise<ListPage<FundraiserCard>> {
    const supabase = await createClient();
    const { data } = await supabase.from('fundraisers').select(FUND_SELECT).order('created_at', { ascending: false });
    const cards = await withStats((data ?? []) as Row[]);
    return paginate(sortFundraisers(filterFundraisers(cards, filter), filter.sort), filter.page, filter.size);
  },
  async featuredFundraisers(limit = 8) {
    const supabase = await createClient();
    const { data } = await supabase.from('fundraisers').select(FUND_SELECT).eq('publication', 'active').order('created_at', { ascending: false }).limit(24);
    return sortFundraisers(await withStats((data ?? []) as Row[]), 'recommended').slice(0, limit);
  },
  async getFundraiser(slug: string): Promise<FundraiserCard | null> {
    const supabase = await createClient();
    const isId = /^[0-9a-f-]{36}$/i.test(slug);
    const { data } = await supabase.from('fundraisers').select(FUND_SELECT).eq(isId ? 'id' : 'slug', slug).maybeSingle();
    if (!data) return null;
    return (await withStats([data as Row]))[0] ?? null;
  },
  async fundraisersOf(organizationId: string) {
    const supabase = await createClient();
    const { data } = await supabase.from('fundraisers').select(FUND_SELECT).eq('organization_id', organizationId).order('created_at', { ascending: false });
    return withStats((data ?? []) as Row[]);
  },
  async publicDonations(fundraiserId: string): Promise<PublicDonation[]> {
    const supabase = await createClient();
    const { data } = await supabase.from('public_donations').select('*').eq('fundraiser_id', fundraiserId).order('created_at', { ascending: false }).limit(50);
    return (data ?? []) as PublicDonation[];
  },
  async comments(fundraiserId: string): Promise<Comment[]> {
    const supabase = await createClient();
    const { data } = await supabase.from('comments').select('*, profile:profiles(name, is_public)').eq('fundraiser_id', fundraiserId).eq('hidden', false).order('created_at', { ascending: false }).limit(100);
    return (data ?? []).map((c) => ({ ...c, author_name: c.profile?.is_public ? c.profile.name : '익명의 기부자' }));
  },
  async listOrganizations(): Promise<Organization[]> {
    const supabase = await createClient();
    const { data } = await supabase.from('organizations').select('*').eq('status', 'approved').order('name');
    return (data ?? []) as Organization[];
  },
  async getOrganization(slug: string) {
    const supabase = await createClient();
    const isId = /^[0-9a-f-]{36}$/i.test(slug);
    const { data } = await supabase.from('organizations').select('*').eq(isId ? 'id' : 'slug', slug).maybeSingle();
    return (data as Organization) ?? null;
  },
  async listCampaigns(): Promise<Campaign[]> {
    const supabase = await createClient();
    const { data } = await supabase.from('campaigns').select('*, participations(count)').eq('review', 'approved').order('created_at', { ascending: false });
    return (data ?? []).map((c) => ({ ...c, participations: c.participations?.[0]?.count ?? 0, registrations: c.registration_count ?? 0 })) as Campaign[];
  },
  async getCampaign(slug: string) {
    const supabase = await createClient();
    const isId = /^[0-9a-f-]{36}$/i.test(slug);
    const { data } = await supabase.from('campaigns').select('*, participations(count)').eq(isId ? 'id' : 'slug', slug).maybeSingle();
    return data ? ({ ...data, participations: data.participations?.[0]?.count ?? 0, registrations: data.registration_count ?? 0 } as Campaign) : null;
  },
  async listContent(type: Content['type'], limit?: number): Promise<Content[]> {
    const supabase = await createClient();
    let query = supabase.from('content').select('*').eq('type', type).eq('published', true).order('created_at', { ascending: false });
    if (limit) query = query.limit(limit);
    const { data } = await query;
    return (data ?? []) as Content[];
  },
  async getContent(slugOrId: string) {
    const supabase = await createClient();
    const isId = /^[0-9a-f-]{36}$/i.test(slugOrId);
    const { data } = await supabase.from('content').select('*').eq(isId ? 'id' : 'slug', slugOrId).eq('published', true).maybeSingle();
    return (data as Content) ?? null;
  },
  async newsOf(fundraiserId: string) {
    const supabase = await createClient();
    const { data } = await supabase.from('content').select('*').eq('type', 'news').eq('fundraiser_id', fundraiserId).eq('published', true).order('created_at', { ascending: false });
    return (data ?? []) as Content[];
  },
  async impactReportsOf(fundraiserId: string) {
    const supabase = await createClient();
    const { data } = await supabase.from('impact_reports').select('*').eq('fundraiser_id', fundraiserId).eq('status', 'approved');
    return data ?? [];
  }
};
