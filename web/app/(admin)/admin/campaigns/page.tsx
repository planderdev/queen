import Link from 'next/link';
import { adminCampaigns, adminRegistrations } from '@/lib/data/admin';
import { date, dateTime, campaignTypeNames } from '@/lib/format';
import { AdminTitle, AdminTable, AdminBadge, AdminNotice } from '@/components/admin/AdminUI';
import { ActionButton } from '@/components/admin/AdminActions';
import { setCampaignReview, setRegistrationOpen, setRegistrationStatus } from '@/lib/actions/admin';

export const metadata = { title: '캠페인·참가 신청' };

export default async function AdminCampaignsPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const campaigns = await adminCampaigns();
  const target = campaigns.find((c) => c.id === id);
  const rows = target ? await adminRegistrations(target.id) : [];
  const confirmed = rows.filter((r) => r.status === 'confirmed').length;
  return (
    <>
      <AdminTitle title="캠페인·참가 신청" text="행사 캠페인은 사이트에서 직접 참가 신청을 받습니다. 신청자 명단을 확인하고 입금이 확인되면 ‘참가 확정’으로 바꿔주세요. 명단은 CSV로 내려받을 수 있습니다." />
      <AdminTable headers={['캠페인', '유형', '기간', '공개', '신청', '작업']} rows={campaigns.map((c) => [
        <><b>{c.title}</b><small>{c.partner_name}</small></>, campaignTypeNames[c.type] ?? c.type, `${date(c.start_at)} ~ ${date(c.end_at)}`,
        <AdminBadge key="review" value={c.review === 'approved' ? 'approved' : 'draft'} />,
        c.type === 'event' ? <>{c.registrations ?? 0}명 {c.registration_open ? <span className="badge status-received">접수 중</span> : <span className="badge status-draft">마감</span>}</> : `응원 ${c.participations ?? 0}명`,
        <span key="ops" style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
          {c.type === 'event' && <Link className="button small" href={`/admin/campaigns?id=${c.id}`}>신청자 명단</Link>}
          {c.type === 'event' && <ActionButton label={c.registration_open ? '신청 마감' : '신청 재개'} className="button small secondary" onRun={setRegistrationOpen.bind(null, c.id, !c.registration_open)} />}
          <ActionButton label={c.review === 'approved' ? '숨기기' : '공개'} className="button small secondary" onRun={setCampaignReview.bind(null, c.id, c.review === 'approved' ? 'draft' : 'approved')} />
          <Link className="button small secondary" href={`/campaigns/${c.slug}`} target="_blank">보기</Link>
        </span>
      ])} empty="등록된 캠페인이 없습니다." />
      {target && (
        <>
          <AdminTitle title={`신청자 명단 — ${target.title}`} text={`총 ${rows.length}명 신청 · 확정 ${confirmed}명 · 취소 ${rows.filter((r) => r.status === 'cancelled').length}명`}>
            <a className="button small primary" href={`/api/admin/campaigns/${target.id}/registrations.csv`}>CSV 내려받기</a>
          </AdminTitle>
          <AdminTable headers={['신청일시', '성함', '연락처', '이메일', '성별·연령', '입금자명', '회원', '상태', '작업']} rows={rows.map((r) => [
            dateTime(r.created_at), <b key="n">{r.name}</b>, r.phone ?? '—', r.email, [r.gender, r.age_group].filter(Boolean).join(' · ') || '—', r.depositor_name ?? '—', r.user_id ? '회원' : '비회원',
            <AdminBadge key="s" value={r.status} />,
            <span key="ops" style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
              {r.status !== 'confirmed' && <ActionButton label="참가 확정" onRun={setRegistrationStatus.bind(null, r.id, 'confirmed')} />}
              {r.status !== 'cancelled' && <ActionButton label="취소" className="button small secondary" confirmText="이 신청을 취소 처리할까요?" onRun={setRegistrationStatus.bind(null, r.id, 'cancelled')} />}
              {r.status !== 'pending' && <ActionButton label="대기로" className="button small secondary" onRun={setRegistrationStatus.bind(null, r.id, 'pending')} />}
            </span>
          ])} empty="아직 신청자가 없습니다." />
          <AdminNotice>참여 확인 항목은 신청 시 모두 체크해야 제출되므로 명단의 모든 신청자가 동의한 상태입니다. 개인정보는 행사 운영 목적으로만 사용하고 행사 종료 후 파기해주세요.</AdminNotice>
        </>
      )}
    </>
  );
}
