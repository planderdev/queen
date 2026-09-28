import Link from 'next/link';
import type { Metadata } from 'next';
import { Search } from 'lucide-react';
import { repo } from '@/lib/data';
import { getSession } from '@/lib/auth';
import { date } from '@/lib/format';
import { PageBanner } from '@/components/site/PageBanner';
import { Area, EmptyResult, Field, Notice, Select, Tabs } from '@/components/ui';
import { FaqList } from '@/components/site/FaqList';
import { ActionForm } from '@/components/site/ActionForm';
import { createInquiry } from '@/lib/actions/community';
import { CommunityPagination } from '@/components/site/CommunityPagination';

export const metadata: Metadata = { title: '고객센터' };
const views = ['faq', 'notices', 'inquiry', 'terms', 'privacy'];

export default async function SupportPage({ searchParams }: { searchParams: Promise<{ view?: string; category?: string; search?: string; page?: string; sort?: string }> }) {
  const sp = await searchParams;
  const view = views.includes(sp.view ?? '') ? sp.view! : 'faq';
  const search = (sp.search ?? '').trim();
  let body: React.ReactNode = null;
  if (view === 'faq') {
    const faqs = await repo.listContent('faq');
    const category = sp.category ?? '';
    const cats = [...new Set(faqs.map((f) => f.category ?? '기타'))];
    const filtered = faqs.filter((f) => (!category || (f.category ?? '기타') === category) && (!search || `${f.title} ${f.body}`.includes(search)));
    const url = (v: Record<string, string>) => `/support?${new URLSearchParams(Object.entries({ view: 'faq', category, search, ...v }).filter(([, x]) => x))}`;
    // 아직 자주 묻는 질문이 없으면 분류·검색 대신 1:1 문의 안내
    body = !faqs.length ? (
      <EmptyResult title="자주 묻는 질문을 정리하고 있어요" text="궁금한 점을 1:1 문의로 남겨주시면 확인 후 답변드릴게요." action={<Link className="button secondary" href="/support?view=inquiry">1:1 문의하기</Link>} />
    ) : (
      <>
        <div className="community-intro"><h2>무엇이 궁금하신가요?</h2><p>자주 묻는 질문에서 빠르게 확인해 보세요.</p></div>
        <Tabs items={[['', '전체', url({ category: '' })], ...cats.map((c) => [c, c, url({ category: c })] as [string, string, string])]} current={category} label="게시물 분류" />
        <div className="community-toolbar"><p>전체 <strong>{filtered.length}</strong>건</p>
          <form className="community-search" action="/support" role="search"><input type="hidden" name="view" value="faq" /><input type="hidden" name="category" value={category} /><label><span className="qm-sr-only">제목 또는 내용 검색</span><input type="search" name="search" defaultValue={search} placeholder="검색어를 입력해 주세요" /></label><button type="submit" aria-label="검색"><Search aria-hidden="true" /></button></form></div>
        {filtered.length ? <FaqList items={filtered.map((f) => [f.title, f.body])} /> : <EmptyResult />}
        <div className="community-help"><div><h3>찾으시는 답변이 없으신가요?</h3><p>1:1 문의로 궁금한 내용을 남겨 주세요.</p></div><Link className="button secondary" href="/support?view=inquiry">1:1 문의하기</Link></div>
      </>
    );
  }
  if (view === 'notices') {
    const all = await repo.listContent('notice');
    const sorted = sp.sort === 'oldest' ? [...all].reverse() : all;
    const filtered = sorted.filter((c) => !search || `${c.title} ${c.body}`.includes(search));
    const per = 10, pages = Math.max(1, Math.ceil(filtered.length / per)), page = Math.min(pages, Math.max(1, Number(sp.page) || 1));
    const items = filtered.slice((page - 1) * per, page * per);
    body = (
      <>
        <div className="community-toolbar"><p>전체 <strong>{filtered.length}</strong>건</p>
          <form className="community-search community-search-with-sort" action="/support" role="search"><input type="hidden" name="view" value="notices" /><select name="sort" aria-label="공지사항 정렬" defaultValue={sp.sort === 'oldest' ? 'oldest' : 'newest'}><option value="newest">최신순</option><option value="oldest">오래된순</option></select><label><span className="qm-sr-only">제목 또는 내용 검색</span><input type="search" name="search" defaultValue={search} placeholder="검색어를 입력해 주세요" /></label><button type="submit" aria-label="검색"><Search aria-hidden="true" /></button></form></div>
        <div className="community-board"><table><caption className="qm-sr-only">퀸만덕 공지사항</caption><thead><tr><th scope="col">번호</th><th scope="col">제목</th><th scope="col">등록일</th></tr></thead>
          <tbody>{items.map((c, i) => <tr key={c.id}><td className="community-board-number">{filtered.length - (page - 1) * per - i}</td><td className="community-board-title"><Link href={`/support/notices/${c.slug ?? c.id}`}>{c.title}</Link>{Date.now() - new Date(c.created_at).getTime() < 7 * 86400000 && <span className="notice-new">새 글</span>}</td><td className="community-board-date">{date(c.created_at)}</td></tr>)}</tbody></table>{!filtered.length && <EmptyResult />}</div>
        <CommunityPagination page={page} pages={pages} href={(n) => `/support?view=notices&page=${n}${search ? `&search=${encodeURIComponent(search)}` : ''}`} />
      </>
    );
  }
  if (view === 'inquiry') {
    const session = await getSession();
    body = (
      <>
        <div className="community-intro"><h2>무엇을 도와드릴까요?</h2><p>문의 내용을 남겨 주시면 {session ? '나의 후원 > 문의 내역' : '입력한 이메일'}에서 답변을 확인할 수 있습니다.</p></div>
        <div className="community-inquiry">
          <Notice>실제 개인정보나 민감정보(계좌 비밀번호, 주민등록번호 등)는 입력하지 마세요.</Notice>
          <ActionForm action={createInquiry} submitLabel="문의 접수" pendingLabel="접수 중…" reset>
            <Select label="문의 유형" name="category" options={[['', '선택해 주세요'], '기부', '정기기부', '단체', '기업', '기타']} required />
            {!session && <Field label="답변 받을 이메일" name="email" type="email" required autoComplete="email" />}
            <Field label="문의 제목" name="title" required maxLength={100} placeholder="제목을 입력해 주세요" />
            <Area label="문의 내용" name="body" required maxLength={2000} placeholder="문의 내용을 입력해 주세요" />
          </ActionForm>
        </div>
      </>
    );
  }
  if (view === 'terms' || view === 'privacy') body = view === 'terms' ? (
    <article className="community-policy"><h2>이용약관</h2>
      <h3>제1조 (목적)</h3><p>이 약관은 퀸만덕(이하 “서비스”)이 제공하는 기부 중개 서비스의 이용 조건과 절차, 이용자와 서비스의 권리·의무를 정합니다.</p>
      <h3>제2조 (기부의 성립)</h3><p>기부는 이용자가 기부를 신청하고 안내된 계좌로 입금한 뒤 운영팀이 입금을 확인한 시점에 성립합니다. 입금 확인 전에는 나의 후원에서 신청을 취소할 수 있습니다.</p>
      <h3>제3조 (환불)</h3><p>입금 확인 후 7일 이내에 환불을 요청할 수 있으며, 운영팀 확인 후 처리됩니다. 이미 단체에 지급된 기부금은 환불이 제한될 수 있습니다.</p>
      <h3>제4조 (정기기부)</h3><p>정기기부 약정은 매월 약정일에 이체하는 방식으로 이행됩니다. 이용자는 언제든지 금액 변경, 일시중지, 해지를 할 수 있습니다.</p>
      <h3>제5조 (게시물)</h3><p>응원 댓글 등 게시물이 타인의 권리를 침해하거나 운영 정책에 어긋나는 경우 운영팀이 숨김 처리할 수 있습니다.</p>
      <p className="community-muted">본 약관의 세부 조항은 서비스 오픈 전 법률 검토를 거쳐 확정됩니다.</p>
    </article>
  ) : (
    <article className="community-policy"><h2>개인정보처리방침</h2>
      <p>퀸만덕(이하 “서비스”)은 이용자의 개인정보를 소중히 다루며, 「개인정보 보호법」 등 관련 법령을 지킵니다. 이 방침은 서비스가 어떤 개인정보를 왜 수집하고 어떻게 보관·파기하는지 안내합니다.</p>
      <h3>1. 수집 항목</h3>
      <ul>
        <li>회원가입: 이메일, 닉네임, 비밀번호(암호화 저장)</li>
        <li>행사(캠페인) 참가 신청: 성함, 연락처, 이메일, 성별, 연령대, 행사별 추가 질문의 답(예: 러닝 페이스·코스), 참가비 입금자명</li>
        <li>기부 신청: 입금자명, 응원 메시지</li>
        <li>1:1 문의: 이메일(비회원), 문의 내용</li>
        <li>서비스 이용 과정에서 자동 생성: 접속 기록, 브라우저 정보(보안과 오류 확인 목적)</li>
      </ul>
      <h3>2. 이용 목적</h3>
      <ul>
        <li>행사 참가 신청 접수, 참가비 입금 확인과 참가 확정, 행사 운영 및 참가 안내 연락</li>
        <li>기부 신청과 입금 확인, 기부 내역 안내, 정기기부 관리</li>
        <li>문의 응대, 회원 관리, 부정 이용 방지</li>
      </ul>
      <h3>3. 보유 및 파기</h3>
      <ul>
        <li>행사 참가 신청 정보: 해당 행사 종료 후 지체 없이 파기합니다.</li>
        <li>회원 정보: 회원 탈퇴 시까지 보관하고 탈퇴 후 지체 없이 파기합니다.</li>
        <li>기부 기록: 관련 법령이 정한 기간 동안 별도로 보관한 뒤 파기합니다.</li>
        <li>문의 내용: 처리가 끝나 목적을 달성하면 파기합니다.</li>
        <li>전자 파일은 복구할 수 없는 방법으로 삭제하고, 내려받은 명단 파일도 함께 삭제합니다.</li>
      </ul>
      <h3>4. 처리 위탁 및 국외 보관</h3>
      <p>서비스는 안정적인 운영을 위해 아래 업체에 개인정보 처리를 위탁하며, 개인정보는 국외(일본 도쿄 지역) 서버에 보관됩니다. 개인정보는 서비스 이용 시점에 네트워크를 통해 전송됩니다.</p>
      <ul>
        <li>Supabase Inc.: 데이터 저장 및 로그인 인증 · 보관 위치 일본 도쿄</li>
        <li>Vercel Inc.: 웹 서비스 운영(서버 처리) · 처리 위치 일본 도쿄 및 이용자와 가까운 네트워크 거점</li>
      </ul>
      <p>국외 보관을 원하지 않으시면 개인정보 제공을 거부할 수 있으나, 이 경우 참가 신청 등 서비스 이용이 제한됩니다.</p>
      <h3>5. 이용자의 권리</h3>
      <p>이용자는 언제든지 자신의 개인정보 열람, 정정, 삭제, 처리 정지를 요청할 수 있습니다. 1:1 문의로 요청하시면 지체 없이 처리합니다. 회원은 나의 후원 &gt; 프로필에서 직접 정보를 수정할 수 있습니다.</p>
      <h3>6. 안전성 확보 조치</h3>
      <p>비밀번호 암호화 저장, 전송 구간 암호화(HTTPS), 관리자 권한 분리와 접근 기록 관리, 데이터베이스 행 단위 접근 제어를 적용합니다.</p>
      <h3>7. 개인정보 보호책임자</h3>
      <p>개인정보 보호책임자와 연락처는 지정 후 이곳에 게시합니다. 그 전까지 개인정보 관련 문의는 1:1 문의로 접수해 주세요.</p>
      <p className="community-muted">시행일: 2026년 9월 28일. 세부 내용은 법률 검토를 거쳐 보완될 수 있습니다.</p>
    </article>
  );
  return (
    <>
      <PageBanner page="support" view={view} />
      <div className="container community-page">{body}</div>
    </>
  );
}
