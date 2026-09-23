import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { repo } from '@/lib/data';
import { getSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { hasSupabase } from '@/lib/env';
import { money, date } from '@/lib/format';
import { PageBanner } from '@/components/site/PageBanner';
import { Notice, SectionTitle } from '@/components/ui';
import { ParticipateButton } from '@/components/site/ParticipateButton';

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const c = await repo.getCampaign((await params).slug); return { title: c?.title ?? '캠페인' }; }

export default async function CampaignPage({ params }: Props) {
  const c = await repo.getCampaign((await params).slug);
  if (!c) notFound();
  const session = await getSession();
  const now = Date.now();
  const available = new Date(c.start_at).getTime() <= now && now < new Date(c.end_at).getTime();
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
