import { guests as fixtureGuests, party, type Guest } from './fixtures';
import { usePrototypeState } from './state';

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

/** Party labels and guest list, with whatever the tester typed on Create Party layered over the fixtures. */
export function useParty() {
  const [state] = usePrototypeState();
  const when = formatWhen(state.when);
  const name = state.partyName.trim() || party.name;
  const hostName = state.hostName.trim() || party.hostName;
  const dateLong = when?.dateLong ?? party.dateLong;
  const dateShort = when?.dateShort ?? party.dateShort;
  const targetTime = when?.time ?? party.time;
  const guests: Guest[] = [...fixtureGuests, ...state.addedGuests.map((g) => ({ ...g, status: 'waiting' as const }))];
  return {
    name, hostName, dateLong, dateShort, targetTime,
    roughTime: `${dateLong} · around ${targetTime}`,
    bookedTime: `${dateLong} at ${state.selectedTime}`,
    guests,
    size: state.partySize,
  };
}
