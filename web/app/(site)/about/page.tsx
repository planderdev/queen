import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowDown, HandHeart } from 'lucide-react';
import { PageBanner } from '@/components/site/PageBanner';
import { SectionTitle } from '@/components/ui';

export const metadata: Metadata = { title: '퀸만덕 소개' };

export default function AboutPage() {
  return (
    <>
      <PageBanner page="about" />
      <article className="about-page">
        <section className="container about-opening" aria-labelledby="about-statement"><div className="about-pin">
          <h2 id="about-statement"><span>작은 마음을 <em>잇고,</em></span><span>이웃의 오늘을 <em>지키고,</em></span><span>더 나은 내일을 <em>함께.</em></span></h2>
          <img src="/assets/images/community.jpg" alt="함께 어깨를 맞대고 있는 사람들" width={1200} height={600} />
          <a className="text-link" href="#about-beginning">우리의 이야기 <ArrowDown aria-hidden="true" /></a></div>
        </section>
        <section className="container program-section about-story" id="about-beginning">
          <SectionTitle title="작은 관심에서 시작되는 변화" text="“한 사람의 마음이 누군가의 하루를 바꿀 수 있을까요?”" />
          <p>따뜻한 한 끼, 새로운 배움, 곁을 지켜주는 관심. <br />누군가에게 평범한 일상은 또 다른 누군가에게 간절한 바람입니다.</p>
          <p>퀸만덕은 그 이야기에 귀 기울이는 데서 시작합니다. <br />도움이 필요한 순간과 마음을 전하고 싶은 사람을 연결하고,<br />나눔이 만들어내는 변화까지 함께 살펴봅니다.</p>
          <ol><li>이야기를 <strong>발견하다</strong></li><li>마음을 <strong>전하다</strong></li><li>변화를 <strong>함께하다</strong></li></ol>
        </section>
        <section className="about-vision"><div className="container">
          <section className="about-row"><h2>작은 나눔이<br /><em>일상을 바꿉니다.</em><small>Small acts, meaningful changes</small></h2><div><h3>우리는 마음의 힘을 믿습니다.</h3><p>나눔은 특별한 누군가만의 일이 아닙니다. <br />이야기를 읽고 공감하는 순간부터, 꾸준히 마음을 전하는 약속까지. <br />작은 실천이 모여 우리 이웃의 든든한 오늘을 만듭니다.</p></div></section>
          <img src="/assets/images/forest.jpg" alt="햇살이 비치는 푸른 숲" width={1400} height={560} loading="lazy" />
          <section className="about-row"><h2>마음이 필요한 곳에<br /><em>더 가까이.</em><small>Closer to our neighbors</small></h2><div><h3>함께 살아갈 내일을 생각합니다.</h3><p>아이들의 배움과 어르신의 식탁,<br />생명과 환경, 지역사회의 일상까지. <br />우리 곁의 다양한 이야기를 발견하고 각자의 방식으로 함께합니다.</p><p>한 번의 참여가 끝이 되지 않도록,<br />나눔 이후의 소식과 결과보고를 통해 변화를 이어갑니다.</p></div></section>
        </div></section>
        <section className="about-promise"><div className="container about-story"><HandHeart aria-hidden="true" /><h2>나눔의 과정까지<br />함께 살펴보겠다는 약속</h2><p>마음이 어디로 향하는지 알 수 있도록. <br />모금의 목적과 사용 계획, 이후의 소식과 결과보고를 연결합니다.</p><p>직접 기부와 기업 지원금을 구분하고,<br />나눔의 시작부터 그 다음 이야기까지 차근차근 전하겠습니다.</p></div></section>
        <section className="container program-section about-row about-letter"><div><h2>함께하는 마음이<br /><em>더 많아지도록.</em></h2><img src="/assets/images/child.jpg" alt="배움의 기회를 상징하는 책과 연필" width={600} height={500} loading="lazy" /></div><div><h3>퀸만덕을 찾아주신 여러분께</h3><p>우리 주변에는 관심과 도움이 필요한 이야기가 있습니다. 퀸만덕은 그 이야기를 더 가까이 만나고, 누구나 자신의 방식으로 나눔에 참여할 수 있는 공간을 만들고자 합니다.</p><p>마음이 닿는 이야기를 발견하고, 작은 실천을 이어가며, 나눔이 만든 변화를 함께 확인하는 것. 우리가 소중히 생각하는 나눔의 모습입니다.</p><p>각자의 작은 마음이 모이면 누군가에게는 든든한 하루가 되고, 우리 모두에게는 더 나은 내일이 됩니다. 그 길에 함께해 주세요.</p><strong>퀸만덕</strong><div className="program-actions"><Link className="button primary" href="/stories">나눔이야기 만나기</Link></div></div></section>
      </article>
    </>
  );
}
