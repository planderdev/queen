import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { repo, canDonate } from '@/lib/data';
import { getSession } from '@/lib/auth';
import { money, flatTitle } from '@/lib/format';
import { PageBanner } from '@/components/site/PageBanner';
import { Notice, Empty, Field, Area } from '@/components/ui';
import { ActionForm } from '@/components/site/ActionForm';
import { AmountInput } from '@/components/site/AmountInput';
import { createDonation } from '@/lib/actions/donation';

export const metadata: Metadata = { title: '마음 전하기' };

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = await repo.getFundraiser(slug);
  if (!f) notFound();
  const session = await getSession();
  if (!session) redirect(`/auth/login?next=${encodeURIComponent(`/donate/${slug}/checkout`)}`);
  if (!canDonate(f)) return <><PageBanner page="donate" title="마음 전하기" /><div className="container section"><Empty title="현재 기부할 수 없는 모금함입니다" text="모금 기간과 진행 상태를 확인해주세요." /></div></>;
  const settings = await repo.settings();
  return (
    <>
      <PageBanner page="donate" title="마음 전하기" />
      <div className="container narrow">
        <ol className="steps"><li className="active">01 금액과 공개 설정</li><li>02 입금 안내</li><li>03 입금 확인</li></ol>
        <Notice>기부금은 계좌이체로 전달됩니다. 신청 후 안내되는 계좌로 입금하면 운영팀이 확인해 기부 내역에 반영합니다. 카드번호나 계좌 비밀번호는 입력받지 않습니다.</Notice>
        <ActionForm action={createDonation} className="panel" submitLabel="입금 안내 받기" pendingLabel="신청 중…">
          <input type="hidden" name="slug" value={f.slug} />
          <h2>얼마의 마음을 전할까요?</h2>
          <p className="help">{flatTitle(f.title)} · {f.organization.name}</p>
          <AmountInput name="amount" defaultValue={10000} presets={[5000, 10000, 30000, 50000]} />
          <p className="help">1,000원부터 10,000,000원까지 가능합니다.</p>
          <Field label="입금자명" name="depositor_name" defaultValue={session.profile.name} required maxLength={30} help="실제 이체할 때 사용하는 이름과 같아야 입금 확인이 빠릅니다." />
          <label className="checkbox"><input type="checkbox" name="anonymous" /> 참여 내역에 익명으로 표시하기</label>
          <Area label="응원 메시지 (선택)" name="message" maxLength={200} placeholder="따뜻한 마음을 함께 남겨주세요." />
          <div className="transfer-box"><span>입금 계좌 (신청 후에도 다시 안내됩니다)</span><b>{settings.bank.bank} {settings.bank.account}</b><span>예금주 {settings.bank.holder}</span></div>
          <label className="checkbox"><input type="checkbox" name="agree" required /> 입금 확인 후 기부가 완료되며, 확인 전에는 나의 후원에서 취소할 수 있음을 확인했습니다.</label>
        </ActionForm>
        <p className="help">기부 신청 금액 예시: {money(10000)} → 입금 확인 후 참여 내역과 모금액에 반영</p>
      </div>
    </>
  );
}
