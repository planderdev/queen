import Link from 'next/link';
import type { Metadata } from 'next';
import { Sprout } from 'lucide-react';
import { ActionForm } from '@/components/site/ActionForm';
import { Field } from '@/components/ui';
import { requestPasswordReset } from '@/lib/actions/auth';

export const metadata: Metadata = { title: '비밀번호 재설정' };

export default function ResetPage() {
  return (
    <div className="container">
      <div className="auth-box">
        <div className="center"><Sprout aria-hidden="true" /><h1 style={{ fontSize: 'var(--font-size-title-small)', margin: 'var(--space-16) 0' }}>비밀번호 재설정</h1><p className="help">가입한 이메일로 재설정 링크를 보내드립니다.</p></div>
        <ActionForm action={requestPasswordReset} submitLabel="재설정 링크 보내기" pendingLabel="보내는 중…">
          <Field label="이메일" name="email" type="email" required autoComplete="email" />
        </ActionForm>
        <div className="auth-alt"><Link className="text-link" href="/auth/login">로그인으로 돌아가기</Link></div>
      </div>
    </div>
  );
}
