// Not in Figma yet: the guest's join screen (after P 2 Verify). Location and optional preferences live here;
// the map itself is P 3 (/p/location). Editing later happens in P 3b's Your info drawer.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ProgressButton } from '../../components/ProgressButton';
import { PermissionDialog } from '../../components/PermissionDialog';
import { PreferencesSheet } from '../../components/Preferences';
import { PickerField } from '../../components/PickerField';
import { party, permissionBody, radiusOptions } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function PJoinInfo() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const [asking, setAsking] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [joining, setJoining] = useState(false);
  const radius = radiusOptions.find((o) => o.value === state.radiusMi)!.label;
  const locationSummary = state.locationSet ? `${state.locationMode === 'pin' ? 'RiNo' : 'Downtown'} · within ${radius}` : 'Tap to set';
  const prefsSummary = state.prefs.length ? state.prefs.join(', ') : 'Tap to add';
  // Joined with a code: the host never added this person, so they say who they are here.
  const byCode = state.guestPhone !== '';
  const ready = state.locationSet && (!byCode || state.guestName.trim() !== '');

  // Like the host's Create Party: the browser's permission prompt comes first, then the map screen.
  const tapLocation = () => { if (state.permission === 'unknown') setAsking(true); else navigate('/p/location', { state: { from: '/p/join' } }); };
  const answered = (permission: 'granted' | 'denied') => {
    update({ permission, locationMode: permission === 'granted' ? 'around' : 'pin' });
    setAsking(false);
    navigate('/p/location', { state: { from: '/p/join' } });
  };
  const join = (flexible: boolean) => update({ joined: true, flexible, droppedOut: false, joinedAt: state.joinedAt ?? Date.now() });
  const go = (flexible: boolean) => { join(flexible); navigate('/p/waiting'); };

  return (
    <Screen back title={`Join ${party.name}`}
      subtitle="Add where you're coming from so we can find a spot that works for everyone. Nobody sees your exact location."
      footer={<>
          {/* Join the party: spinner while "joining", a check, then the party page (same beat as Verify). */}
          <ProgressButton idle="Join the party" busy="Joining…" done="You're in" busyMs={900} disabled={!ready}
            onStart={() => setJoining(true)} onBusyEnd={() => join(false)} onDone={() => navigate('/p/waiting')} />
          <Button variant="ghost" onClick={() => go(true)} disabled={joining}>I'm flexible, skip this</Button>
        </>}>
      {byCode && <Input label="Your name" value={state.guestName} onChange={(v) => update({ guestName: v })} placeholder="Your name" />}
      <PickerField label="My location" value={locationSummary} set={state.locationSet} onClick={tapLocation} />
      <PickerField label="Preferences (optional)" value={prefsSummary} set={state.prefs.length > 0} onClick={() => setPrefsOpen(true)} />
      <p className="t-caption c-secondary">Preferences help {party.hostFirst} pick, they don't limit the options.</p>
      <PermissionDialog open={asking} body={permissionBody.guest} onAllow={() => answered('granted')} onDeny={() => answered('denied')} />
      <PreferencesSheet open={prefsOpen} onClose={() => setPrefsOpen(false)} value={state.prefs} onSave={(prefs) => update({ prefs })} />
    </Screen>
  );
}
