'use client';
import { useActionState, useEffect, type ReactNode } from 'react';
import { useToast } from './Toast';

export interface ActionResult { error?: string; message?: string; ok?: boolean }
type Action = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

// Progressive form: works without JS (server action), shows inline errors and a toast with JS.
export function ActionForm({ action, className, children, submitLabel = '저장', pendingLabel = '처리 중…', reset = false }: { action: Action; className?: string; children: ReactNode; submitLabel?: ReactNode; pendingLabel?: string; reset?: boolean }) {
  const [state, formAction, pending] = useActionState(action, {});
  const toast = useToast();
  useEffect(() => { if (state.ok && state.message) toast(state.message); }, [state, toast]);
  return (
    <form className={className} action={formAction} key={reset && state.ok ? String(Date.now()) : 'form'}>
      {children}
      <p className="form-error" role="alert">{state.error ?? ''}</p>
      <div className="actions"><button className="button primary" type="submit" disabled={pending}>{pending ? pendingLabel : submitLabel}</button></div>
    </form>
  );
}
