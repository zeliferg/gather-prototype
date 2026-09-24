import { guestsComing, me, type Guest } from './fixtures';
import { usePrototypeState } from './state';

/** The guest-side list and which row is "you". A guest invited by text is Priya (the host added her);
 *  one who joined with a code was never on the host's list, so the name they typed is a new row right after the host. */
export function guestList(guestName: string, byCode: boolean): { guests: Guest[]; meId: string } {
  const typed = guestName.trim();
  if (!byCode || !typed) return { guests: guestsComing, meId: me.id };
  // "You" sits right after the host, not at the foot of the list (the user, 24 Sep 2026).
  const [host, ...rest] = guestsComing;
  return { guests: [host, { id: 'me', name: typed, initial: typed[0].toUpperCase(), status: 'responded' }, ...rest], meId: 'me' };
}

export function useGuestList() {
  const [state] = usePrototypeState();
  return guestList(state.guestName, state.guestPhone !== '');
}
