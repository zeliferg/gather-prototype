import { useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { usePresence } from './usePresence';
import { useSwipeToDismiss } from './useSwipeToDismiss';

type Props = { open: boolean; onClose: () => void; title?: string; subtitle?: string; children: ReactNode; /** fill the sheet's full height so a trailing `.sheet__actions` sits where screen footers put their buttons */ tall?: boolean };

export function Sheet({ open, onClose, title, subtitle, children, tall }: Props) {
  const { mounted, visible } = usePresence(open);
  const panel = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLButtonElement>(null);
  useSwipeToDismiss(panel, scrim, onClose, visible);
  if (!mounted) return null;
  return createPortal(
    <div className={`overlay ${visible ? 'overlay--in' : ''}`} role="dialog" aria-modal="true" aria-label={title} inert={!visible} aria-hidden={!visible}>
      <button ref={scrim} className="overlay__scrim" aria-label="Close" onClick={onClose} />
      <div ref={panel} className={`sheet ${tall ? 'sheet--tall' : ''}`}>
        <span className="sheet__handle" aria-hidden />
        {(title || subtitle) && (
          <div className="screen__title">
            {title && <h2 className="t-heading">{title}</h2>}
            {subtitle && <p className="t-secondary c-secondary">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
