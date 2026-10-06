// Figma v6 row 2 (6 Oct 2026): P 7b — You voted! The success beat after the guest's first vote. Nothing is
// booked yet: the host books BOOKING_DELAY_MS after this, never before the guest has voted.
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Check, Close } from '../../components/icons';
import { party, restaurants, shortlist } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function PVoted() {
  const navigate = useNavigate();
  const [state] = usePrototypeState();
  const r = restaurants.find((x) => x.id === state.vote) ?? shortlist[0];
  return (
    <Screen className="landing" right={<button className="icon-btn icon-btn--right" aria-label="Close" onClick={() => navigate('/p/waiting')}><Close /></button>} footer={<>
      <Button onClick={() => navigate('/p/waiting')}>Back to the party</Button>
      <Button variant="ghost" onClick={() => navigate('/p/places')}>Changed your mind?</Button>
    </>}>
      <div className="voted">
        <span className="voted__badge"><Check size={32} /></span>
        <h1 className="t-title">You voted for {r.name}</h1>
        <p className="t-secondary c-secondary">{party.hostFirst} makes the call once everyone has voted, and has the last say. We'll text you when it's booked.</p>
      </div>
    </Screen>
  );
}
