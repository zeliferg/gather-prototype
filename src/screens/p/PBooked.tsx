// Figma: P 6 — SMS: Spot confirmed, shown as a banner over a success screen (the guest-side ORG 5)
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { GatheringCircle } from '../../components/GatheringCircle';
import { Notification } from '../../components/Notification';
import { Close } from '../../components/icons';
import { guests, party, restaurants, sms } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function PBooked() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const r = restaurants.find((x) => x.id === state.selectedRestaurant)!;
  const [banner, setBanner] = useState(true);
  const closeBanner = useCallback(() => setBanner(false), []);
  useEffect(() => { if (!state.guestBooked) update({ guestBooked: true }); }, [state.guestBooked, update]);

  return (
    <Screen className="landing" right={<button className="icon-btn icon-btn--right" aria-label="Close" onClick={() => navigate('/p/waiting')}><Close /></button>}
      footer={<Button onClick={() => navigate('/p/party')}>View the details</Button>}>
      <GatheringCircle initials={guests.map((g) => g.initial)} centerCheck />
      <h1 className="t-display" style={{ textAlign: 'center' }}>{party.hostFirst} booked a spot</h1>
      <p className="t-secondary c-secondary" style={{ textAlign: 'center' }}>{r.name}, {party.dateLong} at {state.selectedTime}. Table for {party.size}.</p>
      <Notification open={banner} onClose={closeBanner} text={`${sms.spotConfirmed.text} ${sms.spotConfirmed.link}`} />
    </Screen>
  );
}
