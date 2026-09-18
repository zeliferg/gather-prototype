// Figma: P 3b — Party page (waiting, then booked) (+ P 3d Can't make it sheet)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Input } from '../../components/Input';
import { Sheet } from '../../components/Sheet';
import { ActionSheet } from '../../components/ActionSheet';
import { GuestRow } from '../../components/GuestRow';
import { DevHint } from '../../components/DevHint';
import { Chevron } from '../../components/icons';
import { guests, party, radiusOptions, restaurants } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function PWaiting() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const [leaving, setLeaving] = useState(false);
  const [directions, setDirections] = useState(false);
  const [calendar, setCalendar] = useState(false);
  const [note, setNote] = useState('Sorry, a work thing came up');
  const radius = radiusOptions.find((o) => o.value === state.radiusMi)!.label;
  const r = restaurants.find((x) => x.id === state.selectedRestaurant)!;
  const booked = state.guestBooked;

  return (
    <Screen footer={<>
      <Button variant="ghost" onClick={() => setLeaving(true)}>Can't make it? Let {party.hostFirst} know</Button>
    </>}>
      <div className="cover"><img src="/photos/cover.jpg" alt="" /></div>
      <div className="screen__title"><h1 className="t-title">{party.name}</h1><p className="t-secondary c-secondary">{booked ? `${party.dateLong} at ${state.selectedTime}` : party.roughTime}</p></div>
      {booked ? (
        <div className="card">
          <div className="row"><Chip variant="success">Booked</Chip><span className="t-caption c-secondary">Table for {party.size}</span></div>
          <p className="t-heading">{r.name}</p>
          <p className="t-secondary c-secondary">{r.address}. {r.hours}.</p>
          <div className="hstack">
            <Button variant="secondary" inline onClick={() => setDirections(true)}>Directions</Button>
            <Button variant="secondary" inline onClick={() => setCalendar(true)}>Add to calendar</Button>
          </div>
          <button className="hstack link t-label" onClick={() => navigate('/p/party')}>See the details <Chevron size={18} /></button>
        </div>
      ) : (
        <div className="card" style={{ background: 'var(--bg-accent-tint)', borderColor: 'transparent' }}>
          <p className="t-body-med">You're in</p>
          <p className="t-secondary c-secondary">{party.hostFirst} is picking a place. We'll text you the moment it's booked.</p>
        </div>
      )}
      <div className="card" style={{ padding: '4px 16px' }}><GuestRow guest={guests[0]} right={<Chip variant="info">Host</Chip>} /></div>
      <div className="card">
        <div className="row"><span className="t-body-med">Your info</span><button className="link t-label" onClick={() => navigate('/p/edit')}>Edit</button></div>
        <p className="t-secondary c-secondary">{state.flexible && !state.locationSet ? "You're flexible." : `${state.locationMode === 'pin' ? 'RiNo' : 'Downtown'}, within ${radius}.`}{state.prefs.length ? ` ${state.prefs.join(', ')}.` : ''}</p>
      </div>
      {!booked && <p className="t-caption c-secondary" style={{ textAlign: 'center' }}>Only the host sees who has responded.</p>}
      {booked && <DevHint to="/p/sms-after">the morning after</DevHint>}

      <ActionSheet open={directions} onClose={() => setDirections(false)} title={`Open ${r.name} in`}
        options={[{ label: 'Apple Maps' }, { label: 'Google Maps' }, { label: 'Waze' }, { label: 'Copy address' }]} />
      <ActionSheet open={calendar} onClose={() => setCalendar(false)} title={`Add ${party.name} to`}
        options={[{ label: 'Apple Calendar' }, { label: 'Google Calendar' }, { label: 'Outlook' }, { label: 'Download .ics file' }]} />
      <Sheet open={leaving} onClose={() => setLeaving(false)} title="Can't make it?" subtitle={`We'll take you off the headcount and let ${party.hostFirst} know. If plans change again, rejoin from your link.`}>
        <Input label={`Add a note for ${party.hostFirst} (optional)`} value={note} onChange={setNote} />
        <Button variant="danger" onClick={() => { update({ droppedOut: true }); setLeaving(false); navigate('/p/dropped'); }}>I can't make it</Button>
        <Button variant="ghost" onClick={() => setLeaving(false)}>Never mind</Button>
      </Sheet>
    </Screen>
  );
}
