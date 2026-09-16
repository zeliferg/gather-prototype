import type { CSSProperties } from 'react';

type Option<T extends string> = { value: T; label: string };

export function Segmented<T extends string>({ options, value, onChange }: { options: Option<T>[]; value: T; onChange: (v: T) => void }) {
  const idx = options.findIndex((o) => o.value === value);
  return (
    <div className="segmented" role="tablist" style={{ '--seg-count': options.length, '--seg-index': idx } as CSSProperties}>
      <span className="segmented__thumb" aria-hidden />
      {options.map((o) => (
        <button key={o.value} role="tab" aria-selected={o.value === value} className="segmented__tab t-label" onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}
