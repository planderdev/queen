'use client';
import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { toggleBookmark } from '@/lib/actions/bookmark';
import { useToast } from './Toast';

export function BookmarkButton({ targetType, targetId, saved: initial, label, path, className = 'bookmark' }: { targetType: 'fundraiser' | 'story' | 'campaign' | 'organization'; targetId: string; saved: boolean; label: string; path: string; className?: string }) {
  const [saved, setSaved] = useState(initial);
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <button type="button" className={`${className} ${saved ? 'saved' : ''}`} aria-label={label} aria-pressed={saved} disabled={pending}
      onClick={() => start(async () => { const r = await toggleBookmark(targetType, targetId, path); if (r.error) toast(r.error); else { setSaved(r.saved); toast(r.saved ? '관심 목록에 담았어요.' : '관심 목록에서 뺐어요.'); } })}>
      <Heart aria-hidden="true" />{className !== 'bookmark' && ' 관심'}
    </button>
  );
}
