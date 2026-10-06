/** `out` = replied "can't make it"; they stay on the host's list until removed but never count as coming. */
export type Guest = { id: string; name: string; initial: string; status: 'host' | 'responded' | 'waiting' | 'out'; avatar?: string; note?: string };
export type RestaurantId = 'alma' | 'heretik' | 'makfam' | 'cartdriver' | 'ashkara';
export type Restaurant = {
  id: RestaurantId; name: string; cuisine: string; address: string; neighborhood: string; hours: string;
  reservations: boolean; /** who takes the booking (OpenTable, Resy…); ignored for walk-in places */ partner: string;
  times: string[]; /** slots a table for 7 or more can still get */ bigTableTimes: string[]; photo: string;
  rating: number; reviews: number; website: string; /** the full menu, listed in the app like a delivery app does: sections of items */ menu: MenuSection[];
};
export type RadiusMi = 0.5 | 1 | 2 | 5;
/** How the spot gets picked: the whole group votes (the host still has the last say) or the host alone. */
export type DecideMode = 'vote' | 'host';
export type Vote = { guestId: string; restaurant: RestaurantId };
export type MenuSection = { section: string; items: { name: string; desc?: string; price: string }[] };

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

/** Everyone's favourite once the vote opens, in the order the votes arrive on the host's side. The three
 *  guests other than Priya split one each, so on the guest side the tester's own vote always decides. */
export const votes: Vote[] = [
  { guestId: 'priya', restaurant: 'alma' },
  { guestId: 'marcus', restaurant: 'heretik' },
  { guestId: 'alex', restaurant: 'alma' },
  { guestId: 'sam', restaurant: 'makfam' },
];

export const decideOptions: { value: DecideMode; label: string }[] = [
  { value: 'vote', label: 'Everyone votes' },
  { value: 'host', label: "I'll pick" },
];

// The participant tester plays Priya.
export const me = guests[1];

/** The small tag on each option: the list is ranked, so only the first is the best spot. */
export function spotTag(index: number): { label: string; best: boolean } {
  return index === 0 ? { label: 'Best spot', best: true } : { label: 'Great spot', best: false };
}

