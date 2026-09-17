// Figma: P 3e — Dropped out
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { GuestRow } from '../../components/GuestRow';
import { guests, party } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function PDropped() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const back = state.guestBooked ? '/p/party' : '/p/waiting';
  return (
    <Screen footer={<Button variant="ghost" onClick={() => { update({ droppedOut: false }); navigate(back); }}>Changed your mind? Rejoin</Button>}>
      <div className="cover"><img src="/photos/cover.jpg" alt="" /></div>
      <div className="screen__title"><h1 className="t-title">{party.name}</h1><p className="t-secondary c-secondary">{party.roughTime}</p></div>
      <div className="card" style={{ background: 'var(--bg-subtle)', borderColor: 'transparent' }}>
        <p className="t-body-med">You're out</p>
        <p className="t-secondary c-secondary">{party.hostFirst}'s been told. If plans change, you can rejoin from this link any time before the dinner.</p>
      </div>
      <div className="card" style={{ padding: '4px 16px' }}><GuestRow guest={guests[0]} right={<Chip variant="info">Host</Chip>} /></div>
    </Screen>
  );
}
