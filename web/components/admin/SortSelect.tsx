'use client';
import { useRouter } from 'next/navigation';

// 모바일 정렬 메뉴: 표 머리글이 숨겨지는 카드 보기에서 정렬을 바꾸는 선택 상자 (데스크톱에서는 CSS로 숨김)
export function SortSelect({ options, current }: { options: [string, string][]; current: string }) {
  const router = useRouter();
  return (
    <label className="qa-sort-select">
      <i className="ri-arrow-up-down-line" aria-hidden="true"></i>
      <span className="sr-only">정렬</span>
      <select value={current} onChange={(e) => router.push(e.target.value)} aria-label="정렬">
        {options.map(([href, label]) => <option key={href} value={href}>{label}</option>)}
      </select>
    </label>
  );
}
