'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { hasSupabase, DB_NOT_CONNECTED } from '@/lib/env';
import type { ActionResult } from '@/components/site/ActionForm';

type Roles = Array<'content' | 'review' | 'finance'>;
const str = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();
// 관리자 화면의 datetime-local 값(YYYY-MM-DDTHH:mm)은 한국 시간으로 입력된다. 서버(UTC)에서 그대로 new Date() 하면 9시간 밀리므로 +09:00을 붙여 해석한다.
const kst = (v: string) => new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(v) ? v : `${v.length === 16 ? `${v}:00` : v}+09:00`);
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || `item-${Date.now().toString(36)}`;

async function guard(roles: Roles) {
  if (!hasSupabase) throw new Error(DB_NOT_CONNECTED);
  const session = await requireAdmin(roles);
  const supabase = await createClient();
  const log = async (action: string, targetType: string, targetId: string, detail?: unknown) => {
    await supabase.from('audit_logs').insert({ actor_id: session.user.id, action, target_type: targetType, target_id: targetId, detail: detail ?? null });
  };
  const notify = async (userId: string | null | undefined, text: string, href: string | null = null) => {
    if (userId) await supabase.from('notifications').insert({ user_id: userId, text, href });
  };
  return { session, supabase, log, notify };
}
const wrap = async (roles: Roles, fn: (ctx: Awaited<ReturnType<typeof guard>>) => Promise<ActionResult>): Promise<ActionResult> => {
  try { return await fn(await guard(roles)); } catch (e) { return { error: e instanceof Error ? e.message : '처리하지 못했습니다.' }; }
};

// ---- 입금 확인 / 기부 상태 ----
export async function setDonationStatus(id: string, status: 'success' | 'cancelled' | 'failed'): Promise<ActionResult> {
  return wrap(['finance'], async ({ session, supabase, log, notify }) => {
    const { data: d } = await supabase.from('donations').select('id, status, user_id, amount, number, fundraiser:fundraisers(slug, title)').eq('id', id).maybeSingle();
    if (!d) return { error: '기부 내역을 찾을 수 없습니다.' };
    if (d.status === 'success' && status !== 'success') return { error: '이미 확인된 기부입니다. 환불 절차로 처리해주세요.' };
    const patch = status === 'success' ? { status, confirmed_at: new Date().toISOString(), confirmed_by: session.user.id } : { status };
    const { error } = await supabase.from('donations').update(patch).eq('id', id);
    if (error) return { error: error.message };
    await log(`기부 ${status === 'success' ? '입금 확인' : status === 'cancelled' ? '취소' : '실패 처리'}`, 'donation', id, { number: d.number, amount: d.amount });
    const fund = Array.isArray(d.fundraiser) ? d.fundraiser[0] : d.fundraiser;
    if (status === 'success') await notify(d.user_id, `입금이 확인되어 기부가 완료되었습니다. (${d.number})`, fund ? `/donate/${fund.slug}` : '/my?view=donations');
    revalidatePath('/admin/donations'); revalidatePath('/my');
    return { ok: true, message: '기부 상태를 변경했습니다.' };
  });
}

export async function resolveRefund(id: string, decision: 'approved' | 'rejected', reason: string): Promise<ActionResult> {
  return wrap(['finance'], async ({ session, supabase, log, notify }) => {
    if (reason.trim().length < 2) return { error: '처리 사유를 입력해주세요.' };
    const { data: r } = await supabase.from('refund_requests').select('*, donation:donations(*)').eq('id', id).maybeSingle();
    if (!r || r.status !== 'requested') return { error: '접수 상태의 환불 요청만 처리할 수 있습니다.' };
    const donation = Array.isArray(r.donation) ? r.donation[0] : r.donation;
    if (decision === 'approved') {
      const { error } = await supabase.from('donations').insert({ user_id: donation.user_id, fundraiser_id: donation.fundraiser_id, organization_id: donation.organization_id, kind: 'refund', amount: donation.amount, status: 'success', method: donation.method, anonymous: donation.anonymous, original_id: donation.id, confirmed_at: new Date().toISOString(), confirmed_by: session.user.id });
      if (error) return { error: error.message };
    }
    await supabase.from('refund_requests').update({ status: decision, review_reason: reason.trim(), reviewed_by: session.user.id }).eq('id', id);
    await log(`환불 ${decision === 'approved' ? '승인' : '반려'}: ${reason.trim()}`, 'refund_request', id, { donation: donation.number });
    await notify(r.user_id, decision === 'approved' ? `환불 요청이 승인되었습니다. (${donation.number})` : `환불 요청이 반려되었습니다: ${reason.trim()}`, '/my?view=donations');
    revalidatePath('/admin/refunds'); revalidatePath('/my');
    return { ok: true, message: '환불 요청을 처리했습니다.' };
  });
}

