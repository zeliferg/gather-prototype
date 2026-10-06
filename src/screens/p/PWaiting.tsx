// Figma: P 3b — Party page (waiting, then booked). Also carries P 9 — Party is here as the restaurant drawer,
// P 9b Who's coming, P 9c Directions, P 9d Add to calendar, P 3d Can't make it, and the Your info drawer.
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { AvatarStack } from '../../components/Avatar';
import { PreferenceChips } from '../../components/Preferences';
import { Input } from '../../components/Input';
import { Sheet } from '../../components/Sheet';
import { ActionSheet } from '../../components/ActionSheet';
import { GuestRow } from '../../components/GuestRow';
import { PermissionDialog } from '../../components/PermissionDialog';
import { LocationPicker } from '../../components/LocationPicker';
import { Chevron, Info } from '../../components/icons';
import { MenuList } from '../../components/MenuList';
import { PlaceDetails } from '../../components/PlaceDetails';
import { PickerField } from '../../components/PickerField';
import { party, permissionBody, radiusOptions, restaurants } from '../../fixtures';
import { useGuestList } from '../../guest';
import { usePrototypeState } from '../../state';
import { useGuestVote } from '../../useVote';
import { VoteLine } from '../../components/VoteLine';

export function PWaiting() {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, update, reset] = usePrototypeState();
  const { guests, meId } = useGuestList();
  const [leaving, setLeaving] = useState(false);
  const [details, setDetails] = useState<'closed' | 'info' | 'menu'>('closed'); // the booked card's (i): a few lines, then the menu
  const [who, setWho] = useState(false);
  const [directions, setDirections] = useState(false);
  const [calendar, setCalendar] = useState(false);
  const [note, setNote] = useState('Sorry, a work thing came up');
  const [info, setInfo] = useState(false);
  const [asking, setAsking] = useState(false);
  const [locOpen, setLocOpen] = useState(false); // the map drawer, swapped in for Your info and back
  const [prefDraft, setPrefDraft] = useState<string[]>(state.prefs);
  const radius = radiusOptions.find((o) => o.value === state.radiusMi)!.label;
  const r = restaurants.find((x) => x.id === state.selectedRestaurant)!;
  const booked = state.guestBooked;
  const vote = useGuestVote();
  // v2 (6 Oct 2026): the vote is cast from the places (P 7 → P 7c); here the card only opens that door, then
  // collapses to the guest's pick. The host books BOOKING_DELAY_MS after the first vote, never before.
  const myPick = restaurants.find((x) => x.id === state.vote);

  // A caller can land here with the Your info drawer open (location.state.info). The success screen's "View the
  // details" lands on the page itself (6 Oct 2026): the drawer opens when the guest taps the place.
  useEffect(() => {
    if (location.state?.info) { setPrefDraft(state.prefs); setInfo(true); }
  }, [location.state]); // eslint-disable-line react-hooks/exhaustive-deps

  const openInfo = () => { setPrefDraft(state.prefs); setInfo(true); };
  // The map is a drawer of its own: Your info steps aside for it and comes back with the new location.
  const openMap = () => { setInfo(false); setLocOpen(true); };
  const tapLocation = () => { if (state.permission === 'unknown') setAsking(true); else openMap(); };
  const answered = (permission: 'granted' | 'denied') => {
    update({ permission, locationMode: permission === 'granted' ? 'around' : 'pin' });
    setAsking(false);
    openMap();
  };
  const useLocation_ = () => { update({ locationSet: true, flexible: false }); setLocOpen(false); setInfo(true); };
  const togglePref = (o: string) => setPrefDraft((d) => (d.includes(o) ? d.filter((x) => x !== o) : [...d, o]));
  const locationSummary = state.locationSet ? `${state.locationMode === 'pin' ? 'RiNo' : 'Downtown'} · within ${radius}` : state.flexible ? "You're flexible" : 'Tap to set';

  return (
    <Screen footer={<Button variant="ghost" onClick={() => setLeaving(true)}>Can't make it? Let {party.hostFirst} know</Button>}>
      <div className="cover"><img src="/photos/cover.jpg" alt="" /></div>
      <div className="screen__title"><h1 className="t-title">{party.name}</h1><p className="t-secondary c-secondary">{booked ? `${party.dateLong} at ${state.selectedTime}` : party.roughTime}</p></div>
      {booked ? (
        /* Same anatomy as the host's booked card: the place's photo with the tags on it, name + (i), two buttons */
        <div className="card">
          {/* The place itself opens the details drawer (photo and name), as does the (i) */}
          <button className="rcard__main" aria-label={`${r.name}, see the details`} onClick={() => setDetails('info')}>
            <div className="rcard__photo booked__photo"><img src={r.photo} alt="" /><span className="rcard__tags"><Chip variant="success">Booked</Chip><Chip variant="info">{vote.leader === r.id ? 'Won the vote' : `${party.hostFirst}'s pick`}</Chip></span></div>
          </button>
          <div className="card__head">
            <div className="stack" style={{ gap: 2, minWidth: 0 }}>
              <p className="t-heading">{r.name}</p>
              <p className="t-secondary c-secondary">{r.address} · Table for {party.size}</p>
            </div>
            <button className="card__action card__action--filled" aria-label="See the details" onClick={() => setDetails('info')}><Info size={18} /></button>
          </div>
          <div className="split">
            <Button variant="secondary" onClick={() => setDirections(true)}>Directions</Button>
            <Button variant="secondary" onClick={() => setCalendar(true)}>Add to calendar</Button>
          </div>
        </div>
      ) : vote.open && myPick ? (
        /* Your vote is in: a status card (as the host's waiting card), then your pick in a card of its own */
        <>
          <div className="card card--tint">
            <p className="t-body-med">Your vote is in</p>
            <p className="t-secondary c-secondary">{vote.arrived} of {vote.voters} have voted. Now it's {party.hostFirst}'s turn to pick a spot; everyone gets a text once it's booked.</p>
          </div>
          <div className="card">
            <div className="card__head"><h2 className="t-heading">Your pick</h2><button className="link t-label" onClick={() => navigate('/p/places')}>Changed your mind?</button></div>
            <div className="vote-pick" key={myPick.id}>
              <span className="place-row__thumb"><img src={myPick.photo} alt="" /></span>
              <span className="stack" style={{ gap: 2, minWidth: 0, flex: 1 }}>
                <span className="t-body-med ellipsis">{myPick.name}</span>
                <span className="t-caption c-secondary">{myPick.cuisine}</span>
                <VoteLine count={vote.tally[myPick.id].length} total={vote.voters} />
              </span>
            </div>
          </div>
        </>
      ) : vote.open ? (
        /* Time to vote: one door to the places, where the guest reads about each before voting */
        <div className="card vote-card">
          <div className="card__head"><h2 className="t-heading">Time to vote</h2></div>
          <p className="t-secondary c-secondary">Everyone's in, so here are 3 places that work for the whole group. Have a look and vote for your favourite. {party.hostFirst} has the last say.</p>
          <Button variant="secondary" inline className="btn--sm" style={{ alignSelf: 'flex-start' }} onClick={() => navigate('/p/places')}>Browse locations</Button>
        </div>
      ) : (
        <div className="card card--tint">
          <p className="t-body-med">You're in</p>
          <p className="t-secondary c-secondary">Waiting for everyone to add where they're coming from. Then we all vote on a spot, and {party.hostFirst} books it.</p>
        </div>
      )}
      <div className="row">
        <h2 className="t-heading">Who's coming</h2>
        <button className="hstack link t-label" onClick={() => setWho(true)}>See everyone <Chevron size={18} /></button>
      </div>
      <AvatarStack guests={guests} />
      <div className="card">
        <div className="row"><span className="t-body-med">Your info</span><button className="link t-label" onClick={openInfo}>Edit</button></div>
        <p className="t-secondary c-secondary">{state.flexible && !state.locationSet ? "You're flexible." : `${state.locationMode === 'pin' ? 'RiNo' : 'Downtown'}, within ${radius}.`}{state.prefs.length ? ` ${state.prefs.join(', ')}.` : ''}</p>
      </div>
      {!booked && !vote.open && <p className="t-caption c-secondary" style={{ textAlign: 'center' }}>Only the host sees who has responded.</p>}
      {/* The walk-through ends here: clear the tab and land on ORG 0, where Join with a code starts the other way in */}
      {booked && <button className="devhint t-caption" onClick={() => { reset(); navigate('/org'); }}>Prototype: start over</button>}

      {/* Your info, as a drawer: location goes via the map screen, preferences change here */}
      <Sheet open={info} onClose={() => setInfo(false)} title="Your info" subtitle="Change where you're coming from or what you'd like.">
        <PickerField label="My location" value={locationSummary} set={state.locationSet || state.flexible} onClick={tapLocation} />
        <PreferenceChips value={prefDraft} onToggle={togglePref} />
        <Button onClick={() => { update({ prefs: prefDraft }); setInfo(false); }}>Save</Button>
      </Sheet>
      <PermissionDialog open={asking} body={permissionBody.guest} onAllow={() => answered('granted')} onDeny={() => answered('denied')} />
      <Sheet open={locOpen} onClose={() => { setLocOpen(false); setInfo(true); }} title="Where are you coming from?" subtitle="We use this to find a spot that works for everyone. Nobody sees your exact location.">
        <LocationPicker context="guest" askPermission={false} />
        <Button onClick={useLocation_}>Use this location</Button>
      </Sheet>

      {/* P 9 — the place as the vote page shows it (photo, tag, address, hours, rating, Website), with the booking as
          its extra line; the actions at the foot are Directions and the menu (6 Oct 2026) */}
      <Sheet open={details === 'info'} onClose={() => setDetails('closed')} title={r.name} subtitle={r.cuisine} actions>
        <div className="rcard__photo rcard__photo--tall"><img src={r.photo} alt="" /></div>
        <PlaceDetails restaurant={r} tag={{ label: vote.leader === r.id ? 'Won the vote' : `${party.hostFirst}'s pick`, best: true }}
          line={`${party.dateLong} at ${state.selectedTime} · Table for ${party.size} · ${r.reservations ? `Booked under ${party.hostFirst}'s name` : 'Walk-in, so arrive together'}`} />
        <div className="sheet__actions">
          <Button onClick={() => { setDetails('closed'); setDirections(true); }}>Directions</Button>
          <Button variant="ghost" onClick={() => setDetails('menu')}>See full menu</Button>
        </div>
      </Sheet>
      <Sheet open={details === 'menu'} onClose={() => setDetails('closed')} title={r.name} subtitle="Menu">
        <MenuList menu={r.menu} />
        <Button variant="ghost" onClick={() => setDetails('info')}>Back</Button>
      </Sheet>

      {/* P 9b */}
      <Sheet open={who} onClose={() => setWho(false)} title="Who's coming" subtitle={`${guests.length} people, including you`}>
        <div className="list">
          {guests.map((g) => <GuestRow key={g.id} guest={g} right={g.status === 'host' ? <Chip variant="info">Host</Chip> : g.id === meId ? <Chip>You</Chip> : null} />)}
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
