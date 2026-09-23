'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth';
import { hasSupabase, DB_NOT_CONNECTED } from '@/lib/env';

export async function getSavedIds(targetType: 'fundraiser' | 'story' | 'campaign' | 'organization'): Promise<string[]> {
  const session = await getSession();
  if (!session) return [];
  const supabase = await createClient();
  const { data } = await supabase.from('bookmarks').select('target_id').eq('user_id', session.user.id).eq('target_type', targetType);
  return (data ?? []).map((b) => b.target_id);
}

export async function toggleBookmark(targetType: 'fundraiser' | 'story' | 'campaign' | 'organization', targetId: string, path: string): Promise<{ saved: boolean; error?: string }> {
  if (!hasSupabase) return { saved: false, error: DB_NOT_CONNECTED };
  const session = await getSession();
  if (!session) return { saved: false, error: '로그인 후 관심 목록에 담을 수 있어요.' };
  const supabase = await createClient();
  const { data: existing } = await supabase.from('bookmarks').select('id').eq('user_id', session.user.id).eq('target_type', targetType).eq('target_id', targetId).maybeSingle();
  if (existing) await supabase.from('bookmarks').delete().eq('id', existing.id);
  else await supabase.from('bookmarks').insert({ user_id: session.user.id, target_type: targetType, target_id: targetId });
  revalidatePath(path);
  return { saved: !existing };
}
