import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { hasSupabase } from '@/lib/env';
import type { Profile } from '@/lib/data/types';

export interface Session { user: { id: string; email: string | null }; profile: Profile }

// Cached per request so layout, header and pages share one round trip.
export const getSession = cache(async (): Promise<Session | null> => {
  if (!hasSupabase) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (!profile) return null;
  return { user: { id: user.id, email: user.email ?? null }, profile: profile as Profile };
});

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) throw new Error('로그인이 필요합니다.');
  if (session.profile.suspended) throw new Error('이용이 중지된 계정입니다. 고객센터로 문의해주세요.');
  return session;
}

export async function requireAdmin(roles: Array<'content' | 'review' | 'finance'> = []): Promise<Session> {
  const session = await requireSession();
  const { role, admin_role } = session.profile;
  if (role !== 'admin') throw new Error('관리자만 사용할 수 있습니다.');
  if (roles.length && admin_role !== 'super' && !roles.includes(admin_role as never)) throw new Error('이 작업 권한이 없는 관리자 역할입니다.');
  return session;
}
