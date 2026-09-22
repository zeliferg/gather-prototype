import { useId } from 'react';
import { snapMinutes } from './time';

type Props = {
  label: string; value: string; onChange?: (v: string) => void; placeholder?: string;
  inputMode?: 'text' | 'tel' | 'numeric'; type?: 'text' | 'tel' | 'datetime-local'; autoFocus?: boolean;
  /** datetime-local only: minutes snap to this grid (the picker steps by it, typed values round to it) */
  minuteStep?: number;
};

export function Input({ label, value, onChange, placeholder, inputMode, type = 'text', autoFocus, minuteStep = 15 }: Props) {
  const id = useId();
  const isTime = type === 'datetime-local';
  const change = (v: string) => onChange?.(isTime ? snapMinutes(v, minuteStep) : v);
  return (
    <div className="input">
      <label htmlFor={id} className="t-caption c-secondary">{label}</label>
      <input id={id} className={`input__field t-body ${type === 'datetime-local' && !value ? 'input__field--empty' : ''}`} type={type} value={value} placeholder={placeholder} inputMode={inputMode} autoFocus={autoFocus}
        step={isTime ? minuteStep * 60 : undefined} readOnly={!onChange} onChange={(e) => change(e.target.value)} />
    </div>
  );
}
