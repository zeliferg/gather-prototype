// Figma: ORG 0 — Landing
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { GatheringCircle } from '../../components/GatheringCircle';

export function OrgLanding() {
  const navigate = useNavigate();
  return (
    <Screen className="landing" brand="Gather" footer={<>
      <Button onClick={() => navigate('/org/create')}>Start a party</Button>
      <Button variant="secondary" onClick={() => navigate('/org/join-code')}>Join with a code</Button>
      <p className="t-caption c-secondary" style={{ textAlign: 'center' }}>Got a text invite? Tap the link. No account needed.</p>
    </>}>
      <GatheringCircle initials={['J', 'P', 'M', 'A', 'S', 'L']} live />
      <h1 className="t-display" style={{ textAlign: 'center' }}>Bring everyone <em>together</em></h1>
      <p className="t-secondary c-secondary" style={{ textAlign: 'center' }}>Tell us where everyone's coming from. We'll find the spot that's fair for all of you.</p>
    </Screen>
  );
}