// ---- 모금함 / 단체 ----
export async function saveFundraiser(_: ActionResult, fd: FormData): Promise<ActionResult> {
  const result = await wrap(['review'], async ({ supabase, log }) => {
    const id = str(fd, 'id');
    const title = str(fd, 'title'), story = str(fd, 'story'), category = str(fd, 'category');
    const target = Number(str(fd, 'target').replace(/[^\d]/g, ''));
    const budget = [0, 1, 2, 3].map((i) => ({ label: str(fd, `budget_label_${i}`), amount: Number(str(fd, `budget_amount_${i}`).replace(/[^\d]/g, '')) })).filter((b) => b.label);
    if (title.length < 2) return { error: '제목을 입력해주세요.' };
    if (!str(fd, 'organization_id')) return { error: '단체를 선택해주세요.' };
    if (!Number.isSafeInteger(target) || target <= 0) return { error: '목표액을 확인해주세요.' };
    if (!str(fd, 'start_at') || !str(fd, 'end_at') || kst(str(fd, 'start_at')) >= kst(str(fd, 'end_at'))) return { error: '종료일은 시작일 이후여야 합니다.' };
    if (budget.length && budget.reduce((a, b) => a + b.amount, 0) !== target) return { error: '사용 계획 합계는 목표액과 같아야 합니다.' };
    const row = {
      title, story, category, organization_id: str(fd, 'organization_id'), image: str(fd, 'image') || null, region: str(fd, 'region') || '전국', target,
      start_at: kst(str(fd, 'start_at')).toISOString(), end_at: kst(str(fd, 'end_at')).toISOString(), budget,
      review: str(fd, 'review') || 'approved', publication: str(fd, 'publication') || 'active', slug: str(fd, 'slug') || slugify(title)
    };
    const { data, error } = id ? await supabase.from('fundraisers').update(row).eq('id', id).select('id').single() : await supabase.from('fundraisers').insert(row).select('id').single();
    if (error) return { error: error.code === '23505' ? '이미 사용 중인 슬러그입니다.' : error.message };
    await log(id ? '모금함 수정' : '모금함 등록', 'fundraiser', data.id, { title });
    revalidatePath('/admin/fundraisers'); revalidatePath('/donate'); revalidatePath('/');
    return { ok: true, message: '저장했습니다.', ...(id ? {} : { redirect: `/admin/fundraisers/${data.id}` }) } as ActionResult & { redirect?: string };
  });
  if ((result as { redirect?: string }).redirect) redirect((result as { redirect: string }).redirect);
  return result;
}

export async function saveOrganization(_: ActionResult, fd: FormData): Promise<ActionResult> {
  return wrap(['review'], async ({ supabase, log }) => {
    const id = str(fd, 'id'), name = str(fd, 'name');
    if (name.length < 2) return { error: '단체명을 입력해주세요.' };
    const row = { name, category: str(fd, 'category') || '지역사회', description: str(fd, 'description'), image: str(fd, 'image') || null, status: str(fd, 'status') || 'approved', slug: str(fd, 'slug') || slugify(name) };
    const { data, error } = id ? await supabase.from('organizations').update(row).eq('id', id).select('id').single() : await supabase.from('organizations').insert(row).select('id').single();
    if (error) return { error: error.code === '23505' ? '이미 사용 중인 슬러그입니다.' : error.message };
    await log(id ? '단체 수정' : '단체 등록', 'organization', data.id, { name });
    revalidatePath('/admin/organizations'); revalidatePath('/organizations');
    return { ok: true, message: '저장했습니다.' };
  });
}

