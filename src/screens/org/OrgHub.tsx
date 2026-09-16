// Figma: ORG 4 — Invite & Party Details (+ ORG 4c See everyone, ORG 4e Reminder sent)
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Avatar } from '../../components/Avatar';
import { Sheet } from '../../components/Sheet';
import { GuestRow } from '../../components/GuestRow';
import { Chevron, Plus } from '../../components/icons';
import { guests, party } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function OrgHub() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const [everyone, setEveryone] = useState(false);
  const [sending, setSending] = useState(false);
  const [ready, setReady] = useState(false);
  const responded = state.everyoneIn ? guests.length : guests.filter((g) => g.status !== 'waiting').length;
  const waiting = guests.filter((g) => g.status === 'waiting');

  useEffect(() => {
    if (!sending) return;
    const t = setTimeout(() => { update({ everyoneIn: true }); navigate('/org/list-ready'); }, 1400);
    return () => clearTimeout(t);
  }, [sending, navigate, update]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const remindOne = (id: string) => update({ remindedIds: [...state.remindedIds, id] });

  return (
    <Screen footer={<>
      <Button variant="secondary" onClick={() => setSending(true)} disabled={sending}>Remind the {waiting.length} who haven't</Button>
      <Button>Share invite link</Button>
    </>}>
      <div className="cover">
        <img src="/photos/cover.jpg" alt="" />
        <Chip className="cover__edit">Edit cover</Chip>
      </div>
      <div className="screen__title">
        <h1 className="t-title">{party.name}</h1>
        <p className="t-secondary c-secondary">{party.roughTime}</p>
      </div>
      <div className="card row">
        <div className="stack" style={{ gap: 2 }}><span className="t-caption c-secondary">Invite link</span><span className="t-body-med">{party.inviteLink}</span></div>
        <button className="link t-body-med">Copy</button>
      </div>
      <div className="row">
        <h2 className="t-heading">Guests</h2>
        <button className="icon-btn icon-btn--right" aria-label="Add a guest"><Plus /></button>
      </div>
      <div className="card">
        <div className="row">
          <div className="avatar-stack">{guests.slice(0, 4).map((g) => <Avatar key={g.id} initial={g.initial} />)}</div>
          <button className="hstack link t-label" onClick={() => setEveryone(true)}>See everyone <Chevron size={18} /></button>
        </div>
        <p className="t-secondary">{sending || state.everyoneIn ? guests.length : responded} of {guests.length} have responded</p>
        <div className="progress"><span className="progress__bar" style={{ width: `${ready ? (((sending || state.everyoneIn ? guests.length : responded) / guests.length) * 100) : 0}%` }} /></div>
      </div>
      <Sheet open={everyone} onClose={() => { setEveryone(false); update({ remindedIds: [] }); }} title="Guests" subtitle={`${responded} of ${guests.length} have responded`}>
        <div className="list">
          {guests.map((g) => (
            <GuestRow key={g.id} guest={g} right={
              g.status === 'host' ? <Chip variant="info">Host</Chip>
              : g.status === 'responded' || state.everyoneIn ? <Chip variant="success">Responded</Chip>
              : state.remindedIds.includes(g.id) ? <Chip variant="success" className="chip--swap">Reminder sent</Chip>
              : <><button className="link t-label" onClick={() => remindOne(g.id)}>Remind</button><Chip>Waiting</Chip></>
            } />
          ))}
        </div>
      </Sheet>
    </Screen>
  );
}
