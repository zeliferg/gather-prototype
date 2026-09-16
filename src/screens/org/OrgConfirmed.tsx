// Figma: ORG 9 — Confirmed
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Check } from '../../components/icons';
import { party, restaurants } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function OrgConfirmed() {
  const navigate = useNavigate();
  const [state] = usePrototypeState();
  const r = restaurants.find((x) => x.id === state.selectedRestaurant)!;
  return (
    <Screen className="landing" footer={<>
      <Button>Add to calendar</Button>
      <Button variant="secondary" onClick={() => navigate('/org/party')}>Back to the party</Button>
    </>}>
      <span className="success-badge"><Check /></span>
      <h1 className="t-display" style={{ textAlign: 'center' }}>You're all set</h1>
      <p className="t-secondary c-secondary" style={{ textAlign: 'center' }}>Everyone's been texted the details.</p>
      <div className="card">
        <p className="t-body-med">{r.name}</p>
        <p className="t-body">{party.dateLong} at {state.selectedTime}</p>
        <p className="t-secondary c-secondary">Table for {party.size}. {r.address}.</p>
      </div>
    </Screen>
  );
}
