import { Chevron } from './icons';

type Props = { label: string; /** what's chosen, or the placeholder when nothing is */ value: string; /** false renders the value in the placeholder colour */ set: boolean; onClick: () => void };

/** A tap-to-pick field with the same anatomy as Input: caption label above, a bordered field below. */
export function PickerField({ label, value, set, onClick }: Props) {
  return (
    <div className="input">
      <span className="t-caption c-secondary">{label}</span>
      <button className="input__field picker" onClick={onClick} aria-label={`${label}, ${value}`}>
        <span className={`t-body ellipsis ${set ? '' : 'c-secondary'}`}>{value}</span>
        <span className="c-secondary" style={{ display: 'grid' }}><Chevron size={20} /></span>
      </button>
    </div>
  );
}