// ---- 콘텐츠 ----
export async function saveContent(_: ActionResult, fd: FormData): Promise<ActionResult> {
  return wrap(['content'], async ({ session, supabase, log }) => {
    const id = str(fd, 'id'), type = str(fd, 'type'), title = str(fd, 'title');
    if (!['notice', 'faq', 'story', 'news', 'banner', 'recommend'].includes(type)) return { error: '콘텐츠 유형을 선택해주세요.' };
    if (title.length < 2) return { error: '제목을 입력해주세요.' };
    const body = str(fd, 'body');
    if (type !== 'recommend' && body.length < 2) return { error: '본문을 입력해주세요.' };
    const fundraiserId = str(fd, 'fundraiser_id') || null;
    if ((type === 'recommend' || type === 'news') && !fundraiserId) return { error: '연결할 모금함을 선택해주세요.' };
    const row = { type, title, body, category: str(fd, 'category') || null, image: str(fd, 'image') || null, fundraiser_id: fundraiserId, published: fd.get('published') === 'on', slug: str(fd, 'slug') || (['notice', 'story'].includes(type) ? slugify(title) : null), created_by: session.user.id };
    const { data, error } = id ? await supabase.from('content').update(row).eq('id', id).select('id').single() : await supabase.from('content').insert(row).select('id').single();
    if (error) return { error: error.code === '23505' ? '이미 사용 중인 슬러그입니다.' : error.message };
    await log(id ? '콘텐츠 수정' : '콘텐츠 등록', 'content', data.id, { type, title });
    revalidatePath('/admin/content'); revalidatePath('/'); revalidatePath('/support'); revalidatePath('/stories');
    return { ok: true, message: '저장했습니다.' };
  });
}
export async function toggleContent(id: string): Promise<ActionResult> {
  return wrap(['content'], async ({ supabase, log }) => {
    const { data: c } = await supabase.from('content').select('published, title').eq('id', id).maybeSingle();
    if (!c) return { error: '콘텐츠를 찾을 수 없습니다.' };
    await supabase.from('content').update({ published: !c.published }).eq('id', id);
    await log(`콘텐츠 ${c.published ? '숨김' : '공개'}`, 'content', id, { title: c.title });
    revalidatePath('/admin/content'); revalidatePath('/'); revalidatePath('/support'); revalidatePath('/stories');
    return { ok: true, message: c.published ? '숨겼습니다.' : '공개했습니다.' };
  });
}

