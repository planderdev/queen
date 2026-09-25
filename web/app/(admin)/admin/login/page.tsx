import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { hasSupabase } from '@/lib/env';
import { ActionForm } from '@/components/site/ActionForm';
import { adminSignIn } from '@/lib/actions/auth';

export const metadata = { title: '관리자 로그인' };

// 관리자 전용 로그인. 사이트(유저단) 로그인과 분리되어 있고, 사이트 어디에도 링크하지 않는다.
export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ next?: string; denied?: string }> }) {
  const { next = '/admin', denied } = await searchParams;
  const session = await getSession();
  if (session?.profile.role === 'admin' && !session.profile.suspended) redirect(next.startsWith('/admin') ? next : '/admin');
  return (
    <main id="main" className="admin-login" tabIndex={-1}>
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <p className="admin-login-brand"><img src="/assets/brand/logo.svg" alt="퀸만덕" width={148} height={18} /><span>운영 관리</span></p>
        <h1 id="admin-login-title">관리자 로그인</h1>
        <p className="admin-login-lead">관리자 권한이 있는 계정만 들어갈 수 있습니다.</p>
        {denied && <p className="admin-login-alert" role="alert">{session ? `${session.profile.name} 계정은 관리자 권한이 없습니다. 관리자 계정으로 다시 로그인해주세요.` : '관리자 권한이 없는 계정입니다.'}</p>}
        {hasSupabase ? (
          <ActionForm action={adminSignIn} className="admin-login-form" submitLabel="로그인" pendingLabel="확인 중…">
            <input type="hidden" name="next" value={next} />
            <label className="admin-login-field"><span>이메일</span><input name="email" type="email" required autoComplete="username" /></label>
            <label className="admin-login-field"><span>비밀번호</span><input name="password" type="password" required autoComplete="current-password" /></label>
          </ActionForm>
        ) : (
          <p className="admin-login-lead">미리보기 모드입니다. 데이터베이스 연결 전에는 로그인 없이 <Link href="/admin">운영 화면</Link>을 읽기 전용으로 볼 수 있습니다.</p>
        )}
        <p className="admin-login-foot">계정 추가·비밀번호 분실은 최고 관리자에게 문의해주세요.</p>
      </section>
    </main>
  );
}
