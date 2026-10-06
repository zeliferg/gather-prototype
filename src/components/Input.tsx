import { useId } from 'react';
import { snapMinutes } from './time';

type Props = {
  label: string; value: string; onChange?: (v: string) => void; placeholder?: string;
  inputMode?: 'text' | 'tel' | 'numeric'; type?: 'text' | 'tel' | 'datetime-local'; autoFocus?: boolean;
  /** datetime-local only: minutes snap to this grid (the picker steps by it, typed values round to it) */
  minuteStep?: number;
  /** One-line reason the field isn't satisfied yet; renders the red border and the message under it. */
  error?: string | null;
  onBlur?: () => void;
};

export function Input({ label, value, onChange, placeholder, inputMode, type = 'text', autoFocus, minuteStep = 15, error, onBlur }: Props) {
  const id = useId();
  const isTime = type === 'datetime-local';
  const change = (v: string) => onChange?.(isTime ? snapMinutes(v, minuteStep) : v);
  return (
    <div className="input">
      <label htmlFor={id} className="t-caption c-secondary">{label}</label>
      <input id={id} className={`input__field t-body ${type === 'datetime-local' && !value ? 'input__field--empty' : ''} ${error ? 'input__field--error' : ''}`} type={type} value={value} placeholder={placeholder} inputMode={inputMode} autoFocus={autoFocus}
        step={isTime ? minuteStep * 60 : undefined} readOnly={!onChange} onChange={(e) => change(e.target.value)} onBlur={onBlur}
        aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} />
      {error && <p id={`${id}-error`} className="input__error t-caption" role="alert">{error}</p>}
    </div>
  );
}
