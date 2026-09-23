// A centred message the host can close (ORG 4 alternative A): a card that scales in over a scrim.
import { createPortal } from 'react-dom';
import { usePresence } from './usePresence';
import { Button } from './Button';
import { Close } from './icons';

type Props = { open: boolean; onClose: () => void; title: string; body: string; cta?: string; onCta?: () => void };

export function Popup({ open, onClose, title, body, cta, onCta }: Props) {
  const { mounted, visible } = usePresence(open);
  if (!mounted) return null;
  return createPortal(
    <div className={`overlay overlay--center ${visible ? 'overlay--in' : ''}`} role="dialog" aria-modal="true" aria-label={title} inert={!visible} aria-hidden={!visible}>
      <button className="overlay__scrim" aria-label="Close" onClick={onClose} />
      <div className="popup">
        <button className="popup__close" aria-label="Close" onClick={onClose}><Close size={18} /></button>
        <div className="stack" style={{ gap: 6 }}>
          <p className="t-heading">{title}</p>
          <p className="t-secondary c-secondary">{body}</p>
        </div>
        {cta && <Button onClick={() => { onClose(); onCta?.(); }}>{cta}</Button>}
        <Button variant="ghost" onClick={onClose}>Got it</Button>
      </div>
    </div>,
    document.body,
  );
}
