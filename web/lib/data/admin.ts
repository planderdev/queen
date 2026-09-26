// Admin reads. Callers must already be an admin (RLS + requireAdmin in pages).
import { createClient } from '@/lib/supabase/server';
import { hasSupabase } from '@/lib/env';
import type { AuditLog, Campaign, CampaignRegistration, Content, Donation, Fundraiser, Inquiry, Organization, Profile, RecurringPlan, RefundRequest } from './types';

const empty = <T,>(): T[] => [];

export async function adminCounts() {
  if (!hasSupabase) return { pendingDonations: 0, refunds: 0, inquiries: 0, reports: 0, reviewFundraisers: 0, pendingRegistrations: 0 };
  const supabase = await createClient();
  const count = async (table: string, col: string, val: string | boolean) => (await supabase.from(table).select('id', { count: 'exact', head: true }).eq(col, val)).count ?? 0;
  const [pendingDonations, refunds, reports, reviewFundraisers] = await Promise.all([count('donations', 'status', 'pending'), count('refund_requests', 'status', 'requested'), count('comment_reports', 'status', 'requested'), count('fundraisers', 'review', 'submitted')]);
  const [{ count: inquiries }, pendingRegistrations] = await Promise.all([supabase.from('inquiries').select('id', { count: 'exact', head: true }).is('answer', null), count('campaign_registrations', 'status', 'pending')]);
  return { pendingDonations, refunds, inquiries: inquiries ?? 0, reports, reviewFundraisers, pendingRegistrations };
}

export async function adminDonations(filter: { status?: string; q?: string } = {}): Promise<Donation[]> {
  if (!hasSupabase) return empty();
  const supabase = await createClient();
  let q = supabase.from('donations').select('*, fundraiser:fundraisers(id, slug, title), organization:organizations(id, slug, name), profile:profiles(name, email)').order('created_at', { ascending: false }).limit(300);
  if (filter.status) q = q.eq('status', filter.status);
  if (filter.q) q = q.or(`number.ilike.%${filter.q}%,depositor_name.ilike.%${filter.q}%`);
  const { data } = await q;
  return (data ?? []) as (Donation & { profile?: { name: string; email: string | null } | null })[];
}

export async function adminRefunds(): Promise<(RefundRequest & { donation: Donation | null; profile: { name: string } | null })[]> {
  if (!hasSupabase) return empty();
  const supabase = await createClient();
  const { data } = await supabase.from('refund_requests').select('*, donation:donations(id, number, amount, status, created_at, fundraiser:fundraisers(id, title)), profile:profiles(name)').order('created_at', { ascending: false });
  return (data ?? []) as never;
}

