import { Link } from 'react-router-dom';
import { Screen } from '../components/Screen';
import { FLOW } from '../flow';

export function NotFound() {
  const home = FLOW === 'participant' ? '/p' : '/org';
  return (
    <Screen title="Not part of this prototype" subtitle="This screen isn't built into the flow you're testing.">
      <Link className="link" to={home}>Back to the start</Link>
    </Screen>
  );
}
