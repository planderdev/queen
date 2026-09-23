'use client';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { cancelPendingDonation, updatePlan } from '@/lib/actions/donation';
import { signOut } from '@/lib/actions/auth';
import { useToast } from './Toast';

export function DonationActions({ id, status, kind, refundOpen, confirmedAt }: { id: string; status: string; kind: string; refundOpen: boolean; confirmedAt: string | null }) {
  const [pending, start] = useTransition();
  const toast = useToast();
  if (status === 'pending') return <button type="button" className="button small secondary" disabled={pending} onClick={() => { if (!confirm('입금 전 기부 신청을 취소할까요?')) return; start(async () => { const r = await cancelPendingDonation(id); toast(r.error ?? r.message ?? ''); }); }}>신청 취소</button>;
  if (status === 'success' && kind !== 'refund' && !refundOpen) {
    const within = !confirmedAt || Date.now() - new Date(confirmedAt).getTime() <= 7 * 86400000;
    return within ? <Link className="button small secondary" href={`/my?view=donations&refund=${id}#refund`}>환불 요청</Link> : <span className="help">환불 기간 종료</span>;
  }
  return null;
}

export function PlanActions({ id, status, amount }: { id: string; status: string; amount: number }) {
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(amount));
  const toast = useToast();
  if (status === 'cancelled') return null;
  const run = (action: 'pause' | 'resume' | 'cancel' | 'amount', amt?: number) => start(async () => { const r = await updatePlan(id, action, amt); toast(r.error ?? r.message ?? ''); if (r.ok) setEditing(false); });
  return (
    <div className="actions" style={{ marginTop: 'var(--space-20)' }}>
      {editing ? (
        <><input type="number" min={1000} max={10000000} step={1000} value={value} onChange={(e) => setValue(e.target.value)} aria-label="월 금액" /><button type="button" className="button small primary" disabled={pending} onClick={() => run('amount', Number(value))}>저장</button><button type="button" className="button small secondary" onClick={() => setEditing(false)}>취소</button></>
      ) : <button type="button" className="button small" onClick={() => setEditing(true)}>금액 변경</button>}
      <button type="button" className="button small" disabled={pending} onClick={() => run(status === 'paused' ? 'resume' : 'pause')}>{status === 'paused' ? '재개' : '일시중지'}</button>
      <button type="button" className="button small danger" disabled={pending} onClick={() => { if (confirm('정기기부 약정을 해지할까요?')) run('cancel'); }}>해지</button>
    </div>
  );
}

export function SignOutButton() {
  return <form action={signOut}><button type="submit" className="button secondary">로그아웃</button></form>;
}