export async function adminFundraisers(): Promise<(Fundraiser & { organization: Pick<Organization, 'id' | 'name'> | null })[]> {
  if (!hasSupabase) return empty();
  const supabase = await createClient();
  const { data } = await supabase.from('fundraisers').select('*, organization:organizations(id, name)').order('created_at', { ascending: false });
  return (data ?? []) as never;
}
export async function adminFundraiser(id: string): Promise<Fundraiser | null> {
  if (!hasSupabase) return null;
  const supabase = await createClient();
  const { data } = await supabase.from('fundraisers').select('*').eq('id', id).maybeSingle();
  return (data as Fundraiser) ?? null;
}
export async function adminOrganizations(): Promise<Organization[]> {
  if (!hasSupabase) return empty();
  const supabase = await createClient();
  const { data } = await supabase.from('organizations').select('*').order('name');
  return (data ?? []) as Organization[];
}
export async function adminCampaigns(): Promise<Campaign[]> {
  if (!hasSupabase) {
    // 미리보기 모드: 시드 캠페인과 예시 신청자로 관리자 화면을 확인할 수 있게 한다 (읽기 전용)
    const { campaigns, sampleRegistrations } = await import('./seed-data.mjs');
    return (campaigns as Campaign[]).map((c) => { const rs = sampleRegistrations.filter((r) => r.campaign_id === c.id); return { ...c, registrations: rs.filter((r) => r.status !== 'cancelled').length, confirmed_count: rs.filter((r) => r.status === 'confirmed').length, participations: 0 }; });
  }
  const supabase = await createClient();
  const { data } = await supabase.from('campaigns').select('*, participations(count)').order('created_at', { ascending: false });
  return (data ?? []).map((c) => ({ ...c, registrations: c.registration_count ?? 0, participations: c.participations?.[0]?.count ?? 0 })) as Campaign[];
}
export async function adminRegistrations(campaignId: string): Promise<CampaignRegistration[]> {
  if (!hasSupabase) { const { sampleRegistrations } = await import('./seed-data.mjs'); return (sampleRegistrations as CampaignRegistration[]).filter((r) => r.campaign_id === campaignId); }
  const supabase = await createClient();
  const { data } = await supabase.from('campaign_registrations').select('*').eq('campaign_id', campaignId).order('created_at', { ascending: true });
  return (data ?? []) as CampaignRegistration[];
}
// 대시보드: 행사 캠페인 입금 대기 신청 (최근순)
export async function adminPendingRegistrations(limit = 6): Promise<(CampaignRegistration & { campaign: { id: string; title: string } | null })[]> {
  if (!hasSupabase) return empty();
  const supabase = await createClient();
  const { data } = await supabase.from('campaign_registrations').select('*, campaign:campaigns(id, title)').eq('status', 'pending').order('created_at', { ascending: false }).limit(limit);
  return (data ?? []) as never;
}
export async function adminContent(type?: string): Promise<Content[]> {
  if (!hasSupabase) return empty();
  const supabase = await createClient();
  let q = supabase.from('content').select('*').order('created_at', { ascending: false });
  if (type) q = q.eq('type', type);
  const { data } = await q;
  return (data ?? []) as Content[];
}
export async function adminContentItem(id: string): Promise<Content | null> {
  if (!hasSupabase) return null;
  const supabase = await createClient();
  const { data } = await supabase.from('content').select('*').eq('id', id).maybeSingle();
  return (data as Content) ?? null;
}
export async function adminInquiries(): Promise<(Inquiry & { profile: { name: string } | null })[]> {
  if (!hasSupabase) return empty();
  const supabase = await createClient();
  const { data } = await supabase.from('inquiries').select('*, profile:profiles(name)').order('created_at', { ascending: false });
  return (data ?? []) as never;
}
export async function adminUsers(): Promise<Profile[]> {
  if (!hasSupabase) return empty();
  const supabase = await createClient();
  const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(500);
  return (data ?? []) as Profile[];
}
export async function adminReports() {
  if (!hasSupabase) return empty<{ id: string; reason: string; status: string; resolution: string | null; created_at: string; comment: { id: string; body: string; hidden: boolean } | null; profile: { name: string } | null }>();
  const supabase = await createClient();
  const { data } = await supabase.from('comment_reports').select('*, comment:comments(id, body, hidden), profile:profiles(name)').order('created_at', { ascending: false });
  return (data ?? []) as never;
}
export async function adminPlans(): Promise<(RecurringPlan & { profile: { name: string } | null; organization: { name: string } | null })[]> {
  if (!hasSupabase) return empty();
  const supabase = await createClient();
  const { data } = await supabase.from('recurring_plans').select('*, profile:profiles(name), organization:organizations(name)').order('created_at', { ascending: false });
  return (data ?? []) as never;
}
export async function adminLogs(): Promise<AuditLog[]> {
  if (!hasSupabase) return empty();
  const supabase = await createClient();
  const { data } = await supabase.from('audit_logs').select('*, actor:profiles(name)').order('created_at', { ascending: false }).limit(200);
  return (data ?? []).map((l) => ({ ...l, actor_name: l.actor?.name ?? null })) as AuditLog[];
}
