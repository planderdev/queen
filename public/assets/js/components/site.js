import {esc,icon} from './ui.js';
import {photos} from '../data.js';
import {foundations} from '../design-system-foundations.js';
import Swiper from '../../vendor/swiper.mjs';

const sections = [
  ['donate','후원하기','SUPPORT','작은 관심이 누군가의 든든한 일상이 됩니다.','meal'],
  ['monthly','정기후원','SUPPORT','매달 이어지는 마음으로 더 오래 함께합니다.','child'],
  ['campaigns','캠페인','CAMPAIGN','마음과 마음이 만나 더 큰 변화를 만듭니다.','community'],
  ['organizations','사업안내','OUR WORK','각자의 자리에서 더 나은 내일을 만드는 사람들.','child'],
  ['about','퀸만덕 소개','ABOUT US','작은 마음을 연결하고, 나눔 이후까지 함께합니다.','forest'],
  ['stories','나눔이야기','NEWS','여러분의 나눔이 만든 변화의 소식을 만나보세요.','community'],
  ['support','후원가이드','SUPPORT','처음 만나는 나눔부터 궁금한 이야기까지 안내합니다.','meal'],
  ['search','이야기 찾기','SEARCH','마음이 가는 이야기를 찾아보세요.','forest'],
  ['my','나의 후원','MY GIVING','내가 전한 마음과 이어지는 변화를 확인하세요.','forest'],
];
export function pageBanner(page,q) {
  const data=sections.find(x=>x[0]===page);
  if(!data)return '';
  const [,defaultTitle,category,description,photo]=data;
  const supportTitles={notices:'공지사항',inquiry:'1:1 문의',terms:'이용 안내',privacy:'개인정보 안내'};
  const title=page==='support'?(supportTitles[q.get('view')]||defaultTitle):defaultTitle;
  // The rendered header is the single source for labels, order and destinations.
  const groups=[...document.querySelectorAll('.site-navigation > .nav-group')].map(group=>({
    label:group.querySelector('summary').textContent.trim(),
    items:[...group.querySelectorAll('.nav-dropdown > a')].map(a=>({label:a.textContent.trim(),href:a.getAttribute('href')}))
  }));
  let selected=null;
  let best=-1;
  for(const group of groups)for(const item of group.items){
    const url=new URL(item.href,location.origin);
    const params=[...url.searchParams];
    if(url.pathname!==`/${page}/`||!params.every(([key,value])=>q.get(key)===value))continue;
    if(params.length>best){selected={group,item};best=params.length;}
  }
  const groupLinks=groups.map(group=>`<a href="${esc(group.items[0].href)}" ${selected?.group===group?'aria-current="true"':''}>${esc(group.label)}</a>`).join('');
  const currentLinks=selected?.group.items.map(item=>`<a href="${esc(item.href)}" ${selected.item===item?'aria-current="page"':''}>${esc(item.label)}</a>`).join('');
  const path=selected?`<details class="path-group"><summary>${esc(selected.group.label)}${icon('chevron-down')}</summary><div>${groupLinks}</div></details><details class="path-current"><summary>${esc(selected.item.label)}${icon('chevron-down')}</summary><div>${currentLinks}</div></details>`:`<details class="path-group"><summary>전체 메뉴${icon('chevron-down')}</summary><div>${groupLinks}</div></details><div class="path-current"><span class="path-label">${esc(title)}</span></div>`;
  return `<section class="page-banner site-shell" aria-labelledby="section-title"><div class="banner-surface" style="background-image:url('${esc(photos[photo])}')"><div class="banner-copy"><span class="section-kicker">${category}</span><h1 id="section-title">${title}</h1><p>${description}</p></div></div><nav class="section-path" aria-label="현재 위치"><a class="path-home" href="/" aria-label="홈">${icon('house')}</a>${path}</nav></section>`;
}

