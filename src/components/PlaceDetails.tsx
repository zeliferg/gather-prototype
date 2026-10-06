// The lines both sides read about a place before acting on it (ORG 6c for the host, P 7c for the guest):
// the ranked tag, address · neighbourhood, hours, how the vote stands, then the rating and a way out to
// the place's own site. Booking words ("Walk-in only") are the host's business and never reach the guest.
import type { Restaurant } from '../fixtures';
import { Chip } from './Chip';
import { ExternalLink, Star } from './icons';

type Props = {
  restaurant: Restaurant;
  tag: { label: string; best: boolean };
  /** one more secondary line: how the vote stands, or the booking ("Friday… · Table for 5 · Booked under…") */
  line?: string | null;
  /** host side: a walk-in place says so next to its hours */
  bookingWords?: boolean;
};

export function PlaceDetails({ restaurant: r, tag, line, bookingWords }: Props) {
  return (
    <>
      <div className="stack" style={{ gap: 6 }}>
        <Chip variant={tag.best ? 'success' : 'neutral'} className="rcard__fair chip--sm">{tag.label}</Chip>
        <p className="t-body">{r.address} · {r.neighborhood}</p>
        <p className="t-secondary c-secondary">{r.hours}{bookingWords && !r.reservations ? ' · Walk-in only' : ''}</p>
        {line && <p className="t-secondary c-secondary">{line}</p>}
      </div>
      {/* What most people check first: the rating, and a way out to the place's own site */}
      <div className="row rating">
        <span className="hstack" style={{ gap: 6 }}><span className="rating__star"><Star size={16} /></span><span className="t-body-med">{r.rating.toFixed(1)}</span><span className="t-secondary c-secondary">{r.reviews.toLocaleString('en-US')} reviews</span></span>
        <a className="link t-label hstack" style={{ gap: 4 }} href={r.website} target="_blank" rel="noreferrer">Website <ExternalLink size={16} /></a>
      </div>
    </>
  );
}
