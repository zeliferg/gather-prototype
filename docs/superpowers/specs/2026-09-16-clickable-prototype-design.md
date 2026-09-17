# Gather clickable prototype — design

Date: 2026-09-16
Source of truth for screens: Figma "Design Process", section **Flow1 v4** (`112:554`).

## Purpose

A browser-based, scripted click-through of the Gather flow so testers on
different phones can walk the organizer and participant journeys without
explanation. No backend, no real SMS, no shared state between devices.
Branding is unfinished; the prototype must survive a later visual pass by
keeping every colour, type and spacing decision in one token file.

## Non-goals

- No live state between phones. A guest "joining" on one phone never
  changes another phone.
- No real SMS, calendar, or maps integration. Choosers open and close;
  links in SMS mockups navigate within the prototype.
- No auth. The verify-code screen accepts any input.
- No admin or content editing.

## Stack

- Vite + React 19 + TypeScript.
- React Router (data-router API) for screens.
- Plain CSS with custom properties. No UI framework.
- Playwright for one end-to-end smoke test per flow.
- Deployed on Vercel, one project per flow branch.

## Structure

```
src/
  tokens.css          # every colour / type / radius / spacing var (v3/* from Figma)
  app.css             # reset, phone frame, shared primitives (button, chip, input, sheet)
  fixtures.ts         # Jordan's Dinner, five guests, three restaurants, times
  router.tsx          # route table; flow entry decided by VITE_FLOW
  components/         # Button, Chip, Input, Avatar, Sheet, PermissionDialog, SmsScreen, Map
  screens/
    org/              # one file per Figma frame, same name: OrgLanding.tsx, OrgCreateParty.tsx …
    p/                # PVerifyCode.tsx, PLobby.tsx, PJoinSubmit.tsx …
tests/
  host.spec.ts        # clicks the organizer spine end to end
  participant.spec.ts # clicks the participant spine end to end
```

Rules:
- One screen component per Figma frame, named after the frame so the
  Figma ↔ code mapping is obvious.
- Screens read scripted data from `fixtures.ts` only. They hold no
  fetched state.
- Bottom sheets, action sheets and the browser location permission
  dialog are overlays rendered by the screen that owns them, not routes.
- SMS moments are routes rendered by one `SmsScreen` component (gray
  Messages mockup); the link in the bubble is the only tap target.
- Ephemeral choices a tester makes (chosen radius, chosen time, "can't
  make it") live in a single `usePrototypeState` store (React context +
  `sessionStorage`) so a refresh doesn't reset the walk-through. Nothing
  else persists.

## Responsive behaviour

- Phone: the app fills the viewport. Bottom CTAs are sticky above the
  home indicator using `env(safe-area-inset-bottom)`. Scroll happens
  inside the content area, never the whole page.
- Desktop / tablet: the same layout renders as a centred 430 px column on
  the canvas colour, full viewport height, so a link opened on a laptop
  still reads as the phone experience. No separate desktop layout.
- All sizes in `rem`/viewport units. No hard-coded 390 px assumptions.

## Flows and branches

`VITE_FLOW` (`host` | `participant` | `all`) picks the entry route and
hides the other track's routes. `main` builds with `all`.

| Branch             | VITE_FLOW     | Vercel alias                            |
|--------------------|---------------|-----------------------------------------|
| `main`             | `all`         | `gather-prototype.vercel.app`           |
| `host-flow`        | `host`        | `gather-host-prototype.vercel.app`      |
| `participant-flow` | `participant` | `gather-participant-prototype.vercel.app` |

Flow branches carry only a `.env.production` with their `VITE_FLOW` and
any flow-specific copy. Shared changes land on `main`; flow branches
rebase onto it. A flow branch never edits `src/components` or
`src/tokens.css` directly.

## First-pass scope (the two spines)

Organizer: Landing → Create Party (location row → drawer with permission
→ Around me / Drop a pin) → SMS management link → Verify → Hub → (Remind,
See everyone) → List's ready → Options list / map → Restaurant detail →
Reservation (or Walk-in) → Confirmed → Party page (confirmed) → SMS
after dinner.

Participant: SMS invite → Verify → Lobby (before joining) → Join &
Submit (permission → Around me / Drop a pin) → Lobby (waiting) → SMS spot
confirmed → Party is here → Directions chooser / Calendar chooser / Who's
coming → Can't make it (confirm sheet → dropped-out state) → SMS after
dinner.

Second pass (not in the first build): Join with a code, Add a guest
sheet, Edit cover sheet, Edit reservation, reminder SMS variants.

## Screens ↔ Figma

Every screen file starts with a one-line comment naming its Figma frame
(e.g. `// Figma: ORG 4 — Invite & Party Details`). The Figma section is
authoritative for copy and layout; when the two disagree, fix the code.

## Motion

This is a web interaction, not a static click-through. Every interactive
moment gets deliberate motion, all driven by a small token set in
`tokens.css` (`--dur-fast/base/slow`, `--ease-out/in-out/spring`) so the
branding pass retunes it in one place:

- Buttons and chips: press scale (0.97) and colour transition on tap.
- Sheets and action sheets: slide up with the scrim fading in; dismiss
  reverses. The permission dialog scales in.
- Screen transitions: forward navigation slides in from the right,
  back slides out; SMS screens fade.
- Success states: the Confirmed check draws in and the ring pulses once;
  "Everyone's in" avatars settle into the circle; the "Reminder sent"
  chip swaps with a crossfade and returns to Remind + Waiting on reopen.
- Map: the radius ring eases when the radius chip changes; a dropped pin
  drops in.
- Progress bar on the hub animates to its value on mount.

Motion respects `prefers-reduced-motion` (durations collapse to 0, no
translations). Implemented with CSS transitions/keyframes and the View
Transitions API where supported; no animation library.

## Testing

- `tests/host.spec.ts` and `tests/participant.spec.ts` drive the full
  spine by visible text (role/name), asserting the final screen is
  reached. They run in CI on every push; a red test blocks a Vercel
  promotion.
- No unit tests for screens. Components get a test only if they carry
  logic (the prototype state store).

## Error handling

There are no network calls, so the only failure modes are a missing
route or a broken fixture reference. Unknown routes render a
"Not part of this prototype" screen with a link back to the flow's entry.
