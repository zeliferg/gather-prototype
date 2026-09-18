// Figma: P 3 — Join & Submit (+ P 3c Drop a pin): the map screen, reached from the join screen's My location row
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { LocationPicker } from '../../components/LocationPicker';
import { usePrototypeState } from '../../state';

export function PJoin() {
  const navigate = useNavigate();
  const [, update] = usePrototypeState();
  return (
    <Screen back title="Where are you coming from?" subtitle="We use this to find a spot that's fair for everyone. Nobody sees your exact location."
      footer={<Button onClick={() => { update({ locationSet: true, flexible: false }); navigate(-1); }}>Save</Button>}>
      <LocationPicker context="guest" askPermission={false} />
    </Screen>
  );
}
