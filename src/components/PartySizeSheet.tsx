// ORG 10's Guests drawer (24 Sep 2026): the party size is the list. Remove or add people, then
// "Are you sure?" checks whether the booked table still fits; if not, the host picks a new time or place.
import { useEffect, useState } from 'react';
import { Sheet } from './Sheet';
import { Button } from './Button';
import { Input } from './Input';
import { ProgressButton } from './ProgressButton';
import { GuestRow } from './GuestRow';
import { Minus, Plus } from './icons';
import { formatPhone, isCompletePhone } from './phone';
import { restaurants, tableFits } from '../fixtures';
import { usePrototypeState, type AddedGuest } from '../state';
import { useParty } from '../party';

type Props = { open: boolean; onClose: () => void; /** the guest changes are saved; `fits` says whether the booked time survived */ onConfirmed: (fits: boolean) => void };

export function PartySizeSheet({ open, onClose, onConfirmed }: Props) {
  const [state, update] = usePrototypeState();
  const { coming, dateLong } = useParty();
  const place = restaurants.find((x) => x.id === state.selectedRestaurant)!;
  const [step, setStep] = useState<'list' | 'add' | 'confirm'>('list');
  const [removed, setRemoved] = useState<string[]>([]);
  const [added, setAdded] = useState<AddedGuest[]>([]);
  const [newGuest, setNewGuest] = useState({ name: '', phone: '' });
  const [fits, setFits] = useState(true);
  // Every open starts from the saved list.
  useEffect(() => { if (open) { setStep('list'); setRemoved([]); setAdded([]); setNewGuest({ name: '', phone: '' }); } }, [open]);

  const size = coming.length - removed.length + added.length;
  const changed = removed.length > 0 || added.length > 0;
  const guestReady = newGuest.name.trim() !== '' && isCompletePhone(newGuest.phone);
  const addOne = () => {
    const n = newGuest.name.trim();
    setAdded([...added, { id: `added-${Date.now()}`, name: n, initial: n[0].toUpperCase() }]);
    setNewGuest({ name: '', phone: '' });
    setStep('list');
  };
  // The moment the spinner turns into the check: the list is saved and the table is checked at the new size.
  const commit = () => {
    update({ removedIds: [...state.removedIds, ...removed], addedGuests: [...state.addedGuests, ...added] });
    setFits(tableFits(place, size, state.selectedTime));
  };
  const remover = (id: string, name: string) => (
    <button className="card__action card__action--filled" aria-label={`Remove ${name}`} onClick={() => setRemoved([...removed, id])}><Minus size={18} /></button>
  );

  return (
    <>
      <Sheet open={open && step === 'list'} onClose={onClose} title="Guests" subtitle="Remove or add people. The table follows the list.">
        <div className="list">
          {coming.map((g) => removed.includes(g.id)
            ? <GuestRow key={g.id} guest={g} muted right={<button className="link t-label" onClick={() => setRemoved(removed.filter((id) => id !== g.id))}>Undo</button>} />
            : <GuestRow key={g.id} guest={g} right={g.status === 'host' ? <span className="t-caption c-secondary">Host</span> : remover(g.id, g.name)} />)}
          {added.map((g) => <GuestRow key={g.id} guest={{ ...g, status: 'waiting' }} right={<button className="card__action card__action--filled" aria-label={`Remove ${g.name}`} onClick={() => setAdded(added.filter((a) => a.id !== g.id))}><Minus size={18} /></button>} />)}
          <button className="guest-row guest-row--tap" onClick={() => setStep('add')}>
            <span className="hstack" style={{ gap: 12 }}><span className="avatar avatar--more" style={{ width: 40, height: 40 }}><Plus size={18} /></span><span className="t-body c-accent">Add someone</span></span>
          </button>
        </div>
        <div className="row">
          <span className="t-body-med">Table for {size}</span>
          {changed && <span className="t-caption c-secondary">was {coming.length}</span>}
        </div>
        <Button onClick={() => setStep('confirm')} disabled={!changed}>Continue</Button>
      </Sheet>

      <Sheet open={open && step === 'add'} onClose={() => setStep('list')} title="Add someone" subtitle="They'll get the details once the table's set.">
        <div className="form">
          <Input label="Name" value={newGuest.name} onChange={(v) => setNewGuest({ ...newGuest, name: v })} placeholder="Name" />
          <Input label="Phone" value={newGuest.phone} onChange={(v) => setNewGuest({ ...newGuest, phone: formatPhone(v) })} type="tel" inputMode="tel" placeholder="(111) 111-1111" />
        </div>
        <Button onClick={addOne} disabled={!guestReady}>Add to the list</Button>
      </Sheet>

      <Sheet open={open && step === 'confirm'} onClose={() => setStep('list')} title="Are you sure?"
        subtitle={`We'll look for a table for ${size} at ${place.name} on ${dateLong}. It might keep your time, or we'll suggest another time or place.`}>
        <ProgressButton idle="Yes, update the table" busy="Checking availability…" done={fits ? 'Table updated' : 'Needs a new time'}
          busyMs={1200} onBusyEnd={commit} onDone={() => onConfirmed(fits)} />
        <Button variant="secondary" onClick={() => setStep('list')}>Back to the list</Button>
      </Sheet>
    </>
  );
}
