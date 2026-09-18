// Figma: P 3b — Party page (waiting, then booked). Also carries P 9 — Party is here as the restaurant drawer,
// P 9b Who's coming, P 9c Directions, P 9d Add to calendar, P 3d Can't make it, and the Your info drawer.
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Avatar } from '../../components/Avatar';
import { Input } from '../../components/Input';
import { Sheet } from '../../components/Sheet';
import { ActionSheet } from '../../components/ActionSheet';
import { GuestRow } from '../../components/GuestRow';
import { DevHint } from '../../components/DevHint';
import { PermissionDialog } from '../../components/PermissionDialog';
import { Chevron } from '../../components/icons';
import { guests, me, party, permissionBody, prefGroups, radiusOptions, restaurants } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function PWaiting() {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, update] = usePrototypeState();
  const [leaving, setLeaving] = useState(false);
  const [details, setDetails] = useState(false);
  const [who, setWho] = useState(false);
  const [directions, setDirections] = useState(false);
  const [calendar, setCalendar] = useState(false);
  const [note, setNote] = useState('Sorry, a work thing came up');
  const [info, setInfo] = useState(false);
  const [asking, setAsking] = useState(false);
  const [prefDraft, setPrefDraft] = useState<string[]>(state.prefs);
  const radius = radiusOptions.find((o) => o.value === state.radiusMi)!.label;
  const r = restaurants.find((x) => x.id === state.selectedRestaurant)!;
  const booked = state.guestBooked;

  // The success screen's "View the details" lands here with the restaurant drawer up; the map screen's Save
  // lands here with the Your info drawer reopened.
  useEffect(() => {
    if (location.state?.details && booked) setDetails(true);
    if (location.state?.info) { setPrefDraft(state.prefs); setInfo(true); }
  }, [location.state, booked]); // eslint-disable-line react-hooks/exhaustive-deps

  const openInfo = () => { setPrefDraft(state.prefs); setInfo(true); };
  // Leaving for the map keeps any preference changes made so far, since the drawer reopens fresh on return.
  const tapLocation = () => { update({ prefs: prefDraft }); if (state.permission === 'unknown') setAsking(true); else navigate('/p/location', { state: { from: '/p/waiting' } }); };
  const answered = (permission: 'granted' | 'denied') => {
    update({ permission, locationMode: permission === 'granted' ? 'around' : 'pin' });
    setAsking(false);
    navigate('/p/location', { state: { from: '/p/waiting' } });
  };
  const togglePref = (o: string) => setPrefDraft((d) => (d.includes(o) ? d.filter((x) => x !== o) : [...d, o]));
  const locationSummary = state.locationSet ? `${state.locationMode === 'pin' ? 'RiNo' : 'Downtown'} · within ${radius}` : state.flexible ? "You're flexible" : 'Tap to set';

  return (
    <Screen footer={<Button variant="ghost" onClick={() => setLeaving(true)}>Can't make it? Let {party.hostFirst} know</Button>}>
      <div className="cover"><img src="/photos/cover.jpg" alt="" /></div>
      <div className="screen__title"><h1 className="t-title">{party.name}</h1><p className="t-secondary c-secondary">{booked ? `${party.dateLong} at ${state.selectedTime}` : party.roughTime}</p></div>
      {booked ? (
        <div className="card">
          <div className="row"><Chip variant="success">Booked</Chip><button className="hstack link t-label" onClick={() => setDetails(true)}>See the details <Chevron size={18} /></button></div>
          <p className="t-heading">{r.name}</p>
          <p className="t-secondary c-secondary">{r.address}. {r.hours}.</p>
          <div className="hstack">
            <Button variant="secondary" inline onClick={() => setDirections(true)}>Directions</Button>
            <Button variant="secondary" inline onClick={() => setCalendar(true)}>Add to calendar</Button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ background: 'var(--bg-accent-tint)', borderColor: 'transparent' }}>
          <p className="t-body-med">You're in</p>
          <p className="t-secondary c-secondary">{party.hostFirst} is picking a place. We'll text you the moment it's booked.</p>
        </div>
      )}
      <div className="row">
        <h2 className="t-heading">Who's coming</h2>
        <button className="hstack link t-label" onClick={() => setWho(true)}>See everyone <Chevron size={18} /></button>
      </div>
      <div className="avatar-stack">
        {guests.slice(0, 3).map((g) => <Avatar key={g.id} initial={g.initial} />)}
        <span className="avatar avatar--more t-label" style={{ width: 40, height: 40 }}>+{guests.length - 3}</span>
      </div>
      <div className="card">
        <div className="row"><span className="t-body-med">Your info</span><button className="link t-label" onClick={openInfo}>Edit</button></div>
        <p className="t-secondary c-secondary">{state.flexible && !state.locationSet ? "You're flexible." : `${state.locationMode === 'pin' ? 'RiNo' : 'Downtown'}, within ${radius}.`}{state.prefs.length ? ` ${state.prefs.join(', ')}.` : ''}</p>
      </div>
      {!booked && <p className="t-caption c-secondary" style={{ textAlign: 'center' }}>Only the host sees who has responded.</p>}
      {booked && <DevHint to="/p/sms-after">the morning after</DevHint>}

      {/* Your info, as a drawer: location goes via the map screen, preferences change here */}
      <Sheet open={info} onClose={() => setInfo(false)} title="Your info" subtitle="Change where you're coming from or what you'd like.">
        <button className="location-row" onClick={tapLocation}>
          <span className="t-body-med">My location</span>
          <span className="hstack c-secondary t-secondary">{locationSummary}<Chevron size={20} /></span>
        </button>
        {prefGroups.map((g) => (
          <div key={g.label} className="stack">
            <p className="t-caption c-secondary">{g.label}</p>
            <div className="chip-row">{g.options.map((o) => <Chip key={o} variant={prefDraft.includes(o) ? 'selected' : 'neutral'} onClick={() => togglePref(o)}>{o}</Chip>)}</div>
          </div>
        ))}
        <Button onClick={() => { update({ prefs: prefDraft }); setInfo(false); }}>Save</Button>
      </Sheet>
      <PermissionDialog open={asking} body={permissionBody.guest} onAllow={() => answered('granted')} onDeny={() => answered('denied')} />

      {/* P 9 — the restaurant, as a drawer */}
      <Sheet open={details} onClose={() => setDetails(false)} title={r.name}>
        <div className="rcard__photo rcard__photo--tall"><img src={r.photo} alt="" /></div>
        <div className="stack" style={{ gap: 4 }}>
          <Chip variant="success" className="rcard__fair">Booked</Chip>
          <p className="t-body">{party.dateLong} at {state.selectedTime}. Table for {party.size}.</p>
          <p className="t-secondary c-secondary">{r.cuisine}. {r.address}. {r.hours}.</p>
        </div>
        <p className="t-secondary c-secondary">{r.reservations ? `Booked under ${party.hostFirst}'s name.` : 'Walk-in, so arrive together.'}</p>
        <div className="hstack">
          <Button variant="secondary" onClick={() => { setDetails(false); setDirections(true); }}>Directions</Button>
          <Button variant="secondary" onClick={() => { setDetails(false); setCalendar(true); }}>Add to calendar</Button>
        </div>
        <Button variant="ghost">See full menu</Button>
      </Sheet>

      {/* P 9b */}
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
