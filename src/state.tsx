import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { DecideMode, RadiusMi, RestaurantId } from './fixtures';

export type PrototypeState = {
  permission: 'unknown' | 'granted' | 'denied';
  locationMode: 'around' | 'pin';
  radiusMi: RadiusMi;
  joined: boolean;
  flexible: boolean;
  droppedOut: boolean;
  remindedIds: string[];
  everyoneIn: boolean;
  selectedRestaurant: RestaurantId;
  selectedTime: string;
  booked: boolean;
  guestBooked: boolean;
  cover: CoverChoice;
  addedGuests: AddedGuest[];
  hostName: string;
  hostPhone: string; // formatted as typed on Create Party, shown again on Verify
  guestPhone: string; // formatted as typed on Join with a code, shown again on the guest's Verify
  guestName: string; // typed on the join screen when joining with a code (the host never added them)
  partyName: string;
  when: string; // datetime-local value, '' until the host picks one
  locationSet: boolean; // the guest saved a location on the map screen
  prefs: string[];
  hostPrefs: string[]; // the host's own preferences, set on Create Party
  removedIds: string[]; // guests the host removed from See everyone
  joinedAt: number | null; // ms epoch; the host "books" BOOKING_DELAY_MS after this
  nudgeAt: number | null; // ms epoch of landing on the hub; the waiting nudge arrives NUDGE_DELAY_MS later
  nudgeDismissed: boolean; // the host closed the waiting nudge; it stays closed
  decide: DecideMode; // chosen on Create Party: the group votes, or the host picks
  vote: RestaurantId | null; // the guest's favourite, once cast
  votedAt: number | null; // ms epoch; the host "books" BOOKING_DELAY_MS after this
  voteOpenAt: number | null; // ms epoch; guest side: when the "time to vote" text arrived
  hostVotesIn: number; // host side: how many fixture votes have arrived since everyone got in
  votesInSeen: boolean; // the host closed the "Votes are in!" banner
  bookedTold: boolean; // the host saw the "everyone got a text" banner on the party page after booking
  hostVote: RestaurantId | null; // v2: the host's own favourite, cast on ORG 6 while the guests vote
  voteOpenTold: boolean; // the host saw the "the group is voting now" banner
};

export type CoverChoice = 'photo' | 'none' | 'blue' | 'sage' | 'matcha' | 'oat' | 'kale' | 'ink';
export type AddedGuest = { id: string; name: string; initial: string };

export const defaultState: PrototypeState = {
  permission: 'unknown',
  locationMode: 'around',
  radiusMi: 2,
  joined: false,
  flexible: false,
  droppedOut: false,
  remindedIds: [],
  everyoneIn: false,
  selectedRestaurant: 'alma',
  selectedTime: '7:00 PM',
  booked: false,
  guestBooked: false,
  cover: 'photo',
  addedGuests: [],
  hostName: '',
  hostPhone: '',
  guestPhone: '',
  guestName: '',
  partyName: '',
  when: '',
  locationSet: false,
  prefs: [],
  hostPrefs: [],
  removedIds: [],
  joinedAt: null,
  nudgeAt: null,
  nudgeDismissed: false,
  decide: 'vote',
  vote: null,
  votedAt: null,
  voteOpenAt: null,
  hostVotesIn: 0,
  votesInSeen: false,
  bookedTold: false,
  hostVote: null,
  voteOpenTold: false,
};

export const STORAGE_KEY = 'gather-prototype';

type Ctx = [PrototypeState, (patch: Partial<PrototypeState>) => void, () => void];
const StateContext = createContext<Ctx | null>(null);

function read(): PrototypeState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState;
  } catch {
    return defaultState;
  }
}

export function PrototypeStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PrototypeState>(read);
  const update = useCallback((patch: Partial<PrototypeState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* private mode */ }
      return next;
    });
  }, []);
  const reset = useCallback(() => {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* private mode */ }
    setState(defaultState);
  }, []);
  const value = useMemo<Ctx>(() => [state, update, reset], [state, update, reset]);
  return <StateContext.Provider value={value}>{children}</StateContext.Provider>;
}

export function usePrototypeState(): Ctx {
  const ctx = useContext(StateContext);
  if (!ctx) throw new Error('usePrototypeState must be used inside PrototypeStateProvider');
  return ctx;
}
