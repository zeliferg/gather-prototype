import { createPortal } from 'react-dom';
import { usePresence } from './usePresence';

type Option = { label: string; onSelect?: () => void };
type Props = { open: boolean; title: string; options: Option[]; onClose: () => void };

export function ActionSheet({ open, title, options, onClose }: Props) {
  const { mounted, visible } = usePresence(open);
  if (!mounted) return null;
  return createPortal(
    <div className={`overlay ${visible ? 'overlay--in' : ''}`} role="dialog" aria-modal="true" aria-label={title} aria-hidden={!visible}>
      <button className="overlay__scrim" aria-label="Close" onClick={onClose} />
      <div className="action-sheet">
        <div className="action-sheet__group">
          <div className="action-sheet__title t-caption c-secondary">{title}</div>
          {options.map((o) => (
            <button key={o.label} className="action-sheet__option t-body c-accent" onClick={() => { o.onSelect?.(); onClose(); }}>{o.label}</button>
          ))}
        </div>
        <div className="action-sheet__group">
          <button className="action-sheet__option t-body-med" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
