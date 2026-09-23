'use client';
import { useState } from 'react';

const fmt = (n: number) => n.toLocaleString('ko-KR');

export function AmountInput({ name, defaultValue, presets }: { name: string; defaultValue: number; presets: number[] }) {
  const [value, setValue] = useState(fmt(defaultValue));
  return (
    <>
      <div className="amount-input">
        <label className="field"><span>기부 금액 (원)</span>
          <input id={name} name={name} inputMode="numeric" required value={value} onChange={(e) => { const n = Number(e.target.value.replace(/[^\d]/g, '')); setValue(n ? fmt(n) : ''); }} aria-describedby="amount-help" />
        </label>
      </div>
      <div className="amount-options">{presets.map((n) => <button type="button" className="button" key={n} onClick={() => setValue(fmt(n))}>{fmt(n)}원</button>)}</div>
    </>
  );
}
