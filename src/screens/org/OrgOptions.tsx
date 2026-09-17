// Figma: ORG 6 — Options, ORG 6b — Options (Map), ORG 6c — Restaurant detail (sheet)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Segmented } from '../../components/Segmented';
import { Sheet } from '../../components/Sheet';
import { MapView } from '../../components/MapView';
import { RestaurantCard } from '../../components/RestaurantCard';
import { restaurants, type RestaurantId } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function OrgOptions() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const [view, setView] = useState<'list' | 'map'>('list');
  const [openId, setOpenId] = useState<RestaurantId | null>(null);
  const open = restaurants.find((r) => r.id === openId);
  const time = state.selectedTime;

  const openRestaurant = (id: RestaurantId) => {
    const r = restaurants.find((x) => x.id === id);
    if (r && !r.times.includes(state.selectedTime)) update({ selectedTime: r.times[0] });
    setOpenId(id);
  };

  const book = () => {
    if (!open) return;
    update({ selectedRestaurant: open.id });
    setOpenId(null);
    navigate(open.reservations ? '/org/reserve' : '/org/walk-in');
  };

  return (
    <Screen back title="3 places that work" subtitle="Fair for where everyone's coming from.">
      <Segmented options={[{ value: 'list', label: 'List' }, { value: 'map', label: 'Map' }]} value={view} onChange={setView} />
      {view === 'list'
        ? restaurants.map((r) => <RestaurantCard key={r.id} restaurant={r} onOpen={() => openRestaurant(r.id)} />)
        : <MapView mode="options" height={620} onSelectPin={openRestaurant} />}
      <Sheet open={!!open} onClose={() => setOpenId(null)} title={open?.name}>
        {open && (
          <>
            <div className="rcard__photo rcard__photo--tall"><img src={open.photo} alt="" /></div>
            <Chip variant="success" className="rcard__fair">Fair for everyone</Chip>
            <p className="t-secondary c-secondary">{open.cuisine}. {open.address}. {open.hours}.</p>
            <p className="t-caption c-secondary">{open.reservations ? 'Available tonight' : 'Walk-in only'}</p>
            <div className="chip-row">{open.times.map((t) => <Chip key={t} variant={t === time ? 'selected' : 'neutral'} onClick={() => update({ selectedTime: t })}>{t}</Chip>)}</div>
            <Button onClick={book}>{open.reservations ? `Book ${time} with [Partner]` : `Set ${time} for the group`}</Button>
            <Button variant="ghost">See full menu</Button>
          </>
        )}
      </Sheet>
    </Screen>
  );
}