// Real Denver places (2 Oct 2026, the user's pick, photos from her Figma frames 616:673 / 617:836). The first
// three are the shortlist everyone sees; the last two appear when the host taps "Show 2 more places".
export const restaurants: Restaurant[] = [
  { id: 'alma', name: 'Alma Fonda Fina', cuisine: 'Mexican, $$', address: '2556 15th St', neighborhood: 'LoHi', hours: 'Open until 10 PM', reservations: true, partner: 'OpenTable',
    times: ['6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM'], bigTableTimes: ['6:30 PM', '8:00 PM'], photo: '/photos/alma.jpg',
    rating: 4.7, reviews: 1180, website: 'https://www.opentable.com/r/alma-fonda-fina-denver',
    menu: [
      { section: 'To start', items: [{ name: 'Esquites', desc: 'Street corn, cotija, lime', price: '$12' }, { name: 'Tostada de atún', desc: 'Tuna, avocado, chile morita', price: '$18' }, { name: 'Queso fundido', desc: 'Chorizo, flour tortillas', price: '$15' }] },
      { section: 'Mains', items: [{ name: 'Carne asada', desc: 'Mole negro, rajas', price: '$34' }, { name: 'Pescado a la talla', desc: 'Whole fish, two salsas', price: '$42' }, { name: 'Enchiladas de pollo', desc: 'Salsa verde, crema', price: '$26' }] },
      { section: 'Dessert', items: [{ name: 'Churros', desc: 'Cajeta, cinnamon sugar', price: '$11' }, { name: 'Flan de coco', price: '$10' }] },
    ] },
  { id: 'heretik', name: 'Heretík', cuisine: 'French/Basque, $$$', address: '1441 26th St', neighborhood: 'RiNo', hours: 'Open until 11 PM', reservations: true, partner: 'OpenTable',
    times: ['7:00 PM', '8:00 PM'], bigTableTimes: ['8:00 PM'], photo: '/photos/heretik.jpg',
    rating: 4.6, reviews: 310, website: 'https://www.opentable.com/r/heretik-denver',
    menu: [
      { section: 'Pintxos', items: [{ name: 'Gilda', desc: 'Anchovy, olive, guindilla', price: '$6' }, { name: 'Steak tartare', desc: 'Egg yolk, toast', price: '$19' }, { name: 'Oysters', desc: 'Half dozen, mignonette', price: '$24' }] },
      { section: 'Mains', items: [{ name: 'Rotisserie chicken', desc: 'Jus, frites', price: '$38' }, { name: 'Txuleta', desc: 'Dry-aged ribeye for two', price: '$120' }, { name: 'Grilled turbot', desc: 'Pil-pil', price: '$48' }] },
      { section: 'Dessert', items: [{ name: 'Basque cheesecake', price: '$12' }, { name: 'Gâteau Basque', desc: 'Cherry jam', price: '$11' }] },
    ] },
  { id: 'makfam', name: 'MAKfam', cuisine: 'Chinese, $', address: '39 W 1st Ave', neighborhood: 'Baker', hours: 'Open until 9:30 PM', reservations: false, partner: 'OpenTable',
    times: ['6:30 PM', '7:00 PM', '7:30 PM'], bigTableTimes: ['6:30 PM', '7:00 PM', '7:30 PM'], photo: '/photos/makfam.jpg',
    rating: 4.6, reviews: 290, website: 'https://www.makfam.com',
    menu: [
      { section: 'Small', items: [{ name: 'Wontons in chili oil', price: '$14' }, { name: 'Cucumber salad', desc: 'Garlic, black vinegar', price: '$9' }, { name: 'Scallion pancake', price: '$10' }] },
      { section: 'Noodles & rice', items: [{ name: 'Dan dan noodles', desc: 'Pork, sesame, chili', price: '$16' }, { name: 'Beef chow fun', price: '$18' }, { name: 'Mapo tofu rice', desc: 'Vegetarian option', price: '$15' }] },
      { section: 'Mains', items: [{ name: 'Salt & pepper tofu', price: '$13' }, { name: 'Three-cup chicken', price: '$19' }] },
    ] },
  { id: 'cartdriver', name: 'Cart-Driver', cuisine: 'Pizza, $', address: '2500 Larimer St', neighborhood: 'RiNo', hours: 'Open until midnight', reservations: true, partner: 'OpenTable',
    times: ['7:00 PM', '8:00 PM'], bigTableTimes: ['8:00 PM'], photo: '/photos/cartdriver.jpg',
    rating: 4.5, reviews: 980, website: 'https://www.cart-driver.com/rino',
    menu: [
      { section: 'Pizza', items: [{ name: 'Margherita', desc: 'Tomato, mozzarella, basil', price: '$17' }, { name: 'Soppressata', desc: 'Hot honey, chili', price: '$20' }, { name: 'Mushroom', desc: 'Taleggio, thyme', price: '$19' }] },
      { section: 'Raw bar', items: [{ name: 'Oysters', desc: 'Each', price: '$3' }, { name: 'Crudo', desc: 'Citrus, chili oil', price: '$16' }] },
      { section: 'Sides', items: [{ name: 'Little gem salad', price: '$12' }, { name: 'Meatballs', desc: 'Tomato, parmesan', price: '$14' }] },
    ] },
  { id: 'ashkara', name: "Ash'Kara", cuisine: 'Mediterranean, $$', address: '2005 W 33rd Ave', neighborhood: 'LoHi', hours: 'Open until 10 PM', reservations: true, partner: 'Resy',
    times: ['7:00 PM', '8:00 PM'], bigTableTimes: ['8:00 PM'], photo: '/photos/ashkara.jpg',
    rating: 4.5, reviews: 480, website: 'https://www.ashkaradenver.com',
    menu: [
      { section: 'Mezze', items: [{ name: 'Hummus', desc: 'Laffa, olive oil', price: '$12' }, { name: 'Baba ganoush', price: '$11' }, { name: 'Mezze for the table', desc: 'Six dips, laffa', price: '$28' }] },
      { section: 'Grill', items: [{ name: 'Lamb kebab', desc: 'Tahini, sumac onion', price: '$32' }, { name: 'Chicken shawarma plate', price: '$24' }, { name: 'Whole branzino', desc: 'Charred lemon', price: '$38' }] },
      { section: 'Dessert', items: [{ name: 'Malabi', desc: 'Rose, pistachio', price: '$10' }, { name: 'Baklava', price: '$9' }] },
    ] },
];

/** The three places that fit the group best: what every list, tally and vote starts with. */
export const shortlist = restaurants.slice(0, 3);
/** Two more that still work, shown on ORG 6 after "Show 2 more places". */
export const moreRestaurants = restaurants.slice(3);

export const fairPoint = { x: 0.52, y: 0.45 };

/** Parties above this size get the restaurant's bigTableTimes instead of times. */
export const BIG_TABLE_FROM = 7;

/** The slots a place can offer a table of `size`: bigger parties get fewer; reservation places also offer a late 8:30. */
export function slotsFor(r: Restaurant, size: number): string[] {
  if (size >= BIG_TABLE_FROM) return r.bigTableTimes;
  return r.reservations ? [...r.times, '8:30 PM'] : r.times;
}

/** Whether a booked time survives a change of party size at the same place. */
export function tableFits(r: Restaurant, size: number, time: string): boolean {
  return slotsFor(r, size).includes(time);
}

export const radiusOptions: { value: RadiusMi; label: string }[] = [
  { value: 0.5, label: '½ mi' }, { value: 1, label: '1 mi' }, { value: 2, label: '2 mi' }, { value: 5, label: '5 mi' },
];

