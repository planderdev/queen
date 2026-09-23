import Link from 'next/link';
import type { Metadata } from 'next';
import { repo } from '@/lib/data';
import { PageBanner } from '@/components/site/PageBanner';
import { SectionTitle } from '@/components/ui';
import { ImageCard } from '@/components/site/ImageCard';

export const metadata: Metadata = { title: '함께하는 단체' };

export default async function OrganizationsPage() {
  const orgs = await repo.listOrganizations();
  return (
    <>
      <PageBanner page="organizations" />
      <div className="container program-page">
        <section className="program-section">
          <SectionTitle title={<>이웃과 가장 가까운 곳에서<br />함께 변화를 만듭니다</>} text={<>도움이 필요한 이야기를 발견하고,<br />다양한 분야의 단체와 마음을 이어보세요.</>} />
          <div className="program-grid">{orgs.map((o) => <ImageCard key={o.id} image={o.image ?? '/assets/images/community.jpg'} category={o.category} title={o.name} body={o.description} href={`/organizations/${o.slug}`} cta="활동과 모금 보기" />)}</div>
        </section>
        <section className="program-band"><SectionTitle title="더 많은 변화, 함께 만드는 내일" text="퀸만덕과 함께 나눔을 이어갈 단체를 기다립니다." /><div className="program-actions"><Link className="button primary" href="/support?view=inquiry">문의하기</Link></div></section>
      </div>
    </>
  );
}
