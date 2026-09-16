// Figma: P 3 — Join & Submit (+ P 3a permission, P 3c Drop a pin)
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { LocationPicker } from '../../components/LocationPicker';
import { usePrototypeState } from '../../state';

export function PJoin() {
  const navigate = useNavigate();
  const [, update] = usePrototypeState();
  const go = (flexible: boolean) => { update({ joined: true, flexible, droppedOut: false }); navigate('/p/waiting'); };
  return (
    <Screen title="Where are you coming from?" subtitle="We use this to find a spot that's fair for everyone. Nobody sees your exact location."
      footer={<><Button onClick={() => go(false)}>Count me in</Button><Button variant="ghost" onClick={() => go(true)}>I'm flexible, skip this</Button></>}>
      <LocationPicker context="guest" />
      <div className="row">
        <button className="link t-body-med">Add preferences (optional)</button>
        <div className="hstack"><Chip>Vegetarian</Chip><Chip>$$</Chip></div>
      </div>
    </Screen>
  );
}
