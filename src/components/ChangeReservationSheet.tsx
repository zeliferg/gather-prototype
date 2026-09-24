// Figma: ORG 11 — Edit reservation, as a drawer on ORG 10 (since 24 Sep 2026): pick another place or time.
// Party size is not here any more: the table follows the guest list (PartySizeSheet).
import { useEffect, useState } from 'react';
import { Sheet } from './Sheet';
import { Button } from './Button';
import { Chip } from './Chip';
import { BIG_TABLE_FROM, restaurants, slotsFor, type RestaurantId } from '../fixtures';
import { usePrototypeState } from '../state';
import { useParty } from '../party';

type Props = { open: boolean; onClose: () => void; /** after the change is saved and everyone is texted */ onSaved: () => void };

export function ChangeReservationSheet({ open, onClose, onSaved }: Props) {
  const [state, update] = usePrototypeState();
  const { size } = useParty();
  const [placeId, setPlaceId] = useState<RestaurantId>(state.selectedRestaurant);
  const [picked, setTime] = useState(state.selectedTime);
  // Every open starts from what is booked.
  useEffect(() => { if (open) { setPlaceId(state.selectedRestaurant); setTime(state.selectedTime); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const place = restaurants.find((x) => x.id === placeId)!;
  // Bigger tables get fewer slots: a time the party can't have drops out and the host picks again before saving.
  const times = slotsFor(place, size);
  const time = times.includes(picked) ? picked : null;
  const fewer = size >= BIG_TABLE_FROM && times.length < slotsFor(place, BIG_TABLE_FROM - 1).length;
  const changed = placeId !== state.selectedRestaurant || time !== state.selectedTime;
  const save = () => {
    if (!time) return;
    update({ selectedRestaurant: placeId, selectedTime: time });
    onSaved();
  };
  const note = !time ? `${picked} isn't available for ${size} at ${place.name}. Pick another time or place.` : 'Everyone gets a text and an updated calendar invite.';

  return (
    <Sheet open={open} onClose={onClose} title="Change time or place" subtitle={`Table for ${size}.`}>
      <div className="stack" style={{ gap: 6 }}>
        <p className="t-caption c-secondary">Place</p>
        <div className="card card--list" role="radiogroup" aria-label="Place">
          {restaurants.map((r) => (
            <button key={r.id} className="row menu-row t-body" role="radio" aria-checked={r.id === placeId} onClick={() => setPlaceId(r.id)}>
              <span className="stack" style={{ gap: 2, alignItems: 'flex-start' }}><span className="t-body">{r.name}</span><span className="t-secondary c-secondary">{r.cuisine}</span></span>
              <span className={`radio ${r.id === placeId ? 'radio--on' : ''}`} aria-hidden />
            </button>
          ))}
        </div>
      </div>
      <div className="stack" style={{ gap: 6 }}>
        <p className="t-caption c-secondary">Time{fewer ? ` · tables for ${BIG_TABLE_FROM} or more have fewer slots at ${place.name}` : ''}</p>
        <div key={`${placeId}-${times.join()}`} className="chip-row chip-row--in" aria-live="polite">
          {times.map((t) => <Chip key={t} className="chip--time" variant={t === time ? 'selected' : 'neutral'} onClick={() => setTime(t)}>{t}</Chip>)}
        </div>
      </div>
      <p className={`t-caption ${time ? 'c-secondary' : ''}`} style={time ? undefined : { color: 'var(--error)' }}>{note}</p>
      <Button onClick={save} disabled={!changed || !time}>Save and notify everyone</Button>
    </Sheet>
  );
}
