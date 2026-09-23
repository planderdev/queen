import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function CommunityPagination({ page, pages, href }: { page: number; pages: number; href: (n: number) => string }) {
  return (
    <nav className="community-pagination" aria-label="페이지 이동">
      {page > 1 ? <Link href={href(page - 1)} aria-label="이전 페이지"><ChevronLeft aria-hidden="true" /></Link> : <span className="is-disabled" aria-hidden="true"><ChevronLeft /></span>}
      {Array.from({ length: pages }, (_, i) => <Link key={i} href={href(i + 1)} aria-current={page === i + 1 ? 'page' : undefined}>{i + 1}</Link>)}
      {page < pages ? <Link href={href(page + 1)} aria-label="다음 페이지"><ChevronRight aria-hidden="true" /></Link> : <span className="is-disabled" aria-hidden="true"><ChevronRight /></span>}
    </nav>
  );
}
