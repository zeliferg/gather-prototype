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
import { Segmented } from '../../components/Segmented';
import { WhenSheet } from '../../components/WhenSheet';
import { whenLabel } from '../../components/when';
import { Plus } from '../../components/icons';
import { formatPhone } from '../../components/phone';
import { continueHint, phoneError, requiredError, useTouched } from '../../components/form';
import { decideOptions, permissionBody, radiusOptions } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function OrgCreateParty() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const [asking, setAsking] = useState(false);
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [whenOpen, setWhenOpen] = useState(false);
  const radius = radiusOptions.find((o) => o.value === state.radiusMi)!.label;
  const summary = touched ? `${state.locationMode === 'pin' ? 'RiNo' : 'Downtown'} · within ${radius}` : 'Tap to set';
  // Validation: each field flags itself once left unfinished (standard blur-and-clear), the button stays
  // disabled, and a caption above it names the first thing missing so the grey never goes unexplained.
  const t = useTouched();
  const fields = [
    { key: 'name', error: requiredError(state.hostName, 'Add your name') },
    { key: 'party', error: requiredError(state.partyName, 'Give the party a name') },
    { key: 'when', error: state.when === '' ? 'Pick a date and time' : null },
    { key: 'phone', error: phoneError(state.hostPhone) },
    { key: 'where', error: touched ? null : "Set where you're coming from" },
  ];
  const err = (key: string) => t.shown(key, fields.find((f) => f.key === key)?.error ?? null);
  const complete = fields.every((f) => !f.error);

  // ORG 1a: the browser's permission prompt comes first, on its own; the drawer opens once it's answered.
  const tapLocation = () => { if (state.permission === 'unknown') setAsking(true); else setOpen(true); };
  const answered = (permission: 'granted' | 'denied') => {
    update({ permission, locationMode: permission === 'granted' ? 'around' : 'pin' });
    setAsking(false);
    setOpen(true);
  };

  return (
    <Screen back title="Start a party" subtitle="Everyone else just adds where they're coming from."
      footer={<>
        {!complete && <p className="form-hint t-caption c-secondary">{continueHint(fields)}</p>}
        <Button onClick={() => navigate('/org/verify')} disabled={!complete}>Create party</Button>
      </>}>
      <div className="form">
        <Input label="Your name" value={state.hostName} onChange={(v) => update({ hostName: v })} placeholder="Your name" error={err('name')} onBlur={() => t.touch('name')} />
        <Input label="Party name" value={state.partyName} onChange={(v) => update({ partyName: v })} placeholder="Taco Tuesday" error={err('party')} onBlur={() => t.touch('party')} />
        <PickerField label="When" value={whenLabel(state.when) || 'Tap to set'} set={state.when !== ''} onClick={() => setWhenOpen(true)} error={err('when')} />
        <Input label="Your phone" value={state.hostPhone} onChange={(v) => update({ hostPhone: formatPhone(v) })} inputMode="tel" type="tel" placeholder="(111) 111-1111" error={err('phone')} onBlur={() => t.touch('phone')} />
        <PickerField label="Your location" value={summary} set={touched} onClick={tapLocation} error={err('where')} />
        {/* v2: who picks the spot. The group votes by default; the host keeps the last say either way. */}
        <div className="input">
          <span className="t-caption c-secondary">Who picks the spot</span>
          <Segmented options={decideOptions} value={state.decide} onChange={(decide) => update({ decide })} />
          <p className="t-caption c-secondary decide-note" key={state.decide}>{state.decide === 'vote' ? "Once everyone's in, guests pick their favourite from places that work for all. You have the last say." : 'You choose from places that work for everyone.'}</p>
        </div>
      </div>
      {/* Optional, so it stays a quiet link rather than another field */}
      <button className="hstack link t-label" style={{ alignSelf: 'flex-start' }} onClick={() => setPrefsOpen(true)}>
        <Plus size={16} />{state.hostPrefs.length ? `Preferences: ${state.hostPrefs.join(', ')}` : 'Add preferences (optional)'}
      </button>
      <WhenSheet open={whenOpen} onClose={() => { setWhenOpen(false); t.touch('when'); }} value={state.when} onSave={(when) => update({ when })} />
      <PreferencesSheet open={prefsOpen} onClose={() => setPrefsOpen(false)} value={state.hostPrefs} onSave={(hostPrefs) => update({ hostPrefs })} />
      <PermissionDialog open={asking} body={permissionBody.host} onAllow={() => answered('granted')} onDeny={() => answered('denied')} />
      <Sheet open={open} onClose={() => { setOpen(false); t.touch('where'); }} title="Your location" subtitle="Only used to find a spot that works for everyone. Guests never see it.">
        <LocationPicker context="host" askPermission={false} />
        <Button onClick={() => { setTouched(true); setOpen(false); }}>Use this location</Button>
      </Sheet>
    </Screen>
  );
}
