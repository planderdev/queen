import Link from 'next/link';
import type { Metadata } from 'next';
import { CalendarCheck, FileCheck2, HandHeart } from 'lucide-react';
import { repo } from '@/lib/data';
import { PageBanner } from '@/components/site/PageBanner';
import { SectionTitle, Tabs } from '@/components/ui';
import { ImageCard } from '@/components/site/ImageCard';
import { Accordion } from '@/components/site/Accordion';

export const metadata: Metadata = { title: '정기기부' };

export default async function MonthlyPage() {
  const orgs = await repo.listOrganizations();
  return (
    <>
      <PageBanner page="monthly" />
      <div className="container program-page">
        <Tabs items={[['monthly', '정기기부', '/monthly'], ['once', '일시기부', '/donate'], ['campaign', '캠페인 참여', '/campaigns']]} current="monthly" />
        <section className="program-section">
          <SectionTitle title={<>한 번의 나눔을 넘어,<br />곁을 지키는 약속</>} text={<>당신이 응원하는 분야에 매달 마음을 전해주세요.<br />작은 관심이 모여 더 단단한 내일을 만듭니다.</>} />
          <div className="program-photo-row">{[['/assets/images/meal.jpg', '따뜻한 한 끼'], ['/assets/images/child.jpg', '배움이 있는 내일'], ['/assets/images/forest.jpg', '함께 지키는 자연']].map(([src, title]) => <figure key={title}><img src={src} alt={`${title} 참고 이미지`} width={600} height={400} loading="lazy" /><figcaption>{title}</figcaption></figure>)}</div>
        </section>
        <section className="program-band">
          <SectionTitle title="나눔의 시작부터 그 다음까지" />
          <div className="program-benefits">
            <article><HandHeart aria-hidden="true" /><h3>내가 선택한 나눔</h3><p>마음이 닿는 활동 분야와 단체를 직접 선택합니다.</p></article>
            <article><CalendarCheck aria-hidden="true" /><h3>일상 속 작은 약속</h3><p>나에게 맞는 금액과 날짜로 매달 마음을 이어갑니다.</p></article>
            <article><FileCheck2 aria-hidden="true" /><h3>함께 확인하는 변화</h3><p>나의 후원에서 기부 내역과 활동 소식을 확인합니다.</p></article>
          </div>
        </section>
        <section className="program-section">
          <SectionTitle title="어떤 내일을 함께 만들까요?" text="마음이 가는 정기기부 프로그램을 만나보세요." />
          <div className="program-grid">{orgs.map((o) => <ImageCard key={o.id} image={o.image ?? '/assets/images/community.jpg'} category={o.category} title={o.name} body={o.description} href={`/monthly/${o.slug}`} cta="정기기부 알아보기" />)}</div>
        </section>
        <section className="program-section program-reading">
          <SectionTitle title="정기기부, 궁금한 이야기" />
          <Accordion items={[
            ['정기기부는 어떻게 결제되나요?', '약정과 결제 안내', '현재는 매달 약정일에 안내 계좌로 이체하는 방식입니다. 자동 결제는 준비 중이며, 도입되면 약정에 연결해 안내합니다.'],
            ['금액을 바꾸거나 잠시 쉬어갈 수 있나요?', '정기기부 관리', '나의 후원에서 월 금액 변경, 일시중지, 재개 및 해지를 할 수 있습니다.'],
            ['나의 정기기부 내역은 어디서 보나요?', '참여 내역 확인', '로그인 후 나의 후원의 정기기부 메뉴에서 약정 상태와 결제 내역을 확인할 수 있습니다.']
          ]} />
          <div className="program-actions"><Link className="button secondary" href="/my?view=monthly">나의 정기기부 관리</Link></div>
        </section>
      </div>
    </>
  );
}
