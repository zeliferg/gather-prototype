// Figma: ORG 10 — Party page (confirmed)
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { AvatarStack } from '../../components/Avatar';
import { Cover } from '../../components/Cover';
import { CoverSheet } from '../../components/CoverSheet';
import { ActionSheet } from '../../components/ActionSheet';
import { Notification } from '../../components/Notification';
import { Sheet } from '../../components/Sheet';
import { EditDetails } from '../../components/EditDetails';
import { ChangeReservationSheet } from '../../components/ChangeReservationSheet';
import { PartySizeSheet } from '../../components/PartySizeSheet';
import { Chevron, Info } from '../../components/icons';
import { MenuList } from '../../components/MenuList';
import { PlaceDetails } from '../../components/PlaceDetails';
import { restaurants, sms } from '../../fixtures';
import { usePrototypeState, type CoverChoice } from '../../state';
import { useParty } from '../../party';

export function OrgParty() {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, update, reset] = usePrototypeState();
  const { name, dateShort, dateLong, bookedTime, coming, size } = useParty();
  const r = restaurants.find((x) => x.id === state.selectedRestaurant)!;
  const [banner, setBanner] = useState<boolean>(location.state?.banner === 'reservationChanged');
  const [directions, setDirections] = useState(false);
  const [details, setDetails] = useState<'closed' | 'info' | 'menu'>('closed'); // the booked card's (i): a few lines, then the menu
  // v2: the first time the party page opens after booking, Gather says everyone got the text. Once.
  const [told, setTold] = useState(false);
  useEffect(() => { if (state.bookedTold) return; const t = setTimeout(() => setTold(true), 600); return () => clearTimeout(t); }, [state.bookedTold]);
  const closeTold = useCallback(() => { setTold(false); update({ bookedTold: true }); }, [update]);
  const [editing, setEditing] = useState(false);
  const [changing, setChanging] = useState(false); // ORG 11: Change time or place
  const [sizing, setSizing] = useState(false); // Guests: change party size
  const [coverOpenedOn, setCoverOpenedOn] = useState<CoverChoice | null>(null);
  const [calendar, setCalendar] = useState(false);
  const closeBanner = useCallback(() => setBanner(false), []);
  return (
    <Screen>
      <Cover choice={state.cover}><Chip className="cover__edit" onClick={() => setCoverOpenedOn(state.cover)}>{state.cover === 'none' ? 'Add cover' : 'Edit cover'}</Chip></Cover>
      <div className="screen__title">
        <h1 className="t-title">{name}</h1>
        <div className="row">
          <p className="t-secondary c-secondary">{bookedTime}</p>
          <button className="link t-label" onClick={() => setEditing(true)}>Edit details</button>
        </div>
      </div>
      {/* The booked place looks like a place: its photo with the Booked tag on it, the name, and an (i) for the rest */}
      <div className="card">
        {/* The place itself opens the details drawer (photo), as does the (i) */}
        <button className="rcard__main" aria-label={`${r.name}, reservation details`} onClick={() => setDetails('info')}>
          <div className="rcard__photo booked__photo"><img src={r.photo} alt="" /><Chip variant="success" className="rcard__tag">{r.reservations ? 'Booked' : 'Walk-in'}</Chip></div>
        </button>
        <div className="card__head">
          <div className="stack" style={{ gap: 2, minWidth: 0 }}>
            <p className="t-heading">{r.name}</p>
            <p className="t-secondary c-secondary">{r.address} · Table for {size}</p>
          </div>
          <button className="card__action card__action--filled" aria-label="Reservation details" onClick={() => setDetails('info')}><Info size={18} /></button>
        </div>
        <div className="split">
          <Button variant="secondary" onClick={() => setDirections(true)}>Directions</Button>
          <Button variant="secondary" onClick={() => setCalendar(true)}>Add to calendar</Button>
        </div>
      </div>
      {/* Same anatomy as the hub's Guests card: a header row inside the card, then one tappable row into the list */}
      <div className="card card--compact">
        <div className="card__head"><h2 className="t-heading">Guests</h2></div>
        <button className="guests-row" aria-label="See everyone" onClick={() => setSizing(true)}>
          <AvatarStack guests={coming} max={3} size={32} />
          <span className="t-secondary" style={{ flex: 1, minWidth: 0 }}>{coming.length} coming</span>
          <span className="card__action"><Chevron size={20} /></span>
        </button>
      </div>
      <div className="card card--menu">
        <div className="card__head"><h2 className="t-heading">Reservation</h2></div>
        <button className="row menu-row t-body" onClick={() => setChanging(true)}>Change time or place<span className="card__action"><Chevron size={20} /></span></button>
        <button className="row menu-row t-body" onClick={() => setSizing(true)}>Change party size<span className="card__action"><Chevron size={20} /></span></button>
        <button className="row menu-row t-body" style={{ color: 'var(--error)' }}>Cancel reservation<span className="card__action" style={{ color: 'inherit' }}><Chevron size={20} /></span></button>
      </div>
      <p className="t-caption c-secondary" style={{ textAlign: 'center' }}>Any change texts everyone and updates their calendar invite.</p>
      {/* The end of the flow: a small way back to the start, which also clears everything this tab chose. */}
      <button className="link t-label" style={{ alignSelf: 'center', padding: '4px 12px', marginBottom: 8 }} onClick={() => { reset(); navigate('/org'); }}>Start over</button>
      <Notification open={told && !banner} onClose={closeTold} app="Gather" closeButton closeLabel="Dismiss"
        text={r.reservations ? `${name} is on: ${r.name}, ${dateShort} at ${state.selectedTime}, table for ${size}. Everyone got a text with the details.` : `${name} is on: ${r.name}, ${dateShort} at ${state.selectedTime}. Everyone got a text to head over then.`} />
      <Notification open={banner} onClose={closeBanner} text={`${sms.reservationChanged(name).text} ${r.name}, ${dateShort} at ${state.selectedTime}, table for ${size}. Details: ${sms.reservationChanged(name).link}`} />
      {/* The (i): the place as ORG 6c shows it (photo, tag, address, hours, rating, Website), with the booking as its
          extra line; Directions and the menu at the foot (6 Oct 2026, the same anatomy as the guest's P 9) */}
      <Sheet open={details === 'info'} onClose={() => setDetails('closed')} title={r.name} subtitle={r.cuisine} actions>
        <div className="rcard__photo rcard__photo--tall"><img src={r.photo} alt="" /></div>
        <PlaceDetails restaurant={r} tag={{ label: r.reservations ? 'Booked' : 'Walk-in', best: true }}
          line={`${dateLong} at ${state.selectedTime} · Table for ${size}${r.reservations ? ` · Booked on ${r.partner}` : ' · Walk-in'}`} />
        <div className="sheet__actions">
          <Button onClick={() => { setDetails('closed'); setDirections(true); }}>Directions</Button>
          <Button variant="ghost" onClick={() => setDetails('menu')}>See full menu</Button>
        </div>
      </Sheet>
      <Sheet open={details === 'menu'} onClose={() => setDetails('closed')} title={r.name} subtitle="Menu">
        <MenuList menu={r.menu} />
        <Button variant="ghost" onClick={() => setDetails('info')}>Back</Button>
      </Sheet>
      <EditDetails open={editing} onClose={() => setEditing(false)} subtitle="Everyone gets a text if the date changes."
        onSave={(patch) => { const moved = patch.when !== state.when; update(patch); if (moved) setBanner(true); }} />
      <ChangeReservationSheet open={changing} onClose={() => setChanging(false)} onSaved={() => { setChanging(false); setBanner(true); }} />
      {/* The list is saved either way; if the booked time can't seat the new size, the change drawer takes over. */}
      <PartySizeSheet open={sizing} onClose={() => setSizing(false)} onConfirmed={(fits) => { setSizing(false); if (fits) setBanner(true); else setChanging(true); }} />
      <CoverSheet original={coverOpenedOn} onClose={() => setCoverOpenedOn(null)} />
      <ActionSheet open={directions} onClose={() => setDirections(false)} title={`Open ${r.name} in`}
        options={[{ label: 'Apple Maps' }, { label: 'Google Maps' }, { label: 'Waze' }, { label: 'Copy address' }]} />
      <ActionSheet open={calendar} onClose={() => setCalendar(false)} title={`Add ${name} to`}
        options={[{ label: 'Apple Calendar' }, { label: 'Google Calendar' }, { label: 'Outlook' }, { label: 'Download .ics file' }]} />
    </Screen>
  );
}