// ---- 문의 / 신고 / 회원 ----
export async function answerInquiry(_: ActionResult, fd: FormData): Promise<ActionResult> {
  return wrap(['content', 'review', 'finance'], async ({ session, supabase, log, notify }) => {
    const id = str(fd, 'id'), answer = str(fd, 'answer');
    if (answer.length < 2) return { error: '답변 내용을 입력해주세요.' };
    const { data: q } = await supabase.from('inquiries').select('user_id, title').eq('id', id).maybeSingle();
    if (!q) return { error: '문의를 찾을 수 없습니다.' };
    await supabase.from('inquiries').update({ answer, answered_at: new Date().toISOString(), answered_by: session.user.id }).eq('id', id);
    await log('문의 답변', 'inquiry', id, { title: q.title });
    await notify(q.user_id, `문의 “${q.title}”에 답변이 등록되었습니다.`, '/my?view=inquiries');
    revalidatePath('/admin/inquiries'); revalidatePath('/my');
    return { ok: true, message: '답변을 저장했습니다.' };
  });
}
export async function moderateComment(reportId: string, hide: boolean, resolution: string): Promise<ActionResult> {
  return wrap(['content'], async ({ supabase, log }) => {
    if (resolution.trim().length < 2) return { error: '처리 사유를 입력해주세요.' };
    const { data: r } = await supabase.from('comment_reports').select('comment_id, status').eq('id', reportId).maybeSingle();
    if (!r || r.status !== 'requested') return { error: '접수 상태의 신고만 처리할 수 있습니다.' };
    await supabase.from('comments').update({ hidden: hide }).eq('id', r.comment_id);
    await supabase.from('comment_reports').update({ status: 'resolved', resolution: resolution.trim() }).eq('id', reportId);
    await log(hide ? '댓글 숨김' : '댓글 유지', 'comment', r.comment_id, { resolution });
    revalidatePath('/admin/moderation');
    return { ok: true, message: '신고를 처리했습니다.' };
  });
}
export async function setUserState(id: string, patch: { suspended?: boolean; role?: 'donor' | 'admin'; admin_role?: 'super' | 'content' | 'review' | 'finance' | null }): Promise<ActionResult> {
  return wrap([], async ({ session, supabase, log }) => {
    if (session.profile.admin_role !== 'super') return { error: '최고 관리자만 회원 권한을 변경할 수 있습니다.' };
    if (id === session.user.id && (patch.suspended || patch.role === 'donor')) return { error: '자신의 계정 권한은 낮출 수 없습니다.' };
    const { error } = await supabase.from('profiles').update(patch).eq('id', id);
    if (error) return { error: error.message };
    await log('회원 상태 변경', 'profile', id, patch);
    revalidatePath('/admin/users');
    return { ok: true, message: '회원 상태를 변경했습니다.' };
  });
}
export async function saveSettings(_: ActionResult, fd: FormData): Promise<ActionResult> {
  return wrap([], async ({ session, supabase, log }) => {
    if (session.profile.admin_role !== 'super') return { error: '최고 관리자만 설정을 변경할 수 있습니다.' };
    const list = (k: string) => str(fd, k).split(',').map((s) => s.trim()).filter(Boolean);
    const rows = [
      { key: 'categories', value: list('categories') }, { key: 'regions', value: list('regions') },
      { key: 'bank', value: { holder: str(fd, 'bank_holder'), bank: str(fd, 'bank_name'), account: str(fd, 'bank_account') } }
    ];
    const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'key' });
    if (error) return { error: error.message };
    await log('설정 변경', 'settings', 'settings', rows);
    revalidatePath('/', 'layout');
    return { ok: true, message: '설정을 저장했습니다.' };
  });
}

// 행사 캠페인 참가 신청 관리
export async function setRegistrationStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled'): Promise<ActionResult> {
  return wrap(['review'], async ({ supabase, log, notify }) => {
    const { data: r } = await supabase.from('campaign_registrations').select('id, user_id, name, campaign:campaigns(title, slug)').eq('id', id).maybeSingle();
    if (!r) return { error: '신청 내역을 찾을 수 없습니다.' };
    const { error } = await supabase.from('campaign_registrations').update({ status }).eq('id', id);
    if (error) return { error: error.message.includes('capacity_full') ? '정원이 모두 찼습니다. 입금 확인을 더 할 수 없습니다. 먼저 다른 신청의 입금 확인을 취소해주세요.' : '상태를 바꾸지 못했습니다.' };
    const campaign = Array.isArray(r.campaign) ? r.campaign[0] : r.campaign;
    await log(status === 'confirmed' ? '참가비 입금 확인' : status === 'cancelled' ? '참가 신청 취소' : '입금 확인 취소', 'campaign_registration', id, { name: r.name, status });
    if (status === 'confirmed') await notify(r.user_id, `“${campaign?.title ?? '캠페인'}” 참가비 입금이 확인되어 참가가 확정되었습니다.`, '/my?view=events');
    revalidatePath('/admin/campaigns'); revalidatePath('/campaigns', 'layout'); revalidatePath('/my');
    return { ok: true, message: status === 'confirmed' ? '입금을 확인했습니다. 참가 확정 인원에 반영했습니다.' : status === 'cancelled' ? '신청을 취소 처리했습니다.' : '입금 확인을 취소하고 대기 상태로 되돌렸습니다.' };
  });
}
export async function setRegistrationOpen(campaignId: string, open: boolean): Promise<ActionResult> {
  return wrap(['review'], async ({ supabase, log }) => {
    const { error } = await supabase.from('campaigns').update({ registration_open: open }).eq('id', campaignId);
    if (error) return { error: '설정을 바꾸지 못했습니다.' };
    await log(open ? '참가 신청 재개' : '참가 신청 마감', 'campaign', campaignId);
    revalidatePath('/admin/campaigns'); revalidatePath('/campaigns');
    return { ok: true, message: open ? '참가 신청을 다시 받습니다.' : '참가 신청을 마감했습니다.' };
  });
}
export async function setCampaignReview(campaignId: string, review: 'approved' | 'draft'): Promise<ActionResult> {
  return wrap(['review'], async ({ supabase, log }) => {
    const { error } = await supabase.from('campaigns').update({ review }).eq('id', campaignId);
    if (error) return { error: '설정을 바꾸지 못했습니다.' };
    await log(review === 'approved' ? '캠페인 공개' : '캠페인 숨김', 'campaign', campaignId);
    revalidatePath('/admin/campaigns'); revalidatePath('/campaigns'); revalidatePath('/');
    return { ok: true, message: review === 'approved' ? '캠페인을 공개했습니다.' : '캠페인을 목록에서 숨겼습니다.' };
  });
}

