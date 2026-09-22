import type { CSSProperties } from 'react';
import type { Guest } from '../fixtures';

type Props = { initial: string; /** memoji-style picture; falls back to the initial */ photo?: string; size?: number; /** greyed: can't make it */ muted?: boolean };

export function Avatar({ initial, photo, size = 40, muted }: Props) {
  return (
    <span className={`avatar t-label ${muted ? 'avatar--muted' : ''}`} style={{ width: size, height: size }} aria-hidden>
      {photo ? <img src={photo} alt="" /> : initial}
    </span>
  );
}

type StackProps = { guests: Pick<Guest, 'id' | 'initial' | 'avatar'>[]; /** faces shown before the "+N" badge */ max?: number; size?: number; style?: CSSProperties };

export function AvatarStack({ guests, max = 5, size = 40, style }: StackProps) {
  const shown = guests.length > max ? guests.slice(0, max) : guests;
  const extra = guests.length - shown.length;
  return (
    <div className="avatar-stack" style={style}>
      {shown.map((g) => <Avatar key={g.id} initial={g.initial} photo={g.avatar} size={size} />)}
      {extra > 0 && <span className="avatar avatar--more t-label" style={{ width: size, height: size }}>+{extra}</span>}
    </div>
  );
}
