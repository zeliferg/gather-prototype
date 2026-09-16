import { useId } from 'react';

type Props = { label: string; value: string; onChange?: (v: string) => void; placeholder?: string; inputMode?: 'text' | 'tel' | 'numeric' };

export function Input({ label, value, onChange, placeholder, inputMode }: Props) {
  const id = useId();
  return (
    <div className="input">
      <label htmlFor={id} className="t-caption c-secondary">{label}</label>
      <input id={id} className="input__field t-body" value={value} placeholder={placeholder} inputMode={inputMode}
        readOnly={!onChange} onChange={(e) => onChange?.(e.target.value)} />
    </div>
  );
}
