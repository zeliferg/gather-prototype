// Figma: P 3e — Dropped out (+ P 9b Who's coming, without you)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { AvatarStack } from '../../components/Avatar';
import { Sheet } from '../../components/Sheet';
import { GuestRow } from '../../components/GuestRow';
import { Chevron } from '../../components/icons';
import { party } from '../../fixtures';
import { useGuestList } from '../../guest';
import { usePrototypeState } from '../../state';

export function PDropped() {
  const navigate = useNavigate();
  const [, update] = usePrototypeState();
  const [who, setWho] = useState(false);
  const { guests, meId } = useGuestList();
  const others = guests.filter((g) => g.id !== meId);
  return (
    <Screen footer={<Button variant="ghost" onClick={() => { update({ droppedOut: false }); navigate('/p/waiting'); }}>Changed your mind? Rejoin</Button>}>
      <div className="cover"><img src="/photos/cover.jpg" alt="" /></div>
      <div className="screen__title"><h1 className="t-title">{party.name}</h1><p className="t-secondary c-secondary">{party.roughTime}</p></div>
      <div className="card" style={{ background: 'var(--bg-subtle)', borderColor: 'transparent' }}>
        <p className="t-body-med">You're out</p>
        <p className="t-secondary c-secondary">{party.hostFirst}'s been told. If plans change, you can rejoin from this link any time before the dinner.</p>
      </div>
      <div className="row">
        <h2 className="t-heading">Who's coming</h2>
        <button className="hstack link t-label" onClick={() => setWho(true)}>See everyone <Chevron size={18} /></button>
      </div>
      <AvatarStack guests={others} />
      <Sheet open={who} onClose={() => setWho(false)} title="Who's coming" subtitle={`${others.length} people, without you`}>
        <div className="list">
          {others.map((g) => <GuestRow key={g.id} guest={g} right={g.status === 'host' ? <Chip variant="info">Host</Chip> : null} />)}
        </div>
      </Sheet>
    </Screen>
  );
}
