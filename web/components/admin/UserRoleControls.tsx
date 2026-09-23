'use client';
import { useState, useTransition } from 'react';
import { setUserState } from '@/lib/actions/admin';
import { useToast } from '@/components/site/Toast';

type AdminRole = 'super' | 'content' | 'review' | 'finance';

export function UserRoleControls({ id, role, adminRole, suspended }: { id: string; role: 'donor' | 'admin'; adminRole: AdminRole | null; suspended: boolean }) {
  const [value, setValue] = useState<string>(role === 'admin' ? adminRole ?? 'content' : 'donor');
  const [pending, start] = useTransition();
  const toast = useToast();
  const run = (patch: Parameters<typeof setUserState>[1]) => start(async () => { const r = await setUserState(id, patch); toast(r.error ?? r.message ?? ''); });
  return (
    <div className="actions">
      <select value={value} onChange={(e) => setValue(e.target.value)} aria-label="역할"><option value="donor">기부 회원</option><option value="super">최고 관리자</option><option value="content">콘텐츠 운영자</option><option value="review">심사 담당자</option><option value="finance">정산 담당자</option></select>
      <button type="button" className="button small primary" disabled={pending} onClick={() => run(value === 'donor' ? { role: 'donor', admin_role: null } : { role: 'admin', admin_role: value as AdminRole })}>역할 적용</button>
      <button type="button" className="button small secondary" disabled={pending} onClick={() => { if (confirm(suspended ? '이용을 재개할까요?' : '이 회원의 이용을 중지할까요?')) run({ suspended: !suspended }); }}>{suspended ? '재개' : '이용중지'}</button>
    </div>
  );
}
