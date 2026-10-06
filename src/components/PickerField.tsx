import { useId } from 'react';
import { Chevron } from './icons';

type Props = { label: string; /** what's chosen, or the placeholder when nothing is */ value: string; /** false renders the value in the placeholder colour */ set: boolean; onClick: () => void; /** one-line reason nothing is chosen yet */ error?: string | null };

/** A tap-to-pick field with the same anatomy as Input: caption label above, a bordered field below. */
export function PickerField({ label, value, set, onClick, error }: Props) {
  const id = useId();
  return (
    <div className="input">
      <span className="t-caption c-secondary">{label}</span>
      <button className={`input__field picker ${error ? 'input__field--error' : ''}`} onClick={onClick} aria-label={`${label}, ${value}`}
        aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined}>
        <span className={`t-body ellipsis ${set ? '' : 'c-secondary'}`}>{value}</span>
        <span className="c-secondary" style={{ display: 'grid' }}><Chevron size={20} /></span>
      </button>
      {error && <p id={`${id}-error`} className="input__error t-caption" role="alert">{error}</p>}
    </div>
  );
}
