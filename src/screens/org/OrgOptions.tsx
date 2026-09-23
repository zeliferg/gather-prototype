// Figma: ORG 6 — Options, ORG 6b — Options (Map), ORG 6c — Restaurant detail (sheet), ORG 8 — Reservation and ORG 8b — Walk-in notice (the sheet's confirm step)
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Segmented } from '../../components/Segmented';
import { Sheet } from '../../components/Sheet';
import { MapView } from '../../components/MapView';
import { RestaurantCard } from '../../components/RestaurantCard';
import { ProgressButton } from '../../components/ProgressButton';
import { partner, restaurants, slotsFor, spotTag, type RestaurantId } from '../../fixtures';
import { usePrototypeState } from '../../state';
import { useParty } from '../../party';

// How long the sheet takes to slide away, read from tokens.css so reduced motion (0ms) navigates at once.
const sheetMs = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dur-sheet')) || 0;

export function OrgOptions() {
  const navigate = useNavigate();
  const location = useLocation();
  const [, update] = usePrototypeState();
  const { targetTime, dateLong, size } = useParty();
  const [view, setView] = useState<'list' | 'map'>('list');
  // The hub's Places card lands here with that place already open.
  const [openId, setOpenId] = useState<RestaurantId | null>(location.state?.open ?? null);
  // Closing only hides the sheet, so its content stays put while it slides away.
  const [sheetOpen, setSheetOpen] = useState<boolean>(openId !== null);
  // ORG 6c is the detail step; ORG 8 / 8b is the confirm step in the same sheet.
  const [step, setStep] = useState<'detail' | 'confirm'>('detail');
  // A slot tapped on a card carries into the sheet; opening a card with nothing tapped shows no slot selected.
  const [picked, setPicked] = useState<Partial<Record<RestaurantId, string | null>>>({});
  const [time, setTime] = useState<string | null>(null);
  const open = restaurants.find((r) => r.id === openId);
  const tag = spotTag(restaurants.findIndex((r) => r.id === openId));

  const openRestaurant = (id: RestaurantId, slot?: string) => { setTime(slot ?? picked[id] ?? null); setOpenId(id); setStep('detail'); setSheetOpen(true); };
  // A slot tapped on a card opens the sheet with it selected.
  const pickSlot = (id: RestaurantId, slot: string) => { setPicked({ ...picked, [id]: slot }); openRestaurant(id, slot); };
  const close = () => setSheetOpen(false);

  // Walk-in places take the party's own time: the host already chose it on Create Party.
  const toConfirm = () => {
    if (!open) return;
    const t = open.reservations ? time : targetTime;
    if (!t) return;
    // A time the party is too big for falls back to the first slot that fits, as ORG 8 did.
    const fits = slotsFor(open, size);
    setTime(open.reservations && !fits.includes(t) ? fits[0] : t);
    setStep('confirm');
  };
  // Booked: the sheet slides away first, then ORG 9 comes in.
  const finish = () => { close(); setTimeout(() => navigate('/org/confirmed'), sheetMs()); };
  const commit = () => { if (open && time) update({ selectedRestaurant: open.id, selectedTime: time, booked: true }); };
  const cta = open ? (open.reservations ? (time ? `Book ${time} with ${partner}` : `Book with ${partner}`) : 'Choose this spot') : '';

  const title = !open ? undefined : step === 'confirm' && open.reservations ? 'Confirm your booking' : open.name;
  const subtitle = !open ? undefined : step === 'detail' ? open.cuisine : open.reservations ? open.name : 'Walk-in only';

  return (
    <Screen back title="3 places that work" subtitle="Each one is close to the middle of where everyone's coming from.">
      <Segmented options={[{ value: 'list', label: 'List' }, { value: 'map', label: 'Map' }]} value={view} onChange={setView} />
      {view === 'list'
        ? restaurants.map((r, i) => <RestaurantCard key={r.id} restaurant={r} index={i} picked={picked[r.id] ?? null} onPick={(t) => pickSlot(r.id, t)} onOpen={() => openRestaurant(r.id)} />)
        : <MapView mode="options" height={620} onSelectPin={openRestaurant} />}
      <Sheet open={sheetOpen} onClose={close} title={title} subtitle={subtitle}>
        {/* The photo stays across both steps; everything after it is keyed by step so it fades in fresh. */}
        {open && <div key="photo" className="rcard__photo rcard__photo--tall"><img src={open.photo} alt="" /></div>}
        {open && step === 'detail' && [
          <div key="d-info" className="stack" style={{ gap: 6 }}>
            <Chip variant={tag.best ? 'success' : 'neutral'} className="rcard__fair chip--sm">{tag.label}</Chip>
            <p className="t-body">{open.address}</p>
            <p className="t-secondary c-secondary">{open.hours} · {open.reservations ? `Reserve on ${partner}` : 'Walk-in only'}</p>
          </div>,
          ...(open.reservations ? [
            <p key="d-label" className="t-caption c-secondary">{time ? 'Time' : 'Pick a time'}</p>,
            <div key="d-times" className="chip-row">{open.times.map((t) => <Chip key={t} className="chip--time" variant={t === time ? 'selected' : 'neutral'} onClick={() => setTime(t)}>{t}</Chip>)}</div>,
          ] : [
            <p key="d-walkin" className="t-secondary c-secondary">No reservations here. The group heads over at {targetTime}, the time you set for the party.</p>,
          ]),
          <Button key="d-cta" onClick={toConfirm} disabled={open.reservations && !time}>{cta}</Button>,
          <Button key="d-menu" variant="ghost">See full menu</Button>,
        ]}
        {open && step === 'confirm' && open.reservations && [
          <div key="c-info" className="stack" style={{ gap: 4 }}>
            <p className="t-body-med">{dateLong} at {time}</p>
            <p className="t-secondary c-secondary">Table for {size} · {open.address}</p>
          </div>,
          <ProgressButton key="c-cta" idle="Confirm" busy="Booking your table…" done="Booked" busyMs={1300} onBusyEnd={commit} onDone={finish} />,
          <Button key="c-back" variant="ghost" onClick={() => setStep('detail')}>Pick another time</Button>,
        ]}
        {open && step === 'confirm' && !open.reservations && [
          <div key="w-info" className="stack" style={{ gap: 4 }}>
            <p className="t-body-med">{dateLong} at {targetTime}</p>
            <p className="t-secondary c-secondary">We'll tell the {size} of you to head over then. Arrive together and you'll usually be seated within 15 minutes.</p>
          </div>,
          <ProgressButton key="w-cta" idle="Notify everyone" busy="Texting everyone…" done="Everyone's told" busyMs={1300} onBusyEnd={commit} onDone={finish} />,
          <Button key="w-back" variant="ghost" onClick={() => setStep('detail')}>Back</Button>,
        ]}
      </Sheet>
    </Screen>
  );
}
