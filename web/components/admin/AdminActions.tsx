'use client';
import { useEffect, useRef, useState, useTransition } from 'react';
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

// 메모: 작은 아이콘 버튼 → 표 위에 뜨는 입력 패널 (표 너비를 밀어내지 않는다)
export function NoteAction({ note, onRun }: { note: string | null; onRun: (note: string) => Promise<ActionResult> }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [value, setValue] = useState(note ?? '');
  const [pending, start] = useTransition();
  const toast = useToast();
  const btn = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  // 표가 가로 스크롤 영역이라 패널이 잘리지 않도록 화면 기준(fixed)으로 버튼 옆에 띄우고, 스크롤·크기 변경 때 버튼을 따라간다.
  const place = () => {
    const el = btn.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const width = 300, below = r.bottom + 6, fitsBelow = below + 110 < window.innerHeight;
    setPos({ top: fitsBelow ? below : r.top - 116, left: Math.max(8, Math.min(r.right - width, window.innerWidth - width - 8)) });
  };
  useEffect(() => {
    if (!open) return;
    input.current?.focus({ preventScroll: true });
    window.addEventListener('scroll', place, true); window.addEventListener('resize', place);
    return () => { window.removeEventListener('scroll', place, true); window.removeEventListener('resize', place); };
  }, [open]);
  const toggle = () => { place(); setValue(note ?? ''); setOpen((v) => !v); };
  const save = () => start(async () => { const r = await onRun(value); toast(r.error ?? r.message ?? ''); if (r.ok) setOpen(false); });
  return (
    <span className="qa-note">
      <button ref={btn} type="button" className={`button small ghost qa-note-btn${note ? ' has-note' : ''}`} aria-expanded={open} aria-label={note ? `메모 수정: ${note}` : '메모 추가'} title={note ?? '메모 추가'} onClick={toggle}>
        <i className={note ? 'ri-sticky-note-fill' : 'ri-sticky-note-add-line'} aria-hidden="true"></i>
      </button>
      {open && pos && (
        <span className="qa-note-panel" role="dialog" aria-label="신청자 메모" style={{ top: pos.top, left: pos.left }}>
          <input ref={input} value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); save(); } if (e.key === 'Escape') setOpen(false); }} placeholder="예: 환불 완료, 대리 신청" maxLength={200} aria-label="메모" />
          <span className="qa-note-actions">
            {note && <button type="button" className="button small ghost" disabled={pending} onClick={() => { setValue(''); start(async () => { const r = await onRun(''); toast(r.error ?? r.message ?? ''); if (r.ok) setOpen(false); }); }}>지우기</button>}
            <button type="button" className="button small secondary" onClick={() => setOpen(false)}>취소</button>
            <button type="button" className="button small primary" disabled={pending} onClick={save}>{pending ? '저장 중…' : '저장'}</button>
          </span>
        </span>
      )}
    </span>
  );
}
