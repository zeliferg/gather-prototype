// Figma: ORG 10 — Party page (confirmed)
import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { AvatarStack } from '../../components/Avatar';
import { Cover } from '../../components/Cover';
import { ActionSheet } from '../../components/ActionSheet';
import { Notification } from '../../components/Notification';
import { Chevron } from '../../components/icons';
import { restaurants, sms } from '../../fixtures';
import { usePrototypeState } from '../../state';
import { useParty } from '../../party';

export function OrgParty() {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, , reset] = usePrototypeState();
  const { name, dateShort, bookedTime, coming, size } = useParty();
  const r = restaurants.find((x) => x.id === state.selectedRestaurant)!;
  const [banner, setBanner] = useState<boolean>(location.state?.banner === 'reservationChanged');
  const [directions, setDirections] = useState(false);
  const [calendar, setCalendar] = useState(false);
  const closeBanner = useCallback(() => setBanner(false), []);
  return (
    <Screen>
      <Cover choice={state.cover} />
      <div className="screen__title">
        <h1 className="t-title">{name}</h1>
        <p className="t-secondary c-secondary">{bookedTime}</p>
      </div>
      <div className="card">
        <div className="row"><Chip variant="success">Booked</Chip><span className="t-caption c-secondary">Table for {size}</span></div>
        <p className="t-heading">{r.name}</p>
        <p className="t-secondary c-secondary">{r.address}. {r.hours}.</p>
        <div className="hstack">
          <Button variant="secondary" inline onClick={() => setDirections(true)}>Directions</Button>
          <Button variant="secondary" inline onClick={() => setCalendar(true)}>Add to calendar</Button>
        </div>
      </div>
      <div className="row"><h2 className="t-heading">Guests</h2><AvatarStack guests={coming} size={32} /></div>
      <div className="card" style={{ gap: 0, padding: '0 16px' }}>
        <button className="row menu-row t-body" onClick={() => navigate('/org/edit')}>Change time or place<Chevron size={20} /></button>
        <button className="row menu-row t-body" onClick={() => navigate('/org/edit', { state: { focus: 'size' } })}>Change party size<Chevron size={20} /></button>
        <button className="row menu-row t-body" style={{ color: 'var(--error)' }}>Cancel reservation<Chevron size={20} /></button>
      </div>
      <p className="t-caption c-secondary" style={{ textAlign: 'center' }}>Any change texts everyone and updates their calendar invite.</p>
      {/* The end of the flow: a small way back to the start, which also clears everything this tab chose. */}
      <button className="link t-label" style={{ alignSelf: 'center', padding: '4px 12px', marginBottom: 8 }} onClick={() => { reset(); navigate('/org'); }}>Start over</button>
      <Notification open={banner} onClose={closeBanner} text={`${sms.reservationChanged.text} ${r.name}, ${dateShort} at ${state.selectedTime}. Details: ${sms.reservationChanged.link}`} />
      <ActionSheet open={directions} onClose={() => setDirections(false)} title={`Open ${r.name} in`}
        options={[{ label: 'Apple Maps' }, { label: 'Google Maps' }, { label: 'Waze' }, { label: 'Copy address' }]} />
      <ActionSheet open={calendar} onClose={() => setCalendar(false)} title={`Add ${name} to`}
        options={[{ label: 'Apple Calendar' }, { label: 'Google Calendar' }, { label: 'Outlook' }, { label: 'Download .ics file' }]} />
    </Screen>
  );
}
