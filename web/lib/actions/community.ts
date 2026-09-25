'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth';
import { hasSupabase, DB_NOT_CONNECTED } from '@/lib/env';
import type { ActionResult } from '@/components/site/ActionForm';

export async function addComment(_: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!hasSupabase) return { error: DB_NOT_CONNECTED };
  const session = await getSession();
  if (!session) return { error: '로그인 후 응원을 남길 수 있어요.' };
  const body = String(formData.get('body') ?? '').trim();
  const fundraiserId = String(formData.get('fundraiser_id') ?? '');
  const path = String(formData.get('path') ?? '/donate');
  if (body.length < 1 || body.length > 200) return { error: '응원 메시지는 1~200자로 남겨주세요.' };
  const supabase = await createClient();
  const { error } = await supabase.from('comments').insert({ fundraiser_id: fundraiserId, user_id: session.user.id, body });
  if (error) return { error: '응원을 저장하지 못했습니다.' };
  revalidatePath(path);
  return { ok: true, message: '응원을 남겼습니다.' };
}

export async function reportComment(commentId: string, reason: string): Promise<ActionResult> {
  if (!hasSupabase) return { error: DB_NOT_CONNECTED };
  const session = await getSession();
  if (!session) return { error: '로그인 후 신고할 수 있어요.' };
  if (reason.trim().length < 2) return { error: '신고 사유를 입력해주세요.' };
  const supabase = await createClient();
  const { error } = await supabase.from('comment_reports').insert({ comment_id: commentId, user_id: session.user.id, reason: reason.trim() });
  if (error) return { error: '신고를 저장하지 못했습니다.' };
  return { ok: true, message: '신고가 접수되었습니다. 운영팀이 확인합니다.' };
}

export async function participate(campaignId: string, path: string): Promise<ActionResult> {
  if (!hasSupabase) return { error: DB_NOT_CONNECTED };
  const session = await getSession();
  if (!session) return { error: '로그인 후 참여할 수 있어요.' };
  const supabase = await createClient();
  const { error } = await supabase.from('participations').insert({ campaign_id: campaignId, user_id: session.user.id });
  if (error) return { error: error.code === '23505' ? '이미 참여한 캠페인입니다.' : '참여를 저장하지 못했습니다.' };
  revalidatePath(path);
  return { ok: true, message: '응원 참여가 기록되었습니다. 금전 기부는 발생하지 않습니다.' };
}

export async function createInquiry(_: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!hasSupabase) return { error: DB_NOT_CONNECTED };
  const session = await getSession();
  const category = String(formData.get('category') ?? '');
  const title = String(formData.get('title') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  if (!category) return { error: '문의 유형을 선택해주세요.' };
  if (title.length < 2 || title.length > 100) return { error: '제목은 2~100자로 입력해주세요.' };
  if (body.length < 5 || body.length > 2000) return { error: '문의 내용은 5~2000자로 입력해주세요.' };
  if (!session && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: '답변 받을 이메일을 정확히 입력해주세요.' };
  const supabase = await createClient();
  const { error } = await supabase.from('inquiries').insert({ user_id: session?.user.id ?? null, email: session ? session.user.email : email, category, title, body });
  if (error) return { error: '문의를 저장하지 못했습니다.' };
  revalidatePath('/my');
  return { ok: true, message: session ? '문의가 접수되었습니다. 나의 후원 > 문의 내역에서 답변을 확인할 수 있습니다.' : '문의가 접수되었습니다. 답변은 입력한 이메일로 안내합니다.' };
}

export async function updateProfile(_: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!hasSupabase) return { error: DB_NOT_CONNECTED };
  const session = await getSession();
  if (!session) return { error: '로그인이 필요합니다.' };
  const name = String(formData.get('name') ?? '').trim();
  if (name.length < 2 || name.length > 20) return { error: '닉네임은 2~20자로 입력해주세요.' };
  const interest = String(formData.get('interest') ?? '');
  const supabase = await createClient();
  const { error } = await supabase.from('profiles').update({ name, interests: interest ? [interest] : [], is_public: formData.get('public') === 'on' }).eq('id', session.user.id);
  if (error) return { error: '프로필을 저장하지 못했습니다.' };
  revalidatePath('/', 'layout');
  return { ok: true, message: '프로필을 저장했습니다.' };
}

// 행사 캠페인 참가 신청 (구글 폼 대체). 비회원도 이메일로 신청할 수 있고, 회원이면 user_id를 함께 기록한다.
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
export async function registerForCampaign(_: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!hasSupabase) return { error: DB_NOT_CONNECTED };
  const session = await getSession();
  const campaignId = String(formData.get('campaign_id') ?? '');
  const get = (k: string) => String(formData.get(k) ?? '').trim();
  const name = get('name'), phone = get('phone'), email = get('email').toLowerCase(), gender = get('gender'), ageGroup = get('age_group'), depositor = get('depositor_name');
  if (name.length < 1 || name.length > 50) return { error: '성함을 입력해주세요.' };
  if (!EMAIL.test(email)) return { error: '이메일을 정확히 입력해주세요. 신청 확인과 안내가 이메일로 전달됩니다.' };
  if (phone && !/^[0-9\-+() ]{9,20}$/.test(phone)) return { error: '연락처는 숫자와 하이픈(-)으로 입력해주세요.' };
  if (gender && !['남자', '여자'].includes(gender)) return { error: '성별 값이 올바르지 않습니다.' };
  const supabase = await createClient();
  const { data: c } = await supabase.from('campaigns').select('id, slug, type, review, registration_open, end_at, details, capacity, confirmed_count').eq('id', campaignId).maybeSingle();
  if (!c || c.type !== 'event' || c.review !== 'approved') return { error: '참가 신청을 받는 캠페인이 아닙니다.' };
  if (!c.registration_open || new Date(c.end_at).getTime() <= Date.now()) return { error: '참가 신청이 마감되었습니다.' };
  if (c.capacity != null && (c.confirmed_count ?? 0) >= c.capacity) return { error: `선착순 ${c.capacity}명 모집이 마감되었습니다. 함께해주셔서 감사합니다.` };
  // 추가 질문(선택형): 보기 안의 값만 받는다
  const answers: Record<string, string> = {};
  for (const q of (c.details?.questions ?? []) as { key: string; label: string; options: string[]; required?: boolean }[]) {
    const v = get(`q_${q.key}`);
    if (!v) { if (q.required) return { error: `${q.label} 항목을 선택해주세요.` }; continue; }
    if (!q.options.includes(v)) return { error: `${q.label} 값이 올바르지 않습니다.` };
    answers[q.key] = v;
  }
  const required: string[] = c.details?.agreements ?? [];
  const agreed = required.filter((_, i) => formData.get(`agree_${i}`));
  if (agreed.length < required.length) return { error: '참여 확인 항목에 모두 체크해주세요.' };
  const { error } = await supabase.from('campaign_registrations').insert({
    campaign_id: c.id, user_id: session?.user.id ?? null, name, phone: phone || null, email, gender: gender || null, age_group: ageGroup || null, depositor_name: depositor || null, agreements: agreed, answers
  });
  if (error) return { error: error.code === '23505' ? '이미 같은 이메일로 신청되어 있습니다. 변경이 필요하면 1:1 문의로 알려주세요.' : error.code === '42501' ? '참가 신청이 마감되었습니다.' : '신청을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.' };
  revalidatePath(`/campaigns/${c.slug}`);
  return { ok: true, message: c.details?.complete || '신청이 접수되었습니다. 입력한 이메일로 안내드립니다.' };
}
