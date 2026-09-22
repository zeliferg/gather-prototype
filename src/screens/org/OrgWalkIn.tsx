// Figma: ORG 8b — Walk-in notice
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Chip } from '../../components/Chip';
import { ProgressButton } from '../../components/ProgressButton';
import { restaurants } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function OrgWalkIn() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const r = restaurants.find((x) => x.id === state.selectedRestaurant)!;
  useEffect(() => {
    if (!r.times.includes(state.selectedTime)) update({ selectedTime: r.times[0] });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Screen back title={r.name} subtitle="Walk-in only"
      footer={<ProgressButton idle={`Set ${state.selectedTime} and notify everyone`} busy="Texting everyone…" done="Everyone's told" busyMs={1300}
        onBusyEnd={() => update({ booked: true })} onDone={() => navigate('/org/confirmed')} />}>
      <div className="card">
        <div className="rcard__photo rcard__photo--tall"><img src={r.photo} alt="" /></div>
        <p className="t-body-med">No reservations here</p>
        <p className="t-secondary c-secondary">We'll tell the group to head over around {state.selectedTime}. Arrive together and you'll usually be seated within 15 minutes.</p>
      </div>
      <p className="t-caption c-secondary">Meet-up time</p>
      <div className="chip-row">{r.times.map((t) => <Chip key={t} className="chip--time" variant={t === state.selectedTime ? 'selected' : 'neutral'} onClick={() => update({ selectedTime: t })}>{t}</Chip>)}</div>
    </Screen>
  );
}
