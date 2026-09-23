import {photos} from '../data.js';
import {date, get, money, published} from '../services/domain.js';
import {chipNav, tabNav, accordion, button, cards, empty, esc, field, icon, link, notice, select, state} from '../components/ui.js';

const orgPhoto = (s, org) => s.fundraisers.find(f => f.organizationId === org.id)?.image || photos.community;
const sectionTitle = (title, text = '') => `<div class="program-section-title"><h2>${title}</h2>${text ? `<p>${text}</p>` : ''}</div>`;
const imageCard = (image, category, title, body, href, cta = '자세히 보기') => `<a class="program-card" href="${esc(href)}"><div class="program-card-image"><img src="${esc(image)}" alt="${esc(category)} 활동 참고 이미지" width="600" height="400" loading="lazy"><span class="program-card-corner" aria-hidden="true">${icon('arrow-right')}</span></div><div class="program-card-copy"><span class="program-category">${esc(category)}</span><h3>${esc(title)}</h3><p>${esc(body)}</p><span class="program-more">${cta}${icon('arrow-right')}</span></div></a>`;

export function monthly(s, q) {
  const id = q.get('id');
  if (id) {
    const org = get(s, 'organizations', id);
    return `<div class="container program-page">
      
      <img class="program-cover" src="${esc(orgPhoto(s, org))}" width="1100" height="550" alt="${esc(org.category)} 활동 참고 이미지">
      <div class="program-reading">${sectionTitle('곁을 지키는 꾸준한 마음', `${esc(org.description)}<br>매달 이어지는 나눔으로 필요한 활동을 계획하고, 월별 활동 소식과 결제 내역을 확인할 수 있습니다.`)}
      <section class="program-subscribe">${sectionTitle('정기기부 신청')}
        ${notice('약정 등록과 결제는 별개입니다. 등록만으로 누적 기부액이 늘어나지 않습니다.')}
        <form class="program-form" data-form="subscribe"><input type="hidden" name="organizationId" value="${esc(id)}">
          ${field('월 기부 금액 (원)', 'amount', '10000', 'number', 'min="1000" max="10000000" step="1" required')}
          ${select('매월 결제일', 'day', [5, 10, 15, 20, 25, 28, 31].map(day => [day, `${day}일`]), 10)}
          <p class="help">짧은 달에는 해당 월의 마지막 날로 조정합니다. 다음 달부터 약정이 시작됩니다.</p>
          <label class="checkbox"><input type="checkbox" required> 월 금액과 결제일을 확인하고 데모 약정을 등록합니다.</label>
          <button class="button primary">약정 내용 확인</button><p class="form-error" id="form-error" role="alert"></p>
        </form>
      </section></div>
    </div>`;
  }
  return `<div class="container program-page">
    
    ${tabNav([['monthly', '정기기부', '/monthly/'], ['once', '일시기부', '/donate/'], ['campaign', '캠페인 참여', '/campaigns/']], 'monthly')}
    <section class="program-section">${sectionTitle('한 번의 나눔을 넘어,<br>곁을 지키는 약속', '당신이 응원하는 분야에 매달 마음을 전해주세요.<br>작은 관심이 모여 더 단단한 내일을 만듭니다.')}
      <div class="program-photo-row">${[[photos.meal, '따뜻한 한 끼'], [photos.child, '배움이 있는 내일'], [photos.forest, '함께 지키는 자연']].map(([src, title]) => `<figure><img src="${src}" alt="${title} 참고 이미지" width="600" height="400" loading="lazy"><figcaption>${title}</figcaption></figure>`).join('')}</div>
    </section>
    <section class="program-band">${sectionTitle('나눔의 시작부터 그 다음까지')}
      <div class="program-benefits">${[['hand-heart', '내가 선택한 나눔', '마음이 닿는 활동 분야와 단체를 직접 선택합니다.'], ['calendar-check', '일상 속 작은 약속', '나에게 맞는 금액과 날짜로 매달 마음을 이어갑니다.'], ['file-check-2', '함께 확인하는 변화', '마이페이지에서 기부 내역과 활동 소식을 확인합니다.']].map(([name, title, body]) => `<article>${icon(name)}<h3>${title}</h3><p>${body}</p></article>`).join('')}</div>
    </section>
    <section class="program-section">${sectionTitle('어떤 내일을 함께 만들까요?', '마음이 가는 정기기부 프로그램을 만나보세요.')}
      <div class="program-grid">${s.organizations.filter(org => org.status === 'approved').map(org => imageCard(orgPhoto(s, org), org.category, org.name, org.description, `/monthly/?id=${org.id}`, '정기기부 알아보기')).join('')}</div>
    </section>
    <section class="program-section program-reading">${sectionTitle('정기기부, 궁금한 이야기')}${accordion([
      ['정기기부는 어떻게 결제되나요?', '약정과 결제 안내', '이 데모에서는 자동 결제가 실행되지 않습니다. 마이페이지에서 결제 예정일 이후 회차 결제를 직접 시뮬레이션할 수 있습니다.'],
      ['금액을 바꾸거나 잠시 쉬어갈 수 있나요?', '정기기부 관리', '마이페이지에서 월 금액 변경, 일시중지, 재개 및 해지를 할 수 있습니다.'],
      ['나의 정기기부 내역은 어디서 보나요?', '참여 내역 확인', '로그인 후 마이페이지의 정기기부 메뉴에서 약정 상태와 결제 내역을 확인할 수 있습니다.']
    ])}<div class="program-actions">${link('나의 정기기부 관리', '/my/?view=monthly', 'secondary')}</div></section>
  </div>`;
}

