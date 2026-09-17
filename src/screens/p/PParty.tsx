// Figma: P 9 — Party is here (+ P 9b Who's coming, P 9c Directions, P 9d Add to calendar, P 3d Can't make it)
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Avatar } from '../../components/Avatar';
import { Input } from '../../components/Input';
import { Sheet } from '../../components/Sheet';
import { ActionSheet } from '../../components/ActionSheet';
import { GuestRow } from '../../components/GuestRow';
import { DevHint } from '../../components/DevHint';
import { Chevron } from '../../components/icons';
import { guests, me, party, restaurants } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function PParty() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const r = restaurants.find((x) => x.id === state.selectedRestaurant)!;
  const [who, setWho] = useState(false);
  const [directions, setDirections] = useState(false);
  const [calendar, setCalendar] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [note, setNote] = useState('Sorry, a work thing came up');
  useEffect(() => { if (!state.booked) update({ booked: true }); }, [state.booked, update]);

  return (
    <Screen footer={<Button variant="ghost" onClick={() => setLeaving(true)}>Can't make it? Let {party.hostFirst} know</Button>}>
      <div className="cover"><img src={r.photo} alt="" /></div>
      <div className="stack">
        <Chip variant="success" className="rcard__fair">Booked</Chip>
        <h1 className="t-title">{r.name}</h1>
        <p className="t-body">{party.dateLong} at {state.selectedTime}. Table for {party.size}.</p>
        <p className="t-secondary c-secondary">{r.address}.</p>
      </div>
      <div className="hstack">
        <Button variant="secondary" onClick={() => setDirections(true)}>Directions</Button>
        <Button variant="secondary" onClick={() => setCalendar(true)}>Add to calendar</Button>
      </div>
      <div className="row">
        <h2 className="t-heading">Who's coming</h2>
        <button className="hstack link t-label" onClick={() => setWho(true)}>See everyone <Chevron size={18} /></button>
      </div>
      <div className="avatar-stack">
        {guests.slice(0, 3).map((g) => <Avatar key={g.id} initial={g.initial} />)}
        <span className="avatar avatar--more t-label" style={{ width: 40, height: 40 }}>+{guests.length - 3}</span>
      </div>
      <DevHint to="/p/sms-after">the morning after</DevHint>

      <Sheet open={who} onClose={() => setWho(false)} title="Who's coming" subtitle={`${guests.length} people, including you`}>
        <div className="list">
          {guests.map((g) => <GuestRow key={g.id} guest={g} right={g.status === 'host' ? <Chip variant="info">Host</Chip> : g.id === me.id ? <Chip>You</Chip> : null} />)}
        </div>
      </Sheet>
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
