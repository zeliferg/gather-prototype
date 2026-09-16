import { usePresence } from './usePresence';

type Props = { open: boolean; body: string; onAllow: () => void; onDeny: () => void };

export function PermissionDialog({ open, body, onAllow, onDeny }: Props) {
  const { mounted, visible } = usePresence(open);
  if (!mounted) return null;
  return (
    <div className={`overlay overlay--center ${visible ? 'overlay--in' : ''}`} role="alertdialog" aria-modal="true" aria-label="Location permission">
      <div className="overlay__scrim" />
      <div className="permission">
        <div className="permission__text">
          <p className="t-body-med">“gather.app” would like to use your current location</p>
          <p className="t-caption c-secondary">{body}</p>
        </div>
        <div className="permission__buttons">
          <button className="permission__btn t-body" onClick={onDeny}>Don't Allow</button>
          <button className="permission__btn t-body-med c-accent" onClick={onAllow}>Allow</button>
        </div>
      </div>
    </div>
  );
}
