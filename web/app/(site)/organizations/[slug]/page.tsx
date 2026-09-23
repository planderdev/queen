import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { repo } from '@/lib/data';
import { PageBanner } from '@/components/site/PageBanner';
import { Cards, SectionTitle, State } from '@/components/ui';
import { getSavedIds } from '@/lib/actions/bookmark';

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const o = await repo.getOrganization((await params).slug); return { title: o?.name ?? '단체' }; }

export default async function OrganizationPage({ params }: Props) {
  const org = await repo.getOrganization((await params).slug);
  if (!org) notFound();
  const [funds, saved] = await Promise.all([repo.fundraisersOf(org.id), getSavedIds('fundraiser')]);
  return (
    <>
      <PageBanner page="organizations" title={org.name} />
      <div className="container program-page">
        <img className="program-cover" src={org.image ?? funds[0]?.image ?? '/assets/images/community.jpg'} alt={`${org.category} 활동 참고 이미지`} width={1100} height={550} />
        <section className="program-section program-reading">
          <SectionTitle title={<>이웃의 일상에<br />변화를 더하는 사람들</>} text={<>{org.description}<br />활동 분야: {org.category}</>} />
          <div className="program-status"><State value={org.status} /><span className="help">퀸만덕 운영팀 검토를 거쳐 공개된 단체입니다.</span></div>
          <div className="program-actions"><Link className="button secondary" href="/support?view=inquiry">단체 문의</Link><Link className="button primary" href={`/monthly/${org.slug}`}>정기기부 프로그램</Link></div>
        </section>
        <section className="program-section"><SectionTitle title="함께 만들어가는 변화" text="공개된 모금과 결과보고를 확인하세요." /><Cards items={funds} savedIds={saved} /></section>
        <div className="program-actions"><Link className="button secondary" href="/organizations">함께하는 단체 목록</Link></div>
      </div>
    </>
  );
}
