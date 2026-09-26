'use client';
import { useRef, useState, type ReactNode } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, A11y } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import 'swiper/css';

// Horizontal editorial rail used on the home page (stories, campaigns, guide). Slides are repeated so
// short collections loop continuously while the counter keeps the logical count.
export function Rail({ label, className, items, gapVar = '--carousel-gap' }: { label: string; className: string; items: ReactNode[]; gapVar?: string }) {
  const ref = useRef<SwiperType | null>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = items.length;
  const copies = total > 1 ? Math.ceil(12 / total) : 1;
  const slides = Array.from({ length: copies }, () => items).flat();
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <>
      {total > 1 && <div className="home-rail-controls">
        <button type="button" className="rail-prev" aria-label={`${label} 이전`} onClick={() => ref.current?.slidePrev()}><ArrowLeft aria-hidden="true" /></button>
        <span className="rail-count" aria-live="polite">{pad(index + 1)} / {pad(total)}</span>
        <progress className="rail-progress" max={1} value={(index + 1) / total} aria-label="슬라이드 진행" />
        <button type="button" className="rail-pause" aria-label={paused ? '슬라이드 재생' : '슬라이드 일시정지'} aria-pressed={paused} hidden={total < 2} onClick={() => { const sw = ref.current; if (!sw) return; if (paused) sw.autoplay.start(); else sw.autoplay.stop(); setPaused(!paused); }}>{paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}</button>
        <button type="button" className="rail-next" aria-label={`${label} 다음`} onClick={() => ref.current?.slideNext()}><ArrowRight aria-hidden="true" /></button>
      </div>}
      <div className={className}>
        <Swiper modules={[Autoplay, A11y]} slidesPerView={1} spaceBetween={20} breakpoints={{ 426: { spaceBetween: 30 }, 1281: { spaceBetween: 40 } }} loop={total > 1} speed={350}
          autoplay={total > 1 ? { delay: 6500, disableOnInteraction: false, pauseOnMouseEnter: true } : false}
          onSwiper={(sw) => { ref.current = sw; }} onSlideChange={(sw) => setIndex(sw.realIndex % total)} style={{ ['--rail-gap' as string]: `var(${gapVar})` }}>
          {slides.map((node, i) => <SwiperSlide key={i} aria-label={`${(i % total) + 1} / ${total}`}>{node}</SwiperSlide>)}
        </Swiper>
      </div>
    </>
  );
}
