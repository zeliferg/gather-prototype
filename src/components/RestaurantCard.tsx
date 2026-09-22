import { partner, spotTag, type Restaurant } from '../fixtures';
import { Chip } from './Chip';
import { Chevron } from './icons';

type Props = {
  restaurant: Restaurant;
  /** position in the ranked list; 0 is the best spot */
  index: number;
  /** A time slot the host tapped on this card; tapping one opens the detail sheet with it selected. */
  picked: string | null;
  onPick: (time: string) => void;
  onOpen: () => void;
};

export function RestaurantCard({ restaurant: r, index, picked, onPick, onOpen }: Props) {
  const tag = spotTag(index);
  return (
    <div className="rcard">
      <button className="rcard__main" onClick={onOpen} aria-label={r.name}>
        <div className="rcard__photo"><img src={r.photo} alt="" /><Chip className="rcard__tag">{r.reservations ? `Reserve on ${partner}` : 'Walk-in only'}</Chip></div>
        <div className="stack" style={{ padding: '0 4px' }}>
          <Chip variant={tag.best ? 'success' : 'neutral'} className="rcard__fair chip--sm">{tag.label}</Chip>
          <div className="row"><span className="t-heading">{r.name}</span><Chevron size={20} /></div>
          <span className="t-secondary c-secondary">{r.cuisine}</span>
        </div>
      </button>
      {r.reservations && (
        <div className="chip-row" style={{ padding: '0 4px 4px' }} role="group" aria-label={`${r.name} times`}>
          {r.times.map((t) => <Chip key={t} className="chip--time" variant={t === picked ? 'selected' : 'neutral'} onClick={() => onPick(t)}>{t.replace(' PM', '')}</Chip>)}
        </div>
      )}
    </div>
  );
}
