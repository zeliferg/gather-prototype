import { guestsComing, me, type Guest } from './fixtures';
import { usePrototypeState } from './state';

/** The guest-side list and which row is "you". A guest invited by text is Priya (the host added her);
 *  one who joined with a code was never on the host's list, so the name they typed is appended as a new row. */
export function guestList(guestName: string, byCode: boolean): { guests: Guest[]; meId: string } {
  const typed = guestName.trim();
  if (!byCode || !typed) return { guests: guestsComing, meId: me.id };
  return { guests: [...guestsComing, { id: 'me', name: typed, initial: typed[0].toUpperCase(), status: 'responded' }], meId: 'me' };
}

export function useGuestList() {
  const [state] = usePrototypeState();
  return guestList(state.guestName, state.guestPhone !== '');
}
