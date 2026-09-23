// The host's Edit details drawer (ORG 4 and ORG 10): party name, When and Your location. When and
// location are pickers of their own, so the drawer swaps to them and comes back, as P 3b's Your info does.
import { useEffect, useState } from 'react';
import { Sheet } from './Sheet';
import { Button } from './Button';
import { Input } from './Input';
import { PickerField } from './PickerField';
import { WhenSheet } from './WhenSheet';
import { LocationPicker } from './LocationPicker';
import { whenLabel } from './when';
import { radiusOptions } from '../fixtures';
import { usePrototypeState } from '../state';

type Props = { open: boolean; onClose: () => void; subtitle: string; onSave: (patch: { partyName: string; when: string }) => void };

export function EditDetails({ open, onClose, subtitle, onSave }: Props) {
  const [state] = usePrototypeState();
  const [step, setStep] = useState<'details' | 'when' | 'location'>('details');
  const [draft, setDraft] = useState({ name: state.partyName, when: state.when });
  // Every open starts from what is saved.
  useEffect(() => { if (open) { setDraft({ name: state.partyName, when: state.when }); setStep('details'); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const radius = radiusOptions.find((o) => o.value === state.radiusMi)!.label;
  const where = `${state.locationMode === 'pin' ? 'RiNo' : 'Downtown'} · within ${radius}`;
  const changed = draft.name.trim() !== state.partyName || draft.when !== state.when;
  return (
    <>
      <Sheet open={open && step === 'details'} onClose={onClose} title="Edit details" subtitle={subtitle}>
        <div className="form">
          <Input label="Party name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} placeholder="Party name" />
          <PickerField label="When" value={whenLabel(draft.when) || 'Tap to set'} set={draft.when !== ''} onClick={() => setStep('when')} />
          <PickerField label="Your location" value={where} set onClick={() => setStep('location')} />
        </div>
        <Button onClick={() => { onSave({ partyName: draft.name.trim(), when: draft.when }); onClose(); }} disabled={!changed || draft.name.trim() === '' || draft.when === ''}>Save</Button>
      </Sheet>
      <WhenSheet open={open && step === 'when'} onClose={() => setStep('details')} value={draft.when} onSave={(when) => setDraft({ ...draft, when })} />
      <Sheet open={open && step === 'location'} onClose={() => setStep('details')} title="Your location" subtitle="Only used to find a spot that works for everyone. Guests never see it.">
        <LocationPicker context="host" askPermission={false} />
        <Button onClick={() => setStep('details')}>Use this location</Button>
      </Sheet>
    </>
  );
}