export function campaigns(s, q) {
  const id = q.get('id');
  if (id) {
    const campaign = get(s, 'campaigns', id);
    if (campaign.review !== 'approved') return empty('검토 중인 캠페인입니다');
    const company = get(s, 'corporatePartners', campaign.partnerId);
    const used = s.matchingContributions.filter(item => item.campaignId === id && item.status === 'approved').reduce((sum, item) => sum + item.amount, 0);
    const available = new Date(s.clock) >= new Date(campaign.start) && new Date(s.clock) < new Date(campaign.end);
    const joined = s.participations.some(item => item.campaignId === id && item.userId === s.userId);
    return `<div class="container program-page">
      
      <img class="program-cover" src="${esc(campaign.image)}" width="1100" height="550" alt="함께하는 나눔 활동 참고 이미지">
      <article class="program-reading program-section">${sectionTitle('우리의 작은 관심이<br>든든한 힘이 됩니다', esc(campaign.description))}
        <section class="program-participation"><h2>함께하는 방법</h2><dl>
          <div><dt>참여 기간</dt><dd>${date(campaign.start)} ~ ${date(campaign.end)}</dd></div>
          <div><dt>참여 방법</dt><dd>${campaign.type === 'matching' ? '직접 기부액의 1:1 매칭' : '응원 약속 참여'}</dd></div>
          <div><dt>기업 지원 한도</dt><dd>${money(campaign.limit)}</dd></div>
          <div><dt>승인된 기업 지원금</dt><dd>${money(used)}</dd></div>
        </dl><p class="help">응원은 계정당 1회 참여할 수 있습니다. 댓글·공유만으로 금전 기부가 발생하지 않습니다. 매칭은 캠페인 기간 내 성공한 직접 기부에 대해 관리자가 별도로 승인하며 잔여 한도를 적용합니다.</p>
        <div class="program-actions">${button(joined ? '응원 참여 완료' : available ? '캠페인 응원 참여' : '참여 기간이 아닙니다', 'participate', `data-id="${esc(id)}" ${!available || joined ? 'disabled' : ''}`, 'primary')}${link('관련 모금함 보기', `/donate/?id=${campaign.fundraiserId}`, 'secondary')}</div></section>
        ${notice(`누적 응원 참여 ${s.participations.filter(item => item.campaignId === id).length}명 · 지원금은 별도 승인 거래만 합산합니다.`)}
      </article><div class="program-actions">${link('캠페인 목록', '/campaigns/', 'secondary')}</div>
    </div>`;
  }
  const view = q.get('view') === 'ended' ? 'ended' : 'ongoing';
  const category = ['matching', 'cheer'].includes(q.get('category')) ? q.get('category') : '';
  const query = (q.get('q') || '').trim();
  const items = s.campaigns.filter(campaign => campaign.review === 'approved' && (view === 'ended' ? new Date(campaign.end) <= new Date(s.clock) : new Date(campaign.end) > new Date(s.clock)) && (!category || campaign.type === category) && (!query || `${campaign.title} ${campaign.description}`.includes(query)));
  const url = values => `/campaigns/?${new URLSearchParams({view, category, q: query, ...values})}`;
  return `<div class="container program-page">
    
    ${tabNav([['ongoing', '진행중인 캠페인', url({view: 'ongoing'})], ['ended', '종료된 캠페인', url({view: 'ended'})]], view)}
    ${items.length ? `<section class="program-feature swiper" data-carousel aria-label="주요 캠페인"><div class="swiper-wrapper">${items.map(campaign => `<article class="swiper-slide"><a class="program-feature-link" href="/campaigns/?id=${esc(campaign.id)}"><img src="${esc(campaign.image)}" width="700" height="450" alt="캠페인 활동 참고 이미지"><div><span class="program-category">${campaign.type === 'matching' ? '기업 매칭' : '응원 참여'}</span><h3>${esc(campaign.title)}</h3><p>${esc(campaign.description)}</p><span class="program-more">함께 참여하기${icon('arrow-right')}</span></div></a></article>`).join('')}</div><div class="program-feature-controls"><button class="icon-button rail-prev" aria-label="이전 캠페인">${icon('chevron-left')}</button><span class="rail-count">01 / ${String(items.length).padStart(2, '0')}</span><button class="icon-button rail-next" aria-label="다음 캠페인">${icon('chevron-right')}</button><button class="icon-button rail-pause" aria-label="캠페인 슬라이드 일시정지">${icon('pause')}</button></div></section>` : ''}
    <div class="program-toolbar">${chipNav([['', '전체'], ['matching', '기업 매칭'], ['cheer', '응원 참여']].map(([value,label])=>[value,label,url({category:value})]),category,'캠페인 유형')}
      <form class="program-search" action="/campaigns/"><input type="hidden" name="view" value="${view}"><input type="hidden" name="category" value="${category}"><label class="qm-sr-only" for="campaign-query">캠페인 검색</label><input id="campaign-query" name="q" value="${esc(query)}" placeholder="검색어를 입력해주세요"><button type="submit" class="icon-button" aria-label="캠페인 검색">${icon('search')}</button></form>
    </div>
    <div class="program-results" aria-live="polite">총 <strong>${items.length}</strong>개의 캠페인</div>
    ${items.length ? `<div class="program-grid">${items.map(campaign => imageCard(campaign.image, campaign.type === 'matching' ? '기업 매칭' : '응원 참여', campaign.title, campaign.description, `/campaigns/?id=${campaign.id}`, view === 'ended' ? '캠페인 살펴보기' : '함께 참여하기')).join('')}</div>` : empty('해당하는 캠페인이 없습니다', '검색어 또는 캠페인 유형을 변경해보세요.')}
  </div>`;
}

