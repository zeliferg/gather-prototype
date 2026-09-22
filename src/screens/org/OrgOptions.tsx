// Figma: ORG 6 — Options, ORG 6b — Options (Map), ORG 6c — Restaurant detail (sheet)
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Segmented } from '../../components/Segmented';
import { Sheet } from '../../components/Sheet';
import { MapView } from '../../components/MapView';
import { RestaurantCard } from '../../components/RestaurantCard';
import { partner, restaurants, spotTag, type RestaurantId } from '../../fixtures';
import { usePrototypeState } from '../../state';
import { useParty } from '../../party';

export function OrgOptions() {
  const navigate = useNavigate();
  const location = useLocation();
  const [, update] = usePrototypeState();
  const { targetTime } = useParty();
  const [view, setView] = useState<'list' | 'map'>('list');
  // The hub's Places card lands here with that place already open.
  const [openId, setOpenId] = useState<RestaurantId | null>(location.state?.open ?? null);
  // A slot tapped on a card carries into the sheet; opening a card with nothing tapped shows no slot selected.
  const [picked, setPicked] = useState<Partial<Record<RestaurantId, string | null>>>({});
  const [time, setTime] = useState<string | null>(null);
  const open = restaurants.find((r) => r.id === openId);
  const tag = spotTag(restaurants.findIndex((r) => r.id === openId));

  const openRestaurant = (id: RestaurantId, slot?: string) => { setTime(slot ?? picked[id] ?? null); setOpenId(id); };
  // A slot tapped on a card opens the sheet with it selected.
  const pickSlot = (id: RestaurantId, slot: string) => { setPicked({ ...picked, [id]: slot }); openRestaurant(id, slot); };

  // Walk-in places take the party's own time: the host already chose it on Create Party.
  const book = () => {
    if (!open) return;
    const t = open.reservations ? time : targetTime;
    if (!t) return;
    update({ selectedRestaurant: open.id, selectedTime: t });
    setOpenId(null);
    navigate(open.reservations ? '/org/reserve' : '/org/walk-in');
  };
  const cta = open ? (open.reservations ? (time ? `Book ${time} with ${partner}` : `Book with ${partner}`) : 'Choose this spot') : '';

  return (
    <Screen back title="3 places that work" subtitle="Each one is close to the middle of where everyone's coming from.">
      <Segmented options={[{ value: 'list', label: 'List' }, { value: 'map', label: 'Map' }]} value={view} onChange={setView} />
      {view === 'list'
        ? restaurants.map((r, i) => <RestaurantCard key={r.id} restaurant={r} index={i} picked={picked[r.id] ?? null} onPick={(t) => pickSlot(r.id, t)} onOpen={() => openRestaurant(r.id)} />)
        : <MapView mode="options" height={620} onSelectPin={openRestaurant} />}
      <Sheet open={!!open} onClose={() => setOpenId(null)} title={open?.name} subtitle={open?.cuisine}>
        {open && (
          <>
            <div className="rcard__photo rcard__photo--tall"><img src={open.photo} alt="" /></div>
            <div className="stack" style={{ gap: 6 }}>
              <Chip variant={tag.best ? 'success' : 'neutral'} className="rcard__fair chip--sm">{tag.label}</Chip>
              <p className="t-body">{open.address}</p>
              <p className="t-secondary c-secondary">{open.hours} · {open.reservations ? `Reserve on ${partner}` : 'Walk-in only'}</p>
            </div>
            {open.reservations ? (
              <>
                <p className="t-caption c-secondary">{time ? 'Time' : 'Pick a time'}</p>
                <div className="chip-row">{open.times.map((t) => <Chip key={t} className="chip--time" variant={t === time ? 'selected' : 'neutral'} onClick={() => setTime(t)}>{t}</Chip>)}</div>
              </>
            ) : (
              <p className="t-secondary c-secondary">No reservations here. The group heads over at {targetTime}, the time you set for the party.</p>
            )}
            <Button onClick={book} disabled={open.reservations && !time}>{cta}</Button>
            <Button variant="ghost">See full menu</Button>
          </>
        )}
      </Sheet>
    </Screen>
  );
}
