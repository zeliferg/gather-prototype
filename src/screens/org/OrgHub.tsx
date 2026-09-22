// Figma: ORG 4 — Invite & Party Details (+ ORG 4b Add a guest, ORG 4c See everyone, ORG 4d Edit cover, ORG 4e Reminder sent)
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { AvatarStack } from '../../components/Avatar';
import { Sheet } from '../../components/Sheet';
import { ActionSheet } from '../../components/ActionSheet';
import { Input } from '../../components/Input';
import { Cover } from '../../components/Cover';
import { CoverSheet } from '../../components/CoverSheet';
import { PreferencesSheet } from '../../components/Preferences';
import { Notification } from '../../components/Notification';
import { GuestRow } from '../../components/GuestRow';
import { Chevron, Plus } from '../../components/icons';
import { formatPhone, isCompletePhone } from '../../components/phone';
import { party, restaurants, sms, type Guest } from '../../fixtures';
import { usePrototypeState, type CoverChoice } from '../../state';
import { useParty } from '../../party';

export function OrgHub() {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, update] = usePrototypeState();
  const { name, roughTime, coming, out } = useParty();
  const [banner, setBanner] = useState<boolean>(location.state?.banner === 'manageLink');
  const [everyone, setEveryone] = useState(false);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [coverOpenedOn, setCoverOpenedOn] = useState<CoverChoice | null>(null);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [acting, setActing] = useState<Guest | null>(null); // the guest whose action sheet is open
  const [draft, setDraft] = useState({ name, when: state.when || party.whenIso });
  const [invited, setInvited] = useState<string | null>(null);
  const [newGuest, setNewGuest] = useState({ name: '', phone: '' });
  const respondedCount = sending || state.everyoneIn ? coming.length : coming.filter((g) => g.status !== 'waiting').length;
  const waiting = coming.length - coming.filter((g) => g.status !== 'waiting').length;
  const closeBanner = useCallback(() => setBanner(false), []);
  const closeInvited = useCallback(() => setInvited(null), []);
  const guestReady = newGuest.name.trim() !== '' && isCompletePhone(newGuest.phone);
  const countLine = `${respondedCount} of ${coming.length} responded`;
  const sheetLine = `${countLine}${out.length ? ` · ${out.length} can't make it` : ''}`;

  useEffect(() => {
    if (!sending) return;
    const t = setTimeout(() => { update({ everyoneIn: true }); navigate('/org/list-ready'); }, 1400);
    return () => clearTimeout(t);
  }, [sending, navigate, update]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const remindOne = (id: string) => update({ remindedIds: [...state.remindedIds, id] });
  const removeOne = (id: string) => update({ removedIds: [...state.removedIds, id] });
  const url = `https://${party.inviteLink}`;
  const copy = async () => { try { await navigator.clipboard.writeText(url); } catch { /* no clipboard */ } setCopied(true); };
  const share = async () => {
    if (navigator.share) { try { await navigator.share({ title: name, text: `Join ${name}`, url }); return; } catch { /* dismissed */ } }
    copy();
  };
  const addGuest = () => {
    const n = newGuest.name.trim();
    update({ addedGuests: [...state.addedGuests, { id: `added-${Date.now()}`, name: n, initial: n[0].toUpperCase() }] });
    setNewGuest({ name: '', phone: '' });
    setAdding(false);
    setBanner(false); // one banner at a time
    setInvited(n);
  };
  const statusChip = (g: Guest) =>
    g.status === 'host' ? <Chip variant="info">Host</Chip>
    : g.status === 'out' ? <Chip variant="danger">Can't make it</Chip>
    : g.status === 'responded' || state.everyoneIn ? <Chip variant="success">Responded</Chip>
    : state.remindedIds.includes(g.id) ? <Chip variant="success" className="chip--swap">Reminder sent</Chip>
    : <Chip>Waiting</Chip>;
  const canRemind = (g: Guest) => g.status === 'waiting' && !state.everyoneIn && !state.remindedIds.includes(g.id);

  return (
    <Screen footer={state.everyoneIn ? <Button onClick={() => navigate('/org/options')}>Browse places</Button> : <>
      <Button variant="secondary" onClick={() => setSending(true)} disabled={sending || waiting === 0}>Remind the {waiting} who haven't</Button>
      <Button onClick={share}>Share invite link</Button>
    </>}>
      <Cover choice={state.cover}><Chip className="cover__edit" onClick={() => setCoverOpenedOn(state.cover)}>{state.cover === 'none' ? 'Add cover' : 'Edit cover'}</Chip></Cover>
      <div className="screen__title">
        <h1 className="t-title">{name}</h1>
        <div className="row">
          <p className="t-secondary c-secondary">{roughTime}</p>
          <button className="link t-label" onClick={() => { setDraft({ name, when: state.when || party.whenIso }); setEditing(true); }}>Edit details</button>
        </div>
        {/* The host's preferences from Create Party, when there are any; tap to change them */}
        {state.hostPrefs.length > 0 && (
          <button className="chip-row" aria-label="Preferences" onClick={() => setPrefsOpen(true)} style={{ marginTop: 6 }}>
            {state.hostPrefs.map((p) => <Chip key={p} className="chip--sm">{p}</Chip>)}
          </button>
        )}
      </div>
      {state.everyoneIn ? (
        /* Everyone's in: the places lead, as one card and one tap. Inviting is over, so the link card and + go. */
        <button className="card places" onClick={() => navigate('/org/options')}>
          <span className="row"><span className="t-heading">3 places that work</span><span className="c-secondary" style={{ display: 'grid' }}><Chevron size={20} /></span></span>
          <span className="t-secondary c-secondary">Close to the middle of where everyone's coming from.</span>
          <span className="stack" style={{ gap: 0, marginTop: 4 }}>
            {restaurants.map((r) => (
              <span key={r.id} className="place-row">
                <span className="place-row__thumb"><img src={r.photo} alt="" /></span>
                <span className="stack" style={{ gap: 0, minWidth: 0 }}>
                  <span className="t-body-med ellipsis">{r.name}</span>
                  <span className="t-caption c-secondary">{r.cuisine} · {r.reservations ? 'Reserve' : 'Walk-in'}</span>
                </span>
              </span>
            ))}
          </span>
        </button>
      ) : (
        <div className="card row">
          <div className="stack" style={{ gap: 2 }}><span className="t-caption c-secondary">Invite link</span><span className="t-body-med">{party.inviteLink}</span></div>
          <button className="link t-body-med" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
        </div>
      )}
      <div className="row">
        <h2 className="t-heading">Guests</h2>
        {!state.everyoneIn && <button className="icon-btn icon-btn--right icon-btn--filled" aria-label="Add a guest" onClick={() => setAdding(true)}><Plus /></button>}
      </div>
      {/* One row, one tap: three faces, the count, a chevron into See everyone */}
      <button className="card guests" aria-label="See everyone" onClick={() => setEveryone(true)}>
        <AvatarStack guests={coming} max={3} size={32} />
        <span className="t-secondary" style={{ flex: 1, minWidth: 0 }}>{state.everyoneIn ? "Everyone's in" : countLine}</span>
        <span className="c-secondary" style={{ display: 'grid' }}><Chevron size={20} /></span>
      </button>

      <Notification open={banner} onClose={closeBanner} text={`${sms.manageLink(name).text} ${sms.manageLink(name).link}`} />
      <Notification open={invited !== null} onClose={closeInvited} app="Gather" autoHideMs={0} closeButton text={`Invite sent to ${invited ?? ''}. They'll get a text with the link.`} />

      {/* ORG 4c: tap a guest for their actions; anyone who can't make it sits in their own group */}
      <Sheet open={everyone} onClose={() => { setEveryone(false); update({ remindedIds: [] }); }} title="Guests" subtitle={sheetLine}>
        <div className="list">
          {coming.map((g) => (
            <GuestRow key={g.id} guest={g} right={statusChip(g)} onClick={g.status === 'host' ? undefined : () => setActing(g)} />
          ))}
        </div>
        {out.length > 0 && (
          <>
            <p className="t-caption c-secondary">Can't make it</p>
            <div className="list">
              {out.map((g) => <GuestRow key={g.id} guest={g} muted right={statusChip(g)} onClick={() => setActing(g)} />)}
            </div>
          </>
        )}
      </Sheet>
      <ActionSheet open={acting !== null} onClose={() => setActing(null)} title={acting?.name ?? ''}
        options={[
          ...(acting && canRemind(acting) ? [{ label: 'Send a reminder', onSelect: () => remindOne(acting.id) }] : []),
          { label: 'Remove from the party', danger: true, onSelect: () => acting && removeOne(acting.id) },
        ]} />

      <Sheet open={editing} onClose={() => setEditing(false)} title="Edit details" subtitle="Everyone gets a text if the time changes.">
        <Input label="Party name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} placeholder="Party name" />
        <Input label="When" type="datetime-local" value={draft.when} onChange={(v) => setDraft({ ...draft, when: v })} />
        <Button onClick={() => { update({ partyName: draft.name, when: draft.when }); setEditing(false); }} disabled={draft.name.trim() === '' || draft.when === ''}>Save</Button>
      </Sheet>

      {/* ORG 4b */}
      <Sheet open={adding} onClose={() => setAdding(false)} title="Add a guest" subtitle="They'll get a text with the invite link.">
        <Input label="Name" value={newGuest.name} onChange={(v) => setNewGuest({ ...newGuest, name: v })} placeholder="Name" />
        <Input label="Phone" value={newGuest.phone} onChange={(v) => setNewGuest({ ...newGuest, phone: formatPhone(v) })} type="tel" inputMode="tel" placeholder="(111) 111-1111" />
        <Button onClick={addGuest} disabled={!guestReady}>Send invite</Button>
        <Button variant="secondary">Choose from contacts</Button>
      </Sheet>

      {/* ORG 4d */}
      <CoverSheet original={coverOpenedOn} onClose={() => setCoverOpenedOn(null)} />
      <PreferencesSheet open={prefsOpen} onClose={() => setPrefsOpen(false)} value={state.hostPrefs} onSave={(hostPrefs) => update({ hostPrefs })} />
    </Screen>
  );
}
