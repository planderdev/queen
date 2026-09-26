import Link from 'next/link';
import { ArrowUpRight, ChevronUp } from 'lucide-react';
import { BackToTop } from './BackToTop';

// 2026-09-26 요청: 떠 있는 후원하기 버튼과 하단 '사이트 관리'(브랜드 가이드·데모 링크) 숨김. /design-system, /demo는 주소로 계속 접근 가능.
export function Footer() {
  return (
    <>
      <footer className="site-bottom">
        <div className="site-shell">
          <div className="bottom-links">
            <nav aria-label="하단 메뉴">
              <Link href="/support?view=terms">이용약관</Link>
              <Link href="/support?view=privacy"><strong>개인정보처리방침</strong></Link>
              <Link href="/about">퀸만덕 소개</Link>
              <Link href="/support">FAQ</Link>
              <Link href="/support?view=inquiry">1:1 문의하기</Link>
            </nav>
          </div>
          <div className="bottom-info">
            <div className="bottom-identity">
              <Link href="/" aria-label="퀸만덕 홈"><img src="/assets/brand/logo2.svg" alt="퀸만덕" width={130} height={81} /></Link>
              <div>
                <h2>작은 마음이 모이는 곳, 퀸만덕</h2>
                <p>작은 나눔이 모여, 더 큰 변화를 만듭니다.</p>
                <p>기부금은 안내된 계좌로 입금 후 운영팀 확인을 거쳐 반영됩니다.<br />단체 소개와 사진은 각 단체가 제공한 자료를 기준으로 합니다.</p>
              </div>
            </div>
            <div className="bottom-contact">
              <h2>후원문의·상담</h2>
              <Link href="/support?view=inquiry">마음을 잇는 문의하기 <ArrowUpRight aria-hidden="true" /></Link>
              <p>궁금한 내용을 남겨주세요.<br />내 문의와 답변은 나의 후원에서 확인할 수 있습니다.</p>
            </div>
          </div>
          <p className="bottom-copyright">© 2026 QUEEN MANDEOK. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
      <aside className="quick-support" aria-label="빠른 메뉴">
        <BackToTop><ChevronUp aria-hidden="true" /></BackToTop>
      </aside>
    </>
  );
}
