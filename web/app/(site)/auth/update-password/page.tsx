import type { Metadata } from 'next';
import { ActionForm } from '@/components/site/ActionForm';
import { Field } from '@/components/ui';
import { updatePassword } from '@/lib/actions/auth';

export const metadata: Metadata = { title: '새 비밀번호 설정' };

export default function UpdatePasswordPage() {
  return (
    <div className="container">
      <div className="auth-box">
        <div className="center"><h1 style={{ fontSize: 'var(--font-size-title-small)', margin: 'var(--space-16) 0' }}>새 비밀번호 설정</h1><p className="help">앞으로 사용할 비밀번호를 입력해주세요.</p></div>
        <ActionForm action={updatePassword} submitLabel="비밀번호 변경" pendingLabel="변경 중…">
          <Field label="새 비밀번호" name="password" type="password" required minLength={8} autoComplete="new-password" help="8자 이상" />
        </ActionForm>
      </div>
    </div>
  );
}