export const sms = {
  manageLink: (partyName: string) => ({ time: 'Today 2:14 PM', text: `Your party "${partyName}" is live. Manage it anytime here:`, link: party.manageLink }),
  reminder: { time: 'Today 4:02 PM', text: "Reminder from Jordan: still need your location for Jordan's Dinner. Or just tell us you're in:", link: party.inviteLink },
  invite: { time: 'Today 2:10 PM', text: "Jordan invited you to Jordan's Dinner. Add where you're coming from so we can find a spot that works for everyone:", link: party.inviteLink },
  voteOpen: { time: 'Today 4:40 PM', text: "Everyone's in! Time to vote on a spot for Jordan's Dinner. Pick your favourite:", link: party.inviteLink },
  spotConfirmed: (place: string) => ({ time: 'Today 5:15 PM', text: `Jordan picked a spot. Jordan's Dinner is at ${place}, Fri Sep 12 at 7:00 PM. Details and directions:`, link: party.inviteLink }),
  reminderTomorrow: { time: 'Yesterday 6:00 PM', text: "Reminder: Jordan's Dinner is tomorrow at 7:00 PM at Alma Fonda Fina. See you there.", link: party.inviteLink },
  reminder2h: { time: 'Today 5:00 PM', text: "Jordan's Dinner starts in 2 hours at Alma Fonda Fina, 2556 15th St.", link: party.inviteLink },
  afterGuest: { time: 'Today 10:00 AM', text: 'It was a blast! Thanks for joining Jordan at Alma Fonda Fina. Want to plan your own? Start a party at', link: 'gather.app' },
  afterHost: (partyName: string, place: string) => ({ time: 'Today 10:00 AM', text: `Thanks for hosting ${partyName} at ${place}! Hope it was a blast. Start your next party any time at`, link: 'gather.app' }),
  reservationChanged: (partyName: string) => ({ time: 'Today 5:40 PM', text: `Reservation changed: ${partyName} is now`, link: party.inviteLink }),
  dropped: { time: 'Today 3:30 PM', text: "Priya can't make it to Jordan's Dinner anymore (“Sorry, a work thing came up”). You're now 4. Manage the party:", link: party.manageLink },
};

export const permissionBody = {
  host: "Only used to find a spot that works for everyone. Guests never see it.",
  guest: "Only used to find a spot that works for everyone. Nobody sees your exact location.",
};

// `tone` is what sits on top of the cover: the Edit cover pill goes white-on-dark for the two dark colours.
export const coverColours: { id: 'blue' | 'sage' | 'matcha' | 'oat' | 'kale' | 'ink'; label: string; token: string; tone: 'light' | 'dark' }[] = [
  { id: 'blue', label: 'Blue', token: 'var(--bg-info-tint)', tone: 'light' },
  { id: 'sage', label: 'Sage', token: 'var(--bg-accent-tint)', tone: 'light' },
  { id: 'matcha', label: 'Matcha', token: 'var(--accent-matcha)', tone: 'light' },
  { id: 'oat', label: 'Oat', token: 'var(--bg-subtle)', tone: 'light' },
  { id: 'kale', label: 'Kale', token: 'var(--accent)', tone: 'dark' },
  { id: 'ink', label: 'Ink', token: 'var(--text-primary)', tone: 'dark' },
];

// Downtown Denver; the map centres here for "Around me" and every pin is placed relative to it.
export const denver = { lat: 39.7392, lng: -104.9903 };
export const pinDrop = { lat: 39.7590, lng: -104.9820 }; // RiNo
export const restaurantCoords: Record<RestaurantId, { lat: number; lng: number }> = {
  alma: { lat: 39.7548, lng: -105.0082 },
  heretik: { lat: 39.7583, lng: -104.9862 },
  makfam: { lat: 39.7183, lng: -104.9881 },
  cartdriver: { lat: 39.7566, lng: -104.9876 },
  ashkara: { lat: 39.7625, lng: -105.0092 },
};
// Roughly the middle of the shortlist: LoHi, RiNo and Baker meet around downtown.
export const fairCoords = { lat: 39.7438, lng: -104.9942 };

export const VOTE_OPEN_DELAY_MS = 8_000; // joining → "Everyone's in! Time to vote" text
export const BOOKING_DELAY_MS = 15_000; // how long after the guest votes the host "books a spot"
export const VOTE_TICK_MS = 2_500; // host side: one fixture vote arrives per tick once everyone's in
export const NUDGE_DELAY_MS = 9_000; // hub landing → waiting nudge: the 6 s Messages banner, then a 3 s beat

export const prefGroups: { label: string; options: string[] }[] = [
  { label: 'Dietary', options: ['Vegetarian', 'Vegan', 'Gluten-free', 'Halal'] },
  { label: 'Budget', options: ['$', '$$', '$$$'] },
  { label: 'Vibe', options: ['Casual', 'Lively', 'Quiet', 'Outdoor'] },
  { label: 'Access', options: ['Wheelchair accessible'] },
];
