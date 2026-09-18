// Figma: ORG 1 — Create Party (+ ORG 1a/1b/1c location drawer states)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Sheet } from '../../components/Sheet';
import { PermissionDialog } from '../../components/PermissionDialog';
import { LocationPicker } from '../../components/LocationPicker';
import { Chevron } from '../../components/icons';
import { permissionBody, radiusOptions } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function OrgCreateParty() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const [phone, setPhone] = useState('');
  const [asking, setAsking] = useState(false);
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const radius = radiusOptions.find((o) => o.value === state.radiusMi)!.label;
  const summary = touched ? `${state.locationMode === 'pin' ? 'RiNo' : 'Downtown'} · within ${radius}` : 'Tap to set';

  // ORG 1a: the browser's permission prompt comes first, on its own; the drawer opens once it's answered.
  const tapLocation = () => { if (state.permission === 'unknown') setAsking(true); else setOpen(true); };
  const answered = (permission: 'granted' | 'denied') => {
    update({ permission, locationMode: permission === 'granted' ? 'around' : 'pin' });
    setAsking(false);
    setOpen(true);
  };

  return (
    <Screen back title="Start a party" subtitle="Everyone else just adds where they're coming from."
      footer={<Button onClick={() => navigate('/org/verify')}>Create party</Button>}>
      <Input label="Your name" value={state.hostName} onChange={(v) => update({ hostName: v })} placeholder="Jordan Reyes" />
      <Input label="Party name (optional)" value={state.partyName} onChange={(v) => update({ partyName: v })} placeholder="Jordan's Dinner" />
      <Input label="When" type="datetime-local" value={state.when} onChange={(v) => update({ when: v })} />
      <Input label="Your phone" value={phone} onChange={setPhone} inputMode="tel" type="tel" placeholder="(555) 019-2244" />
      <button className="location-row" onClick={tapLocation}>
        <span className="t-body-med">Your location</span>
        <span className="hstack c-secondary t-secondary">{summary}<Chevron size={20} /></span>
      </button>
      <PermissionDialog open={asking} body={permissionBody.host} onAllow={() => answered('granted')} onDeny={() => answered('denied')} />
      <Sheet open={open} onClose={() => setOpen(false)} title="Your location" subtitle="Only used to find a fair spot. Guests never see it.">
        <LocationPicker context="host" askPermission={false} />
        <Button onClick={() => { setTouched(true); setOpen(false); }}>Use this location</Button>
      </Sheet>
    </Screen>
  );
}
