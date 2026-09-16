import type { Restaurant } from '../fixtures';
import { Chip } from './Chip';
import { Chevron } from './icons';

export function RestaurantCard({ restaurant: r, onOpen }: { restaurant: Restaurant; onOpen: () => void }) {
  return (
    <button className="rcard" onClick={onOpen} aria-label={r.name}>
      <div className="rcard__photo"><img src={r.photo} alt="" /><Chip className="rcard__tag">{r.reservations ? 'Takes reservations' : 'Walk-in only'}</Chip></div>
      <div className="stack" style={{ padding: '0 4px 4px' }}>
        <Chip variant="success" className="rcard__fair">Fair for everyone</Chip>
        <div className="row"><span className="t-heading">{r.name}</span><Chevron size={20} /></div>
        <span className="t-secondary c-secondary">{r.cuisine}</span>
        <div className="chip-row">{r.times.map((t) => <Chip key={t}>{t.replace(' PM', '')}</Chip>)}</div>
      </div>
    </button>
  );
}
