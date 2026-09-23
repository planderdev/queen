import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { repo } from '@/lib/data';
import { getSession } from '@/lib/auth';
import { PageBanner } from '@/components/site/PageBanner';
import { Field, Notice, SectionTitle, Select } from '@/components/ui';
import { ActionForm } from '@/components/site/ActionForm';
import { createPlan } from '@/lib/actions/donation';
import Link from 'next/link';

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const o = await repo.getOrganization((await params).slug); return { title: o ? `${o.name} 정기기부` : '정기기부' }; }

export default async function MonthlyOrgPage({ params }: Props) {
  const { slug } = await params;
  const org = await repo.getOrganization(slug);
  if (!org) notFound();
  const [session, settings] = await Promise.all([getSession(), repo.settings()]);
  return (
    <>
      <PageBanner page="monthly" title={`${org.name} 정기기부`} />
      <div className="container program-page">
        <img className="program-cover" src={org.image ?? '/assets/images/community.jpg'} width={1100} height={550} alt={`${org.category} 활동 참고 이미지`} />
        <div className="program-reading">
          <SectionTitle title="곁을 지키는 꾸준한 마음" text={<>{org.description}<br />매달 이어지는 나눔으로 필요한 활동을 계획하고, 월별 활동 소식과 결제 내역을 확인할 수 있습니다.</>} />
          <section className="program-subscribe">
            <SectionTitle title="정기기부 신청" />
            <Notice>약정을 등록하면 매달 약정일에 아래 계좌로 이체해주시면 됩니다. 입금 확인 후 정기기부 내역에 반영됩니다. 자동 결제는 준비 중입니다.</Notice>
            <div className="transfer-box"><span>정기기부 입금 계좌</span><b>{settings.bank.bank} {settings.bank.account}</b><span>예금주 {settings.bank.holder}</span></div>
            {session ? (
              <ActionForm action={createPlan} className="program-form" submitLabel="약정 등록" pendingLabel="등록 중…">
                <input type="hidden" name="slug" value={org.slug} />
                <Field label="월 기부 금액 (원)" name="amount" type="number" defaultValue={10000} min={1000} max={10000000} step={1} required />
                <Select label="매월 결제일" name="day" options={[5, 10, 15, 20, 25, 28, 31].map((d) => [String(d), `${d}일`] as [string, string])} defaultValue="10" />
                <p className="help">짧은 달에는 해당 월의 마지막 날로 조정합니다. 다음 달부터 약정이 시작됩니다.</p>
                <label className="checkbox"><input type="checkbox" name="agree" required /> 월 금액과 결제일을 확인하고 정기기부 약정을 등록합니다.</label>
              </ActionForm>
            ) : <div className="program-actions"><Link className="button primary" href={`/auth/login?next=${encodeURIComponent(`/monthly/${org.slug}`)}`}>로그인하고 약정 등록</Link></div>}
          </section>
        </div>
      </div>
    </>
  );
}
