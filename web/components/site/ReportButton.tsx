'use client';
import { useState, useTransition } from 'react';
import { reportComment } from '@/lib/actions/community';
import { useToast } from './Toast';

export function ReportButton({ commentId }: { commentId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [pending, start] = useTransition();
  const toast = useToast();
  if (!open) return <button type="button" className="button small secondary" onClick={() => setOpen(true)}>신고</button>;
  return (
    <form className="actions" onSubmit={(e) => { e.preventDefault(); start(async () => { const r = await reportComment(commentId, reason); toast(r.error ?? r.message ?? ''); if (r.ok) setOpen(false); }); }}>
      <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="신고 사유" aria-label="신고 사유" maxLength={200} required />
      <button type="submit" className="button small primary" disabled={pending}>접수</button>
      <button type="button" className="button small secondary" onClick={() => setOpen(false)}>취소</button>
    </form>
  );
}
