import type { ReactNode } from 'react';
import type { Guest } from '../fixtures';
import { Avatar } from './Avatar';
import { More } from './icons';

type Props = { guest: Guest; right?: ReactNode; /** makes the row a button (opens the guest's actions) */ onClick?: () => void; muted?: boolean };

export function GuestRow({ guest, right, onClick, muted }: Props) {
  const inner = (
    <>
      <div className="hstack" style={{ gap: 12, minWidth: 0 }}>
        <Avatar initial={guest.initial} photo={guest.avatar} muted={muted} />
        <div className="stack" style={{ gap: 0, minWidth: 0 }}>
          <span className="t-body ellipsis">{guest.name}</span>
          {guest.note && <span className="t-caption c-secondary ellipsis">“{guest.note}”</span>}
        </div>
      </div>
      <div className="hstack">{right}{onClick && <span className="guest-row__more"><More size={20} /></span>}</div>
    </>
  );
  if (onClick) return <button className="guest-row guest-row--tap" onClick={onClick} aria-label={guest.name}>{inner}</button>;
  return <div className="guest-row">{inner}</div>;
}
