'use client';
import { useState, useTransition } from 'react';
import { participate } from '@/lib/actions/community';
import { useToast } from './Toast';

export function ParticipateButton({ campaignId, joined: initial, available, path }: { campaignId: string; joined: boolean; available: boolean; path: string }) {
  const [joined, setJoined] = useState(initial);
  const [pending, start] = useTransition();
  const toast = useToast();
  const label = joined ? '응원 참여 완료' : available ? '캠페인 응원 참여' : '참여 기간이 아닙니다';
  return (
    <button type="button" className="button primary" disabled={joined || !available || pending} onClick={() => start(async () => { const r = await participate(campaignId, path); toast(r.error ?? r.message ?? ''); if (r.ok) setJoined(true); })}>{label}</button>
  );
}
