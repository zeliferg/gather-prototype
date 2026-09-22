// The Preferences sheet (P 2b) and its chip groups, shared by the guest's join screen, the guest's
// Your info drawer and the host's Create Party.
import { useState } from 'react';
import { Sheet } from './Sheet';
import { Button } from './Button';
import { Chip } from './Chip';
import { prefGroups } from '../fixtures';

export function PreferenceChips({ value, onToggle }: { value: string[]; onToggle: (option: string) => void }) {
  return (
    <>
      {prefGroups.map((g) => (
        <div key={g.label} className="stack">
          <p className="t-caption c-secondary">{g.label}</p>
          <div className="chip-row">{g.options.map((o) => <Chip key={o} variant={value.includes(o) ? 'selected' : 'neutral'} onClick={() => onToggle(o)}>{o}</Chip>)}</div>
        </div>
      ))}
    </>
  );
}

type SheetProps = { open: boolean; onClose: () => void; value: string[]; onSave: (prefs: string[]) => void; subtitle?: string };

export function PreferencesSheet({ open, onClose, value, onSave, subtitle = 'Pick anything that matters to you.' }: SheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title="Preferences" subtitle={subtitle}>
      {/* The Sheet unmounts its children when closed, so the draft starts from `value` on every open. */}
      <Draft value={value} onSave={(prefs) => { onSave(prefs); onClose(); }} />
    </Sheet>
  );
}

function Draft({ value, onSave }: { value: string[]; onSave: (prefs: string[]) => void }) {
  const [draft, setDraft] = useState(value);
  const toggle = (o: string) => setDraft((d) => (d.includes(o) ? d.filter((x) => x !== o) : [...d, o]));
  const unchanged = draft.length === value.length && draft.every((o) => value.includes(o));
  return (
    <>
      <PreferenceChips value={draft} onToggle={toggle} />
      <Button onClick={() => onSave(draft)} disabled={unchanged}>Save preferences</Button>
    </>
  );
}
