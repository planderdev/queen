'use server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hasSupabase, DB_NOT_CONNECTED, env } from '@/lib/env';
import type { ActionResult } from '@/components/site/ActionForm';

const safeNext = (raw: FormDataEntryValue | null) => { const v = String(raw ?? ''); return v.startsWith('/') && !v.startsWith('//') ? v : '/my'; };

export async function signIn(_: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!hasSupabase) return { error: DB_NOT_CONNECTED };
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  if (!email || !password) return { error: '이메일과 비밀번호를 입력해주세요.' };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message === 'Invalid login credentials' ? '이메일 또는 비밀번호가 맞지 않습니다.' : error.message === 'Email not confirmed' ? '이메일 인증을 먼저 완료해주세요. 받은편지함을 확인해주세요.' : error.message };
  redirect(safeNext(formData.get('next')));
}

export async function signUp(_: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!hasSupabase) return { error: DB_NOT_CONNECTED };
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  if (name.length < 2 || name.length > 20) return { error: '닉네임은 2~20자로 입력해주세요.' };
  if (!email) return { error: '이메일을 입력해주세요.' };
  if (password.length < 8) return { error: '비밀번호는 8자 이상으로 입력해주세요.' };
  if (!formData.get('agree')) return { error: '이용약관과 개인정보처리방침에 동의해주세요.' };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name }, emailRedirectTo: `${env.siteUrl}/auth/callback?next=/my` } });
  if (error) return { error: error.message.includes('already registered') ? '이미 가입된 이메일입니다. 로그인해주세요.' : error.message };
  if (data.session) redirect('/my');
  return { ok: true, message: '인증 메일을 보냈습니다. 받은편지함에서 링크를 눌러 가입을 완료해주세요.' };
}

export async function requestPasswordReset(_: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!hasSupabase) return { error: DB_NOT_CONNECTED };
  const email = String(formData.get('email') ?? '').trim();
  if (!email) return { error: '가입한 이메일을 입력해주세요.' };
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${env.siteUrl}/auth/callback?next=/auth/update-password` });
  if (error) return { error: error.message };
  return { ok: true, message: '재설정 링크를 이메일로 보냈습니다. 받은편지함을 확인해주세요.' };
}

export async function updatePassword(_: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!hasSupabase) return { error: DB_NOT_CONNECTED };
  const password = String(formData.get('password') ?? '');
  if (password.length < 8) return { error: '비밀번호는 8자 이상으로 입력해주세요.' };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  redirect('/my?view=profile');
}

export async function signOut() {
  if (hasSupabase) { const supabase = await createClient(); await supabase.auth.signOut(); }
  redirect('/');
}
