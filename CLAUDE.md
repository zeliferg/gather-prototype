# Gather prototype — working notes for Claude

Scripted, browser-based click-through of Gather, a group-dinner planner that
finds a fair meeting spot. No backend, no shared state between phones; each
device walks its own script. Built 16 Sep 2026 from the Figma design.

## Where things come from

- **Design source of truth:** Figma "Design Process" file
  `ht32GrUtNnpG53pb34b3Cv`, section **Flow1 v4** (`112:554`). Every screen
  file's first line is `// Figma: <frame name>`; the frame is authoritative
  for copy and layout. When they disagree, fix the code.
- **Spec:** `docs/superpowers/specs/2026-09-16-clickable-prototype-design.md`
  (binding). **Plan:** `docs/superpowers/plans/2026-09-16-clickable-prototype.md`.
- Research, interviews and the Figma work live in a separate folder
  (`~/Projects/food-app`); this repo is only the code.

## Stack and layout

Vite 6 + React 19 + TypeScript (strict), react-router-dom 6, plain CSS.
- `src/tokens.css` — the **only** place colours, type, radii, spacing and
  motion durations live. No hex or `ms` literals anywhere else (structural px
  like touch-target sizes are fine). Reduced motion zeroes every `--dur-*`,
  `--delay-*`, `--stagger` token.
- `src/fixtures.ts` — Jordan's Dinner, six guests (the participant tester is
  Priya; Leo replied "can't make it" and is `status: 'out'`), three Denver
  restaurants, the `partner` (OpenTable), all SMS copy. `guestsComing` is
  the guest-side list; the host side goes through `useParty().coming/out`.
  Avatars are 240px photo crops in `public/avatars/<id>.jpg`
  (`Avatar` falls back to the initial when there is no photo).
- `src/state.tsx` — `usePrototypeState()` → `[state, update, reset]`, backed
  by `sessionStorage`. Only tester choices go here. `reset()` is wired to
  "Start over" at the foot of ORG 10 (the host landing lost its link on
  21 Sep 2026) and to "Prototype: start over" at the foot of P 3b once
  booked, which lands on ORG 0 Landing (P 1 lost its link on 23 Sep 2026).
- `src/components/` — primitives (`Screen`, `Button`, `Chip`, `Input`,
  `Avatar`, `Segmented`, `CodeInput`), overlays (`Sheet`, `ActionSheet`,
  `PermissionDialog`, `Notification` — all portal to `document.body`,
  animated via `usePresence` (two rAFs so the off-screen start state is
  painted before the slide), marked `inert` + `aria-hidden` while exiting),
  `SmsScreen`, `MapView` (Leaflet + OpenStreetMap raster tiles, desaturated
  in CSS, draggable; ring and pins are React overlays re-projected on move;
  needs the "© OpenStreetMap contributors" attribution it renders),
  `LocationPicker`, `Cover`, `DevHint`, `ProgressButton` (spinner → check →
  navigate; Verify, Join, Book, Set time), `phone.ts` (`formatPhone` as typed),
  `Preferences` (`PreferencesSheet` = P 2b, used by the guest join screen and
  the host's Create Party; `PreferenceChips` inline in the guest's Your info
  drawer), `AvatarStack` (up to 5 faces then "+N").
- `src/party.ts` — `useParty()` layers what the tester typed on Create Party
  (name, party name, When), manually added guests and removed guests over the
  fixtures (`deriveGuests` is the pure, tested part).
- `src/screens/org/*` and `src/screens/p/*` — one file per Figma frame.
- `src/flow.ts` — `FLOW` from `VITE_FLOW` (`host|participant|all`), validated,
  falls back to `all`. `src/router.tsx` registers only that track's routes.

## Flows, branches, deploys

| Branch | `VITE_FLOW` | Live |
|---|---|---|
| `main` | all | https://gather-prototype-rho.vercel.app/org |
| `host-flow` | host | https://gather-host-prototype.vercel.app/org |
| `participant-flow` | participant | https://gather-participant-prototype.vercel.app/p |

Each flow branch is exactly one commit ahead of `main` (its
`.env.production`). Flow branches never edit shared files directly.

**To ship any change:** commit on `main`, push, then
`git checkout host-flow && git rebase main && git push --force-with-lease origin host-flow`
and the same for `participant-flow`. Vercel redeploys all three. Never merge a
flow branch into `main`; GitHub's "Compare & pull request" banners for them
are noise.

## Verify before claiming done

```
npm run build        # tsc -b + vite, must be clean
npm test             # Vitest — the state store (4)
npm run test:e2e     # Playwright on WebKit/iPhone 13 — smoke ×3, host spine, participant spine
```
First time: `npx playwright install webkit`. Playwright role queries need
`exact: true` where a name prefixes another ("Remind", "Allow", "Cancel"…),
and the Sheet scrim is clicked at `{ x: 10, y: 10 }` because its centre sits
under the panel. Nothing here has been checked by a human eye on a phone as
of 16 Sep 2026 — the tests prove the taps land, not that it feels right.

## Conventions

- Every tappable thing is a `<button>` or `<a>`; tests locate by role + name.
- Motion is part of the deliverable: presses scale, sheets slide, success
  states animate. A static screen is unfinished.
- Phone-first, `dvh` units, safe-area insets; ≥600px renders as a centred
  430px column. The body scrolls, not the page; footers stay put.
