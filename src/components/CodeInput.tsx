import { useEffect, useRef, useState } from 'react';

type Props = { value: string; onChange: (v: string) => void; autofill?: string };

// Boxes start empty. Tapping the field plays the one-time-code autofill: digits land one by
// one (each box pops via .code__box:not(:empty)), the way iOS fills a code from Messages.
export function CodeInput({ value, onChange, autofill = '428913' }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [filling, setFilling] = useState(false);
  const digits = value.replace(/\D/g, '').slice(0, 6);

  useEffect(() => {
    if (!filling) return;
    if (digits.length >= autofill.length) { setFilling(false); return; }
    const step = getComputedStyle(document.documentElement).getPropertyValue('--dur-fill').trim();
    const ms = step.endsWith('ms') ? parseFloat(step) : parseFloat(step) * 1000;
    const t = setTimeout(() => onChange(autofill.slice(0, digits.length + 1)), Number.isFinite(ms) ? ms : 90);
    return () => clearTimeout(t);
  }, [filling, digits, autofill, onChange]);

  const tap = () => { ref.current?.focus(); if (digits.length === 0) setFilling(true); };

  return (
    <div className="code" onClick={tap}>
      <input ref={ref} className="code__hidden" inputMode="numeric" autoComplete="one-time-code" aria-label="6-digit code"
        value={digits} onFocus={() => { if (digits.length === 0) setFilling(true); }} onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))} />
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} className={`code__box t-heading ${i === digits.length ? 'code__box--active' : ''}`}>{digits[i] ?? ''}</span>
      ))}
    </div>
  );
}
