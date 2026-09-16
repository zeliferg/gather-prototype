// Figma: ORG 8b — Walk-in notice
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { restaurants } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function OrgWalkIn() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const r = restaurants.find((x) => x.id === state.selectedRestaurant)!;
  return (
    <Screen back title={r.name} subtitle="Walk-in only"
      footer={<Button onClick={() => { update({ booked: true }); navigate('/org/confirmed'); }}>Set {state.selectedTime} and notify everyone</Button>}>
      <div className="card" style={{ background: 'var(--bg-accent-tint)', borderColor: 'transparent' }}>
        <p className="t-body-med">No reservations here</p>
        <p className="t-secondary c-secondary">We'll tell the group to head over around {state.selectedTime}. Arrive together and you'll usually be seated within 15 minutes.</p>
      </div>
      <p className="t-caption c-secondary">Meet-up time</p>
      <div className="chip-row">{r.times.map((t) => <Chip key={t} variant={t === state.selectedTime ? 'selected' : 'neutral'} onClick={() => update({ selectedTime: t })}>{t}</Chip>)}</div>
    </Screen>
  );
}
