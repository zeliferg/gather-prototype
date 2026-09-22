// Figma: ORG 11 — Edit reservation
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { BIG_TABLE_FROM, restaurants, slotsFor, type RestaurantId } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function OrgEditReservation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, update] = usePrototypeState();
  const [placeId, setPlaceId] = useState<RestaurantId>(state.selectedRestaurant);
  const [picked, setTime] = useState(state.selectedTime);
  const [size, setSize] = useState(state.partySize);
  const sizeRef = useRef<HTMLDivElement>(null);
  const place = restaurants.find((x) => x.id === placeId)!;
  // Bigger tables get fewer slots, so the row changes with the party size; a time the new size can't
  // have drops out and the host picks again before saving.
  const times = slotsFor(place, size);
  const time = times.includes(picked) ? picked : null;
  const bigTable = size >= BIG_TABLE_FROM;
  const fewer = bigTable && times.length < slotsFor(place, BIG_TABLE_FROM - 1).length;

  useEffect(() => {
    if (location.state?.focus === 'size') sizeRef.current?.scrollIntoView({ block: 'center' });
  }, [location.state]);

  const changed = placeId !== state.selectedRestaurant || time !== state.selectedTime || size !== state.partySize;
  const save = () => {
    if (!time) return;
    update({ selectedRestaurant: placeId, selectedTime: time, partySize: size });
    navigate('/org/party', { state: { banner: 'reservationChanged' } });
  };

  return (
    <Screen back title="Change the reservation"
      footer={<Button onClick={save} disabled={!changed || !time}>Save and notify everyone</Button>}>
      <p className="t-caption c-secondary">Place</p>
      <div className="card" style={{ gap: 0, padding: '0 16px' }} role="radiogroup" aria-label="Place">
        {restaurants.map((r) => (
          <button key={r.id} className="row menu-row t-body" role="radio" aria-checked={r.id === placeId} onClick={() => setPlaceId(r.id)}>
            <span className="stack" style={{ gap: 2, alignItems: 'flex-start' }}><span className="t-body">{r.name}</span><span className="t-secondary c-secondary">{r.cuisine}</span></span>
            <span className={`radio ${r.id === placeId ? 'radio--on' : ''}`} aria-hidden />
          </button>
        ))}
      </div>
      <p className="t-caption c-secondary">Party size</p>
      <div className="stepper" ref={sizeRef}>
        <button className="stepper__btn" aria-label="Decrease party size" onClick={() => setSize((n) => Math.max(1, n - 1))} disabled={size <= 1}>−</button>
        <span className="stepper__value" aria-live="polite">{size}</span>
        <button className="stepper__btn" aria-label="Increase party size" onClick={() => setSize((n) => Math.min(12, n + 1))} disabled={size >= 12}>+</button>
      </div>
      <p className="t-caption c-secondary">Time{fewer ? ` · tables for ${BIG_TABLE_FROM} or more have fewer slots at ${place.name}` : ''}</p>
      <div key={`${placeId}-${times.join()}`} className="chip-row chip-row--in" aria-live="polite">
        {times.map((t) => <Chip key={t} className="chip--time" variant={t === time ? 'selected' : 'neutral'} onClick={() => setTime(t)}>{t}</Chip>)}
      </div>
      <p className="t-caption c-secondary">{!time ? `${picked} isn't available for ${size}. Pick another time.` : size < state.partySize ? 'Someone dropped out? The table gets smaller.' : size > state.partySize ? 'Bringing a plus-one? We ask for a bigger table.' : 'Everyone gets a text and an updated calendar invite.'}</p>
    </Screen>
  );
}
