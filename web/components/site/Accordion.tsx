'use client';
import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function Accordion({ items }: { items: [string, string, string][] }) {
  const [open, setOpen] = useState<number | null>(null);
  const id = useId();
  return (
    <div className="accordion">
      {items.map(([title, sub, body], i) => (
        <section key={i}>
          <h3><button className="accordion-trigger" type="button" aria-expanded={open === i} aria-controls={`${id}-${i}`} onClick={() => setOpen(open === i ? null : i)}
            onKeyDown={(e) => { const all = (e.currentTarget.closest('.accordion') as HTMLElement).querySelectorAll<HTMLButtonElement>('.accordion-trigger'); let t: number | null = null; if (e.key === 'ArrowDown') t = (i + 1) % all.length; if (e.key === 'ArrowUp') t = (i - 1 + all.length) % all.length; if (e.key === 'Home') t = 0; if (e.key === 'End') t = all.length - 1; if (t !== null) { e.preventDefault(); all[t].focus(); } }}>
            <span>{title}<small>{sub}</small></span><ChevronDown aria-hidden="true" /></button></h3>
          <div id={`${id}-${i}`} className="accordion-panel" hidden={open !== i}>{body}</div>
        </section>
      ))}
    </div>
  );
}
