import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { RadiusMi, RestaurantId } from './fixtures';

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
  partySize: number;
  cover: CoverChoice;
  addedGuests: AddedGuest[];
  hostName: string;
  partyName: string;
  when: string; // datetime-local value, '' until the host picks one
  locationSet: boolean; // the guest saved a location on the map screen
  prefs: string[];
  joinedAt: number | null; // ms epoch; the host "books" BOOKING_DELAY_MS after this
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
  selectedRestaurant: 'tavola',
  selectedTime: '7:00 PM',
  booked: false,
  guestBooked: false,
  partySize: 5,
  cover: 'photo',
  addedGuests: [],
  hostName: '',
  partyName: '',
  when: '',
  locationSet: false,
  prefs: [],
  joinedAt: null,
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
