// Mounted once for the guest track: BOOKING_DELAY_MS after the guest joins, the host "books a spot".
// The party page flips to its booked state and a Messages banner drops onto whatever screen is open.
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../../components/Notification';
import { BOOKING_DELAY_MS, sms } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function BookingWatcher() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const [banner, setBanner] = useState(false);
  const close = useCallback(() => setBanner(false), []);
  const due = state.joined && !state.guestBooked && state.joinedAt !== null;

  useEffect(() => {
    if (!due) return;
    const wait = Math.max(0, state.joinedAt! + BOOKING_DELAY_MS - Date.now());
    const t = setTimeout(() => { update({ guestBooked: true }); setBanner(true); }, wait);
    return () => clearTimeout(t);
  }, [due, state.joinedAt, update]);

  return <Notification open={banner} onClose={close} onTap={() => navigate('/p/booked')} autoHideMs={8000} text={`${sms.spotConfirmed.text} ${sms.spotConfirmed.link}`} />;
}
