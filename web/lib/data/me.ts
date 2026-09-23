// Signed-in member data (RLS limits rows to the caller).
import { createClient } from '@/lib/supabase/server';
import { hasSupabase } from '@/lib/env';
import type { Donation, RecurringPlan, Inquiry, Notification, RefundRequest, Bookmark } from './types';

const DONATION_SELECT = '*, fundraiser:fundraisers(id, slug, title), organization:organizations(id, slug, name)';

export async function myDonations(userId: string, filter: { status?: string; from?: string; to?: string } = {}): Promise<Donation[]> {
  if (!hasSupabase) return [];
  const supabase = await createClient();
  let q = supabase.from('donations').select(DONATION_SELECT).eq('user_id', userId).order('created_at', { ascending: false });
  if (filter.status) q = q.eq('status', filter.status);
  if (filter.from) q = q.gte('created_at', filter.from);
  if (filter.to) q = q.lte('created_at', `${filter.to}T23:59:59+09:00`);
  const { data } = await q;
  return (data ?? []) as Donation[];
}

export async function myPlans(userId: string): Promise<RecurringPlan[]> {
  if (!hasSupabase) return [];
  const supabase = await createClient();
  const { data } = await supabase.from('recurring_plans').select('*, organization:organizations(id, slug, name)').eq('user_id', userId).order('created_at', { ascending: false });
  return (data ?? []) as RecurringPlan[];
}

export async function myBookmarks(userId: string): Promise<Bookmark[]> {
  if (!hasSupabase) return [];
  const supabase = await createClient();
  const { data } = await supabase.from('bookmarks').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return (data ?? []) as Bookmark[];
}

export async function myInquiries(userId: string): Promise<Inquiry[]> {
  if (!hasSupabase) return [];
  const supabase = await createClient();
  const { data } = await supabase.from('inquiries').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return (data ?? []) as Inquiry[];
}

export async function myRefunds(userId: string): Promise<RefundRequest[]> {
  if (!hasSupabase) return [];
  const supabase = await createClient();
  const { data } = await supabase.from('refund_requests').select('*').eq('user_id', userId);
  return (data ?? []) as RefundRequest[];
}

export async function myNotifications(userId: string): Promise<Notification[]> {
  if (!hasSupabase) return [];
  const supabase = await createClient();
  const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
  return (data ?? []) as Notification[];
}
