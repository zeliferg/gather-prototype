import type { ReactNode } from 'react';
import type { Guest } from '../fixtures';
import { Avatar } from './Avatar';

export function GuestRow({ guest, right }: { guest: Guest; right?: ReactNode }) {
  return (
    <div className="guest-row">
      <div className="hstack" style={{ gap: 12 }}><Avatar initial={guest.initial} /><span className="t-body">{guest.name}</span></div>
      <div className="hstack">{right}</div>
    </div>
  );
}
