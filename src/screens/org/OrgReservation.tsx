// Figma: ORG 8 — Reservation
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { party, restaurants } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function OrgReservation() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const r = restaurants.find((x) => x.id === state.selectedRestaurant)!;
  return (
    <Screen back title={r.name} subtitle={`Table for ${party.size} on ${party.dateLong}`}
      footer={<Button onClick={() => { update({ booked: true }); navigate('/org/confirmed'); }}>Book {state.selectedTime}</Button>}>
      <p className="t-caption c-secondary">Pick a time</p>
      <div className="chip-row">{[...r.times, '8:30 PM'].map((t) => <Chip key={t} variant={t === state.selectedTime ? 'selected' : 'neutral'} onClick={() => update({ selectedTime: t })}>{t}</Chip>)}</div>
      <div className="card">
        <p className="t-body-med">What happens next</p>
        <p className="t-secondary c-secondary">We book the table and text everyone the details. You can change or cancel later from the party page.</p>
      </div>
    </Screen>
  );
}
