import Link from 'next/link';
import type { Metadata } from 'next';
import { Sprout } from 'lucide-react';
import { ActionForm } from '@/components/site/ActionForm';
import { Field, Notice } from '@/components/ui';
import { signIn } from '@/lib/actions/auth';
import { hasSupabase } from '@/lib/env';

export const metadata: Metadata = { title: '로그인' };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; reason?: string }> }) {
  const { next = '/my' } = await searchParams;
  return (
    <div className="container">
      <div className="auth-box">
        <div className="center"><Sprout aria-hidden="true" /><h1 style={{ fontSize: 'var(--font-size-title-small)', margin: 'var(--space-16) 0' }}>다시 만나 반가워요</h1><p className="help">퀸만덕 계정으로 마음을 이어가세요.</p></div>
        {!hasSupabase && <Notice>미리보기 모드입니다. 데이터베이스가 연결되면 회원가입과 로그인을 사용할 수 있습니다.</Notice>}
        <ActionForm action={signIn} submitLabel="로그인" pendingLabel="확인 중…">
          <input type="hidden" name="next" value={next} />
          <Field label="이메일" name="email" type="email" required autoComplete="email" />
          <Field label="비밀번호" name="password" type="password" required autoComplete="current-password" minLength={8} />
        </ActionForm>
        <div className="auth-alt">
          <p className="auth-divider"><span>아직 계정이 없나요?</span></p>
          <Link className="button secondary" href={`/auth/signup?next=${encodeURIComponent(next)}`}>회원가입</Link>
          <Link className="text-link" href="/auth/reset">비밀번호를 잊으셨나요?</Link>
        </div>
      </div>
    </div>
  );
}
