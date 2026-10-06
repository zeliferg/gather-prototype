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
import { moreRestaurants, restaurants, shortlist, slotsFor, spotTag, type RestaurantId } from '../../fixtures';
import { PlaceDetails } from '../../components/PlaceDetails';
import { MenuList } from '../../components/MenuList';
import { usePrototypeState } from '../../state';
import { useParty } from '../../party';
import { useHostVote } from '../../useVote';

// How long the sheet takes to slide away, read from tokens.css so reduced motion (0ms) navigates at once.
const sheetMs = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dur-sheet')) || 0;

export function OrgOptions() {
  const navigate = useNavigate();
  const location = useLocation();
  const [, update] = usePrototypeState();
  const { targetTime, dateLong, size } = useParty();
  const vote = useHostVote();
  const [view, setView] = useState<'list' | 'map'>('list');
  // Three places fit best; two more that still work come in on request and stay for the visit.
  const [showMore, setShowMore] = useState(false);
  // The hub's Places card lands here with that place already open.
  const [openId, setOpenId] = useState<RestaurantId | null>(location.state?.open ?? null);
  // Closing only hides the sheet, so its content stays put while it slides away.
  const [sheetOpen, setSheetOpen] = useState<boolean>(openId !== null);
  // ORG 6c is the detail step; ORG 8 / 8b is the confirm step in the same sheet; the menu is a step of its own.
  const [step, setStep] = useState<'detail' | 'confirm' | 'menu'>('detail');
  // A slot tapped on a card carries into the sheet; opening a card with nothing tapped shows no slot selected.
  const [picked, setPicked] = useState<Partial<Record<RestaurantId, string | null>>>({});
  const [time, setTime] = useState<string | null>(null);
  const open = restaurants.find((r) => r.id === openId);
  const tag = vote.on && open ? (vote.leader === open.id ? { label: 'Most votes', best: true } : { label: 'Great spot', best: false }) : spotTag(shortlist.findIndex((r) => r.id === openId));
  const lead = restaurants.find((r) => r.id === vote.leader);
  // v2: the host has the last say; confirming a place that isn't leading says so.
  const overriding = vote.on && open && lead && lead.id !== open.id;
  const list = [...(vote.on ? vote.ranked : shortlist), ...(showMore ? moreRestaurants : [])];

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
  // The chosen slot already shows in the chips, so the button doesn't repeat it (6 Oct 2026)
  const cta = open ? (open.reservations ? `Book with ${open.partner}` : 'Choose this spot') : '';

  const title = !open ? undefined : step === 'confirm' && open.reservations ? 'Confirm your booking' : open.name;
  const subtitle = !open ? undefined : step === 'detail' ? open.cuisine : step === 'menu' ? 'Menu' : open.reservations ? open.name : 'Walk-in only';

  return (
    <Screen back title={vote.on ? (vote.allIn ? 'Votes are in' : 'The vote so far') : '3 places that work'}
      subtitle={vote.on ? `${vote.arrived} of ${vote.voters} picked a favourite. Each place is close to the middle of where everyone's coming from, and you have the last say.` : "Each one is close to the middle of where everyone's coming from."}>
      <Segmented options={[{ value: 'list', label: 'List' }, { value: 'map', label: 'Map' }]} value={view} onChange={setView} />
      {view === 'list'
        ? list.map((r, i) => <div key={r.id} className={i >= 3 ? 'rcard-in' : undefined}><RestaurantCard restaurant={r} index={i} picked={picked[r.id] ?? null} onPick={(t) => pickSlot(r.id, t)} onOpen={() => openRestaurant(r.id)}
            vote={vote.on ? { voters: vote.votersOf(r.id), total: vote.voters, leading: vote.leader === r.id } : undefined} /></div>)
        : <MapView mode="options" height={620} onSelectPin={openRestaurant} places={list} />}
      {/* Three is enough to start; the door to a couple more stays open, worded as choice rather than doubt */}
      {view === 'list' && !showMore && (
        <div className="stack" style={{ gap: 10, alignItems: 'center', padding: '4px 0 8px' }}>
          <p className="t-secondary c-secondary" style={{ textAlign: 'center' }}>These 3 fit the group best. Want a couple more to choose from?</p>
          <Button variant="secondary" onClick={() => setShowMore(true)}>Show {moreRestaurants.length} more places</Button>
        </div>
      )}
      <Sheet open={sheetOpen} onClose={close} title={title} subtitle={subtitle} actions={step !== 'menu'}>
        {/* The photo stays across both steps; everything after it is keyed by step so it fades in fresh. */}
        {open && step !== 'menu' && <div key="photo" className="rcard__photo rcard__photo--tall"><img src={open.photo} alt="" /></div>}
        {open && step === 'menu' && [<MenuList key="m-list" menu={open.menu} />, <Button key="m-back" variant="ghost" onClick={() => setStep('detail')}>Back</Button>]}
        {open && step === 'detail' && [
          <PlaceDetails key="d-details" restaurant={open} tag={tag} bookingWords line={vote.on ? `${vote.tally[open.id].length} of ${vote.voters} voted for this.` : null} />,
          ...(open.reservations ? [
            <p key="d-label" className="t-caption c-secondary">{time ? 'Time' : 'Pick a time'}</p>,
            <div key="d-times" className="chip-row">{open.times.map((t) => <Chip key={t} className="chip--time" variant={t === time ? 'selected' : 'neutral'} onClick={() => setTime(t)}>{t}</Chip>)}</div>,
          ] : [
            <p key="d-walkin" className="t-secondary c-secondary">No reservations here. The group heads over at {targetTime}, the time you set for the party.</p>,
          ]),
          <div key="d-actions" className="sheet__actions">
            <Button onClick={toConfirm} disabled={open.reservations && !time}>{cta}</Button>
            <Button variant="ghost" onClick={() => setStep('menu')}>See full menu</Button>
          </div>,
        ]}
        {open && step === 'confirm' && open.reservations && [
          <div key="c-info" className="stack" style={{ gap: 4 }}>
            <p className="t-body-med">{dateLong} at {time}</p>
            <p className="t-secondary c-secondary">Table for {size} · {open.address}</p>
            {overriding && <p className="t-secondary c-secondary">Most votes went to {lead.name}. Everyone gets a text with your pick.</p>}
          </div>,
          <div key="c-actions" className="sheet__actions">
            <ProgressButton idle="Confirm" busy="Booking your table…" done="Booked" busyMs={1300} onBusyEnd={commit} onDone={finish} />
            <Button variant="ghost" onClick={() => setStep('detail')}>Pick another time</Button>
          </div>,
        ]}
        {open && step === 'confirm' && !open.reservations && [
          <div key="w-info" className="stack" style={{ gap: 4 }}>
            <p className="t-body-med">{dateLong} at {targetTime}</p>
            <p className="t-secondary c-secondary">We'll tell the {size} of you to head over then. Arrive together and you'll usually be seated within 15 minutes.</p>
            {overriding && <p className="t-secondary c-secondary">Most votes went to {lead.name}. Everyone gets a text with your pick.</p>}
          </div>,
          <div key="w-actions" className="sheet__actions">
            <ProgressButton idle="Notify everyone" busy="Texting everyone…" done="Everyone's told" busyMs={1300} onBusyEnd={commit} onDone={finish} />
            <Button variant="ghost" onClick={() => setStep('detail')}>Back</Button>
          </div>,
        ]}
      </Sheet>
    </Screen>
  );
}
