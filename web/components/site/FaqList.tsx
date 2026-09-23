'use client';
import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function FaqList({ items }: { items: [string, string][] }) {
  const [open, setOpen] = useState<number | null>(null);
  const id = useId();
  return (
    <div className="community-faq">
      {items.map(([q, a], i) => (
        <section key={i}>
          <h3><button className="accordion-trigger" type="button" aria-expanded={open === i} aria-controls={`${id}-${i}`} onClick={() => setOpen(open === i ? null : i)}><span className="community-question-mark" aria-hidden="true">Q</span><span className="community-question">{q}</span><ChevronDown aria-hidden="true" /></button></h3>
          <div className="community-answer" id={`${id}-${i}`} hidden={open !== i}><span aria-hidden="true">A</span><p>{a}</p></div>
        </section>
      ))}
    </div>
  );
}
