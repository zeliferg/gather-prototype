// Figma: ORG 2 — SMS: Management link, shown as an iOS-style notification banner instead of a full SMS screen
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePresence } from './usePresence';
import { Close } from './icons';

type Props = { open: boolean; text: string; onClose: () => void; app?: string; /** 0 keeps it up until dismissed */ autoHideMs?: number; closeButton?: boolean; /** tapping the body does this (and closes) instead of just closing */ onTap?: () => void };

export function Notification({ open, text, onClose, app = 'Messages', autoHideMs = 6000, closeButton = false, onTap }: Props) {
  const { mounted, visible } = usePresence(open);
  useEffect(() => {
    if (!open || autoHideMs === 0) return;
    const t = setTimeout(onClose, autoHideMs);
    return () => clearTimeout(t);
  }, [open, autoHideMs, onClose]);
  if (!mounted) return null;
  return createPortal(
    <div className={`banner-wrap ${visible ? 'banner-wrap--in' : ''}`} inert={!visible} aria-hidden={!visible}>
      <div className="notif" role="status" onClick={onTap ? () => { onClose(); onTap(); } : closeButton ? undefined : onClose}>
        <span className="notif__icon t-label" aria-hidden>G</span>
        <span className="notif__body">
          <span className="row"><span className="t-label">{app}</span><span className="t-caption c-secondary">now</span></span>
          <span className="t-secondary notif__text">{text}</span>
        </span>
        {closeButton && <button className="notif__close" aria-label="Dismiss notification" onClick={onClose}><Close size={18} /></button>}
      </div>
    </div>,
    document.body,
  );
}
