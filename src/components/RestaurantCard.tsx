import { spotTag, type Guest, type Restaurant } from '../fixtures';
import { Chip } from './Chip';
import { VoteLine } from './VoteLine';

type Props = {
  restaurant: Restaurant;
  /** position in the ranked list; 0 is the best spot */
  index: number;
  /** A time slot the host tapped on this card; tapping one opens the detail sheet with it selected. */
  picked: string | null;
  onPick: (time: string) => void;
  onOpen: () => void;
  /** v2, vote mode: who voted for this place, out of how many voters; `leading` swaps the tag for "Most votes";
   *  `mine` marks the host's own favourite and `onVote` casts or moves it */
  vote?: { voters: Guest[]; total: number; leading: boolean; mine: boolean; onVote: () => void };
};

export function RestaurantCard({ restaurant: r, index, picked, onPick, onOpen, vote }: Props) {
  const tag = vote ? (vote.leading ? { label: 'Most votes', best: true } : { label: 'Great spot', best: false }) : spotTag(index);
  return (
    <div className="rcard">
      <button className="rcard__main" onClick={onOpen} aria-label={r.name}>
        <div className="rcard__photo"><img src={r.photo} alt="" /><Chip className="rcard__tag">{r.reservations ? `Reserve on ${r.partner}` : 'Walk-in only'}</Chip></div>
        <div className="stack" style={{ padding: '0 4px' }}>
          <Chip variant={tag.best ? 'success' : 'neutral'} className="rcard__fair chip--sm">{tag.label}</Chip>
          {/* The whole card opens the place, so no chevron; in vote mode the share of the vote sits where it was */}
          <div className="rcard__title"><span className="t-heading">{r.name}</span>{vote && <VoteLine voters={vote.voters} total={vote.total} />}</div>
          <span className="t-secondary c-secondary">{r.cuisine}</span>
        </div>
      </button>
      {/* The host votes like everyone else: one chip per card, outside the opening tap */}
      {vote && (
        <div style={{ padding: '0 4px' }}>
          <Chip variant={vote.mine ? 'selected' : 'neutral'} className={vote.mine ? 'chip--swap' : ''} onClick={vote.onVote}>{vote.mine ? '✓ My favourite' : 'Vote for this spot'}</Chip>
        </div>
      )}
      {r.reservations && (
        <div className="chip-row" style={{ padding: '0 4px 4px' }} role="group" aria-label={`${r.name} times`}>
          {r.times.map((t) => <Chip key={t} className="chip--time" variant={t === picked ? 'selected' : 'neutral'} onClick={() => onPick(t)}>{t}</Chip>)}
        </div>
      )}
    </div>
  );
}
