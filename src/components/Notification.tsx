// Figma: ORG 2 — SMS: Management link, shown as an iOS-style notification banner instead of a full SMS screen
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePresence } from './usePresence';

type Props = { open: boolean; text: string; onClose: () => void; app?: string; autoHideMs?: number };

export function Notification({ open, text, onClose, app = 'Messages', autoHideMs = 6000 }: Props) {
  const { mounted, visible } = usePresence(open);
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, autoHideMs);
    return () => clearTimeout(t);
  }, [open, autoHideMs, onClose]);
  if (!mounted) return null;
  return createPortal(
    <div className={`banner-wrap ${visible ? 'banner-wrap--in' : ''}`} inert={!visible} aria-hidden={!visible}>
      <button className="notif" role="status" onClick={onClose} aria-label={`${app}: ${text}`}>
        <span className="notif__icon t-label" aria-hidden>G</span>
        <span className="notif__body">
          <span className="row"><span className="t-label">{app}</span><span className="t-caption c-secondary">now</span></span>
          <span className="t-secondary notif__text">{text}</span>
        </span>
      </button>
    </div>,
    document.body,
  );
}
