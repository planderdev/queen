import Link from 'next/link';
import type { Metadata } from 'next';
import { Sprout } from 'lucide-react';
import { ActionForm } from '@/components/site/ActionForm';
import { Field, Notice } from '@/components/ui';
import { signUp } from '@/lib/actions/auth';
import { hasSupabase } from '@/lib/env';

export const metadata: Metadata = { title: '회원가입' };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = '/my' } = await searchParams;
  return (
    <div className="container">
      <div className="auth-box">
        <div className="center"><Sprout aria-hidden="true" /><h1 style={{ fontSize: 'var(--font-size-title-small)', margin: 'var(--space-16) 0' }}>나눔의 첫걸음</h1><p className="help">이메일로 가입하면 기부 내역과 정기기부를 한곳에서 관리할 수 있어요.</p></div>
        {!hasSupabase && <Notice>미리보기 모드입니다. 데이터베이스가 연결되면 회원가입을 사용할 수 있습니다.</Notice>}
        <ActionForm action={signUp} submitLabel="가입하기" pendingLabel="가입 중…">
          <input type="hidden" name="next" value={next} />
          <Field label="닉네임" name="name" required maxLength={20} placeholder="참여 내역에 표시될 이름" autoComplete="nickname" />
          <Field label="이메일" name="email" type="email" required autoComplete="email" />
          <Field label="비밀번호" name="password" type="password" required minLength={8} autoComplete="new-password" help="8자 이상" />
          <label className="checkbox"><input type="checkbox" name="agree" required /> <Link href="/support?view=terms">이용약관</Link>과 <Link href="/support?view=privacy">개인정보처리방침</Link>에 동의합니다.</label>
        </ActionForm>
        <div className="actions" style={{ justifyContent: 'center', margin: 'var(--space-20) 0' }}><Link className="text-link" href="/auth/login">이미 계정이 있어요</Link></div>
      </div>
    </div>
  );
}
