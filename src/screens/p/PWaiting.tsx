// Figma: P 3b — Party page (waiting) (+ P 3d Can't make it sheet)
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Input } from '../../components/Input';
import { Sheet } from '../../components/Sheet';
import { GuestRow } from '../../components/GuestRow';
import { DevHint } from '../../components/DevHint';
import { guests, party, radiusOptions } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function PWaiting() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const [leaving, setLeaving] = useState(false);
  const [note, setNote] = useState('Sorry, a work thing came up');
  const [booked, setBooked] = useState(false);
  const radius = radiusOptions.find((o) => o.value === state.radiusMi)!.label;

  useEffect(() => { const t = setTimeout(() => setBooked(true), 2500); return () => clearTimeout(t); }, []);

  return (
    <Screen footer={<>
      <Button variant="ghost" onClick={() => setLeaving(true)}>Can't make it anymore? Let {party.hostFirst} know</Button>
      <p className="t-caption c-secondary" style={{ textAlign: 'center' }}>Only the host sees who has responded.</p>
    </>}>
      <div className="cover"><img src="/photos/cover.jpg" alt="" /></div>
      <div className="screen__title"><h1 className="t-title">{party.name}</h1><p className="t-secondary c-secondary">{party.roughTime}</p></div>
      {booked ? (
        <Link to="/p/sms-confirmed" className="card banner" style={{ background: 'var(--bg-accent-tint)', borderColor: 'transparent', textDecoration: 'none', color: 'inherit' }}>
          <p className="t-body-med">{party.hostFirst} booked a spot</p>
          <p className="t-secondary c-secondary">You've got a text with the details. Open it →</p>
        </Link>
      ) : (
        <div className="card" style={{ background: 'var(--bg-accent-tint)', borderColor: 'transparent' }}>
          <p className="t-body-med">You're in</p>
          <p className="t-secondary c-secondary">{party.hostFirst} is picking a place. We'll text you the moment it's booked.</p>
        </div>
      )}
      <div className="card" style={{ padding: '4px 16px' }}><GuestRow guest={guests[0]} right={<Chip variant="info">Host</Chip>} /></div>
      <div className="card">
        <div className="row"><span className="t-body-med">Your info</span><button className="link t-label">Edit</button></div>
        <p className="t-secondary c-secondary">{state.flexible ? "You're flexible." : `${state.locationMode === 'pin' ? 'RiNo' : 'Downtown'}, within ${radius}.`} Vegetarian, $$.</p>
      </div>
      <DevHint to="/p/sms-confirmed">{party.hostFirst} books a spot</DevHint>
      <Sheet open={leaving} onClose={() => setLeaving(false)} title="Can't make it?" subtitle={`We'll take you off the headcount and let ${party.hostFirst} know. If plans change again, rejoin from your link.`}>
        <Input label={`Add a note for ${party.hostFirst} (optional)`} value={note} onChange={setNote} />
        <Button variant="danger" onClick={() => { update({ droppedOut: true }); setLeaving(false); navigate('/p/dropped'); }}>I can't make it</Button>
        <Button variant="ghost" onClick={() => setLeaving(false)}>Never mind</Button>
      </Sheet>
    </Screen>
  );
}
