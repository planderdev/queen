import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth';
import { repo } from '@/lib/data';
import { money, dateTime } from '@/lib/format';
import { PageBanner } from '@/components/site/PageBanner';
import { Notice, Cards } from '@/components/ui';
import { ShareButton } from '@/components/site/ShareButton';
import { hasSupabase } from '@/lib/env';

export default async function CompletePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ d?: string }> }) {
  const { slug } = await params;
  const { d } = await searchParams;
  if (!hasSupabase || !d) notFound();
  const session = await getSession();
  if (!session) redirect('/auth/login');
  const supabase = await createClient();
  const [{ data: tx }, f, settings, others] = await Promise.all([
    supabase.from('donations').select('*').eq('id', d).eq('user_id', session.user.id).maybeSingle(),
    repo.getFundraiser(slug), repo.settings(), repo.featuredFundraisers(3)
  ]);
  if (!tx || !f) notFound();
  return (
    <>
      <PageBanner page="donate" title="입금 안내" />
      <div className="container narrow">
        <ol className="steps"><li>01 금액과 공개 설정</li><li className="active">02 입금 안내</li><li>03 입금 확인</li></ol>
        <Notice>기부 신청이 접수되었습니다. 아래 계좌로 입금하면 운영팀이 확인 후 기부를 완료 처리합니다. 입금 전에는 나의 후원에서 신청을 취소할 수 있어요.</Notice>
        <div className="panel">
          <div className="transfer-box"><span>입금 계좌</span><b>{settings.bank.bank} {settings.bank.account}</b><span>예금주 {settings.bank.holder} · 입금액 <b>{money(tx.amount)}</b> · 입금자명 <b>{tx.depositor_name}</b></span></div>
          <div className="check-row"><span>모금함</span><b>{f.title.replace(/\n/g, ' ')}</b></div>
          <div className="check-row"><span>전할 마음</span><b>{money(tx.amount)}</b></div>
          <div className="check-row"><span>신청 일시 (한국 시간)</span><b>{dateTime(tx.created_at)}</b></div>
          <div className="check-row"><span>공개 설정</span><b>{tx.anonymous ? '익명' : '닉네임 공개'}</b></div>
          <p className="help transaction-reference">기부 신청 번호<br />{tx.number}</p>
          <div className="actions"><Link className="button primary" href="/my?view=donations">나의 기부 내역</Link><Link className="button secondary" href={`/donate/${f.slug}`}>모금함으로 돌아가기</Link><ShareButton /></div>
        </div>
        <h2>다른 이야기에도 마음을 전해보세요</h2>
        <Cards items={others.filter((x) => x.id !== f.id).slice(0, 2)} />
      </div>
    </>
  );
}
