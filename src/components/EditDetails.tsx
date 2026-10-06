// The host's Edit details drawer (ORG 4 and ORG 10): party name, When, Your location, Your preferences and,
// on the hub, who picks the spot. When, location and preferences are pickers of their own, so the drawer
// swaps to them and comes back, as P 3b's Your info does. Everything is saved together by Save.
import { useEffect, useState } from 'react';
import { Sheet } from './Sheet';
import { Button } from './Button';
import { Input } from './Input';
import { requiredError, useTouched } from './form';
import { PickerField } from './PickerField';
import { Segmented } from './Segmented';
import { WhenSheet } from './WhenSheet';
import { LocationPicker } from './LocationPicker';
import { PreferencesSheet } from './Preferences';
import { whenLabel } from './when';
import { decideOptions, radiusOptions, type DecideMode } from '../fixtures';
import { usePrototypeState } from '../state';

type Patch = { partyName: string; when: string; decide: DecideMode; hostPrefs: string[] };
type Props = { open: boolean; onClose: () => void; subtitle: string; onSave: (patch: Patch) => void; /** v2: show "Who picks the spot" (the hub, until the spot is booked) */ decide?: boolean };

const same = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

export function EditDetails({ open, onClose, subtitle, onSave, decide = false }: Props) {
  const [state] = usePrototypeState();
  const [step, setStep] = useState<'details' | 'when' | 'location' | 'prefs'>('details');
  const saved = () => ({ name: state.partyName, when: state.when, decide: state.decide, prefs: state.hostPrefs });
  const [draft, setDraft] = useState(saved);
  // Every open starts from what is saved.
  useEffect(() => { if (open) { setDraft(saved()); setStep('details'); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const radius = radiusOptions.find((o) => o.value === state.radiusMi)!.label;
  const where = `${state.locationMode === 'pin' ? 'RiNo' : 'Downtown'} · within ${radius}`;
  const t = useTouched();
  const nameError = requiredError(draft.name, 'Give the party a name');
  const changed = draft.name.trim() !== state.partyName || draft.when !== state.when || draft.decide !== state.decide || !same(draft.prefs, state.hostPrefs);
  return (
    <>
      <Sheet open={open && step === 'details'} onClose={onClose} title="Edit details" subtitle={subtitle}>
        <div className="form">
          <Input label="Party name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} placeholder="Party name" error={t.shown('name', nameError)} onBlur={() => t.touch('name')} />
          <PickerField label="When" value={whenLabel(draft.when) || 'Tap to set'} set={draft.when !== ''} onClick={() => setStep('when')} />
          <PickerField label="Your location" value={where} set onClick={() => setStep('location')} />
          {/* The host is one of the guests: their own picks live with their location, not as a card on the page */}
          <PickerField label="Your preferences" value={draft.prefs.length ? draft.prefs.join(' · ') : 'Tap to add (optional)'} set={draft.prefs.length > 0} onClick={() => setStep('prefs')} />
          {decide && (
            <div className="input">
              <span className="t-caption c-secondary">Who picks the spot</span>
              <Segmented options={decideOptions} value={draft.decide} onChange={(d) => setDraft({ ...draft, decide: d })} />
            </div>
          )}
        </div>
        <Button onClick={() => { onSave({ partyName: draft.name.trim(), when: draft.when, decide: draft.decide, hostPrefs: draft.prefs }); onClose(); }} disabled={!changed || draft.name.trim() === '' || draft.when === ''}>Save</Button>
      </Sheet>
      <WhenSheet open={open && step === 'when'} onClose={() => setStep('details')} value={draft.when} onSave={(when) => setDraft({ ...draft, when })} />
      <Sheet open={open && step === 'location'} onClose={() => setStep('details')} title="Your location" subtitle="Only used to find a spot that works for everyone. Guests never see it.">
        <LocationPicker context="host" askPermission={false} />
        <Button onClick={() => setStep('details')}>Use this location</Button>
      </Sheet>
      <PreferencesSheet open={open && step === 'prefs'} onClose={() => setStep('details')} title="Your preferences" subtitle="What matters to you. We weigh it with everyone else's." value={draft.prefs} onSave={(prefs) => setDraft({ ...draft, prefs })} />
    </>
  );
}
