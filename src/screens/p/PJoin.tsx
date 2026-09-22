// Figma: P 3 — Join & Submit (+ P 3c Drop a pin): the map screen, reached from the join screen's My location row
import { useLocation, useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { LocationPicker } from '../../components/LocationPicker';
import { usePrototypeState } from '../../state';

export function PJoin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [, update] = usePrototypeState();
  const from: string = location.state?.from ?? '/p/join';
  return (
    <Screen back title="Where are you coming from?" subtitle="We use this to find a spot that works for everyone. Nobody sees your exact location."
      footer={<Button onClick={() => { update({ locationSet: true, flexible: false }); navigate(from, { state: from === '/p/waiting' ? { info: true } : undefined }); }}>Save</Button>}>
      <LocationPicker context="guest" askPermission={false} />
    </Screen>
  );
}
