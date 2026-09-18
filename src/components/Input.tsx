import { useId } from 'react';

type Props = {
  label: string; value: string; onChange?: (v: string) => void; placeholder?: string;
  inputMode?: 'text' | 'tel' | 'numeric'; type?: 'text' | 'tel' | 'datetime-local'; autoFocus?: boolean;
};

export function Input({ label, value, onChange, placeholder, inputMode, type = 'text', autoFocus }: Props) {
  const id = useId();
  return (
    <div className="input">
      <label htmlFor={id} className="t-caption c-secondary">{label}</label>
      <input id={id} className={`input__field t-body ${type === 'datetime-local' && !value ? 'input__field--empty' : ''}`} type={type} value={value} placeholder={placeholder} inputMode={inputMode} autoFocus={autoFocus}
        readOnly={!onChange} onChange={(e) => onChange?.(e.target.value)} />
    </div>
  );
}
