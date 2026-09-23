import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function ImageCard({ image, category, title, body, href, cta = '자세히 보기' }: { image: string; category: string; title: string; body: string; href: string; cta?: string }) {
  return (
    <Link className="program-card" href={href}>
      <div className="program-card-image"><img src={image} alt={`${category} 활동 참고 이미지`} width={600} height={400} loading="lazy" /><span className="program-card-corner" aria-hidden="true"><ArrowRight /></span></div>
      <div className="program-card-copy"><span className="program-category">{category}</span><h3>{title}</h3><p>{body}</p><span className="program-more">{cta}<ArrowRight aria-hidden="true" /></span></div>
    </Link>
  );
}
