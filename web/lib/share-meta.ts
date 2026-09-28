import type { Metadata } from 'next';

// 카카오톡·문자·SNS 공유 미리보기(Open Graph). 이미지·주소는 layout의 metadataBase 기준 절대 주소로 바뀐다.
export const DEFAULT_OG_IMAGE = { url: '/og/default.png', width: 1200, height: 630, alt: '퀸만덕 · 작은 나눔이 모여, 더 큰 변화를 만듭니다' };
const clip = (s: string, n = 110) => { const t = s.replace(/\s+/g, ' ').trim(); return t.length > n ? `${t.slice(0, n - 1)}…` : t; };

export function shareMeta({ title, description, path, image, imageSize }: { title: string; description?: string | null; path: string; image?: string | null; imageSize?: [number, number] }): Metadata {
  const desc = clip(description || '마음이 닿는 이야기를 만나고, 그 다음의 변화까지 함께하세요.');
  const img = image ? { url: image, width: imageSize?.[0] ?? 1200, height: imageSize?.[1] ?? 630, alt: title } : DEFAULT_OG_IMAGE;
  return {
    title, description: desc,
    alternates: { canonical: path },
    openGraph: { type: 'website', siteName: '퀸만덕', locale: 'ko_KR', title, description: desc, url: path, images: [img] },
    twitter: { card: 'summary_large_image', title, description: desc, images: [img.url] }
  };
}
