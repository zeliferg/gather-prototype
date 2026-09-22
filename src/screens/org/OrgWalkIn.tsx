// Figma: ORG 8b — Walk-in notice
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { ProgressButton } from '../../components/ProgressButton';
import { restaurants } from '../../fixtures';
import { usePrototypeState } from '../../state';
import { useParty } from '../../party';

export function OrgWalkIn() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const { targetTime, dateLong, size } = useParty();
  const r = restaurants.find((x) => x.id === state.selectedRestaurant)!;
  // A walk-in spot keeps the party's own time; nothing to pick here.
  useEffect(() => {
    if (state.selectedTime !== targetTime) update({ selectedTime: targetTime });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Screen back title={r.name} subtitle="Walk-in only"
      footer={<ProgressButton idle="Notify everyone" busy="Texting everyone…" done="Everyone's told" busyMs={1300}
        onBusyEnd={() => update({ booked: true })} onDone={() => navigate('/org/confirmed')} />}>
      <div className="card">
        <div className="rcard__photo rcard__photo--tall"><img src={r.photo} alt="" /></div>
        <p className="t-body-med">No reservations here</p>
        <p className="t-body">{dateLong} at {targetTime}</p>
        <p className="t-secondary c-secondary">We'll tell the {size} of you to head over then. Arrive together and you'll usually be seated within 15 minutes.</p>
      </div>
    </Screen>
  );
}