export function organizations(s, q) {
  const id = q.get('id');
  if (id) {
    const org = get(s, 'organizations', id);
    return `<div class="container program-page">
      <img class="program-cover" src="${esc(orgPhoto(s, org))}" alt="${esc(org.category)} 활동 참고 이미지" width="1100" height="550">
      <section class="program-section program-reading">${sectionTitle('이웃의 일상에<br>변화를 더하는 사람들', `활동 분야: ${esc(org.category)}`)}
        <div class="program-status">${state(org.status)}<span class="help">플랫폼 데모 심사 상태이며 공인 인증이 아닙니다.</span></div>
        <div class="program-actions">${link('단체 문의', '/support/?view=inquiry', 'secondary')}${link('정기기부 프로그램', `/monthly/?id=${org.id}`)}</div>
      </section><section class="program-section">${sectionTitle('함께 만들어가는 변화', '공개된 모금과 결과보고를 확인하세요.')}${cards(s, s.fundraisers.filter(f => f.organizationId === id && published(s, f)))}</section>
      <div class="program-actions">${link('함께하는 단체 목록', '/organizations/', 'secondary')}</div>
    </div>`;
  }
  return `<div class="container program-page">
    <section class="program-section">${sectionTitle('이웃과 가장 가까운 곳에서<br>함께 변화를 만듭니다', '도움이 필요한 이야기를 발견하고,<br>다양한 분야의 가상 단체와 마음을 이어보세요.')}
      <div class="program-grid">${s.organizations.filter(org => org.status === 'approved').map(org => imageCard(orgPhoto(s, org), org.category, org.name, org.description, `/organizations/?id=${org.id}`, '활동과 모금 보기')).join('')}</div>
    </section><section class="program-band">${sectionTitle('더 많은 변화, 함께 만드는 내일', '퀸만덕과 함께 나눔을 이어갈 단체를 기다립니다.')}<div class="program-actions">${link('문의하기', '/support/?view=inquiry')}</div></section>
  </div>`;
}

