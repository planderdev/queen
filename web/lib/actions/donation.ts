'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth';
import { hasSupabase, DB_NOT_CONNECTED } from '@/lib/env';
import { repo, canDonate } from '@/lib/data';
import type { ActionResult } from '@/components/site/ActionForm';

const MIN = 1000, MAX = 10000000;
const parseAmount = (raw: FormDataEntryValue | null) => Number(String(raw ?? '').replace(/[^\d]/g, ''));

// 1차: 계좌이체. 기부 신청을 pending으로 기록하고 입금 안내 화면으로 보낸다. 운영자가 입금을 확인하면 success.
export async function createDonation(_: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!hasSupabase) return { error: DB_NOT_CONNECTED };
  const session = await getSession();
  const slug = String(formData.get('slug') ?? '');
  if (!session) redirect(`/auth/login?next=${encodeURIComponent(`/donate/${slug}/checkout`)}`);
  if (session.profile.suspended) return { error: '이용이 중지된 계정입니다. 고객센터로 문의해주세요.' };
  const f = await repo.getFundraiser(slug);
  if (!f || !canDonate(f)) return { error: '현재 기부할 수 없는 모금함입니다. 모금 기간과 진행 상태를 확인해주세요.' };
  const amount = parseAmount(formData.get('amount'));
  if (!Number.isSafeInteger(amount) || amount < MIN || amount > MAX) return { error: `기부 금액은 ${MIN.toLocaleString()}원부터 ${MAX.toLocaleString()}원까지 입력할 수 있습니다.` };
  const depositor = String(formData.get('depositor_name') ?? '').trim();
  if (depositor.length < 2 || depositor.length > 30) return { error: '입금자명을 2~30자로 입력해주세요. 실제 이체할 때 쓰는 이름과 같아야 합니다.' };
  const message = String(formData.get('message') ?? '').trim().slice(0, 200);
  if (!formData.get('agree')) return { error: '안내 내용을 확인했다는 항목에 체크해주세요.' };
  const supabase = await createClient();
  const { data, error } = await supabase.from('donations').insert({
    user_id: session.user.id, fundraiser_id: f.id, kind: 'donation', amount, status: 'pending', method: 'transfer',
    depositor_name: depositor, anonymous: formData.get('anonymous') === 'on', message
  }).select('id').single();
  if (error || !data) return { error: '기부 신청을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.' };
  redirect(`/donate/${slug}/checkout/complete?d=${data.id}`);
}

export async function cancelPendingDonation(id: string): Promise<ActionResult> {
  if (!hasSupabase) return { error: DB_NOT_CONNECTED };
  const session = await getSession();
  if (!session) return { error: '로그인이 필요합니다.' };
  const supabase = await createClient();
  const { data: d } = await supabase.from('donations').select('id, status, user_id').eq('id', id).maybeSingle();
  if (!d || d.user_id !== session.user.id) return { error: '본인의 기부 내역만 취소할 수 있습니다.' };
  if (d.status !== 'pending') return { error: '입금 확인 대기 중인 기부만 취소할 수 있습니다. 확인된 기부는 환불을 요청해주세요.' };
  const { error } = await supabase.from('donations').update({ status: 'cancelled' }).eq('id', id);
  if (error) return { error: '취소하지 못했습니다. 다시 시도해주세요.' };
  revalidatePath('/my');
  return { ok: true, message: '기부 신청을 취소했습니다.' };
}

