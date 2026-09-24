// Figma: ORG 4h — Waiting nudge (banner). Mounted once for the host track: NUDGE_DELAY_MS after landing on
// the hub (the Messages banner has left by then), a Gather banner tells the host what they're waiting for.
// It stays until closed (X or a swipe up) and never returns; tapping it opens the Guests sheet on the hub.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../../components/Notification';
import { NUDGE_DELAY_MS } from '../../fixtures';
import { usePrototypeState } from '../../state';
import { useParty } from '../../party';

export function NudgeWatcher() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const { coming } = useParty();
  const [due, setDue] = useState(false);
  const waiting = coming.filter((g) => g.status === 'waiting').length;
  const armed = state.nudgeAt !== null && !state.nudgeDismissed && !state.everyoneIn && waiting > 0;

  useEffect(() => {
    if (!armed) { setDue(false); return; }
    const wait = Math.max(0, state.nudgeAt! + NUDGE_DELAY_MS - Date.now());
    const t = setTimeout(() => setDue(true), wait);
    return () => clearTimeout(t);
  }, [armed, state.nudgeAt]);

  const dismiss = () => update({ nudgeDismissed: true });
  return (
    <Notification open={armed && due} onClose={dismiss} onTap={() => navigate('/org/hub', { state: { everyone: true } })} app="Gather" autoHideMs={0} closeButton closeLabel="Dismiss reminder"
      text={`Waiting on ${waiting} ${waiting === 1 ? 'person' : 'people'} to add where they're coming from. Once they're in, you'll see places that work for everyone.`} />
  );
}
