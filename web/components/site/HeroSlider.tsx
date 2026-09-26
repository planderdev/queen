'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, A11y } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import 'swiper/css';

// scrim: 밝고 복잡한 사진 위 흰 글자 가독성을 위한 어두운 그라데이션 (캠페인 사진 슬라이드용)
export interface HeroSlide { image: string; light?: boolean; scrim?: boolean; heading: string[]; description: string[]; href: string; cta: string }

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const ref = useRef<SwiperType | null>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = slides.length;
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <section className="home-hero-shell" aria-label="주요 나눔 안내">
      <div className="home-hero" id="home-slider">
        <Swiper modules={[Autoplay, A11y]} loop={total > 1} speed={350} autoplay={total > 1 ? { delay: 6500, disableOnInteraction: false, pauseOnMouseEnter: true } : false}
          onSwiper={(sw) => { ref.current = sw; }} onSlideChange={(sw) => setIndex(sw.realIndex)} a11y={{ prevSlideMessage: '이전 배너', nextSlideMessage: '다음 배너' }}>
          {slides.map((s, i) => (
            <SwiperSlide key={i} className={`home-hero-slide ${s.light ? 'home-hero-light' : ''} ${s.scrim ? 'home-hero-scrim' : ''}`} style={{ backgroundImage: `url('${s.image}')` }}>
              <div className="home-hero-copy">
                <h1 className="aos-animate">{s.heading.map((l, j) => <span key={j}>{j > 0 && <br />}{l}</span>)}</h1>
                <p className="aos-animate">{s.description.map((l, j) => <span key={j}>{j > 0 && <br />}{l}</span>)}</p>
                <Link className="home-outline-link aos-animate" href={s.href}>{s.cta}<ArrowRight aria-hidden="true" /></Link>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        {total > 1 && <div className="home-hero-controls">
          <button id="slide-prev" type="button" aria-label="이전 배너" onClick={() => ref.current?.slidePrev()}><ChevronLeft aria-hidden="true" /></button>
          <span id="slide-count">{pad(index + 1)} / {pad(total)}</span>
          <button id="slide-next" type="button" aria-label="다음 배너" onClick={() => ref.current?.slideNext()}><ChevronRight aria-hidden="true" /></button>
          <button id="slide-pause" type="button" aria-label={paused ? '배너 재생' : '배너 일시정지'} aria-pressed={paused} onClick={() => { const sw = ref.current; if (!sw) return; if (paused) sw.autoplay.start(); else sw.autoplay.stop(); setPaused(!paused); }}>{paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}</button>
        </div>}
      </div>
    </section>
  );
}