export function about() {
  return `<article class="about-page">
    <section class="container about-opening" aria-labelledby="about-statement"><div class="about-pin">
      <h2 id="about-statement"><span>작은 마음을 <em>잇고,</em></span><span>이웃의 오늘을 <em>지키고,</em></span><span>더 나은 내일을 <em>함께.</em></span></h2>
      <img src="${photos.community}" alt="함께 어깨를 맞대고 있는 사람들" width="1200" height="600">
      <a class="text-link" href="#about-beginning">우리의 이야기 ${icon('arrow-down')}</a></div>
    </section>
    <section class="container program-section about-story" id="about-beginning">
      ${sectionTitle('작은 관심에서 시작되는 변화', '“한 사람의 마음이 누군가의 하루를 바꿀 수 있을까요?”')}
      <p>따뜻한 한 끼, 새로운 배움, 곁을 지켜주는 관심. <br>누군가에게 평범한 일상은 또 다른 누군가에게 간절한 바람입니다.</p>
      <p>퀸만덕은 그 이야기에 귀 기울이는 데서 시작합니다. <br>도움이 필요한 순간과 마음을 전하고 싶은 사람을 연결하고,<br>나눔이 만들어내는 변화까지 함께 살펴봅니다.</p>
      <ol><li>이야기를 <strong>발견하다</strong></li><li>마음을 <strong>전하다</strong></li><li>변화를 <strong>함께하다</strong></li></ol>
    </section>
    <section class="about-vision">
      <div class="container">
        <section class="about-row"><h2>작은 나눔이<br><em>일상을 바꿉니다.</em><small>Small acts, meaningful changes</small></h2><div><h3>우리는 마음의 힘을 믿습니다.</h3><p>나눔은 특별한 누군가만의 일이 아닙니다. <br>이야기를 읽고 공감하는 순간부터, 꾸준히 마음을 전하는 약속까지. <br>작은 실천이 모여 우리 이웃의 든든한 오늘을 만듭니다.</p></div></section>
        <img src="${photos.forest}" alt="햇살이 비치는 푸른 숲" width="1400" height="560" loading="lazy">
        <section class="about-row"><h2>마음이 필요한 곳에<br><em>더 가까이.</em><small>Closer to our neighbors</small></h2><div><h3>함께 살아갈 내일을 생각합니다.</h3><p>아이들의 배움과 어르신의 식탁,<br>생명과 환경, 지역사회의 일상까지. <br>우리 곁의 다양한 이야기를 발견하고 각자의 방식으로 함께합니다.</p><p>한 번의 참여가 끝이 되지 않도록,<br>나눔 이후의 소식과 결과보고를 통해 변화를 이어갑니다.</p></div></section>
      </div>
    </section>
    <section class="about-promise"><div class="container about-story">${icon('hand-heart')}<h2>나눔의 과정까지<br>함께 살펴보겠다는 약속</h2><p>마음이 어디로 향하는지 알 수 있도록. <br>모금의 목적과 사용 계획, 이후의 소식과 결과보고를 연결합니다.</p><p>직접 기부와 기업 지원금을 구분하고,<br>나눔의 시작부터 그 다음 이야기까지 차근차근 전하겠습니다.</p></div></section>
    <section class="container program-section about-row about-letter"><div><h2>함께하는 마음이<br><em>더 많아지도록.</em></h2><img src="${photos.child}" alt="배움의 기회를 상징하는 책과 연필" width="600" height="500" loading="lazy"></div><div><h3>퀸만덕을 찾아주신 여러분께</h3><p>우리 주변에는 관심과 도움이 필요한 이야기가 있습니다. 퀸만덕은 그 이야기를 더 가까이 만나고, 누구나 자신의 방식으로 나눔에 참여할 수 있는 공간을 만들고자 합니다.</p><p>마음이 닿는 이야기를 발견하고, 작은 실천을 이어가며, 나눔이 만든 변화를 함께 확인하는 것. 우리가 소중히 생각하는 나눔의 모습입니다.</p><p>각자의 작은 마음이 모이면 누군가에게는 든든한 하루가 되고, 우리 모두에게는 더 나은 내일이 됩니다. 그 길에 함께해 주세요.</p><strong>퀸만덕</strong><div class="program-actions">${link('나눔이야기 만나기','/stories/')}</div></div></section>
  </article>`;
}
