import Link from 'next/link';
import { ChevronDown, House } from 'lucide-react';
import { navigation, visibleNavigation } from './Header';

const sections: Record<string, [string, string, string, string]> = {
  donate: ['후원하기', 'SUPPORT', '작은 관심이 누군가의 든든한 일상이 됩니다.', '/assets/images/meal.jpg'],
  monthly: ['정기후원', 'SUPPORT', '매달 이어지는 마음으로 더 오래 함께합니다.', '/assets/images/child.jpg'],
  campaigns: ['캠페인', 'CAMPAIGN', '마음과 마음이 만나 더 큰 변화를 만듭니다.', '/assets/images/community.jpg'],
  organizations: ['사업안내', 'OUR WORK', '각자의 자리에서 더 나은 내일을 만드는 사람들.', '/assets/images/child.jpg'],
  about: ['퀸만덕 소개', 'ABOUT US', '작은 마음을 연결하고, 나눔 이후까지 함께합니다.', '/assets/images/forest.jpg'],
  stories: ['나눔이야기', 'NEWS', '여러분의 나눔이 만든 변화의 소식을 만나보세요.', '/assets/images/community.jpg'],
  support: ['후원가이드', 'SUPPORT', '처음 만나는 나눔부터 궁금한 이야기까지 안내합니다.', '/assets/images/meal.jpg'],
  my: ['나의 후원', 'MY GIVING', '내가 전한 마음과 이어지는 변화를 확인하세요.', '/assets/images/forest.jpg']
};
const supportTitles: Record<string, string> = { notices: '공지사항', inquiry: '1:1 문의', terms: '이용약관', privacy: '개인정보처리방침' };
// 공지사항·1:1 문의는 주 메뉴 '소식' 아래에 있으므로 소식 배너를 쓴다 (후원가이드 배너 대신)
const newsViews: Record<string, [string, string]> = {
  notices: ['퀸만덕의 새로운 소식과 안내를 전합니다.', '/assets/images/community.jpg'],
  inquiry: ['궁금한 점을 남겨 주시면 확인 후 답변드립니다.', '/assets/images/community.jpg']
};

// Section hero + breadcrumb menu. `current` is the pathname (+ query for support views) to highlight.
export function PageBanner({ page, view, title: override }: { page: string; view?: string; title?: string }) {
  const data = sections[page];
  if (!data) return null;
  const news = page === 'support' && view ? newsViews[view] : undefined;
  const [defaultTitle, baseCategory, baseDescription, basePhoto] = data;
  const category = news ? 'NEWS' : baseCategory;
  const description = news?.[0] ?? baseDescription;
  const photo = news?.[1] ?? basePhoto;
  const title = override ?? (page === 'support' ? supportTitles[view ?? ''] ?? defaultTitle : defaultTitle);
  const current = `/${page}${page === 'support' && view ? `?view=${view}` : ''}`;
  let selected: { group: (typeof navigation)[number]; item: [string, string] } | null = null;
  let best = -1;
  for (const group of navigation) for (const item of group[1]) {
    const [path, query = ''] = item[0].split('?');
    const [curPath, curQuery = ''] = current.split('?');
    if (path !== curPath) continue;
    const params = new URLSearchParams(query);
    if (![...params].every(([k, v]) => new URLSearchParams(curQuery).get(k) === v)) continue;
    if ([...params].length > best) { selected = { group, item }; best = [...params].length; }
  }
  return (
    <section className="page-banner site-shell" aria-labelledby="section-title">
      <div className="banner-surface" style={{ backgroundImage: `url('${photo}')` }}>
        <div className="banner-copy"><span className="section-kicker">{category}</span><h1 id="section-title">{title}</h1><p>{description}</p></div>
      </div>
      <nav className="section-path" aria-label="현재 위치">
        <Link className="path-home" href="/" aria-label="홈"><House aria-hidden="true" /></Link>
        <details className="path-group">
          <summary>{selected ? selected.group[0] : '전체 메뉴'}<ChevronDown aria-hidden="true" /></summary>
          <div>{visibleNavigation.map((g) => <Link key={g[0]} href={g[1][0][0]} aria-current={selected?.group === g ? 'true' : undefined}>{g[0]}</Link>)}</div>
        </details>
        {selected ? (
          <details className="path-current">
            <summary>{selected.item[1]}<ChevronDown aria-hidden="true" /></summary>
            <div>{selected.group[1].map((i) => <Link key={i[0]} href={i[0]} aria-current={selected!.item === i ? 'page' : undefined}>{i[1]}</Link>)}</div>
          </details>
        ) : <div className="path-current"><span className="path-label">{title}</span></div>}
      </nav>
    </section>
  );
}
