'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

const ToastContext = createContext<(text: string) => void>(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [text, setText] = useState('');
  const [show, setShow] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toast = useCallback((t: string) => { setText(t); setShow(true); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setShow(false), 4000); }, []);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div id="toast" role="status" aria-live="polite" className={show ? 'show' : ''}>{text}</div>
    </ToastContext.Provider>
  );
}
