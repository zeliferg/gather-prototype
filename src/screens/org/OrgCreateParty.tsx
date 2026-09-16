// Figma: ORG 1 — Create Party (+ ORG 1a/1b/1c location drawer states)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Sheet } from '../../components/Sheet';
import { LocationPicker } from '../../components/LocationPicker';
import { Chevron } from '../../components/icons';
import { party, radiusOptions } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function OrgCreateParty() {
  const navigate = useNavigate();
  const [state] = usePrototypeState();
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const radius = radiusOptions.find((o) => o.value === state.radiusMi)!.label;
  const summary = touched ? `${state.locationMode === 'pin' ? 'RiNo' : 'Downtown'} · within ${radius}` : 'Tap to set';

  return (
    <Screen back title="Start a party" subtitle="Everyone else just adds where they're coming from."
      footer={<Button onClick={() => navigate('/org/sms-link')}>Create party</Button>}>
      <Input label="Your name" value={party.hostName} />
      <Input label="Party name (optional)" value={party.name} />
      <Input label="When" value={`${party.dateShort} at ${party.time}`} />
      <Input label="Your phone" value={party.hostPhone} inputMode="tel" />
      <button className="card row location-row" onClick={() => setOpen(true)}>
        <span className="t-body-med">Your location</span>
        <span className="hstack c-secondary t-secondary">{summary}<Chevron size={20} /></span>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Your location" subtitle="Only used to find a fair spot. Guests never see it.">
        <LocationPicker context="host" />
        <Button onClick={() => { setTouched(true); setOpen(false); }}>Use this location</Button>
      </Sheet>
    </Screen>
  );
}
