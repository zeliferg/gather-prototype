// Figma: ORG 9 — Confirmed
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { ActionSheet } from '../../components/ActionSheet';
import { Check } from '../../components/icons';
import { restaurants } from '../../fixtures';
import { usePrototypeState } from '../../state';
import { useParty } from '../../party';

export function OrgConfirmed() {
  const navigate = useNavigate();
  const [state] = usePrototypeState();
  const { name, dateLong, size } = useParty();
  const r = restaurants.find((x) => x.id === state.selectedRestaurant)!;
  const [calendar, setCalendar] = useState(false);
  return (
    <Screen className="landing" footer={<>
      <Button onClick={() => setCalendar(true)}>Add to calendar</Button>
      <Button variant="secondary" onClick={() => navigate('/org/party')}>Back to the party</Button>
    </>}>
      <span className="success-badge"><Check size={32} /></span>
      <h1 className="t-display" style={{ textAlign: 'center' }}>You're all set</h1>
      <p className="t-secondary c-secondary" style={{ textAlign: 'center' }}>Everyone's been texted the details.</p>
      <div className="card">
        <p className="t-body-med">{r.name}</p>
        <p className="t-body">{dateLong} at {state.selectedTime}</p>
        <p className="t-secondary c-secondary">Table for {size}. {r.address}.</p>
      </div>
      <ActionSheet open={calendar} onClose={() => setCalendar(false)} title={`Add ${name} to`}
        options={[{ label: 'Apple Calendar' }, { label: 'Google Calendar' }, { label: 'Outlook' }, { label: 'Download .ics file' }]} />
    </Screen>
  );
}
