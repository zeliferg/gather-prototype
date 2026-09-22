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
import { Calendar, Clock, MapPin } from '../../components/icons';
import { partner, restaurants, type RestaurantId } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function OrgOptions() {
  const navigate = useNavigate();
  const location = useLocation();
  const [, update] = usePrototypeState();
  const [view, setView] = useState<'list' | 'map'>('list');
  // The hub's Places card lands here with that place already open.
  const [openId, setOpenId] = useState<RestaurantId | null>(location.state?.open ?? null);
  // A slot tapped on a card carries into the sheet; opening a card with nothing tapped shows no slot selected.
  const [picked, setPicked] = useState<Partial<Record<RestaurantId, string | null>>>({});
  const [time, setTime] = useState<string | null>(null);
  const open = restaurants.find((r) => r.id === openId);

  const openRestaurant = (id: RestaurantId) => { setTime(picked[id] ?? null); setOpenId(id); };

  const book = () => {
    if (!open || !time) return;
    update({ selectedRestaurant: open.id, selectedTime: time });
    setOpenId(null);
    navigate(open.reservations ? '/org/reserve' : '/org/walk-in');
  };
  const cta = open ? (open.reservations
    ? (time ? `Book ${time} with ${partner}` : `Book with ${partner}`)
    : (time ? `Set ${time} for the group` : 'Set a time for the group')) : '';

  return (
    <Screen back title="3 places that work" subtitle="Each one is close to the middle of where everyone's coming from.">
      <Segmented options={[{ value: 'list', label: 'List' }, { value: 'map', label: 'Map' }]} value={view} onChange={setView} />
      {view === 'list'
        ? restaurants.map((r) => <RestaurantCard key={r.id} restaurant={r} picked={picked[r.id] ?? null} onPick={(t) => setPicked({ ...picked, [r.id]: t })} onOpen={() => openRestaurant(r.id)} />)
        : <MapView mode="options" height={620} onSelectPin={openRestaurant} />}
      <Sheet open={!!open} onClose={() => setOpenId(null)} title={open?.name} subtitle={open?.cuisine}>
        {open && (
          <>
            <div className="rcard__photo rcard__photo--tall"><img src={open.photo} alt="" /></div>
            <Chip variant="success" className="rcard__fair">Close to everyone</Chip>
            <div className="list">
              <div className="info-row"><span className="info-row__icon"><MapPin size={20} /></span><div className="stack" style={{ gap: 0 }}><span className="t-caption c-secondary">Address</span><span className="t-body">{open.address}</span></div></div>
              <div className="info-row"><span className="info-row__icon"><Clock size={20} /></span><div className="stack" style={{ gap: 0 }}><span className="t-caption c-secondary">Hours</span><span className="t-body">{open.hours}</span></div></div>
              <div className="info-row"><span className="info-row__icon"><Calendar size={20} /></span><div className="stack" style={{ gap: 0 }}><span className="t-caption c-secondary">Booking</span><span className="t-body">{open.reservations ? `Reserve on ${partner}` : 'Walk-in only'}</span></div></div>
            </div>
            <p className="t-caption c-secondary">{open.reservations ? 'Available tonight' : 'Walk-in only'}{time ? '' : ' · pick a time'}</p>
            <div className="chip-row">{open.times.map((t) => <Chip key={t} className="chip--lg" variant={t === time ? 'selected' : 'neutral'} onClick={() => setTime(t)}>{t}</Chip>)}</div>
            <Button onClick={book} disabled={!time}>{cta}</Button>
            <Button variant="ghost">See full menu</Button>
          </>
        )}
      </Sheet>
    </Screen>
  );
}
