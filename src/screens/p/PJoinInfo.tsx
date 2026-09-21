// Not in Figma yet: the guest's join screen (after P 2 Verify). Location and optional preferences live here;
// the map itself is P 3 (/p/location). Editing later happens in P 3b's Your info drawer.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { ProgressButton } from '../../components/ProgressButton';
import { Chip } from '../../components/Chip';
import { Sheet } from '../../components/Sheet';
import { PermissionDialog } from '../../components/PermissionDialog';
import { Chevron } from '../../components/icons';
import { party, permissionBody, prefGroups, radiusOptions } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function PJoinInfo() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const [asking, setAsking] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(state.prefs);
  const [joining, setJoining] = useState(false);
  const radius = radiusOptions.find((o) => o.value === state.radiusMi)!.label;
  const locationSummary = state.locationSet ? `${state.locationMode === 'pin' ? 'RiNo' : 'Downtown'} · within ${radius}` : 'Tap to set';
  const prefsSummary = state.prefs.length ? state.prefs.join(', ') : 'Tap to add';

  // Like the host's Create Party: the browser's permission prompt comes first, then the map screen.
  const tapLocation = () => { if (state.permission === 'unknown') setAsking(true); else navigate('/p/location', { state: { from: '/p/join' } }); };
  const answered = (permission: 'granted' | 'denied') => {
    update({ permission, locationMode: permission === 'granted' ? 'around' : 'pin' });
    setAsking(false);
    navigate('/p/location', { state: { from: '/p/join' } });
  };
  const join = (flexible: boolean) => update({ joined: true, flexible, droppedOut: false, joinedAt: state.joinedAt ?? Date.now() });
  const go = (flexible: boolean) => { join(flexible); navigate('/p/waiting'); };

  const toggle = (o: string) => setDraft((d) => (d.includes(o) ? d.filter((x) => x !== o) : [...d, o]));

  return (
    <Screen back title={`Join ${party.name}`}
      subtitle="Add where you're coming from so we can find a spot that's fair for everyone. Nobody sees your exact location."
      footer={<>
          {/* Join the party: spinner while "joining", a check, then the party page (same beat as Verify). */}
          <ProgressButton idle="Join the party" busy="Joining…" done="You're in" busyMs={900} disabled={!state.locationSet}
            onStart={() => setJoining(true)} onBusyEnd={() => join(false)} onDone={() => navigate('/p/waiting')} />
          <Button variant="ghost" onClick={() => go(true)} disabled={joining}>I'm flexible, skip this</Button>
        </>}>
      <button className="location-row" onClick={tapLocation}>
        <span className="t-body-med">My location</span>
        <span className="hstack c-secondary t-secondary">{locationSummary}<Chevron size={20} /></span>
      </button>
      <button className="location-row" onClick={() => { setDraft(state.prefs); setPrefsOpen(true); }}>
        <span className="t-body-med">Preferences (optional)</span>
        <span className="hstack c-secondary t-secondary" style={{ minWidth: 0 }}><span className="ellipsis">{prefsSummary}</span><Chevron size={20} /></span>
      </button>
      <p className="t-caption c-secondary">Preferences help {party.hostFirst} pick, they don't limit the options.</p>
      <PermissionDialog open={asking} body={permissionBody.guest} onAllow={() => answered('granted')} onDeny={() => answered('denied')} />
      <Sheet open={prefsOpen} onClose={() => setPrefsOpen(false)} title="Preferences" subtitle="Pick anything that matters to you.">
        {prefGroups.map((g) => (
          <div key={g.label} className="stack">
            <p className="t-caption c-secondary">{g.label}</p>
            <div className="chip-row">{g.options.map((o) => <Chip key={o} variant={draft.includes(o) ? 'selected' : 'neutral'} onClick={() => toggle(o)}>{o}</Chip>)}</div>
          </div>
        ))}
        <Button onClick={() => { update({ prefs: draft }); setPrefsOpen(false); }}>Save preferences</Button>
      </Sheet>
    </Screen>
  );
}
