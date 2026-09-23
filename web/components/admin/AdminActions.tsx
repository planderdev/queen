'use client';
import { useState, useTransition } from 'react';
import { useToast } from '@/components/site/Toast';
import type { ActionResult } from '@/components/site/ActionForm';

// One-click action with optional confirm; reason-taking action opens an inline field.
export function ActionButton({ label, onRun, confirmText, className = 'button small primary' }: { label: string; onRun: () => Promise<ActionResult>; confirmText?: string; className?: string }) {
  const [pending, start] = useTransition();
  const toast = useToast();
  return <button type="button" className={className} disabled={pending} onClick={() => { if (confirmText && !confirm(confirmText)) return; start(async () => { const r = await onRun(); toast(r.error ?? r.message ?? ''); }); }}>{pending ? '처리 중…' : label}</button>;
}

export function ReasonAction({ label, onRun, className = 'button small primary', placeholder = '처리 사유' }: { label: string; onRun: (reason: string) => Promise<ActionResult>; className?: string; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [pending, start] = useTransition();
  const toast = useToast();
  if (!open) return <button type="button" className={className} onClick={() => setOpen(true)}>{label}</button>;
  return (
    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
      <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder={placeholder} aria-label={placeholder} maxLength={300} style={{ minWidth: 200 }} />
      <button type="button" className={className} disabled={pending} onClick={() => start(async () => { const r = await onRun(reason); toast(r.error ?? r.message ?? ''); if (r.ok) setOpen(false); })}>{pending ? '처리 중…' : '확인'}</button>
      <button type="button" className="button small secondary" onClick={() => setOpen(false)}>취소</button>
    </span>
  );
}
