import Link from 'next/link';
import { adminCampaigns, adminRegistrations } from '@/lib/data/admin';
import { date, dateTime, campaignTypeNames } from '@/lib/format';
import { AdminTitle, AdminTable, AdminBadge, AdminNotice } from '@/components/admin/AdminUI';
import { ActionButton } from '@/components/admin/AdminActions';
import { Chips } from '@/components/ui';
import { setCampaignReview, setRegistrationOpen, setRegistrationStatus } from '@/lib/actions/admin';
import type { Campaign } from '@/lib/data/types';

export const metadata = { title: '캠페인·참가 신청' };

const isFull = (c: Campaign) => c.capacity != null && (c.confirmed_count ?? 0) >= c.capacity;

export default async function AdminCampaignsPage({ searchParams }: { searchParams: Promise<{ id?: string; status?: string }> }) {
  const { id, status: statusParam } = await searchParams;
  const campaigns = await adminCampaigns();
  const target = campaigns.find((c) => c.id === id);
  const all = target ? await adminRegistrations(target.id) : [];
  // 선착순 처리 순서가 보이도록 신청 순번(오래된 순 1번)을 매긴다
  const numbered = all.map((r, i) => ({ ...r, no: i + 1 }));
  const status = ['pending', 'confirmed', 'cancelled'].includes(statusParam ?? '') ? statusParam! : '';
  const rows = status ? numbered.filter((r) => r.status === status) : numbered;
  const questions = target?.details.questions ?? [];
  const confirmed = target?.confirmed_count ?? 0;
  const full = target ? isFull(target) : false;
  const tally = (s: string) => all.filter((r) => r.status === s).length;
  const href = (s: string) => `/admin/campaigns?${new URLSearchParams({ id: target?.id ?? '', ...(s ? { status: s } : {}) })}#roster`;
  return (
    <>
      <AdminTitle title="캠페인·참가 신청" text="행사 캠페인은 사이트에서 직접 참가 신청을 받습니다. 통장에서 참가비 입금을 확인한 뒤 신청자의 ‘입금 확인’을 누르면 참가가 확정되고 모집 인원이 올라갑니다. 입금 확인 인원이 정원에 닿으면 신청이 자동 마감됩니다." />
      <AdminTable headers={['캠페인', '유형', '기간', '공개', '모집 현황', '작업']} rows={campaigns.map((c) => [
        <><b>{c.title}</b><small>{c.partner_name}</small></>, campaignTypeNames[c.type] ?? c.type, `${date(c.start_at)} ~ ${date(c.end_at)}`,
        <AdminBadge key="review" value={c.review === 'approved' ? 'approved' : 'draft'} />,
        c.type === 'event'
          ? <><b>입금 확인 {c.confirmed_count ?? 0}{c.capacity != null ? ` / ${c.capacity}명` : '명'}</b><small>신청 {c.registrations ?? 0}명 · {isFull(c) ? <span className="badge status-rejected">정원 마감</span> : c.registration_open ? <span className="badge status-received">접수 중</span> : <span className="badge status-draft">신청 마감</span>}</small></>
          : `응원 ${c.participations ?? 0}명`,
        <span key="ops" style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
          {c.type === 'event' && <Link className="button small" href={`/admin/campaigns?id=${c.id}#roster`}>신청자 명단</Link>}
          {c.type === 'event' && <ActionButton label={c.registration_open ? '신청 마감' : '신청 재개'} className="button small secondary" onRun={setRegistrationOpen.bind(null, c.id, !c.registration_open)} />}
          <ActionButton label={c.review === 'approved' ? '숨기기' : '공개'} className="button small secondary" onRun={setCampaignReview.bind(null, c.id, c.review === 'approved' ? 'draft' : 'approved')} />
          <Link className="button small secondary" href={`/campaigns/${c.slug}`} target="_blank">보기</Link>
        </span>
      ])} empty="등록된 캠페인이 없습니다." />
      {target && (
        <div id="roster">
          <AdminTitle title={`신청자 명단 — ${target.title}`} text={`입금 확인 ${confirmed}${target.capacity != null ? ` / ${target.capacity}명` : '명'}${full ? ' · 정원 마감 (신규 신청 중단)' : target.capacity != null ? ` · 잔여 ${target.capacity - confirmed}석` : ''} · 입금 대기 ${tally('pending')}명 · 취소 ${tally('cancelled')}명`}>
            <a className="button small primary" href={`/api/admin/campaigns/${target.id}/registrations.csv`}>CSV 내려받기</a>
          </AdminTitle>
          {target.details.bank && <AdminNotice>입금 계좌: {target.details.bank.bank} {target.details.bank.account} (예금주 {target.details.bank.holder}). 통장 입금자명과 명단의 ‘입금자명’(없으면 성함)을 대조해 확인하세요.</AdminNotice>}
          <Chips items={[['', `전체 ${all.length}`, href('')], ['pending', `입금 대기 ${tally('pending')}`, href('pending')], ['confirmed', `입금 확인 ${tally('confirmed')}`, href('confirmed')], ['cancelled', `취소 ${tally('cancelled')}`, href('cancelled')]]} current={status} label="신청 상태" />
          <AdminTable headers={['No.', '신청일시', '성함', '입금자명', '연락처', '이메일', ...questions.map((q) => q.short ?? q.label), '성별·연령', '상태', '작업']} rows={rows.map((r) => [
            r.no, dateTime(r.created_at), <b key="n">{r.name}</b>, r.depositor_name || r.name, r.phone ?? '—', r.email,
            ...questions.map((q) => r.answers?.[q.key] ?? '—'),
            [r.gender, r.age_group].filter(Boolean).join(' · ') || '—',
            <AdminBadge key="s" value={r.status} />,
            <span key="ops" style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
              {r.status === 'pending' && !full && <ActionButton label="입금 확인" onRun={setRegistrationStatus.bind(null, r.id, 'confirmed')} />}
              {r.status === 'pending' && full && <span className="badge status-draft">정원 마감</span>}
              {r.status === 'confirmed' && <ActionButton label="입금 확인 취소" className="button small secondary" confirmText="입금 확인을 취소하고 대기 상태로 되돌릴까요? 모집 인원이 1명 줄어듭니다." onRun={setRegistrationStatus.bind(null, r.id, 'pending')} />}
              {r.status !== 'cancelled' && <ActionButton label="신청 취소" className="button small secondary" confirmText="이 신청을 취소 처리할까요?" onRun={setRegistrationStatus.bind(null, r.id, 'cancelled')} />}
              {r.status === 'cancelled' && <ActionButton label="대기로 복구" className="button small secondary" onRun={setRegistrationStatus.bind(null, r.id, 'pending')} />}
            </span>
          ])} empty={status ? '해당 상태의 신청이 없습니다.' : '아직 신청자가 없습니다.'} />
          <AdminNotice>참여 확인 항목은 신청 시 모두 체크해야 제출되므로 명단의 모든 신청자가 동의한 상태입니다. 정원이 찬 뒤 입금한 신청자는 환불 후 ‘신청 취소’로 정리해주세요. 개인정보는 행사 운영 목적으로만 사용하고 행사 종료 후 파기해주세요.</AdminNotice>
        </div>
      )}
    </>
  );
}
