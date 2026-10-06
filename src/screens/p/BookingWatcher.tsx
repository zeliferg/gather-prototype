// Mounted once for the guest track. v2: VOTE_OPEN_DELAY_MS after joining, everyone's in and a Messages text
// opens the vote; BOOKING_DELAY_MS after the guest votes the host "books a spot": the winner of the vote, with
// the party page flipping to its booked state and a Messages banner dropping onto whatever screen is open.
// A guest who hasn't voted keeps the vote open: nothing is booked until they have (6 Oct 2026).
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../../components/Notification';
import { BOOKING_DELAY_MS, VOTE_OPEN_DELAY_MS, sms } from '../../fixtures';
import { usePrototypeState } from '../../state';
import { useGuestVote } from '../../useVote';

export function BookingWatcher() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const { winner } = useGuestVote();
  const [banner, setBanner] = useState<'vote' | null>(null);
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
    // The booking is a moment of its own: land on P 6 (which drops the "Jordan picked a spot" text over
    // itself) rather than flipping the party page underneath the guest (6 Oct 2026, the user never saw P 6).
    const t = setTimeout(() => { update({ guestBooked: true, selectedRestaurant: winner, selectedTime: '7:00 PM' }); navigate('/p/booked'); }, Math.max(0, at - Date.now()));
    return () => clearTimeout(t);
  }, [bookDue, state.votedAt, winner, update, navigate]);

  const text = sms.voteOpen;
  return <Notification open={banner !== null} onClose={close} onTap={() => navigate('/p/waiting')} text={`${text.text} ${text.link}`} />;
}