// 행사 캠페인 편집·등록 (관리자). 안내 문구·질문·입금 계좌·배너 문구까지 한 화면에서 저장한다.
const lines = (v: string) => v.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
export async function saveCampaign(_: ActionResult, fd: FormData): Promise<ActionResult> {
  const result = await wrap(['review'], async ({ supabase, log }) => {
    const id = str(fd, 'id');
    const title = str(fd, 'title');
    if (title.length < 2) return { error: '캠페인 제목을 입력해주세요.' };
    const start = str(fd, 'start_at'), end = str(fd, 'end_at');
    if (!start || !end || kst(start) >= kst(end)) return { error: '신청 마감일시는 시작일시 이후여야 합니다.' };
    const capacityRaw = str(fd, 'capacity').replace(/[^\d]/g, '');
    const capacity = capacityRaw ? Number(capacityRaw) : null;
    const fee = Number(str(fd, 'fee_amount').replace(/[^\d]/g, '') || 0);
    if (capacity != null && (!Number.isSafeInteger(capacity) || capacity < 1)) return { error: '정원은 1명 이상으로 입력하거나 비워 두세요(제한 없음).' };
    let existing: { details?: Record<string, unknown>; confirmed_count?: number } | null = null;
    if (id) {
      const { data } = await supabase.from('campaigns').select('details, confirmed_count').eq('id', id).maybeSingle();
      existing = data;
      if (capacity != null && (data?.confirmed_count ?? 0) > capacity) return { error: `이미 입금 확인된 인원(${data?.confirmed_count}명)보다 정원을 작게 할 수 없습니다.` };
    }
    // 질문: 한 줄에 "질문 | 보기1, 보기2, …". 기존 질문 순서의 key는 유지해 이미 받은 답변과 연결을 지킨다.
    const oldQs = ((existing?.details?.questions as { key: string }[] | undefined) ?? []);
    const questions = [] as { key: string; label: string; short: string; required: boolean; options: string[] }[];
    for (const [i, line] of lines(str(fd, 'questions')).entries()) {
      const [label, opts = ''] = line.split('|').map((x) => x.trim());
      const options = opts.split(',').map((x) => x.trim()).filter(Boolean);
      if (!label || options.length < 2) return { error: `질문 ${i + 1}번째 줄은 "질문 | 보기1, 보기2" 형식으로 보기를 2개 이상 적어주세요.` };
      questions.push({ key: oldQs[i]?.key ?? `q${i + 1}`, label, short: label.replace(/\s*\(.*\)\s*$/, '').slice(0, 12), required: true, options });
    }
    const bank = { bank: str(fd, 'bank_bank'), account: str(fd, 'bank_account'), holder: str(fd, 'bank_holder') };
    if (fee > 0 && (!bank.bank || !bank.account || !bank.holder)) return { error: '참가비가 있으면 입금 계좌(은행·계좌번호·예금주)를 모두 입력해주세요.' };
    const heroHeading = lines(str(fd, 'hero_heading'));
    const details = {
      ...(existing?.details ?? {}),
      intro: str(fd, 'intro'), event_name: str(fd, 'event_name'), schedule: str(fd, 'schedule'), course: str(fd, 'course'),
      benefits: lines(str(fd, 'benefits')), agreements: lines(str(fd, 'agreements')), complete: str(fd, 'complete'), questions,
      bank: bank.bank || bank.account ? bank : undefined,
      hero: heroHeading.length ? { heading: heroHeading, description: lines(str(fd, 'hero_description')), cta: str(fd, 'hero_cta') || undefined } : undefined
    };
    const row = {
      title, description: str(fd, 'description'), partner_name: str(fd, 'partner_name'), image: str(fd, 'image') || null, type: 'event',
      slug: str(fd, 'slug') || slugify(title), review: str(fd, 'review') === 'approved' ? 'approved' : 'draft', registration_open: fd.get('registration_open') === 'on',
      start_at: kst(start).toISOString(), end_at: kst(end).toISOString(), capacity, fee_amount: fee, details, limit_amount: 0, rate: 1
    };
    const { data, error } = id ? await supabase.from('campaigns').update(row).eq('id', id).select('id, slug').single() : await supabase.from('campaigns').insert(row).select('id, slug').single();
    if (error) return { error: error.code === '23505' ? '이미 사용 중인 주소(슬러그)입니다.' : error.message };
    await log(id ? '캠페인 수정' : '캠페인 등록', 'campaign', data.id, { title });
    revalidatePath('/admin/campaigns'); revalidatePath('/campaigns', 'layout'); revalidatePath('/');
    return { ok: true, message: '캠페인을 저장했습니다.', ...(id ? {} : { redirect: `/admin/campaigns/${data.id}` }) } as ActionResult & { redirect?: string };
  });
  if ((result as { redirect?: string }).redirect) redirect((result as { redirect: string }).redirect);
  return result;
}

