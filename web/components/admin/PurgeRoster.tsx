'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/site/Toast';
import type { ActionResult } from '@/components/site/ActionForm';

// 참가자 명단 파기(비식별화). 되돌릴 수 없어서 ‘파기’를 직접 입력해야 실행된다.
export function PurgeRoster({ count, ended, deadline, isSuper, purgedAt, onRun }: { count: number; ended: boolean; deadline: string; isSuper: boolean; purgedAt?: string; onRun: (word: string) => Promise<ActionResult> }) {
  const [open, setOpen] = useState(false);
  const [word, setWord] = useState('');
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  if (purgedAt) return <p className="qa-purge-done"><i className="ri-shield-check-line" aria-hidden="true"></i> 참가자 명단을 파기했습니다 · {purgedAt}</p>;
  const blocked = !ended ? `신청 마감(${deadline}) 이후에 사용할 수 있습니다.` : !isSuper ? '최고 관리자만 실행할 수 있습니다.' : '';
  return (
    <div className="qa-purge-body">
      <ul>
        <li>참가자 {count}명의 성함·연락처·이메일·성별·연령대·입금자명·메모를 되돌릴 수 없게 지웁니다. 운영 이력에 남은 이름도 함께 지웁니다.</li>
        <li>입금 확인 인원, 신청 상태, 신청 시각, 코스 선택 같은 통계는 남습니다.</li>
        <li>파기 전에 필요한 자료가 있다면 CSV를 내려받고, 사용 후에는 그 파일도 삭제해주세요.</li>
      </ul>
      {blocked ? <p className="qa-help">{blocked}</p> : !open ? (
        <button type="button" className="button small qa-danger-btn" onClick={() => setOpen(true)}><i className="ri-delete-bin-6-line" aria-hidden="true"></i> 명단 파기</button>
      ) : (
        <div className="qa-purge-confirm">
          <label htmlFor="qa-purge-word">되돌릴 수 없습니다. 계속하려면 <b>파기</b>를 입력하세요.</label>
          <div>
            <input id="qa-purge-word" value={word} onChange={(e) => setWord(e.target.value)} placeholder="파기" autoComplete="off" />
            <button type="button" className="button small secondary" onClick={() => { setOpen(false); setWord(''); }}>취소</button>
            <button type="button" className="button small qa-danger-btn" disabled={word.trim() !== '파기' || pending} onClick={() => start(async () => { const r = await onRun(word); toast(r.error ?? r.message ?? ''); if (r.ok) { setOpen(false); router.refresh(); } })}>{pending ? '파기 중…' : '영구 파기'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
