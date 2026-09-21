// Figma: ORG 8 — Reservation (confirms the time picked on ORG 6c; the chips let the host change it)
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Chip } from '../../components/Chip';
import { ProgressButton } from '../../components/ProgressButton';
import { restaurants, slotsFor } from '../../fixtures';
import { usePrototypeState } from '../../state';
import { useParty } from '../../party';

export function OrgReservation() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const { dateLong, size } = useParty();
  const r = restaurants.find((x) => x.id === state.selectedRestaurant)!;
  const times = slotsFor(r, size);
  useEffect(() => {
    if (!times.includes(state.selectedTime)) update({ selectedTime: times[0] });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Screen back title="Confirm your booking" subtitle="Here's what we'll book. Change the time if you need to."
      footer={<ProgressButton idle={`Book ${state.selectedTime}`} busy="Booking your table…" done="Booked" busyMs={1300}
        onBusyEnd={() => update({ booked: true })} onDone={() => navigate('/org/confirmed')} />}>
      <div className="card">
        <div className="rcard__photo rcard__photo--tall"><img src={r.photo} alt="" /></div>
        <p className="t-heading">{r.name}</p>
        <p className="t-body">{dateLong} at {state.selectedTime}</p>
        <p className="t-secondary c-secondary">Table for {size}. {r.address}.</p>
      </div>
      <p className="t-caption c-secondary">Or pick another time</p>
      <div className="chip-row">{times.map((t) => <Chip key={t} className="chip--lg" variant={t === state.selectedTime ? 'selected' : 'neutral'} onClick={() => update({ selectedTime: t })}>{t}</Chip>)}</div>
      <div className="stack" style={{ gap: 4, paddingTop: 'var(--space-2)', borderTop: '1px solid var(--border-hairline)' }}>
        <p className="t-label c-secondary">What happens next</p>
        <p className="t-caption c-secondary">We book the table and text everyone the details. You can change or cancel later from the party page.</p>
      </div>
    </Screen>
  );
}
