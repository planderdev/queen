/* Section reveals share the existing motion and spacing scales. */
let initialized = false;
let refreshFrame;
const preference = matchMedia('(prefers-reduced-motion: reduce)');
const selectors = [
  '.about-story', '.about-vision .about-row > h2', '.about-vision .about-row > div', '.about-vision img', '.about-letter > div:last-child',
  '.home-section-heading', '.home-values',
  '.home-story-rail', '.home-campaign-rail', '.home-guide-rail', '.home-news-grid',
  '.program-section-title', '.program-photo-row', '.program-benefits',
  '.program-grid', '.program-cover', '.program-feature',
  '.community-story-grid', '.community-board', '.community-intro', '.community-faq',
  '.community-article > header', '.community-article-body > img',
  '.community-article-body > h3', '.community-article-body > p', '.community-reports',
  '.card-grid', '.detail-cover', '.article-body'
].join(',');

function refresh() {
  if (!initialized || !window.AOS) return;
  cancelAnimationFrame(refreshFrame);
  refreshFrame = requestAnimationFrame(() => window.AOS.refresh());
}

let pinCleanup;
function mountAboutPin() {
  pinCleanup?.();
  const opening = document.querySelector('.about-opening');
  if (!opening) return;
  let frame;
  const update = () => {
    frame = null;
    const enabled = !preference.matches;
    opening.classList.toggle('is-pinned', enabled);
    if (!enabled) return;
    const pin = opening.querySelector('.about-pin');
    const top = parseFloat(getComputedStyle(pin).top) || 0;
    const travel = Math.max(1, opening.offsetHeight - pin.offsetHeight);
    const progress = Math.max(0, Math.min(1, (top - opening.getBoundingClientRect().top) / travel));
    opening.dataset.step = String(Math.min(2, Math.floor(progress * 3)));
  };
  const schedule = () => { if (frame == null) frame = requestAnimationFrame(update); };
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule);
  preference.addEventListener('change', schedule);
  pinCleanup = () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    preference.removeEventListener('change', schedule);
  };
  update();
}

export function mountScrollMotion() {
  mountAboutPin();
  const main = document.getElementById('main');
  if (!document.body.classList.contains('public-site') ||
      ['auth', 'my'].includes(document.body.dataset.page) || !window.AOS) return;
  const styles = getComputedStyle(document.documentElement);
  const offset = parseFloat(styles.getPropertyValue('--space-32'));
  const duration = parseFloat(styles.getPropertyValue('--motion-image'));
  const candidates = [...main.querySelectorAll(selectors)].filter(el =>
    !el.closest('form,dialog,.donation-summary') && !el.querySelector('form'));
  const targets = new Set(candidates);
  for (const el of candidates) {
    // Reveal a card group as a unit; never nest transforms or touch Swiper slides.
    let parent = el.parentElement;
    while (parent && !targets.has(parent)) parent = parent.parentElement;
    if (parent) continue;
    el.dataset.aos = el.matches('.about-vision .about-row > h2') ? 'fade-right' : el.matches('.about-vision .about-row > div') ? 'fade-left' : 'site-reveal';
    // Keep content already on screen stable after a filter/action re-render.
    if (el.getBoundingClientRect().top < innerHeight - offset) el.classList.add('aos-animate');
  }
  document.body.classList.toggle('aos-enabled', !preference.matches);
  if (initialized) {
    window.AOS.refreshHard();
    return;
  }
  initialized = true;
  window.AOS.init({
    once: true, offset, duration, delay: 0,
    easing: 'ease-out', disableMutationObserver: true,
  });
  main.addEventListener('load', refresh, true);
  main.addEventListener('click', refresh);
  main.addEventListener('focusin', event => {
    const target = event.target.closest('[data-aos]');
    if (target) target.classList.add('aos-animate');
  });
  preference.addEventListener('change', () => {
    document.body.classList.toggle('aos-enabled', !preference.matches);
    refresh();
  });
  document.fonts?.ready.then(refresh);
}
