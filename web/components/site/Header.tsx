import Link from 'next/link';
import { ChevronDown, Menu, Search, UserRound } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { MenuToggle } from './MenuToggle';

export const navigation: [string, [string, string][]][] = [
  ['후원하기', [['/donate', '일시후원'], ['/monthly', '정기후원'], ['/support', '후원가이드']]],
  ['캠페인', [['/campaigns', '나눔 캠페인'], ['/donate', '진행 중인 모금']]],
  ['사업안내', [['/organizations', '함께하는 단체'], ['/monthly', '정기기부 프로그램']]],
  ['기관소개', [['/about', '퀸만덕 소개']]],
  ['소식', [['/stories', '나눔이야기'], ['/support?view=notices', '공지사항'], ['/support?view=inquiry', '1:1 문의']]]
];

export async function Header({ page }: { page: string }) {
  const session = await getSession();
  return (
    <header className="site-masthead">
      <div className="site-shell masthead-inner">
        <Link className="brand" href="/" aria-label="퀸만덕 홈"><img className="masthead-logo" src="/assets/brand/logo.svg" alt="퀸만덕" width={222} height={27} /></Link>
        <MenuToggle><Menu aria-hidden="true" /></MenuToggle>
        <div className="site-menu" id="site-menu">
          <nav className="site-navigation" aria-label="주 메뉴">
            {navigation.map(([label, items]) => (
              <details className="nav-group" key={label}>
                <summary>{label}<ChevronDown aria-hidden="true" /></summary>
                <div className="nav-dropdown">
                  {items.map(([href, text]) => <Link key={href + text} href={href} aria-current={page === href.replace(/^\//, '').split('?')[0] ? 'page' : undefined}>{text}</Link>)}
                </div>
              </details>
            ))}
          </nav>
          <div className="masthead-tools">
            <Link className="button primary" href="/my"><UserRound aria-hidden="true" /> 나의 후원</Link>
            {session ? <Link className="button secondary" href="/my?view=profile" id="session-label">{session.profile.name}</Link> : <Link className="button secondary" href="/auth/login" id="session-label">로그인</Link>}
            <Link className="icon-button" href="/donate" aria-label="검색"><Search aria-hidden="true" /></Link>
          </div>
        </div>
      </div>
    </header>
  );
}
