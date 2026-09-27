// 미리보기(데이터베이스 연결 전) 모드 전용 관리자 예시 데이터 — 화면 확인용. 실제 DB에는 넣지 않는다.
import { campaigns, content, fundraisers, organizations, sampleRegistrations } from './seed-data.mjs';
import type { AuditLog, CampaignRegistration, Content, Donation, Fundraiser, Inquiry, Organization, Profile, RecurringPlan, RefundRequest } from './types';

const ago = (h: number) => new Date(Date.now() - h * 3600000).toISOString();
const orgs = organizations as Organization[];
const funds = fundraisers as unknown as Fundraiser[];

export const previewOrganizations = orgs;
export const previewFundraisers = funds.map((f) => ({ ...f, organization: orgs.find((o) => o.id === f.organization_id) ?? null }));
export const previewContent = content as Content[];
export const previewUsers: Profile[] = [
  { id: 'p-1', email: 'admin@example.com', name: '퀸만덕 관리자', role: 'admin', admin_role: 'super', interests: [], is_public: true, suspended: false, created_at: ago(240) },
  { id: 'p-2', email: 'donor1@example.com', name: '나눔이', role: 'donor', admin_role: null, interests: ['어르신'], is_public: true, suspended: false, created_at: ago(120) },
  { id: 'p-3', email: 'donor2@example.com', name: '제주러너', role: 'donor', admin_role: null, interests: [], is_public: false, suspended: false, created_at: ago(30) },
  { id: 'p-4', email: 'spam@example.com', name: '광고계정', role: 'donor', admin_role: null, interests: [], is_public: false, suspended: true, created_at: ago(10) }
];
const donation = (i: number, status: Donation['status'], amount: number, name: string, h: number): Donation & { profile: { name: string } | null; fundraiser: { id: string; slug: string; title: string } | null; organization: null } => ({
  id: `d-${i}`, number: `QM-PREVIEW-${String(i).padStart(3, '0')}`, user_id: 'p-2', fundraiser_id: funds[i % funds.length].id, organization_id: null, plan_id: null, kind: 'donation', amount, status, method: 'transfer',
  depositor_name: name, anonymous: i % 3 === 0, message: '', original_id: null, confirmed_at: status === 'success' ? ago(h - 2) : null, created_at: ago(h),
  profile: { name: '나눔이' }, fundraiser: { id: funds[i % funds.length].id, slug: funds[i % funds.length].slug, title: funds[i % funds.length].title }, organization: null
});
export const previewDonations = [donation(1, 'pending', 30000, '김나눔', 3), donation(2, 'success', 50000, '이온기', 28), donation(3, 'cancelled', 10000, '박마음', 50), donation(4, 'pending', 100000, '최희망', 6)];
export const previewRefunds = [{ id: 'r-1', donation_id: 'd-2', user_id: 'p-2', reason: '금액을 잘못 입력했습니다.', status: 'requested', review_reason: null, created_at: ago(5), donation: previewDonations[1], profile: { name: '나눔이' } }] as unknown as (RefundRequest & { donation: Donation | null; profile: { name: string } | null })[];
export const previewPlans = [{ id: 'pl-1', user_id: 'p-2', organization_id: orgs[0].id, amount: 20000, day: 25, next_date: ago(-240), status: 'active', created_at: ago(400), profile: { name: '나눔이' }, organization: { name: orgs[0].name } }] as unknown as (RecurringPlan & { profile: { name: string } | null; organization: { name: string } | null })[];
export const previewInquiries: (Inquiry & { profile: { name: string } | null })[] = [
  { id: 'i-1', user_id: null, email: 'runner@example.com', category: '기타', title: '기부런 당일 주차가 가능한가요?', body: '행사장 근처에 주차할 곳이 있는지 궁금합니다. 가족과 함께 가려고 합니다.', answer: null, answered_at: null, created_at: ago(4), profile: null },
  { id: 'i-2', user_id: 'p-2', email: 'donor1@example.com', category: '기부', title: '입금자명을 잘못 적었어요', body: '신청할 때 입금자명을 다르게 적었는데 확인 가능할까요?', answer: '확인해 입금 처리했습니다. 감사합니다.', answered_at: ago(20), created_at: ago(26), profile: { name: '나눔이' } }
];
export const previewReports = [
  { id: 'rp-1', reason: '광고성 댓글', status: 'requested', resolution: null, created_at: ago(2), comment: { id: 'c-1', body: '여기서 확인하면 혜택이… (외부 링크)', hidden: false }, profile: { name: '제주러너' } },
  { id: 'rp-2', reason: '욕설', status: 'resolved', resolution: '숨김 처리', created_at: ago(70), comment: { id: 'c-2', body: '(숨김 처리된 댓글)', hidden: true }, profile: { name: '나눔이' } }
];
export const previewLogs: AuditLog[] = [
  { id: 'l-1', actor_id: 'p-1', actor_name: '퀸만덕 관리자', action: '참가비 입금 확인', target_type: 'campaign_registration', target_id: 'x', detail: { name: '김하늘', status: 'confirmed' }, created_at: ago(1) },
  { id: 'l-2', actor_id: 'p-1', actor_name: '퀸만덕 관리자', action: '캠페인 수정', target_type: 'campaign', target_id: 'y', detail: { title: '[우리도 오늘은 구세군] 기부런' }, created_at: ago(12) },
  { id: 'l-3', actor_id: 'p-1', actor_name: '퀸만덕 관리자', action: '문의 답변', target_type: 'inquiry', target_id: 'i-2', detail: { title: '입금자명을 잘못 적었어요' }, created_at: ago(20) }
];
export const previewPendingRegistrations = (sampleRegistrations as CampaignRegistration[]).filter((r) => r.status === 'pending').map((r) => ({ ...r, campaign: { id: r.campaign_id, title: (campaigns as { id: string; title: string }[]).find((c) => c.id === r.campaign_id)?.title ?? '행사' } }));
