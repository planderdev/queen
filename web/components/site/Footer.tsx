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
              {/* 열려 있는 메뉴(캠페인·소식)에 맞춘 링크. 숨긴 기관소개·후원 FAQ는 제외 */}
              <Link href="/campaigns">나눔 캠페인</Link>
              <Link href="/stories">나눔이야기</Link>
              <Link href="/support?view=notices">공지사항</Link>
              <Link href="/support?view=inquiry">1:1 문의하기</Link>
            </nav>
          </div>
          <div className="bottom-info">
            <div className="bottom-identity">
              <Link href="/" aria-label="퀸만덕 홈"><img src="/assets/brand/logo2.svg" alt="퀸만덕" width={130} height={81} /></Link>
              <div>
                <h2>작은 마음이 모이는 곳, 퀸만덕</h2>
                <p>작은 나눔이 모여, 더 큰 변화를 만듭니다.</p>
                <p>캠페인 참가비는 안내된 계좌로 입금 후 운영팀 확인을 거쳐 참가가 확정됩니다.<br />일부 사진은 이해를 돕기 위한 참고 이미지입니다.</p>
              </div>
            </div>
            <div className="bottom-contact">
              <h2>문의·상담</h2>
              <Link href="/support?view=inquiry">마음을 잇는 문의하기 <ArrowUpRight aria-hidden="true" /></Link>
              <p>캠페인·참가 신청에 관해 궁금한 점을 남겨주세요.<br />회원은 나의 후원에서, 비회원은 이메일로 답변을 받습니다.</p>
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
