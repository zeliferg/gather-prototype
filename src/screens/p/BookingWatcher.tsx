// Mounted once for the guest track. v2: VOTE_OPEN_DELAY_MS after joining, everyone's in and a Messages text
// opens the vote; BOOKING_DELAY_MS after the guest votes the host "books a spot": the winner of the vote, with
// the party page flipping to its booked state and a Messages banner dropping onto whatever screen is open.
// A guest who hasn't voted keeps the vote open: nothing is booked until they have (6 Oct 2026).
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../../components/Notification';
import { BOOKING_DELAY_MS, VOTE_OPEN_DELAY_MS, restaurants, sms } from '../../fixtures';
import { usePrototypeState } from '../../state';
import { useGuestVote } from '../../useVote';

export function BookingWatcher() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const { winner } = useGuestVote();
  const [banner, setBanner] = useState<'vote' | 'booked' | null>(null);
  const close = useCallback(() => setBanner(null), []);
  const joined = state.joined && state.joinedAt !== null;
  const voteDue = joined && state.voteOpenAt === null;
  const bookDue = joined && state.votedAt !== null && !state.guestBooked;

  useEffect(() => {
    if (!voteDue) return;
    const wait = Math.max(0, state.joinedAt! + VOTE_OPEN_DELAY_MS - Date.now());
    const t = setTimeout(() => { update({ voteOpenAt: Date.now() }); setBanner('vote'); }, wait);
    return () => clearTimeout(t);
  }, [voteDue, state.joinedAt, update]);

  useEffect(() => {
    if (!bookDue) return;
    const at = state.votedAt! + BOOKING_DELAY_MS;
    const t = setTimeout(() => { update({ guestBooked: true, selectedRestaurant: winner, selectedTime: '7:00 PM' }); setBanner('booked'); }, Math.max(0, at - Date.now()));
    return () => clearTimeout(t);
  }, [bookDue, state.votedAt, winner, update]);

  const place = restaurants.find((r) => r.id === state.selectedRestaurant)!.name;
  const text = banner === 'vote' ? sms.voteOpen : sms.spotConfirmed(place);
  return <Notification open={banner !== null} onClose={close} onTap={() => navigate(banner === 'vote' ? '/p/waiting' : '/p/booked')} autoHideMs={8000} text={`${text.text} ${text.link}`} />;
}
