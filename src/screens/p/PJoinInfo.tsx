// Not in Figma yet: the guest's join screen (after P 2 Verify). Location and optional preferences live here;
// the map is a drawer (P 3 / P 3c), as on the host's Create Party (6 Oct 2026). Editing later happens in
// P 3b's Your info drawer.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ProgressButton } from '../../components/ProgressButton';
import { PermissionDialog } from '../../components/PermissionDialog';
import { Sheet } from '../../components/Sheet';
import { LocationPicker } from '../../components/LocationPicker';
import { PreferencesSheet } from '../../components/Preferences';
import { PickerField } from '../../components/PickerField';
import { party, permissionBody, radiusOptions } from '../../fixtures';
import { usePrototypeState } from '../../state';
import { footerHint, requiredError, useTouched } from '../../components/form';

export function PJoinInfo() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const [asking, setAsking] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [joining, setJoining] = useState(false);
  const [locOpen, setLocOpen] = useState(false);
  const radius = radiusOptions.find((o) => o.value === state.radiusMi)!.label;
  const locationSummary = state.locationSet ? `${state.locationMode === 'pin' ? 'RiNo' : 'Downtown'} · within ${radius}` : 'Tap to set';
  const prefsSummary = state.prefs.length ? state.prefs.join(', ') : 'Tap to add';
  // Joined with a code: the host never added this person, so they say who they are here.
  const byCode = state.guestPhone !== '';
  const t = useTouched();
  const fields = [
    ...(byCode ? [{ key: 'name', error: requiredError(state.guestName, 'Add your name') }] : []),
    { key: 'where', error: state.locationSet ? null : "Set where you're coming from" },
  ];
  const ready = fields.every((f) => !f.error);

  // Like the host's Create Party: the browser's permission prompt comes first, on its own; the drawer opens once it's answered.
  const tapLocation = () => { if (state.permission === 'unknown') setAsking(true); else setLocOpen(true); };
  const answered = (permission: 'granted' | 'denied') => {
    update({ permission, locationMode: permission === 'granted' ? 'around' : 'pin' });
    setAsking(false);
    setLocOpen(true);
  };
  const join = (flexible: boolean) => update({ joined: true, flexible, droppedOut: false, joinedAt: state.joinedAt ?? Date.now() });
  const go = (flexible: boolean) => { join(flexible); navigate('/p/waiting'); };

  return (
    <Screen back title={`Join ${party.name}`}
      subtitle="Add where you're coming from so we can find a spot that works for everyone. Nobody sees your exact location."
      footer={<>
          {footerHint(fields, t.shown) && <p className="form-hint t-caption c-secondary">{footerHint(fields, t.shown)}</p>}
          {/* Join the party: spinner while "joining", a check, then the party page (same beat as Verify). */}
          <ProgressButton idle="Join the party" busy="Joining…" done="You're in" busyMs={900} disabled={!ready}
            onStart={() => setJoining(true)} onBusyEnd={() => join(false)} onDone={() => navigate('/p/waiting')} />
          <Button variant="ghost" onClick={() => go(true)} disabled={joining}>I'm flexible, skip this</Button>
        </>}>
      {/* When the dinner is tells the guest where they'll be coming from */}
      <div className="card card--tint">
        <p className="t-body-med">{party.roughTime}</p>
        <p className="t-secondary c-secondary">{party.hostFirst} is hosting. Tell us where you'll be coming from around then.</p>
      </div>
      {byCode && <Input label="Your name" value={state.guestName} onChange={(v) => update({ guestName: v })} placeholder="Your name" error={t.shown('name', fields[0].error)} onBlur={() => t.touch('name')} />}
      <PickerField label="My location" value={locationSummary} set={state.locationSet} onClick={tapLocation} />
      <PickerField label="Preferences (optional)" value={prefsSummary} set={state.prefs.length > 0} onClick={() => setPrefsOpen(true)} />
      <p className="t-caption c-secondary">Preferences help {party.hostFirst} pick, they don't limit the options.</p>
      <PermissionDialog open={asking} body={permissionBody.guest} onAllow={() => answered('granted')} onDeny={() => answered('denied')} />
      <PreferencesSheet open={prefsOpen} onClose={() => setPrefsOpen(false)} value={state.prefs} onSave={(prefs) => update({ prefs })} />
      {/* P 3 / P 3c as a drawer: the map, Around me / Drop a pin, radius; Use this location saves */}
      <Sheet open={locOpen} onClose={() => { setLocOpen(false); t.touch('where'); }} title="Where are you coming from?" subtitle="We use this to find a spot that works for everyone. Nobody sees your exact location.">
        <LocationPicker context="guest" askPermission={false} />
        <Button onClick={() => { update({ locationSet: true, flexible: false }); setLocOpen(false); }}>Use this location</Button>
      </Sheet>
    </Screen>
  );
}
