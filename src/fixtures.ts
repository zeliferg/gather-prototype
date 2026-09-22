/** `out` = replied "can't make it"; they stay on the host's list until removed but never count as coming. */
export type Guest = { id: string; name: string; initial: string; status: 'host' | 'responded' | 'waiting' | 'out'; avatar?: string; note?: string };
export type RestaurantId = 'tavola' | 'corner' | 'noodle';
export type Restaurant = {
  id: RestaurantId; name: string; cuisine: string; address: string; hours: string;
  reservations: boolean; times: string[]; /** slots a table for 7 or more can still get */ bigTableTimes: string[]; photo: string; pin: { x: number; y: number };
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

// Photo avatars in public/avatars (240px square crops); swap a file to recast a guest.
export const guests: Guest[] = [
  { id: 'jordan', name: 'Jordan Reyes', initial: 'J', status: 'host', avatar: '/avatars/jordan.jpg' },
  { id: 'priya', name: 'Priya Nair', initial: 'P', status: 'responded', avatar: '/avatars/priya.jpg' },
  { id: 'marcus', name: 'Marcus Webb', initial: 'M', status: 'responded', avatar: '/avatars/marcus.jpg' },
  { id: 'alex', name: 'Alex Chen', initial: 'A', status: 'waiting', avatar: '/avatars/alex.jpg' },
  { id: 'sam', name: 'Sam Okafor', initial: 'S', status: 'waiting', avatar: '/avatars/sam.jpg' },
  { id: 'leo', name: 'Leo Martins', initial: 'L', status: 'out', avatar: '/avatars/leo.jpg', note: 'Away that weekend' },
];

/** Everyone who might still show up: what the guest side calls "who's coming" and what the table is sized for. */
export const guestsComing = guests.filter((g) => g.status !== 'out');

// The participant tester plays Priya.
export const me = guests[1];

/** The small tag on each option: the list is ranked, so only the first is the best spot. */
export function spotTag(index: number): { label: string; best: boolean } {
  return index === 0 ? { label: 'Best spot', best: true } : { label: 'Great spot', best: false };
}

/** The reservations partner the host books through. */
export const partner = 'OpenTable';

export const restaurants: Restaurant[] = [
  { id: 'tavola', name: 'Tavola Verde', cuisine: 'Italian, $$', address: '214 Elm Street', hours: 'Open until 10 PM', reservations: true, times: ['6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM'], bigTableTimes: ['6:30 PM', '8:00 PM'], photo: '/photos/tavola.jpg', pin: { x: 0.26, y: 0.2 } },
  { id: 'corner', name: 'Corner Table', cuisine: 'New American, $$$', address: '88 Larimer Street', hours: 'Open until 11 PM', reservations: true, times: ['7:00 PM', '8:00 PM'], bigTableTimes: ['8:00 PM'], photo: '/photos/corner.jpg', pin: { x: 0.36, y: 0.32 } },
  { id: 'noodle', name: 'Noodle Bar Riverside', cuisine: 'Noodles, $', address: '17 Platte Street', hours: 'Open until 9:30 PM', reservations: false, times: ['6:30 PM', '7:00 PM', '7:30 PM'], bigTableTimes: ['6:30 PM', '7:00 PM', '7:30 PM'], photo: '/photos/noodle.jpg', pin: { x: 0.2, y: 0.72 } },
];

export const fairPoint = { x: 0.52, y: 0.45 };

/** Parties above this size get the restaurant's bigTableTimes instead of times. */
export const BIG_TABLE_FROM = 7;

/** The slots a place can offer a table of `size`: bigger parties get fewer; reservation places also offer a late 8:30. */
export function slotsFor(r: Restaurant, size: number): string[] {
  if (size >= BIG_TABLE_FROM) return r.bigTableTimes;
  return r.reservations ? [...r.times, '8:30 PM'] : r.times;
}

export const radiusOptions: { value: RadiusMi; label: string }[] = [
  { value: 0.5, label: '½ mi' }, { value: 1, label: '1 mi' }, { value: 2, label: '2 mi' }, { value: 5, label: '5 mi' },
];

export const sms = {
  manageLink: (partyName: string) => ({ time: 'Today 2:14 PM', text: `Your party "${partyName}" is live. Manage it anytime here:`, link: party.manageLink }),
  reminder: { time: 'Today 4:02 PM', text: "Reminder from Jordan: still need your location for Jordan's Dinner. Or just tell us you're in:", link: party.inviteLink },
  invite: { time: 'Today 2:10 PM', text: "Jordan invited you to Jordan's Dinner. Add where you're coming from so we can find a spot that works for everyone:", link: party.inviteLink },
  spotConfirmed: { time: 'Today 5:15 PM', text: "You're all set. Jordan's Dinner is at Tavola Verde, Fri Sep 12 at 7:00 PM. Details and directions:", link: party.inviteLink },
  reminderTomorrow: { time: 'Yesterday 6:00 PM', text: "Reminder: Jordan's Dinner is tomorrow at 7:00 PM at Tavola Verde. See you there.", link: party.inviteLink },
  reminder2h: { time: 'Today 5:00 PM', text: "Jordan's Dinner starts in 2 hours at Tavola Verde, 214 Elm Street.", link: party.inviteLink },
  afterGuest: { time: 'Today 10:00 AM', text: 'It was a blast! Thanks for joining Jordan at Tavola Verde. Want to plan your own? Start a party at', link: 'gather.app' },
  afterHost: (partyName: string, place: string) => ({ time: 'Today 10:00 AM', text: `Thanks for hosting ${partyName} at ${place}! Hope it was a blast. Start your next party any time at`, link: 'gather.app' }),
  reservationChanged: (partyName: string) => ({ time: 'Today 5:40 PM', text: `Reservation changed: ${partyName} is now`, link: party.inviteLink }),
  dropped: { time: 'Today 3:30 PM', text: "Priya can't make it to Jordan's Dinner anymore (“Sorry, a work thing came up”). You're now 4. Manage the party:", link: party.manageLink },
};

export const permissionBody = {
  host: "Only used to find a spot that works for everyone. Guests never see it.",
  guest: "Only used to find a spot that works for everyone. Nobody sees your exact location.",
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

export const BOOKING_DELAY_MS = 15_000; // how long after joining the host "books a spot"

export const prefGroups: { label: string; options: string[] }[] = [
  { label: 'Dietary', options: ['Vegetarian', 'Vegan', 'Gluten-free', 'Halal'] },
  { label: 'Budget', options: ['$', '$$', '$$$'] },
  { label: 'Vibe', options: ['Casual', 'Lively', 'Quiet', 'Outdoor'] },
  { label: 'Access', options: ['Wheelchair accessible'] },
];
