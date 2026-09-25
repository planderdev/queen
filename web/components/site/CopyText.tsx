'use client';
import { Copy } from 'lucide-react';
import { useToast } from './Toast';

// 계좌번호처럼 그대로 옮겨 적어야 하는 값을 한 번에 복사. 클립보드가 막힌 환경에서는 안내만 한다.
export function CopyText({ value, label = '복사' }: { value: string; label?: string }) {
  const toast = useToast();
  return (
    <button type="button" className="button small secondary copy-text" onClick={async () => {
      try { await navigator.clipboard.writeText(value); toast('복사했습니다.'); } catch { toast('복사하지 못했습니다. 길게 눌러 직접 복사해주세요.'); }
    }}><Copy aria-hidden="true" />{label}</button>
  );
}