export async function requestRefund(_: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!hasSupabase) return { error: DB_NOT_CONNECTED };
  const session = await getSession();
  if (!session) return { error: '로그인이 필요합니다.' };
  const id = String(formData.get('donation_id') ?? '');
  const reason = String(formData.get('reason') ?? '').trim();
  if (reason.length < 5) return { error: '환불 사유를 5자 이상 적어주세요.' };
  const supabase = await createClient();
  const { data: d } = await supabase.from('donations').select('id, status, kind, user_id, confirmed_at, fundraiser_id').eq('id', id).maybeSingle();
  if (!d || d.user_id !== session.user.id) return { error: '본인의 기부 내역만 환불 요청할 수 있습니다.' };
  if (d.status !== 'success' || d.kind === 'refund') return { error: '입금이 확인된 기부만 환불 요청할 수 있습니다.' };
  if (d.confirmed_at && Date.now() - new Date(d.confirmed_at).getTime() > 7 * 86400000) return { error: '환불 요청 기간(입금 확인 후 7일)이 지났습니다. 고객센터로 문의해주세요.' };
  const { data: open } = await supabase.from('refund_requests').select('id').eq('donation_id', id).neq('status', 'rejected').maybeSingle();
  if (open) return { error: '이미 환불을 요청한 기부입니다.' };
  const { error } = await supabase.from('refund_requests').insert({ donation_id: id, user_id: session.user.id, reason });
  if (error) return { error: '환불 요청을 저장하지 못했습니다.' };
  revalidatePath('/my');
  return { ok: true, message: '환불 요청을 접수했습니다. 운영팀 확인 후 처리됩니다.' };
}

export async function createPlan(_: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!hasSupabase) return { error: DB_NOT_CONNECTED };
  const session = await getSession();
  const slug = String(formData.get('slug') ?? '');
  if (!session) redirect(`/auth/login?next=${encodeURIComponent(`/monthly/${slug}`)}`);
  const org = await repo.getOrganization(slug);
  if (!org) return { error: '단체를 찾을 수 없습니다.' };
  const amount = parseAmount(formData.get('amount'));
  const day = Number(formData.get('day'));
  if (!Number.isSafeInteger(amount) || amount < MIN || amount > MAX) return { error: '월 기부 금액은 1,000원부터 10,000,000원까지 입력할 수 있습니다.' };
  if (![5, 10, 15, 20, 25, 28, 31].includes(day)) return { error: '결제일을 선택해주세요.' };
  if (!formData.get('agree')) return { error: '약정 내용을 확인했다는 항목에 체크해주세요.' };
  const next = nextDate(new Date(), day);
  const supabase = await createClient();
  const { error } = await supabase.from('recurring_plans').insert({ user_id: session.user.id, organization_id: org.id, amount, day, next_date: next, status: 'active' });
  if (error) return { error: '약정을 저장하지 못했습니다.' };
  revalidatePath('/my');
  redirect('/my?view=monthly&created=1');
}

export async function updatePlan(id: string, action: 'pause' | 'resume' | 'cancel' | 'amount', amount?: number): Promise<ActionResult> {
  if (!hasSupabase) return { error: DB_NOT_CONNECTED };
  const session = await getSession();
  if (!session) return { error: '로그인이 필요합니다.' };
  const supabase = await createClient();
  const { data: p } = await supabase.from('recurring_plans').select('*').eq('id', id).eq('user_id', session.user.id).maybeSingle();
  if (!p) return { error: '약정을 찾을 수 없습니다.' };
  if (p.status === 'cancelled') return { error: '이미 해지된 약정입니다.' };
  const patch: Record<string, unknown> = {};
  if (action === 'pause') patch.status = 'paused';
  if (action === 'resume') { patch.status = 'active'; patch.next_date = nextDate(new Date(), p.day); }
  if (action === 'cancel') patch.status = 'cancelled';
  if (action === 'amount') { if (!amount || amount < MIN || amount > MAX) return { error: '월 금액은 1,000원 이상 10,000,000원 이하로 입력해주세요.' }; patch.amount = amount; }
  const { error } = await supabase.from('recurring_plans').update(patch).eq('id', id);
  if (error) return { error: '변경하지 못했습니다.' };
  revalidatePath('/my');
  return { ok: true, message: { pause: '약정을 일시중지했습니다.', resume: '약정을 재개했습니다.', cancel: '약정을 해지했습니다.', amount: '월 금액을 변경했습니다.' }[action] };
}

// 다음 결제 예정일: 다음 달의 지정일, 짧은 달은 말일로 조정 (한국 시간 기준)
export async function nextDateFor(day: number) { return nextDate(new Date(), day); }
function nextDate(from: Date, day: number) {
  const kst = new Date(from.getTime() + 9 * 3600000);
  const y = kst.getUTCFullYear(), m = kst.getUTCMonth() + 1; // next month
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const d = new Date(Date.UTC(y, m, Math.min(day, last)));
  return d.toISOString().slice(0, 10);
}
