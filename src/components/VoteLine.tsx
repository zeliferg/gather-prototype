// v2: a place's share of the vote, as one small inline line: the faces of who voted (host side) or just
// the count (guest side). It sits at the right of a card's name row; the label fading in is the motion
// when a vote lands.
import { AvatarStack } from './Avatar';
import type { Guest } from '../fixtures';

type Props = { voters?: Guest[]; count?: number; total: number; /** the row is the tester's own vote */ mine?: boolean };

export function VoteLine({ voters, count, total, mine }: Props) {
  const n = count ?? voters?.length ?? 0;
  const label = `${n} of ${total} votes`;
  return (
    <span className="vote-line" aria-label={label}>
      {voters && voters.length > 0 && <AvatarStack guests={voters} size={24} max={3} />}
      <span key={n} className={`t-caption vote-line__label ${n ? '' : 'c-secondary'}`}>{label}{mine ? ' · yours' : ''}</span>
    </span>
  );
}
