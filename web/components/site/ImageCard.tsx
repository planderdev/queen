import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { ShareButton } from './ShareButton';

export function ImageCard({ image, category, title, body, href, cta = '자세히 보기', share = false }: { image: string; category: string; title: string; body: string; href: string; cta?: string; share?: boolean }) {
  const card = (
    <Link className="program-card" href={href}>
      <div className="program-card-image"><img src={image} alt={`${category} 활동 참고 이미지`} width={600} height={400} loading="lazy" /><span className="program-card-corner" aria-hidden="true"><span className="program-card-go"><ArrowUpRight /></span></span></div>
      <div className="program-card-copy"><span className="program-category">{category}</span><h3>{title}</h3><p>{body}</p><span className="program-more">{cta}<ArrowRight aria-hidden="true" /></span></div>
    </Link>
  );
  if (!share) return card;
  // 공유 버튼은 카드 링크 안에 넣을 수 없어(링크 안 버튼 금지) 같은 틀 안에 형제로 겹쳐 둔다
  return <div className="program-card-wrap">{card}<ShareButton className="program-card-share" label="공유하기" iconOnly title={title} path={href} text="함께 참여해요!" /></div>;
}
