import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { repo } from '@/lib/data';
import { getSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { hasSupabase } from '@/lib/env';
import { money, date, dateTime } from '@/lib/format';
import { PageBanner } from '@/components/site/PageBanner';
import { Notice, SectionTitle } from '@/components/ui';
import { ParticipateButton } from '@/components/site/ParticipateButton';
import { RegistrationForm } from '@/components/site/RegistrationForm';
import type { Campaign } from '@/lib/data/types';

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const c = await repo.getCampaign((await params).slug); return { title: c?.title ?? '캠페인' }; }

export default async function CampaignPage({ params }: Props) {
  const c = await repo.getCampaign((await params).slug);
  if (!c) notFound();
  const session = await getSession();
  const now = Date.now();
  const available = new Date(c.start_at).getTime() <= now && now < new Date(c.end_at).getTime();
  if (c.type === 'event') return <EventCampaign c={c} available={available} defaults={session ? { name: session.profile.name, email: session.user.email } : undefined} />;
  let joined = false, used = 0;
  if (hasSupabase) {
    const supabase = await createClient();
    if (session) { const { data } = await supabase.from('participations').select('id').eq('campaign_id', c.id).eq('user_id', session.user.id).maybeSingle(); joined = Boolean(data); }
    const { data: m } = await supabase.from('matching_contributions').select('amount').eq('campaign_id', c.id).eq('status', 'approved');
    used = (m ?? []).reduce((a, x) => a + x.amount, 0);
  }
  const fund = c.fundraiser_id ? await repo.getFundraiser(c.fundraiser_id) : null;
  return (
    <>
      <PageBanner page="campaigns" title={c.title} />
      <div className="container program-page">
        <img className="program-cover" src={c.image ?? '/assets/images/community.jpg'} width={1100} height={550} alt="함께하는 나눔 활동 참고 이미지" />
        <article className="program-reading program-section">
          <SectionTitle title={<>우리의 작은 관심이<br />든든한 힘이 됩니다</>} text={c.description} />
          <section className="program-participation"><h2>함께하는 방법</h2><dl>
            <div><dt>참여 기간</dt><dd>{date(c.start_at)} ~ {date(c.end_at)}</dd></div>
            <div><dt>참여 방법</dt><dd>{c.type === 'matching' ? `직접 기부액의 1:${c.rate} 매칭` : '응원 약속 참여'}</dd></div>
            <div><dt>기업 지원 한도</dt><dd>{money(c.limit_amount)}</dd></div>
            <div><dt>승인된 기업 지원금</dt><dd>{money(used)}</dd></div>
            <div><dt>함께하는 기업</dt><dd>{c.partner_name}</dd></div>
          </dl>
          <p className="help">응원은 계정당 1회 참여할 수 있습니다. 댓글·공유만으로 금전 기부가 발생하지 않습니다. 매칭은 캠페인 기간 내 확인된 직접 기부에 대해 운영팀이 승인하며 잔여 한도를 적용합니다.</p>
          <div className="program-actions">
            {session ? <ParticipateButton campaignId={c.id} joined={joined} available={available} path={`/campaigns/${c.slug}`} /> : <Link className="button primary" href={`/auth/login?next=${encodeURIComponent(`/campaigns/${c.slug}`)}`}>로그인하고 응원 참여</Link>}
            {fund && <Link className="button secondary" href={`/donate/${fund.slug}`}>관련 모금함 보기</Link>}
          </div></section>
          <Notice>누적 응원 참여 {c.participations ?? 0}명 · 지원금은 별도 승인 거래만 합산합니다.</Notice>
        </article>
        <div className="program-actions"><Link className="button secondary" href="/campaigns">캠페인 목록</Link></div>
      </div>
    </>
  );
}

// 행사(참가 신청) 캠페인: 행사 안내 + 참가 신청서. 신청은 회원·비회원 모두 가능.
function EventCampaign({ c, available, defaults }: { c: Campaign; available: boolean; defaults?: { name?: string | null; email?: string | null } }) {
  const d = c.details;
  const open = available && c.registration_open && (c.capacity == null || (c.registrations ?? 0) < c.capacity);
  const [prizeHead, ...prizes] = d.benefits ?? [];
  return (
    <>
      <PageBanner page="campaigns" title={c.title} />
      <div className="container program-page">
        <img className="program-cover" src={c.image ?? '/assets/images/community.jpg'} width={1100} height={550} alt="행사 참고 이미지" />
        <article className="program-reading program-section">
          <SectionTitle title={<>함께 달리고,<br />함께 나누는 하루</>} text={<span style={{ whiteSpace: 'pre-line' }}>{d.intro ?? c.description}</span>} />
          <section className="program-participation"><h2>행사 안내</h2><dl>
            {d.event_name && <div><dt>행사명</dt><dd>{d.event_name}</dd></div>}
            {d.schedule && <div><dt>일시</dt><dd>{d.schedule}</dd></div>}
            {d.course && <div><dt>러닝 코스</dt><dd>{d.course}</dd></div>}
            {prizeHead && <div><dt>참가자 혜택</dt><dd><b>{prizeHead}</b>{prizes.length > 0 && <ul className="event-prizes">{prizes.map((p) => <li key={p}>{p}</li>)}</ul>}</dd></div>}
            <div><dt>참가비</dt><dd>{c.fee_amount > 0 ? money(c.fee_amount) : '신청 후 개별 안내'}</dd></div>
            <div><dt>신청 마감</dt><dd>{dateTime(c.end_at)}</dd></div>
            <div><dt>함께하는 곳</dt><dd>{c.partner_name}</dd></div>
          </dl>
          <p className="help">참가비와 기부금의 사용처는 행사 종료 후 소식 페이지에 공개합니다. 참가 신청 자체로 결제가 이루어지지 않으며, 참가비 입금 안내는 신청 후 이메일로 전달됩니다.</p>
          </section>
          <section className="program-subscribe" id="register">
            <SectionTitle title="참가 신청" text={open ? '아래 신청서를 작성해주세요. 로그인 없이도 신청할 수 있습니다.' : '참가 신청이 마감되었습니다. 함께해주셔서 감사합니다.'} />
            {open ? <RegistrationForm campaign={c} defaults={defaults} /> : <Notice>현재 신청을 받고 있지 않습니다. 문의는 1:1 문의로 남겨주세요.</Notice>}
          </section>
          <Notice>현재 참가 신청 {c.registrations ?? 0}명{c.capacity ? ` / 정원 ${c.capacity}명` : ''} · 신청 정보는 행사 운영 목적으로만 사용합니다.</Notice>
        </article>
        <div className="program-actions"><Link className="button secondary" href="/campaigns">캠페인 목록</Link></div>
      </div>
    </>
  );
}