// 신청자 메모 (환불 완료·대리 신청 등 운영 메모). 빈 값이면 지운다.
export async function setRegistrationNote(id: string, note: string): Promise<ActionResult> {
  return wrap(['review'], async ({ supabase, log }) => {
    const value = note.trim().slice(0, 200) || null;
    const { error } = await supabase.from('campaign_registrations').update({ note: value }).eq('id', id);
    if (error) return { error: '메모를 저장하지 못했습니다.' };
    await log('참가 신청 메모', 'campaign_registration', id, { note: value });
    revalidatePath('/admin/campaigns');
    return { ok: true, message: value ? '메모를 저장했습니다.' : '메모를 지웠습니다.' };
  });
}

// 행사 종료 후 참가자 명단 파기(비식별화) — DB 함수가 최고 관리자·신청 마감 이후 조건을 다시 확인한다
export async function purgeRegistrations(campaignId: string, confirmWord: string): Promise<ActionResult> {
  return wrap([], async ({ session, supabase }) => {
    if (session.profile.admin_role !== 'super') return { error: '최고 관리자만 명단을 파기할 수 있습니다.' };
    if (confirmWord.trim() !== '파기') return { error: '확인을 위해 ‘파기’를 입력해주세요.' };
    const { data, error } = await supabase.rpc('purge_campaign_registrations', { p_campaign: campaignId });
    if (error) {
      const m = error.message;
      return { error: m.includes('not_ended') ? '신청 마감 이후에 파기할 수 있습니다.' : m.includes('forbidden') ? '최고 관리자만 명단을 파기할 수 있습니다.' : '명단을 파기하지 못했습니다. 잠시 후 다시 시도해주세요.' };
    }
    revalidatePath('/admin/campaigns'); revalidatePath('/admin/logs');
    return { ok: true, message: `참가자 ${data ?? 0}명의 개인정보를 파기했습니다. 내려받은 명단 파일도 삭제해주세요.` };
  });
}