- Commit trailer: `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

## Known gaps (deliberate, for a later pass)

Second-pass screens not built: reminder SMS variants. Join with a code
(ORG 0b, `PJoinCode` at `/p/join-code`) is live since 23 Sep 2026: Landing's
button leads there, Party code (5 chars, uppercased) and Your phone
(`guestPhone`, formatted like the host's) enable Continue, which goes to the
P 3 lobby, then Verify (subtitle names the typed phone), then `PJoinInfo`.
Landing (ORG 0) is registered in the participant build too, so "Start a
party" hits NotFound there. P 8 (guest morning-after SMS) has no in-app link
since 23 Sep 2026: reach it by `/p/sms-after`. ORG 2 (management-link SMS) is not a
route any more: it shows as a `Notification` banner on the hub after Verify,
and "Reservation changed" does the same on ORG 10 after ORG 11. ORG 8
(Reservation) and ORG 8b (Walk-in notice) are not routes either since 22 Sep
2026: they are the confirm step of ORG 6c's sheet (same photo, Back returns to
the detail step); on Booked the sheet slides away, then ORG 9. Likewise
P 6 (spot-confirmed SMS) is a banner over `PBooked` (`/p/booked`, the
guest-side success screen), and P 3b is the guest's hub in both states:
waiting, then booked. P 9 is no longer a route: its content is the "See the
details" drawer on P 3b's booked card, and P 9b Who's coming lives on P 3b
too. "Join the party" on `PJoinInfo` plays spinner → check like Verify. The guest order is invite → P 3 lobby ("Verify and join") → P 2 →
`PJoinInfo` (`/p/join`, not in Figma: My location row + Preferences sheet,
Count me in disabled until a location is saved) → P 3 map (`/p/location`,
Save returns) → P 3b. P 3b's Edit opens a Your info drawer (location row →
the map screen, which returns with the drawer reopened; preference chips
inline). The host
"books" `BOOKING_DELAY_MS` (15 s) after the guest joins: `BookingWatcher`,
mounted by `RouteShell` on guest routes, flips `guestBooked` and drops the
banner on whatever screen is open; tapping it opens `PBooked`.
ORG 12 (host morning-after text) has no in-app link since 21 Sep 2026: reach
it by `/org/sms-after`. Resend code is live: the link reports progress, a
Messages banner brings a second code, the boxes refill. ORG 6 card time chips
are tappable and carry into ORG 6c; opening a card without one shows no slot
selected and the CTA waits for a time. Party size changes the slots on ORG 8
and ORG 11 (`slotsFor`, `bigTableTimes` from 7 guests). Inert-by-design
controls: Choose from contacts, Choose from
photos / Take a photo (both just restore the photo cover),
Edit info, See full menu, Cancel reservation. Since 22 Sep 2026: the hub's
Guests card is one tappable row: three 32px faces then "+N", the count line
("3 of 5 responded · 1 can't make it"), a chevron into See everyone, and
once everyone's in the invite-link card and the + go, "Everyone's in" is a
text line, and a single tappable Places card (`.places`) leads the page into
ORG 6 (`location.state.open` still preopens a sheet if a caller passes it);
See everyone rows (except the host) open an ActionSheet (Send a reminder /
Remove from the party) and guests who can't make it sit in their own group;
"Fair for everyone" became a small ranked tag (`spotTag`: "Best spot" on the
first option, "Great spot" on the rest) and the map's centre is a pulsing dot
with no label; tap-to-pick rows are `PickerField` (label above, field below,
same anatomy as `Input`); ORG 6c stacks tag / address / hours · booking by type
weight, no icons; time slots everywhere are outlined `chip--time` (36px, the
stepper matches); ORG 10 ends with a small "Start over" link that resets the tab; the
host picks preferences on ORG 1 from an "Add preferences (optional)" link
(`hostPrefs`, separate from the guest's) and sees them as a "Your preferences" row under the Guests card on ORG 4 (always shown, "Tap to add (optional)" when empty; tap opens the sheet); banner and SMS copy that names the party
takes the typed name (`sms.manageLink(name)` etc.); the host row in
`deriveGuests` carries the typed host name with an initial, no photo; tapping
a slot on an ORG 6 card opens ORG 6c with it selected; walk-in places have no
slots anywhere, the party's own time is used ("Choose this spot" → ORG 8b
"Notify everyone"); `CoverSheet` (ORG 4d) previews choices live and Cancel
restores, used on ORG 4 and ORG 10; "Can't make it" is `chip--danger`; ORG 1 fields sit in a `.form` (12px gap). The When picker
(`Input type="datetime-local"`) steps by 15 minutes and rounds typed values to
the grid (`snapMinutes`, tested); the same Input serves Edit details on ORG 4. On ORG 4 before everyone's in, the footer is only "Remind the N who haven't";
the invite-link card opens an "Invite people" drawer (link + Copy, then
Messages / WhatsApp / Email as real `sms:`/`wa.me`/`mailto:` links, and More =
Web Share API, falling back to copy). Copy avoids the word "fair" (22 Sep
2026): say "a spot that works for everyone".
Deferred polish: `Segmented` uses `role=tab` (should be radiogroup), sheets
lack focus trapping/Escape/swipe-to-dismiss, type scale is px not rem, the
first screen slides in from the left on initial load, SMS routes slide rather
than fade, landscape safe-area sides unused. Cross-device realism: location permission
and other state persist per tab across host → participant walk-throughs; use
"Prototype: start over". Map tiles come straight from tile.openstreetmap.org
(fine for prototype traffic, not for production); "Around me" always centres
on downtown Denver rather than reading real geolocation, so the mocked
permission dialog stays the only prompt testers see.
