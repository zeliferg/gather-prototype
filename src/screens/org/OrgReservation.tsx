// Figma: ORG 8 — Reservation (confirms the time picked on ORG 6c; the chips let the host change it)
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { restaurants } from '../../fixtures';
import { usePrototypeState } from '../../state';
import { useParty } from '../../party';

export function OrgReservation() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const { dateLong, size } = useParty();
  const r = restaurants.find((x) => x.id === state.selectedRestaurant)!;
  const times = [...r.times, '8:30 PM'];
  useEffect(() => {
    if (!times.includes(state.selectedTime)) update({ selectedTime: times[0] });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Screen back title="Confirm your booking" subtitle="Here's what we'll book. Change the time if you need to."
      footer={<Button onClick={() => { update({ booked: true }); navigate('/org/confirmed'); }}>Book {state.selectedTime}</Button>}>
      <div className="card">
        <p className="t-heading">{r.name}</p>
        <p className="t-body">{dateLong} at {state.selectedTime}</p>
        <p className="t-secondary c-secondary">Table for {size}. {r.address}.</p>
      </div>
      <p className="t-caption c-secondary">Or pick another time</p>
      <div className="chip-row">{times.map((t) => <Chip key={t} variant={t === state.selectedTime ? 'selected' : 'neutral'} onClick={() => update({ selectedTime: t })}>{t}</Chip>)}</div>
      <div className="card">
        <p className="t-body-med">What happens next</p>
        <p className="t-secondary c-secondary">We book the table and text everyone the details. You can change or cancel later from the party page.</p>
      </div>
    </Screen>
  );
}
