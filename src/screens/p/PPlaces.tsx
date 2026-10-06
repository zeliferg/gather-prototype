// Figma v6 row 2 (6 Oct 2026): P 7 — The places (vote) and P 7c — the detail sheet with "Vote for this spot".
// The guest browses the same cards and detail the host sees, minus everything about booking, and votes
// from the detail. The first vote earns the You voted! screen; a changed vote goes straight back to P 3b.
import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Segmented } from '../../components/Segmented';
import { Sheet } from '../../components/Sheet';
import { MapView } from '../../components/MapView';
import { RestaurantCard } from '../../components/RestaurantCard';
import { PlaceDetails } from '../../components/PlaceDetails';
import { ProgressButton } from '../../components/ProgressButton';
import { MenuList } from '../../components/MenuList';
import { shortlist, type RestaurantId } from '../../fixtures';
import { usePrototypeState } from '../../state';
import { useGuestVote } from '../../useVote';

// How long the sheet takes to slide away, read from tokens.css so reduced motion (0ms) navigates at once.
const sheetMs = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dur-sheet')) || 0;

export function PPlaces() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const vote = useGuestVote();
  const [view, setView] = useState<'list' | 'map'>('list');
  // The sheet pages through the shortlist (swipe left/right); `active` is the page in view and the one the buttons act on.
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const pagerEl = useRef<HTMLDivElement | null>(null);
  // Closing only hides the sheet, so its content stays put while it slides away.
  const [sheetOpen, setSheetOpen] = useState(false);
  const [step, setStep] = useState<'detail' | 'menu'>('detail');
  // Whether the vote being cast is the guest's first: decided when the button is tapped, read when it's done.
  const firstVote = useRef(false);
  // The vote lands while the button still shows its check; keeping it mounted until then lets it finish and navigate.
  const [casting, setCasting] = useState(false);
  const open = shortlist[active];
  const tagFor = (id: RestaurantId) => (vote.leader === id ? { label: 'Most votes', best: true } : { label: 'Great spot', best: false });
  const openPlace = (id: RestaurantId) => { const i = Math.max(0, shortlist.findIndex((r) => r.id === id)); activeRef.current = i; setActive(i); setStep('detail'); setSheetOpen(true); };
  // The pager mounts with the sheet: land on the tapped place without animating there.
  const pagerRef = useCallback((el: HTMLDivElement | null) => { pagerEl.current = el; if (el) el.scrollLeft = activeRef.current * el.clientWidth; }, []);
  const onPage = () => { const el = pagerEl.current; if (!el || el.clientWidth === 0) return; const i = Math.round(el.scrollLeft / el.clientWidth); if (i !== activeRef.current) { activeRef.current = i; setActive(i); } };
  const cast = () => update({ vote: open.id, votedAt: state.votedAt ?? Date.now() });
  const finish = () => { setCasting(false); setSheetOpen(false); setTimeout(() => navigate(firstVote.current ? '/p/voted' : '/p/waiting'), sheetMs()); };

  return (
    <Screen back title="3 places that work" subtitle="Everyone's in. Each place is close to the middle of where you're all coming from. Tap one to read about it, then vote.">
      <Segmented options={[{ value: 'list', label: 'List' }, { value: 'map', label: 'Map' }]} value={view} onChange={setView} />
      {view === 'list'
        ? shortlist.map((r, i) => <RestaurantCard key={r.id} guest restaurant={r} index={i} picked={null} onPick={() => {}} onOpen={() => openPlace(r.id)}
            vote={{ voters: vote.votersOf(r.id), total: vote.voters, leading: vote.leader === r.id }} />)
        : <MapView mode="options" height={620} onSelectPin={openPlace} places={shortlist} />}
      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={open.name} subtitle={step === 'menu' ? 'Menu' : open.cuisine}>
        {step === 'detail' && [
          /* One page per place: swipe sideways to compare them without going back to the list */
          <div key="pager" ref={pagerRef} className="pager" onScroll={onPage}>
            {shortlist.map((r) => (
              <div key={r.id} className="pager__page">
                <div className="rcard__photo rcard__photo--tall"><img src={r.photo} alt="" /></div>
                <PlaceDetails restaurant={r} tag={tagFor(r.id)} voteLine={`${vote.tally[r.id].length} of ${vote.voters} voted for this.`} />
              </div>
            ))}
          </div>,
          <div key="dots" className="dots" aria-hidden>{shortlist.map((r, i) => <span key={r.id} className={`dot ${i === active ? 'dot--on' : ''}`} />)}</div>,
          /* One button for every page, so swiping never remounts it: the label and disabled state follow the page in view */
          <ProgressButton key="cta" idle={state.vote === open.id && !casting ? 'Your vote' : 'Vote for this spot'} disabled={state.vote === open.id && !casting}
            busy="Casting your vote…" done="Voted" busyMs={900}
            onStart={() => { firstVote.current = state.vote === null; setCasting(true); }} onBusyEnd={cast} onDone={finish} />,
          <Button key="menu" variant="ghost" onClick={() => setStep('menu')}>See full menu</Button>,
        ]}
        {step === 'menu' && [<MenuList key="m-list" menu={open.menu} />, <Button key="m-back" variant="ghost" onClick={() => setStep('detail')}>Back</Button>]}
      </Sheet>
    </Screen>
  );
}
