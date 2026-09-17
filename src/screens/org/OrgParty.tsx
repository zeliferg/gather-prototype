// Figma: ORG 10 — Party page (confirmed)
import { useState } from 'react';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Avatar } from '../../components/Avatar';
import { ActionSheet } from '../../components/ActionSheet';
import { DevHint } from '../../components/DevHint';
import { Chevron } from '../../components/icons';
import { guests, party, restaurants } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function OrgParty() {
  const [state] = usePrototypeState();
  const r = restaurants.find((x) => x.id === state.selectedRestaurant)!;
  const [directions, setDirections] = useState(false);
  const [calendar, setCalendar] = useState(false);
  return (
    <Screen title={party.name} subtitle={`${party.dateLong} at ${state.selectedTime}`}>
      <div className="card">
        <div className="row"><Chip variant="success">Booked</Chip><span className="t-caption c-secondary">Table for {party.size}</span></div>
        <p className="t-heading">{r.name}</p>
        <p className="t-secondary c-secondary">{r.address}. Fair for everyone.</p>
        <div className="hstack">
          <Button variant="secondary" inline onClick={() => setDirections(true)}>Directions</Button>
          <Button variant="secondary" inline onClick={() => setCalendar(true)}>Add to calendar</Button>
        </div>
      </div>
      <div className="row"><h2 className="t-heading">Guests</h2><div className="avatar-stack">{guests.map((g) => <Avatar key={g.id} initial={g.initial} size={32} />)}</div></div>
      <div className="card" style={{ gap: 0, padding: '0 16px' }}>
        {['Change time or place', 'Change party size'].map((l) => <button key={l} className="row menu-row t-body">{l}<Chevron size={20} /></button>)}
        <button className="row menu-row t-body" style={{ color: 'var(--error)' }}>Cancel reservation<Chevron size={20} /></button>
      </div>
      <p className="t-caption c-secondary" style={{ textAlign: 'center' }}>Any change texts everyone and updates their calendar invite.</p>
      <DevHint to="/org/sms-after">the morning after</DevHint>
      <ActionSheet open={directions} onClose={() => setDirections(false)} title={`Open ${r.name} in`}
        options={[{ label: 'Apple Maps' }, { label: 'Google Maps' }, { label: 'Waze' }, { label: 'Copy address' }]} />
      <ActionSheet open={calendar} onClose={() => setCalendar(false)} title={`Add ${party.name} to`}
        options={[{ label: 'Apple Calendar' }, { label: 'Google Calendar' }, { label: 'Outlook' }, { label: 'Download .ics file' }]} />
    </Screen>
  );
}
