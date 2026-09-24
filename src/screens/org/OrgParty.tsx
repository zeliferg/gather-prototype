// Figma: ORG 10 — Party page (confirmed)
import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { AvatarStack } from '../../components/Avatar';
import { Cover } from '../../components/Cover';
import { CoverSheet } from '../../components/CoverSheet';
import { ActionSheet } from '../../components/ActionSheet';
import { Notification } from '../../components/Notification';
import { EditDetails } from '../../components/EditDetails';
import { ChangeReservationSheet } from '../../components/ChangeReservationSheet';
import { PartySizeSheet } from '../../components/PartySizeSheet';
import { Chevron } from '../../components/icons';
import { restaurants, sms } from '../../fixtures';
import { usePrototypeState, type CoverChoice } from '../../state';
import { useParty } from '../../party';

export function OrgParty() {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, update, reset] = usePrototypeState();
  const { name, dateShort, bookedTime, coming, size } = useParty();
  const r = restaurants.find((x) => x.id === state.selectedRestaurant)!;
  const [banner, setBanner] = useState<boolean>(location.state?.banner === 'reservationChanged');
  const [directions, setDirections] = useState(false);
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
      <div className="card">
        <div className="card__head"><Chip variant="success">Booked</Chip><span className="t-caption c-secondary">Table for {size}</span></div>
        <div className="stack" style={{ gap: 2 }}>
          <p className="t-heading">{r.name}</p>
          <p className="t-secondary c-secondary">{r.address}. {r.hours}.</p>
        </div>
        <div className="split">
          <Button variant="secondary" onClick={() => setDirections(true)}>Directions</Button>
          <Button variant="secondary" onClick={() => setCalendar(true)}>Add to calendar</Button>
        </div>
      </div>
      {/* Same anatomy as the hub's Guests card: a header row inside the card, then one tappable row into the list */}
      <div className="card">
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
      <Notification open={banner} onClose={closeBanner} text={`${sms.reservationChanged(name).text} ${r.name}, ${dateShort} at ${state.selectedTime}, table for ${size}. Details: ${sms.reservationChanged(name).link}`} />
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