let sliders=[];
export function destroyCarousels(){sliders.forEach(s=>s.destroy(true,true));sliders=[];}
export function mountCarousels(){
  const spacing=getComputedStyle(document.documentElement);
  const gap24=parseFloat(spacing.getPropertyValue('--space-24'));
  const gap32=parseFloat(spacing.getPropertyValue('--space-32'));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero=document.querySelector('#home-slider');
  const mounts=hero?[{root:hero,hero:true}]:[];
  document.querySelectorAll('[data-carousel]').forEach(root=>mounts.push({root,hero:false}));
  mounts.forEach(({root,hero:isHero})=>{
    const el=root.matches('.swiper')?root:root.querySelector('.swiper');
    const single=isHero||root.classList.contains('program-feature');
    const rail=['stories','campaigns','guide'].includes(root.dataset.carousel);
    if(!el)return;
    const total=el.querySelectorAll('.swiper-slide').length;
    if(!total)return;
    // Repeat short editorial collections for a continuous rail, retaining their logical count.
    if(rail&&total>1){
      const wrapper=el.querySelector('.swiper-wrapper');
      const originals=[...wrapper.children];
      originals.forEach((slide,index)=>slide.dataset.carouselIndex=index);
      const copies=Math.ceil(12/total);
      for(let n=1;n<copies;n++)originals.forEach(slide=>wrapper.append(slide.cloneNode(true)));
    }
    const prev=root.querySelector(isHero?'#slide-prev':'.rail-prev');
    const next=root.querySelector(isHero?'#slide-next':'.rail-next');
    const pause=root.querySelector(isHero?'#slide-pause':'.rail-pause');
    const count=root.querySelector(isHero?'#slide-count':'.rail-count');
    const updateCount=sw=>{const index=sw.realIndex%total;if(count)count.textContent=`${String(index+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`;const progress=root.querySelector('.rail-progress');if(progress)progress.value=(index+1)/total;};
    const sw=new Swiper(el,{
      slidesPerView:single||rail?1:1.12,spaceBetween:single?0:rail?parseFloat(spacing.getPropertyValue('--carousel-gap')):gap24,
      loop:(single||rail)&&total>1,speed:reduced?0:350,
      autoplay:!reduced&&(single||rail)&&total>1?{delay:6500,disableOnInteraction:false,pauseOnMouseEnter:true}:false,
      navigation:{prevEl:prev,nextEl:next},watchOverflow:true,
      breakpoints:single?{}:rail?Object.fromEntries(foundations.carouselBreakpoints.map(({min,gap})=>[min,{spaceBetween:gap}])):{600:{slidesPerView:Math.min(2,total),spaceBetween:gap24},1024:{slidesPerView:Math.min(3,total),spaceBetween:gap32}},
      a11y:{enabled:true,slideRole:'',prevSlideMessage:prev?.getAttribute('aria-label')||'이전 항목',nextSlideMessage:next?.getAttribute('aria-label')||'다음 항목',slideLabelMessage:'{{index}} / {{slidesLength}}'},
      on:{init:updateCount,slideChange:updateCount},

    });
    const updateRailAccess=()=>{
      if(!rail)return;
      const left=root.dataset.carousel==='campaigns'?0:el.getBoundingClientRect().left;
      sw.slides.forEach(slide=>{
        const rect=slide.getBoundingClientRect();
        slide.tabIndex=rect.right>left+1&&rect.left<document.documentElement.clientWidth-1?0:-1;
        slide.setAttribute('aria-label',`${Number(slide.dataset.carouselIndex)+1} / ${total}`);
      });
    };
    sw.on('transitionEnd',updateRailAccess);
    sw.on('resize',updateRailAccess);
    requestAnimationFrame(updateRailAccess);
    const updatePause=()=>{if(!pause)return;pause.innerHTML=icon(sw.autoplay.running?'pause':'play');pause.setAttribute('aria-label',sw.autoplay.running?'슬라이드 일시정지':'슬라이드 재생');pause.setAttribute('aria-pressed',String(!sw.autoplay.running));window.lucide?.createIcons();};
    if(pause){pause.hidden=total<2;pause.onclick=()=>{sw.autoplay.running?sw.autoplay.stop():sw.autoplay.start();updatePause();};updatePause();}
    root.addEventListener('focusin',event=>{if(event.target.closest('a')&&sw.autoplay.running){sw.autoplay.stop();updatePause();}});
    sliders.push(sw);
  });
}
export function initSiteNavigation(){
  document.addEventListener('change',event=>{if(event.target.matches('select[data-navigate]')){const next=new URL(event.target.value,location.origin);if(next.origin===location.origin)location.href=next.href;}});
  const button=document.querySelector('#menu-toggle'),menu=document.querySelector('#site-menu');
  if(!button||!menu)return;
  const setOpen=open=>{button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');document.body.classList.toggle('menu-open',open);document.querySelectorAll('#main,.site-bottom,.quick-support,.home-mobile-support,.demo-launch').forEach(el=>el.inert=open);if(!open)menu.querySelectorAll('details[open]').forEach(d=>d.open=false);};
  button.onclick=()=>setOpen(button.getAttribute('aria-expanded')!=='true');
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){const opened=document.querySelector('details[open]:focus-within');if(opened){opened.open=false;opened.querySelector('summary').focus();return;}if(button.getAttribute('aria-expanded')==='true'){setOpen(false);button.focus();}}});
  document.addEventListener('click',e=>{if(!e.target.closest('.site-masthead,.section-path,.footer-sites'))document.querySelectorAll('.nav-group[open],.section-path details[open],.footer-sites[open]').forEach(d=>d.open=false);});
  document.addEventListener('toggle',e=>{if(!e.target.matches('.nav-group,.section-path details')||!e.target.open)return;const parent=e.target.parentElement;parent.querySelectorAll(':scope > details[open]').forEach(d=>{if(d!==e.target)d.open=false;});},true);
  document.querySelectorAll('.nav-group').forEach(group=>{group.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&matchMedia('(min-width:1100px)').matches)group.open=true;});group.addEventListener('pointerleave',()=>{if(matchMedia('(min-width:1100px)').matches&&!group.contains(document.activeElement))group.open=false;});});
  const media=matchMedia('(min-width: 1100px)');media.addEventListener('change',()=>setOpen(false));
  document.getElementById('back-to-top').onclick=()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
}
