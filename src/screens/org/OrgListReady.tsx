// Figma: ORG 5 — List's ready
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { GatheringCircle } from '../../components/GatheringCircle';
import { Close } from '../../components/icons';
import { useParty } from '../../party';

export function OrgListReady() {
  const navigate = useNavigate();
  const { coming } = useParty();
  return (
    <Screen className="landing" right={<button className="icon-btn icon-btn--right" aria-label="Close" onClick={() => navigate('/org/hub')}><Close /></button>}
      footer={<Button onClick={() => navigate('/org/options')}>Browse places</Button>}>
      <GatheringCircle seats={coming} centerCheck />
      <h1 className="t-display" style={{ textAlign: 'center' }}>Everyone's in</h1>
      <p className="t-secondary c-secondary" style={{ textAlign: 'center' }}>All {coming.length} responded. We found 3 places close to everyone.</p>
    </Screen>
  );
}
