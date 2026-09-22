import { guests as fixtureGuests, party, type Guest } from './fixtures';
import { usePrototypeState, type AddedGuest } from './state';

export function formatWhen(when: string): { dateLong: string; dateShort: string; time: string } | null {
  if (!when) return null;
  const d = new Date(when);
  if (Number.isNaN(d.getTime())) return null;
  return {
    dateLong: d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
    dateShort: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  };
}

/** The host's guest list: fixtures minus anyone removed, plus manually added guests (always waiting).
 *  The host row takes the name typed on Create Party and, for now, shows an initial instead of a photo. */
export function deriveGuests(removedIds: string[], added: AddedGuest[], hostName = ''): { all: Guest[]; coming: Guest[]; out: Guest[] } {
  const typed = hostName.trim();
  const withHost = fixtureGuests.map((g) => (g.status === 'host' && typed ? { ...g, name: typed, initial: typed[0].toUpperCase(), avatar: undefined } : g));
  const all: Guest[] = [...withHost.filter((g) => !removedIds.includes(g.id)), ...added.map((g) => ({ ...g, status: 'waiting' as const }))];
  return { all, coming: all.filter((g) => g.status !== 'out'), out: all.filter((g) => g.status === 'out') };
}

/** Party labels and guest list, with whatever the tester typed on Create Party layered over the fixtures. */
export function useParty() {
  const [state] = usePrototypeState();
  const when = formatWhen(state.when);
  const name = state.partyName.trim() || party.name;
  const hostName = state.hostName.trim() || party.hostName;
  const dateLong = when?.dateLong ?? party.dateLong;
  const dateShort = when?.dateShort ?? party.dateShort;
  const targetTime = when?.time ?? party.time;
  const { all, coming, out } = deriveGuests(state.removedIds, state.addedGuests, state.hostName);
  return {
    name, hostName, dateLong, dateShort, targetTime,
    roughTime: `${dateLong} · around ${targetTime}`,
    bookedTime: `${dateLong} at ${state.selectedTime}`,
    /** everyone on the list, including those who can't make it */
    guests: all,
    coming,
    out,
    size: state.partySize,
  };
}
