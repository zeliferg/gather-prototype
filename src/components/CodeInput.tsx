import { useRef } from 'react';

export function CodeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const digits = value.replace(/\D/g, '').slice(0, 6);
  return (
    <div className="code" onClick={() => ref.current?.focus()}>
      <input ref={ref} className="code__hidden" inputMode="numeric" autoComplete="one-time-code" aria-label="6-digit code"
        value={digits} onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))} />
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} className={`code__box t-heading ${i === digits.length ? 'code__box--active' : ''}`}>{digits[i] ?? ''}</span>
      ))}
    </div>
  );
}
