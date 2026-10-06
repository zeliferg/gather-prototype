// Figma: ORG 2 — SMS: Management link, shown as an iOS-style notification banner instead of a full SMS screen
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { usePresence } from './usePresence';
import { useSwipeUpToDismiss } from './useSwipeUpToDismiss';
import { Close } from './icons';

type Props = { open: boolean; text: string; onClose: () => void; app?: string; /** 0 keeps it up until dismissed */ autoHideMs?: number; closeButton?: boolean; closeLabel?: string; /** tapping the body does this (and closes) instead of just closing */ onTap?: () => void };

const AUTO_HIDE_MS = 5000; // every banner leaves on its own after this (6 Oct 2026), or as soon as the tester moves to another screen

export function Notification({ open, text, onClose, app = 'Messages', autoHideMs = AUTO_HIDE_MS, closeButton = false, closeLabel = 'Dismiss notification', onTap }: Props) {
  const { mounted, visible } = usePresence(open);
  // Moving on to another screen takes the banner with it
  const { pathname } = useLocation();
  const seenPath = useRef(pathname);
  useEffect(() => {
    if (seenPath.current !== pathname) { seenPath.current = pathname; if (open) onClose(); }
  }, [pathname, open, onClose]);
  const card = useRef<HTMLDivElement>(null);
  useSwipeUpToDismiss(card, onClose, visible);
  useEffect(() => {
    if (!open || autoHideMs === 0) return;
    const t = setTimeout(onClose, autoHideMs);
    return () => clearTimeout(t);
  }, [open, autoHideMs, onClose]);
  if (!mounted) return null;
  return createPortal(
    <div className={`banner-wrap ${visible ? 'banner-wrap--in' : ''}`} inert={!visible} aria-hidden={!visible}>
      <div ref={card} className="notif" role="status" onClick={onTap ? () => { onClose(); onTap(); } : closeButton ? undefined : onClose}>
        <span className="notif__icon t-label" aria-hidden>G</span>
        <span className="notif__body">
          <span className="row"><span className="t-label">{app}</span><span className="t-caption c-secondary">now</span></span>
          <span className="t-secondary notif__text">{text}</span>
        </span>
        {closeButton && <button className="notif__close" aria-label={closeLabel} onClick={(e) => { e.stopPropagation(); onClose(); }}><Close size={18} /></button>}
      </div>
    </div>,
    document.body,
  );
}
