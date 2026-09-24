'use client';
import { useActionState, useEffect, type ReactNode } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useToast } from './Toast';

export interface ActionResult { error?: string; message?: string; ok?: boolean }
type Action = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

// Progressive form: works without JS (server action), shows inline errors and a toast with JS.
export function ActionForm({ action, className, children, submitLabel = '저장', pendingLabel = '처리 중…', reset = false, successPanel = false }: { action: Action; className?: string; children: ReactNode; submitLabel?: ReactNode; pendingLabel?: string; reset?: boolean; successPanel?: boolean }) {
  const [state, formAction, pending] = useActionState(action, {});
  const toast = useToast();
  useEffect(() => { if (state.ok && state.message) toast(state.message); }, [state, toast]);
  // successPanel: 제출이 끝나면 폼 대신 완료 문구를 보여준다 (참가 신청처럼 한 번만 제출하는 폼)
  if (successPanel && state.ok) return <div className={`form-success ${className ?? ''}`} role="status"><CheckCircle2 aria-hidden="true" /><p style={{ whiteSpace: 'pre-wrap' }}>{state.message}</p></div>;
  return (
    <form className={className} action={formAction} key={reset && state.ok ? String(Date.now()) : 'form'}>
      {children}
      <p className="form-error" role="alert">{state.error ?? ''}</p>
      <div className="actions"><button className="button primary" type="submit" disabled={pending}>{pending ? pendingLabel : submitLabel}</button></div>
    </form>
  );
}
