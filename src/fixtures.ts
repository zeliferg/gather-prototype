export type Guest = { id: string; name: string; initial: string; status: 'host' | 'responded' | 'waiting' };
export type RestaurantId = 'tavola' | 'corner' | 'noodle';
export type Restaurant = {
  id: RestaurantId; name: string; cuisine: string; address: string; hours: string;
  reservations: boolean; times: string[]; photo: string; pin: { x: number; y: number };
};
export type RadiusMi = 0.5 | 1 | 2 | 5;

export const party = {
  name: "Jordan's Dinner",
  hostName: 'Jordan Reyes',
  hostFirst: 'Jordan',
  dateLong: 'Friday, Sep 12',
  dateShort: 'Fri, Sep 12',
  time: '7:00 PM',
  whenIso: '2025-09-12T19:00', // datetime-local form of dateLong + time
  roughTime: 'Friday, Sep 12 · around 7:00 PM',
  exactTime: 'Friday, Sep 12 at 7:00 PM',
  code: '7K3M9',
  inviteLink: 'gather.app/p/7k3m9',
  manageLink: 'gather.app/m/9k2p1',
  hostPhone: '(555) 019-2244',
  guestPhone: '(555) 204-1187',
  size: 5,
};

export const guests: Guest[] = [
  { id: 'jordan', name: 'Jordan Reyes', initial: 'J', status: 'host' },
  { id: 'priya', name: 'Priya Nair', initial: 'P', status: 'responded' },
  { id: 'marcus', name: 'Marcus Webb', initial: 'M', status: 'responded' },
  { id: 'alex', name: 'Alex Chen', initial: 'A', status: 'waiting' },
  { id: 'sam', name: 'Sam Okafor', initial: 'S', status: 'waiting' },
];

// The participant tester plays Priya.
export const me = guests[1];

export const restaurants: Restaurant[] = [
  { id: 'tavola', name: 'Tavola Verde', cuisine: 'Italian, $$', address: '214 Elm Street', hours: 'Open until 10 PM', reservations: true, times: ['6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM'], photo: '/photos/tavola.jpg', pin: { x: 0.26, y: 0.2 } },
  { id: 'corner', name: 'Corner Table', cuisine: 'New American, $$$', address: '88 Larimer Street', hours: 'Open until 11 PM', reservations: true, times: ['7:00 PM', '8:00 PM'], photo: '/photos/corner.jpg', pin: { x: 0.36, y: 0.32 } },
  { id: 'noodle', name: 'Noodle Bar Riverside', cuisine: 'Noodles, $', address: '17 Platte Street', hours: 'Open until 9:30 PM', reservations: false, times: ['6:30 PM', '7:00 PM', '7:30 PM'], photo: '/photos/noodle.jpg', pin: { x: 0.2, y: 0.72 } },
];

export const fairPoint = { x: 0.52, y: 0.45 };

export const radiusOptions: { value: RadiusMi; label: string }[] = [
  { value: 0.5, label: '½ mi' }, { value: 1, label: '1 mi' }, { value: 2, label: '2 mi' }, { value: 5, label: '5 mi' },
];

export const sms = {
  manageLink: { time: 'Today 2:14 PM', text: 'Your party "Jordan\'s Dinner" is live. Manage it anytime here:', link: party.manageLink },
  reminder: { time: 'Today 4:02 PM', text: "Reminder from Jordan: still need your location for Jordan's Dinner. Or just tell us you're in:", link: party.inviteLink },
  invite: { time: 'Today 2:10 PM', text: "Jordan invited you to Jordan's Dinner. Add where you're coming from so we can find a spot that works for everyone:", link: party.inviteLink },
  spotConfirmed: { time: 'Today 5:15 PM', text: "You're all set. Jordan's Dinner is at Tavola Verde, Fri Sep 12 at 7:00 PM. Details and directions:", link: party.inviteLink },
  reminderTomorrow: { time: 'Yesterday 6:00 PM', text: "Reminder: Jordan's Dinner is tomorrow at 7:00 PM at Tavola Verde. See you there.", link: party.inviteLink },
  reminder2h: { time: 'Today 5:00 PM', text: "Jordan's Dinner starts in 2 hours at Tavola Verde, 214 Elm Street.", link: party.inviteLink },
  afterGuest: { time: 'Today 10:00 AM', text: 'It was a blast! Thanks for joining Jordan at Tavola Verde. Want to plan your own? Start a party at', link: 'gather.app' },
  afterHost: { time: 'Today 10:00 AM', text: "Thanks for hosting Jordan's Dinner at Tavola Verde! Hope it was a blast. Start your next party any time at", link: 'gather.app' },
  reservationChanged: { time: 'Today 5:40 PM', text: "Reservation changed: Jordan's Dinner is now", link: party.inviteLink },
  dropped: { time: 'Today 3:30 PM', text: "Priya can't make it to Jordan's Dinner anymore (“Sorry, a work thing came up”). You're now 4. Manage the party:", link: party.manageLink },
};

export const permissionBody = {
  host: "Only used to find a spot that's fair for everyone. Guests never see it.",
  guest: "Only used to find a spot that's fair for everyone. Nobody sees your exact location.",
};

export const coverColours: { id: 'blue' | 'sage' | 'matcha' | 'oat' | 'kale' | 'ink'; label: string; token: string }[] = [
  { id: 'blue', label: 'Blue', token: 'var(--bg-info-tint)' },
  { id: 'sage', label: 'Sage', token: 'var(--bg-accent-tint)' },
  { id: 'matcha', label: 'Matcha', token: 'var(--accent-matcha)' },
  { id: 'oat', label: 'Oat', token: 'var(--bg-subtle)' },
  { id: 'kale', label: 'Kale', token: 'var(--accent)' },
  { id: 'ink', label: 'Ink', token: 'var(--text-primary)' },
];

// Downtown Denver; the map centres here for "Around me" and every pin is placed relative to it.
export const denver = { lat: 39.7392, lng: -104.9903 };
export const pinDrop = { lat: 39.7590, lng: -104.9820 }; // RiNo
export const restaurantCoords: Record<RestaurantId, { lat: number; lng: number }> = {
  tavola: { lat: 39.7435, lng: -104.9950 },
  corner: { lat: 39.7590, lng: -104.9840 },
  noodle: { lat: 39.7570, lng: -105.0100 },
};
export const fairCoords = { lat: 39.7515, lng: -104.9990 };
