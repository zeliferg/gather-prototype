// Figma: ORG 1 — Create Party (+ ORG 1a/1b/1c location drawer states)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Sheet } from '../../components/Sheet';
import { PermissionDialog } from '../../components/PermissionDialog';
import { LocationPicker } from '../../components/LocationPicker';
import { PreferencesSheet } from '../../components/Preferences';
import { PickerField } from '../../components/PickerField';
import { Plus } from '../../components/icons';
import { formatPhone, isCompletePhone } from '../../components/phone';
import { permissionBody, radiusOptions } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function OrgCreateParty() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const [asking, setAsking] = useState(false);
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const radius = radiusOptions.find((o) => o.value === state.radiusMi)!.label;
  const summary = touched ? `${state.locationMode === 'pin' ? 'RiNo' : 'Downtown'} · within ${radius}` : 'Tap to set';
  const complete = state.hostName.trim() !== '' && state.partyName.trim() !== '' && state.when !== '' && isCompletePhone(state.hostPhone) && touched;

  // ORG 1a: the browser's permission prompt comes first, on its own; the drawer opens once it's answered.
  const tapLocation = () => { if (state.permission === 'unknown') setAsking(true); else setOpen(true); };
  const answered = (permission: 'granted' | 'denied') => {
    update({ permission, locationMode: permission === 'granted' ? 'around' : 'pin' });
    setAsking(false);
    setOpen(true);
  };

  return (
    <Screen back title="Start a party" subtitle="Everyone else just adds where they're coming from."
      footer={<Button onClick={() => navigate('/org/verify')} disabled={!complete}>Create party</Button>}>
      <div className="form">
        <Input label="Your name" value={state.hostName} onChange={(v) => update({ hostName: v })} placeholder="Your name" />
        <Input label="Party name" value={state.partyName} onChange={(v) => update({ partyName: v })} placeholder="Taco Tuesday" />
        <Input label="When" type="datetime-local" value={state.when} onChange={(v) => update({ when: v })} />
        <Input label="Your phone" value={state.hostPhone} onChange={(v) => update({ hostPhone: formatPhone(v) })} inputMode="tel" type="tel" placeholder="(111) 111-1111" />
        <PickerField label="Your location" value={summary} set={touched} onClick={tapLocation} />
      </div>
      {/* Optional, so it stays a quiet link rather than another field */}
      <button className="hstack link t-label" style={{ alignSelf: 'flex-start' }} onClick={() => setPrefsOpen(true)}>
        <Plus size={16} />{state.hostPrefs.length ? `Preferences: ${state.hostPrefs.join(', ')}` : 'Add preferences (optional)'}
      </button>
      <PreferencesSheet open={prefsOpen} onClose={() => setPrefsOpen(false)} value={state.hostPrefs} onSave={(hostPrefs) => update({ hostPrefs })} />
      <PermissionDialog open={asking} body={permissionBody.host} onAllow={() => answered('granted')} onDeny={() => answered('denied')} />
      <Sheet open={open} onClose={() => setOpen(false)} title="Your location" subtitle="Only used to find a fair spot. Guests never see it.">
        <LocationPicker context="host" askPermission={false} />
        <Button onClick={() => { setTouched(true); setOpen(false); }}>Use this location</Button>
      </Sheet>
    </Screen>
  );
}
