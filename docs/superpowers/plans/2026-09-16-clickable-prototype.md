# Gather Clickable Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A browser-based, scripted click-through of the Gather organizer and participant flows, deployable per flow to a clearly named Vercel URL, with real motion on every interaction.

**Architecture:** Vite + React SPA. One screen component per Figma frame, reading scripted data from `fixtures.ts`; tester choices live in a small session-scoped store. Sheets, action sheets and the browser permission dialog are overlays owned by the screen that opens them. `VITE_FLOW` picks which track's routes are registered so each flow branch deploys only its own screens.

**Tech Stack:** Vite 6, React 18, TypeScript, react-router-dom 6 (data router), plain CSS with custom properties, Vitest (store only), Playwright (one smoke test per flow), Vercel.

**Spec:** `docs/superpowers/specs/2026-09-16-clickable-prototype-design.md`

## Global Constraints

- Node 25 / npm 11 are installed; use `npm`, not pnpm/yarn.
- Fonts: Inter (400/500/600) and Fraunces (600, roman + italic) from Google Fonts. Fraunces appears only on Landing's headline and Confirmed's title.
- Colour, type, radius, spacing and motion values live **only** in `src/tokens.css`. No hex or px duration literals anywhere else.
- Motion durations: `--dur-fast: 120ms`, `--dur-base: 220ms`, `--dur-slow: 360ms`. All collapse to `0ms` under `prefers-reduced-motion: reduce`.
- Screen files start with `// Figma: <frame name>` naming their Figma frame in section `Flow1 v4` (`112:554`).
- Copy is the Figma copy verbatim (strings are given in each task). Fixture names: party "Jordan's Dinner", host "Jordan Reyes", guests Priya Nair / Marcus Webb / Alex Chen / Sam Okafor, restaurants Tavola Verde / Corner Table / Noodle Bar Riverside.
- Phone-first layout; on viewports ≥ 600px the app is a centred 430px column on the canvas colour. No fixed 390px assumptions.
- Every tappable element is a `<button>` or `<a>` (Playwright locates by role + name).
- Commit after every task with a Conventional-Commit-style message and the trailer `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Assets already present: `public/denver.png` (map), `public/photos/{tavola,corner,noodle,cover}.jpg`.

---

## File map

| File | Responsibility |
|---|---|
| `index.html` | viewport meta with `viewport-fit=cover`, Google Fonts link, `#root` |
| `src/main.tsx` | mounts `<RouterProvider>` inside `<PrototypeStateProvider>` |
| `src/tokens.css` | all design + motion tokens, type utility classes |
| `src/app.css` | reset, `.phone` column, `.screen` layout, primitives' CSS, overlay + keyframes |
| `src/fixtures.ts` | party, guests, restaurants, times, SMS copy |
| `src/state.tsx` | `PrototypeStateProvider`, `usePrototypeState`, `defaultState` |
| `src/router.tsx` | route table gated by `VITE_FLOW`, `RouteShell` with transitions, `NotFound` |
| `src/components/Screen.tsx` | header (back/close), scrolling body, sticky footer |
| `src/components/Button.tsx`, `Chip.tsx`, `Input.tsx`, `Avatar.tsx`, `Segmented.tsx`, `CodeInput.tsx` | primitives |
| `src/components/Sheet.tsx` | bottom sheet with scrim, slide-up, `usePresence` |
| `src/components/ActionSheet.tsx` | iOS-style grouped options + Cancel |
| `src/components/PermissionDialog.tsx` | browser location prompt |
| `src/components/SmsScreen.tsx` | gray Messages mockup route |
| `src/components/MapView.tsx` | Denver map with around-me ring / dropped pin / option pins |
| `src/components/LocationPicker.tsx` | permission → Around me / Drop a pin → radius chips (shared by ORG 1b and P 3) |
| `src/components/DevHint.tsx` | small "Prototype: …" link for scripted jumps |
| `src/screens/org/*.tsx` | organizer screens |
| `src/screens/p/*.tsx` | participant screens |
| `tests/host.spec.ts`, `tests/participant.spec.ts` | Playwright spines |
| `vercel.json`, `.env.production` (flow branches only) | deployment |

---

### Task 1: Scaffold, fonts, tokens, phone column

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/tokens.css`, `src/app.css`, `src/App.tsx`
- Test: build passes; `npm run dev` renders the column

**Interfaces:**
- Produces: CSS custom properties listed below; type classes `.t-display .t-title .t-heading .t-body .t-body-med .t-secondary .t-caption .t-label .t-button`; layout classes `.phone`.

- [ ] **Step 1: Scaffold with Vite**

```bash
cd ~/Projects/gather-prototype
npm create vite@latest . -- --template react-ts
npm install
npm install react-router-dom@6
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @playwright/test
npx playwright install chromium
rm -f src/App.css src/index.css src/assets/react.svg public/vite.svg
```

If `npm create vite` refuses because the directory is not empty, run it in a temp dir and move `package.json vite.config.ts tsconfig*.json index.html src/` into the repo.

- [ ] **Step 2: Replace `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#F7F5F2" />
    <title>Gather</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,600&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Write `src/tokens.css`**

```css
:root {
  /* v3/Color from Figma */
  --bg-canvas: #F7F5F2;
  --bg-surface: #FFFFFF;
  --bg-subtle: #EFEBE6;
  --bg-accent-tint: #E7EDE6;
  --bg-info-tint: #DCE9F8;
  --text-primary: #1F1A17;
  --text-secondary: #6F675F;
  --text-on-accent: #FFFFFF;
  --text-accent: #3F4A3F;
  --border-hairline: #E8E2DB;
  --border-strong: #1F1A17;
  --accent: #3F4A3F;
  --accent-matcha: #C4FA80;
  --error: #B3402E;
  --scrim: rgba(0, 0, 0, 0.35);
  --sms-bubble: #E9E9EB;
  --sms-link: #0A66C2;

  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-serif: 'Fraunces', Georgia, serif;

  --radius-input: 12px;
  --radius-card: 16px;
  --radius-sheet: 20px;
  --radius-pill: 999px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;

  --phone-max: 430px;
  --gutter: 20px;

  --dur-fast: 120ms;
  --dur-base: 220ms;
  --dur-slow: 360ms;
  --ease-out: cubic-bezier(0.2, 0.8, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}

@media (prefers-reduced-motion: reduce) {
  :root { --dur-fast: 0ms; --dur-base: 0ms; --dur-slow: 0ms; }
}

/* v3/* text styles */
.t-display { font: 600 34px/40px var(--font-serif); letter-spacing: -0.01em; }
.t-title { font: 600 28px/34px var(--font-sans); letter-spacing: -0.01em; }
.t-heading { font: 600 20px/26px var(--font-sans); }
.t-body { font: 400 17px/24px var(--font-sans); }
.t-body-med { font: 500 17px/24px var(--font-sans); }
.t-secondary { font: 400 15px/20px var(--font-sans); }
.t-caption { font: 400 13px/18px var(--font-sans); }
.t-label { font: 500 13px/18px var(--font-sans); }
.t-button { font: 600 16px/20px var(--font-sans); }
.c-secondary { color: var(--text-secondary); }
.c-accent { color: var(--text-accent); }
```

- [ ] **Step 4: Write `src/app.css` (reset + column + screen layout)**

```css
@import './tokens.css';

*, *::before, *::after { box-sizing: border-box; }
html, body, #root { height: 100%; margin: 0; }
body {
  background: var(--bg-canvas);
  color: var(--text-primary);
  font: 400 17px/24px var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
}
button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }
h1, h2, h3, p { margin: 0; }
img { display: block; max-width: 100%; }

/* Phone column: fills the viewport on phones, centred 430px column on desktop */
.phone {
  position: relative;
  width: 100%;
  max-width: var(--phone-max);
  min-height: 100dvh;
  margin: 0 auto;
  background: var(--bg-canvas);
  overflow: hidden;
  isolation: isolate;
}
@media (min-width: 600px) {
  .phone { border-left: 1px solid var(--border-hairline); border-right: 1px solid var(--border-hairline); }
}

/* Screen layout */
.screen { display: grid; grid-template-rows: auto 1fr auto; min-height: 100dvh; }
.screen__header { padding: calc(var(--space-6) + env(safe-area-inset-top, 0px)) var(--gutter) 0; display: flex; align-items: center; justify-content: space-between; min-height: 56px; }
.screen__body { padding: var(--space-4) var(--gutter) var(--space-6); display: flex; flex-direction: column; gap: var(--space-4); }
.screen__footer { position: sticky; bottom: 0; padding: var(--space-3) var(--gutter) calc(var(--space-6) + env(safe-area-inset-bottom, 0px)); background: linear-gradient(to top, var(--bg-canvas) 70%, transparent); display: flex; flex-direction: column; gap: var(--space-2); }
.screen__title { display: flex; flex-direction: column; gap: var(--space-1); }
.icon-btn { width: 40px; height: 40px; margin-left: -8px; display: grid; place-items: center; border-radius: var(--radius-pill); transition: background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out); }
.icon-btn:active { background: var(--bg-subtle); transform: scale(0.94); }
.icon-btn--right { margin-left: 0; margin-right: -8px; }
.card { background: var(--bg-surface); border: 1px solid var(--border-hairline); border-radius: var(--radius-card); padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3); }
.row { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); }
.stack { display: flex; flex-direction: column; gap: var(--space-2); }
.hstack { display: flex; align-items: center; gap: var(--space-2); }
.link { color: var(--text-accent); font-weight: 500; }
.divider { height: 1px; background: var(--border-hairline); }
```

- [ ] **Step 5: Write `src/App.tsx` and `src/main.tsx`**

`src/App.tsx` (temporary — replaced by the router in Task 5):
```tsx
export default function App() {
  return (
    <div className="phone">
      <div className="screen">
        <div className="screen__header" />
        <div className="screen__body">
          <h1 className="t-display">Bring everyone <em>together</em></h1>
          <p className="t-body c-secondary">Tokens and column render.</p>
        </div>
      </div>
    </div>
  );
}
```

`src/main.tsx`:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './app.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 6: Verify build and dev render**

Run: `npm run build`
Expected: `✓ built in …` with no TypeScript errors.

Run: `npm run dev` and open the URL in a browser at a phone width and at desktop width.
Expected: headline in Fraunces, canvas-colour background; on desktop a centred column with hairline sides.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite app with tokens and phone column

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Fixtures and prototype state store

**Files:**
- Create: `src/fixtures.ts`, `src/state.tsx`, `src/state.test.tsx`, `vitest.config.ts`
- Modify: `package.json` (scripts)

**Interfaces:**
- Produces:
  - `party: { name, hostName, hostFirst, dateLong, dateShort, time, roughTime, code, inviteLink, manageLink, hostPhone, guestPhone }`
  - `guests: Guest[]` where `Guest = { id: string; name: string; initial: string; status: 'host' | 'responded' | 'waiting' }`
  - `restaurants: Restaurant[]` where `Restaurant = { id: 'tavola'|'corner'|'noodle'; name; cuisine; address; hours; reservations: boolean; times: string[]; photo: string; pin: { x: number; y: number } }`
  - `sms: { manageLink, reminder, invite, spotConfirmed, reminderTomorrow, reminder2h, afterGuest, afterHost, dropped }` each `{ time: string; text: string; link: string }`
  - `RadiusMi = 0.5 | 1 | 2 | 5`, `radiusOptions: { value: RadiusMi; label: string }[]`
  - `PrototypeState`, `defaultState`, `usePrototypeState(): [PrototypeState, (patch: Partial<PrototypeState>) => void, () => void]`, `PrototypeStateProvider`

- [ ] **Step 1: Write `src/fixtures.ts`**

```ts
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
  dropped: { time: 'Today 3:30 PM', text: "Priya can't make it to Jordan's Dinner anymore (“Sorry, a work thing came up”). You're now 4. Manage the party:", link: party.manageLink },
};
```

- [ ] **Step 2: Write the failing store test `src/state.test.tsx`**

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { PrototypeStateProvider, usePrototypeState, defaultState, STORAGE_KEY } from './state';

const wrapper = ({ children }: { children: React.ReactNode }) => <PrototypeStateProvider>{children}</PrototypeStateProvider>;

describe('usePrototypeState', () => {
  beforeEach(() => sessionStorage.clear());

  it('starts from defaultState', () => {
    const { result } = renderHook(() => usePrototypeState(), { wrapper });
    expect(result.current[0]).toEqual(defaultState);
  });

  it('merges a patch and persists it to sessionStorage', () => {
    const { result } = renderHook(() => usePrototypeState(), { wrapper });
    act(() => result.current[1]({ radiusMi: 5, locationMode: 'pin' }));
    expect(result.current[0].radiusMi).toBe(5);
    expect(result.current[0].locationMode).toBe('pin');
    expect(JSON.parse(sessionStorage.getItem(STORAGE_KEY)!).radiusMi).toBe(5);
  });

  it('rehydrates from sessionStorage', () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...defaultState, droppedOut: true }));
    const { result } = renderHook(() => usePrototypeState(), { wrapper });
    expect(result.current[0].droppedOut).toBe(true);
  });

  it('reset returns to defaultState and clears storage', () => {
    const { result } = renderHook(() => usePrototypeState(), { wrapper });
    act(() => result.current[1]({ joined: true }));
    act(() => result.current[2]());
    expect(result.current[0]).toEqual(defaultState);
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
```

- [ ] **Step 3: Add Vitest config and scripts**

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', include: ['src/**/*.test.tsx'] },
});
```

In `package.json` scripts add:
```json
"test": "vitest run",
"test:e2e": "playwright test"
```

Run: `npm test`
Expected: FAIL — `Cannot find module './state'`.

- [ ] **Step 4: Write `src/state.tsx`**

```tsx
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { RadiusMi, RestaurantId } from './fixtures';

export type PrototypeState = {
  permission: 'unknown' | 'granted' | 'denied';
  locationMode: 'around' | 'pin';
  radiusMi: RadiusMi;
  joined: boolean;
  flexible: boolean;
  droppedOut: boolean;
  remindedIds: string[];
  everyoneIn: boolean;
  selectedRestaurant: RestaurantId;
  selectedTime: string;
  booked: boolean;
};

export const defaultState: PrototypeState = {
  permission: 'unknown',
  locationMode: 'around',
  radiusMi: 2,
  joined: false,
  flexible: false,
  droppedOut: false,
  remindedIds: [],
  everyoneIn: false,
  selectedRestaurant: 'tavola',
  selectedTime: '7:00 PM',
  booked: false,
};

export const STORAGE_KEY = 'gather-prototype';

type Ctx = [PrototypeState, (patch: Partial<PrototypeState>) => void, () => void];
const StateContext = createContext<Ctx | null>(null);

function read(): PrototypeState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState;
  } catch {
    return defaultState;
  }
}

export function PrototypeStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PrototypeState>(read);
  const update = useCallback((patch: Partial<PrototypeState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* private mode */ }
      return next;
    });
  }, []);
  const reset = useCallback(() => {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* private mode */ }
    setState(defaultState);
  }, []);
  const value = useMemo<Ctx>(() => [state, update, reset], [state, update, reset]);
  return <StateContext.Provider value={value}>{children}</StateContext.Provider>;
}

export function usePrototypeState(): Ctx {
  const ctx = useContext(StateContext);
  if (!ctx) throw new Error('usePrototypeState must be used inside PrototypeStateProvider');
  return ctx;
}
```

- [ ] **Step 5: Run the tests**

Run: `npm test`
Expected: 4 passed.

- [ ] **Step 6: Commit**

```bash
git add src/fixtures.ts src/state.tsx src/state.test.tsx vitest.config.ts package.json package-lock.json
git commit -m "feat: add scripted fixtures and session-scoped prototype state

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Primitives — Screen, Button, Chip, Input, Avatar, Segmented, CodeInput

**Files:**
- Create: `src/components/Screen.tsx`, `Button.tsx`, `Chip.tsx`, `Input.tsx`, `Avatar.tsx`, `Segmented.tsx`, `CodeInput.tsx`, `src/components/icons.tsx`
- Modify: `src/app.css` (append primitives CSS), `src/App.tsx` (kitchen-sink render for visual check)

**Interfaces:**
- Produces:
  - `<Screen back? title? subtitle? footer? right? className?>{children}</Screen>` — `back` is `true` (navigate(-1)) or a function; `right` is a ReactNode rendered top-right (used for the close X).
  - `<Button variant='primary'|'secondary'|'ghost'|'danger' onClick type disabled>label</Button>` — full width by default.
  - `<Chip variant='neutral'|'selected'|'success'|'info' onClick?>label</Chip>`
  - `<Input label value onChange? placeholder? inputMode? />`
  - `<Avatar initial size? />` (size 40 default, 32 for stacks)
  - `<Segmented options={[{value,label}]} value onChange />`
  - `<CodeInput value onChange />` — 6 boxes, digits only.
  - `icons.tsx`: `Back`, `Chevron`, `Close`, `Check`, `Plus`, `Pin` SVG components (24px, `currentColor`).

- [ ] **Step 1: Write `src/components/icons.tsx`**

```tsx
type P = { size?: number };
const base = (size = 24) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true });
export const Back = ({ size }: P) => <svg {...base(size)}><path d="m15 6-6 6 6 6" /></svg>;
export const Chevron = ({ size }: P) => <svg {...base(size)}><path d="m9 6 6 6-6 6" /></svg>;
export const Close = ({ size }: P) => <svg {...base(size)}><path d="M6 6l12 12M18 6L6 18" /></svg>;
export const Check = ({ size }: P) => <svg {...base(size)}><path className="check-path" d="m5 12 5 5 9-10" /></svg>;
export const Plus = ({ size }: P) => <svg {...base(size)}><path d="M12 5v14M5 12h14" /></svg>;
export const Pin = ({ size }: P) => <svg width={size ?? 24} height={size ?? 24} viewBox="0 0 24 24" aria-hidden><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z" fill="currentColor" /><circle cx="12" cy="9" r="2.5" fill="#fff" /></svg>;
```

- [ ] **Step 2: Write `src/components/Screen.tsx`**

```tsx
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Back } from './icons';

type Props = {
  back?: boolean | (() => void);
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function Screen({ back, title, subtitle, right, footer, className, children }: Props) {
  const navigate = useNavigate();
  const onBack = typeof back === 'function' ? back : () => navigate(-1);
  return (
    <div className={`screen ${className ?? ''}`}>
      <div className="screen__header">
        {back ? (
          <button className="icon-btn" aria-label="Back" onClick={onBack}><Back /></button>
        ) : <span />}
        {right ?? null}
      </div>
      <div className="screen__body">
        {(title || subtitle) && (
          <div className="screen__title">
            {title && <h1 className="t-title">{title}</h1>}
            {subtitle && <p className="t-secondary c-secondary">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
      {footer && <div className="screen__footer">{footer}</div>}
    </div>
  );
}
```

- [ ] **Step 3: Write `Button.tsx`, `Chip.tsx`, `Input.tsx`, `Avatar.tsx`, `Segmented.tsx`, `CodeInput.tsx`**

`Button.tsx`:
```tsx
import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; inline?: boolean };

export function Button({ variant = 'primary', inline, className, ...rest }: Props) {
  return <button {...rest} className={`btn btn--${variant} ${inline ? 'btn--inline' : ''} ${className ?? ''}`} />;
}
```

`Chip.tsx`:
```tsx
import type { ReactNode } from 'react';

type Props = { variant?: 'neutral' | 'selected' | 'success' | 'info'; onClick?: () => void; children: ReactNode; className?: string };

export function Chip({ variant = 'neutral', onClick, children, className }: Props) {
  const cls = `chip chip--${variant} ${className ?? ''}`;
  if (onClick) return <button className={cls} onClick={onClick} aria-pressed={variant === 'selected'}>{children}</button>;
  return <span className={cls}>{children}</span>;
}
```

`Input.tsx`:
```tsx
import { useId } from 'react';

type Props = { label: string; value: string; onChange?: (v: string) => void; placeholder?: string; inputMode?: 'text' | 'tel' | 'numeric' };

export function Input({ label, value, onChange, placeholder, inputMode }: Props) {
  const id = useId();
  return (
    <div className="input">
      <label htmlFor={id} className="t-caption c-secondary">{label}</label>
      <input id={id} className="input__field t-body" value={value} placeholder={placeholder} inputMode={inputMode}
        readOnly={!onChange} onChange={(e) => onChange?.(e.target.value)} />
    </div>
  );
}
```

`Avatar.tsx`:
```tsx
export function Avatar({ initial, size = 40 }: { initial: string; size?: number }) {
  return <span className="avatar t-label" style={{ width: size, height: size }} aria-hidden>{initial}</span>;
}
```

`Segmented.tsx`:
```tsx
type Option<T extends string> = { value: T; label: string };

export function Segmented<T extends string>({ options, value, onChange }: { options: Option<T>[]; value: T; onChange: (v: T) => void }) {
  const idx = options.findIndex((o) => o.value === value);
  return (
    <div className="segmented" role="tablist" style={{ '--seg-count': options.length, '--seg-index': idx } as React.CSSProperties}>
      <span className="segmented__thumb" aria-hidden />
      {options.map((o) => (
        <button key={o.value} role="tab" aria-selected={o.value === value} className="segmented__tab t-label" onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}
```

`CodeInput.tsx`:
```tsx
import { useRef } from 'react';

export function CodeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const digits = value.replace(/\D/g, '').slice(0, 6);
  return (
    <div className="code" onClick={() => ref.current?.focus()}>
      <input ref={ref} className="code__hidden" inputMode="numeric" autoComplete="one-time-code" aria-label="6-digit code"
        value={digits} onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))} />
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} className={`code__box t-heading ${i === digits.length ? 'code__box--active' : ''}`}>{digits[i] ?? ''}</span>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Append primitives CSS to `src/app.css`**

```css
/* Button */
.btn { display: flex; align-items: center; justify-content: center; width: 100%; min-height: 52px; padding: 0 var(--space-5); border-radius: var(--radius-pill); font: 600 16px/20px var(--font-sans); transition: transform var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out), opacity var(--dur-fast); }
.btn:active { transform: scale(0.97); }
.btn:disabled { opacity: 0.4; pointer-events: none; }
.btn--inline { width: auto; }
.btn--primary { background: var(--accent); color: var(--text-on-accent); }
.btn--primary:active { background: #33403A; }
.btn--secondary { background: var(--bg-subtle); color: var(--text-primary); }
.btn--ghost { background: transparent; color: var(--text-accent); }
.btn--ghost:active { background: var(--bg-subtle); }
.btn--danger { background: transparent; color: var(--error); }

/* Chip */
.chip { display: inline-flex; align-items: center; min-height: 30px; padding: 6px 12px; border-radius: var(--radius-pill); font: 500 13px/18px var(--font-sans); white-space: nowrap; transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out); }
button.chip:active { transform: scale(0.95); }
.chip--neutral { background: var(--bg-subtle); color: var(--text-primary); }
.chip--selected { background: var(--accent); color: var(--text-on-accent); }
.chip--success { background: var(--bg-accent-tint); color: var(--text-accent); }
.chip--info { background: var(--bg-info-tint); color: var(--text-primary); }
.chip-row { display: flex; flex-wrap: wrap; gap: var(--space-2); }

/* Input */
.input { display: flex; flex-direction: column; gap: 6px; }
.input__field { width: 100%; min-height: 52px; padding: 0 var(--space-4); border: 1px solid var(--border-hairline); border-radius: var(--radius-input); background: var(--bg-surface); color: var(--text-primary); outline: none; transition: border-color var(--dur-fast), box-shadow var(--dur-fast); }
.input__field::placeholder { color: var(--text-secondary); }
.input__field:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--bg-accent-tint); }

/* Avatar */
.avatar { display: inline-grid; place-items: center; border-radius: var(--radius-pill); background: var(--bg-info-tint); color: var(--text-primary); border: 2px solid var(--bg-surface); flex: none; }
.avatar-stack { display: flex; }
.avatar-stack > * + * { margin-left: -8px; }
.avatar--more { background: var(--bg-subtle); }

/* Segmented */
.segmented { position: relative; display: grid; grid-template-columns: repeat(var(--seg-count), 1fr); padding: 3px; gap: 2px; background: var(--bg-subtle); border-radius: 10px; }
.segmented__thumb { position: absolute; top: 3px; bottom: 3px; left: 3px; width: calc((100% - 6px - (var(--seg-count) - 1) * 2px) / var(--seg-count)); transform: translateX(calc(var(--seg-index) * (100% + 2px))); background: var(--bg-surface); border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.06); transition: transform var(--dur-base) var(--ease-out); }
.segmented__tab { position: relative; min-height: 32px; border-radius: 8px; color: var(--text-secondary); transition: color var(--dur-fast); }
.segmented__tab[aria-selected="true"] { color: var(--text-primary); }

/* Code input */
.code { position: relative; display: flex; gap: var(--space-2); }
.code__hidden { position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%; }
.code__box { flex: 1; aspect-ratio: 1; display: grid; place-items: center; border: 1px solid var(--border-hairline); border-radius: var(--radius-input); background: var(--bg-surface); transition: border-color var(--dur-fast), transform var(--dur-fast) var(--ease-spring); }
.code__box--active { border-color: var(--accent); }
.code__box:not(:empty) { animation: pop var(--dur-base) var(--ease-spring); }
@keyframes pop { from { transform: scale(0.85); } to { transform: scale(1); } }
```

- [ ] **Step 5: Kitchen-sink render in `src/App.tsx` (temporary)**

```tsx
import { useState } from 'react';
import { Screen } from './components/Screen';
import { Button } from './components/Button';
import { Chip } from './components/Chip';
import { Input } from './components/Input';
import { Avatar } from './components/Avatar';
import { Segmented } from './components/Segmented';
import { CodeInput } from './components/CodeInput';

export default function App() {
  const [seg, setSeg] = useState<'around' | 'pin'>('around');
  const [code, setCode] = useState('42');
  return (
    <div className="phone">
      <Screen title="Kitchen sink" subtitle="Every primitive, once." footer={<><Button>Primary</Button><Button variant="ghost">Ghost</Button></>}>
        <Input label="Your name" value="Jordan Reyes" />
        <div className="chip-row"><Chip>Neutral</Chip><Chip variant="selected">Selected</Chip><Chip variant="success">Success</Chip><Chip variant="info">Info</Chip></div>
        <div className="avatar-stack"><Avatar initial="J" /><Avatar initial="P" /><Avatar initial="M" /></div>
        <Segmented options={[{ value: 'around', label: 'Around me' }, { value: 'pin', label: 'Drop a pin' }]} value={seg} onChange={setSeg} />
        <CodeInput value={code} onChange={setCode} />
        <Button variant="secondary">Secondary</Button>
        <Button variant="danger">Danger</Button>
      </Screen>
    </div>
  );
}
```

Run: `npm run dev`. In the browser: tap the segmented control (thumb slides), type into the code boxes (boxes pop), press buttons (scale on press).
Expected: all primitives match the Figma v3 look — Kale-fill primary pill, hairline inputs, tint chips.

- [ ] **Step 6: Commit**

```bash
git add src/components src/app.css src/App.tsx
git commit -m "feat: add screen layout and UI primitives with press motion

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Overlays and mockups — Sheet, ActionSheet, PermissionDialog, SmsScreen, MapView, LocationPicker, DevHint

**Files:**
- Create: `src/components/usePresence.ts`, `Sheet.tsx`, `ActionSheet.tsx`, `PermissionDialog.tsx`, `SmsScreen.tsx`, `MapView.tsx`, `LocationPicker.tsx`, `DevHint.tsx`
- Modify: `src/app.css` (append overlay CSS), `src/App.tsx` (temporary demo)

**Interfaces:**
- Produces:
  - `usePresence(open: boolean): { mounted: boolean; visible: boolean }` — keeps the node mounted for `--dur-base` after `open` goes false so exit animations play.
  - `<Sheet open onClose title? subtitle?>{children}</Sheet>`
  - `<ActionSheet open title options={[{ label, onSelect? }]} onClose />` — every option closes the sheet after `onSelect`.
  - `<PermissionDialog open body onAllow onDeny />` — title is always “gather.app” would like to use your current location.
  - `<SmsScreen time text link to />` — full screen; `to` is the route the link navigates to.
  - `<MapView mode='empty'|'around'|'pin'|'options' radiusMi? height? onSelectPin?(id) />`
  - `<LocationPicker context='host'|'guest' />` — renders permission dialog (once), Segmented (Around me / Drop a pin), MapView, radius card; reads/writes `permission`, `locationMode`, `radiusMi` in the store.
  - `<DevHint to>label</DevHint>` — caption-sized link for scripted jumps.

- [ ] **Step 1: Write `usePresence.ts`**

```ts
import { useEffect, useState } from 'react';

const EXIT_MS = 260;

export function usePresence(open: boolean) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);
  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const t = setTimeout(() => setMounted(false), EXIT_MS);
    return () => clearTimeout(t);
  }, [open]);
  return { mounted, visible };
}
```

- [ ] **Step 2: Write `Sheet.tsx`, `ActionSheet.tsx`, `PermissionDialog.tsx`**

`Sheet.tsx`:
```tsx
import type { ReactNode } from 'react';
import { usePresence } from './usePresence';

type Props = { open: boolean; onClose: () => void; title?: string; subtitle?: string; children: ReactNode };

export function Sheet({ open, onClose, title, subtitle, children }: Props) {
  const { mounted, visible } = usePresence(open);
  if (!mounted) return null;
  return (
    <div className={`overlay ${visible ? 'overlay--in' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
      <button className="overlay__scrim" aria-label="Close" onClick={onClose} />
      <div className="sheet">
        <span className="sheet__handle" aria-hidden />
        {(title || subtitle) && (
          <div className="screen__title">
            {title && <h2 className="t-heading">{title}</h2>}
            {subtitle && <p className="t-secondary c-secondary">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
```

`ActionSheet.tsx`:
```tsx
import { usePresence } from './usePresence';

type Option = { label: string; onSelect?: () => void };
type Props = { open: boolean; title: string; options: Option[]; onClose: () => void };

export function ActionSheet({ open, title, options, onClose }: Props) {
  const { mounted, visible } = usePresence(open);
  if (!mounted) return null;
  return (
    <div className={`overlay ${visible ? 'overlay--in' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
      <button className="overlay__scrim" aria-label="Close" onClick={onClose} />
      <div className="action-sheet">
        <div className="action-sheet__group">
          <div className="action-sheet__title t-caption c-secondary">{title}</div>
          {options.map((o) => (
            <button key={o.label} className="action-sheet__option t-body c-accent" onClick={() => { o.onSelect?.(); onClose(); }}>{o.label}</button>
          ))}
        </div>
        <div className="action-sheet__group">
          <button className="action-sheet__option t-body-med" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
```

`PermissionDialog.tsx`:
```tsx
import { usePresence } from './usePresence';

type Props = { open: boolean; body: string; onAllow: () => void; onDeny: () => void };

export function PermissionDialog({ open, body, onAllow, onDeny }: Props) {
  const { mounted, visible } = usePresence(open);
  if (!mounted) return null;
  return (
    <div className={`overlay overlay--center ${visible ? 'overlay--in' : ''}`} role="alertdialog" aria-modal="true" aria-label="Location permission">
      <div className="overlay__scrim" />
      <div className="permission">
        <div className="permission__text">
          <p className="t-body-med">“gather.app” would like to use your current location</p>
          <p className="t-caption c-secondary">{body}</p>
        </div>
        <div className="permission__buttons">
          <button className="permission__btn t-body" onClick={onDeny}>Don't Allow</button>
          <button className="permission__btn t-body-med c-accent" onClick={onAllow}>Allow</button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write `SmsScreen.tsx`, `MapView.tsx`, `DevHint.tsx`**

`SmsScreen.tsx`:
```tsx
import { Link } from 'react-router-dom';

type Props = { time: string; text: string; link: string; to: string };

export function SmsScreen({ time, text, link, to }: Props) {
  return (
    <div className="sms">
      <div className="sms__contact">
        <span className="sms__avatar t-heading">G</span>
        <span className="t-caption c-secondary">Gather</span>
      </div>
      <div className="divider" />
      <p className="t-caption c-secondary sms__time">{time}</p>
      <div className="sms__bubble t-body">
        <p>{text}</p>
        <Link className="sms__link" to={to}>{link}</Link>
      </div>
    </div>
  );
}
```

`MapView.tsx`:
```tsx
import { fairPoint, restaurants, type RadiusMi, type RestaurantId } from '../fixtures';
import { Pin } from './icons';

type Props = {
  mode: 'empty' | 'around' | 'pin' | 'options';
  radiusMi?: RadiusMi;
  height?: number;
  onSelectPin?: (id: RestaurantId) => void;
};

const RING_PX: Record<RadiusMi, number> = { 0.5: 70, 1: 110, 2: 150, 5: 210 };

export function MapView({ mode, radiusMi = 2, height = 220, onSelectPin }: Props) {
  const ring = RING_PX[radiusMi];
  const center = mode === 'pin' ? { left: '66%', top: '50%' } : { left: '50%', top: '50%' };
  return (
    <div className="map" style={{ height }} aria-label="Map of Denver" role="img">
      {(mode === 'around' || mode === 'pin') && (
        <span className={`map__ring ${mode === 'pin' ? 'map__ring--pin' : ''}`} style={{ width: ring, height: ring, ...center }} />
      )}
      {mode === 'around' && <span className="map__me" style={center} />}
      {mode === 'pin' && <span className="map__pin" style={center}><Pin size={28} /></span>}
      {mode === 'options' && (
        <>
          <span className="map__fair t-label" style={{ left: `${fairPoint.x * 100}%`, top: `${fairPoint.y * 100}%` }}>Fair meeting point</span>
          {restaurants.map((r) => (
            <button key={r.id} className="map__option t-label" style={{ left: `${r.pin.x * 100}%`, top: `${r.pin.y * 100}%` }} onClick={() => onSelectPin?.(r.id)}>
              <span className="map__dot" />{r.name}
            </button>
          ))}
        </>
      )}
    </div>
  );
}
```

`DevHint.tsx`:
```tsx
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

export function DevHint({ to, children }: { to: string; children: ReactNode }) {
  return <Link className="devhint t-caption" to={to}>Prototype: {children} →</Link>;
}
```

- [ ] **Step 4: Write `LocationPicker.tsx`**

```tsx
import { useState } from 'react';
import { usePrototypeState } from '../state';
import { radiusOptions } from '../fixtures';
import { Segmented } from './Segmented';
import { MapView } from './MapView';
import { Chip } from './Chip';
import { Input } from './Input';
import { PermissionDialog } from './PermissionDialog';

type Props = { context: 'host' | 'guest' };

export function LocationPicker({ context }: Props) {
  const [state, update] = usePrototypeState();
  const [address, setAddress] = useState(state.permission === 'granted' ? 'Current location' : '');
  const askPermission = state.permission === 'unknown';
  const mode = state.locationMode;
  const mapMode = state.permission === 'granted' || mode === 'pin' ? mode : 'empty';

  return (
    <>
      <PermissionDialog
        open={askPermission}
        body={context === 'host' ? "Only used to find a spot that's fair for everyone. Guests never see it." : "Only used to find a spot that's fair for everyone. Nobody sees your exact location."}
        onAllow={() => { update({ permission: 'granted', locationMode: 'around' }); setAddress('Current location'); }}
        onDeny={() => { update({ permission: 'denied', locationMode: 'pin' }); }}
      />
      {context === 'host' && (
        <Input label="Search an address or neighborhood" value={address} onChange={setAddress} placeholder="Search an address or neighborhood" />
      )}
      <Segmented
        options={[{ value: 'around', label: 'Around me' }, { value: 'pin', label: 'Drop a pin' }]}
        value={mode}
        onChange={(v) => { update({ locationMode: v }); if (v === 'pin' && context === 'host') setAddress('RiNo, Denver'); if (v === 'around' && state.permission === 'granted') setAddress('Current location'); }}
      />
      <MapView mode={mapMode} radiusMi={state.radiusMi} />
      <div className="card">
        <p className="t-body-med">{mode === 'pin' ? 'How far from the pin?' : 'How far would you go?'}</p>
        <div className="chip-row">
          {radiusOptions.map((o) => (
            <Chip key={o.value} variant={o.value === state.radiusMi ? 'selected' : 'neutral'} onClick={() => update({ radiusMi: o.value })}>{o.label}</Chip>
          ))}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 5: Append overlay, SMS, map CSS to `src/app.css`**

```css
/* Overlays */
.overlay { position: absolute; inset: 0; z-index: 10; display: flex; flex-direction: column; justify-content: flex-end; }
.overlay--center { justify-content: center; align-items: center; }
.overlay__scrim { position: absolute; inset: 0; background: var(--scrim); opacity: 0; transition: opacity var(--dur-base) var(--ease-out); }
.overlay--in .overlay__scrim { opacity: 1; }
.sheet { position: relative; background: var(--bg-surface); border-radius: var(--radius-sheet) var(--radius-sheet) 0 0; padding: var(--space-3) var(--gutter) calc(var(--space-8) + env(safe-area-inset-bottom, 0px)); display: flex; flex-direction: column; gap: var(--space-4); transform: translateY(100%); transition: transform var(--dur-slow) var(--ease-out); max-height: 88dvh; overflow-y: auto; }
.overlay--in .sheet { transform: translateY(0); }
.sheet__handle { align-self: center; width: 36px; height: 5px; border-radius: 3px; background: var(--border-hairline); }
.action-sheet { position: relative; margin: 0 var(--space-2) calc(var(--space-8) + env(safe-area-inset-bottom, 0px)); display: flex; flex-direction: column; gap: var(--space-2); transform: translateY(110%); transition: transform var(--dur-slow) var(--ease-out); }
.overlay--in .action-sheet { transform: translateY(0); }
.action-sheet__group { background: var(--bg-surface); border-radius: 14px; overflow: hidden; }
.action-sheet__title { display: grid; place-items: center; min-height: 40px; border-bottom: 1px solid var(--border-hairline); }
.action-sheet__option { width: 100%; min-height: 56px; display: grid; place-items: center; transition: background var(--dur-fast); }
.action-sheet__option + .action-sheet__option { border-top: 1px solid var(--border-hairline); }
.action-sheet__option:active { background: var(--bg-subtle); }
.permission { position: relative; width: 270px; background: var(--bg-surface); border-radius: 14px; box-shadow: 0 8px 24px rgba(0,0,0,0.18); overflow: hidden; transform: scale(0.9); opacity: 0; transition: transform var(--dur-base) var(--ease-spring), opacity var(--dur-base); }
.overlay--in .permission { transform: scale(1); opacity: 1; }
.permission__text { padding: 20px 16px 18px; text-align: center; display: flex; flex-direction: column; gap: 6px; }
.permission__buttons { display: grid; grid-template-columns: 1fr 1px 1fr; border-top: 1px solid var(--border-hairline); }
.permission__buttons::before { content: ''; grid-column: 2; background: var(--border-hairline); }
.permission__btn { min-height: 46px; }
.permission__btn:first-child { grid-column: 1; }
.permission__btn:last-child { grid-column: 3; }

/* SMS mockup */
.sms { min-height: 100dvh; padding: calc(var(--space-8) + env(safe-area-inset-top, 0px)) var(--space-4) var(--space-8); background: #fff; display: flex; flex-direction: column; align-items: center; gap: var(--space-3); }
.sms__contact { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.sms__avatar { width: 44px; height: 44px; border-radius: 50%; background: var(--accent); color: #fff; display: grid; place-items: center; }
.sms .divider { width: 100%; }
.sms__time { margin-top: var(--space-2); }
.sms__bubble { align-self: flex-start; max-width: 280px; padding: 12px 14px; border-radius: 18px; background: var(--sms-bubble); display: flex; flex-direction: column; gap: 6px; animation: bubble-in var(--dur-slow) var(--ease-spring) both; transform-origin: bottom left; }
.sms__link { color: var(--sms-link); text-decoration: underline; }
@keyframes bubble-in { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }

/* Map */
.map { position: relative; width: 100%; border-radius: var(--radius-card); border: 1px solid var(--border-hairline); background: var(--bg-subtle) url('/denver.png') center / cover no-repeat; overflow: hidden; }
.map::after { content: ''; position: absolute; inset: 0; background: rgba(247, 245, 242, 0.22); pointer-events: none; }
.map__ring { position: absolute; transform: translate(-50%, -50%); border-radius: 50%; background: rgba(231, 237, 230, 0.85); border: 1.5px solid var(--accent); transition: width var(--dur-slow) var(--ease-spring), height var(--dur-slow) var(--ease-spring), left var(--dur-slow) var(--ease-out); z-index: 1; }
.map__me { position: absolute; width: 14px; height: 14px; transform: translate(-50%, -50%); border-radius: 50%; background: var(--accent); border: 3px solid #fff; box-shadow: 0 0 0 0 rgba(63,74,63,0.4); animation: pulse 2s var(--ease-out) infinite; z-index: 2; }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(63,74,63,0.35); } 100% { box-shadow: 0 0 0 16px rgba(63,74,63,0); } }
.map__pin { position: absolute; transform: translate(-50%, -100%); color: var(--accent); animation: drop var(--dur-slow) var(--ease-spring) both; z-index: 2; }
@keyframes drop { from { transform: translate(-50%, -160%); opacity: 0; } to { transform: translate(-50%, -100%); opacity: 1; } }
.map__fair { position: absolute; transform: translate(-50%, -50%); padding: 6px 12px; border-radius: var(--radius-pill); background: var(--accent); color: var(--text-on-accent); z-index: 2; }
.map__option { position: absolute; transform: translate(-30%, -50%); display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: var(--radius-pill); background: var(--bg-surface); border: 1px solid var(--border-hairline); box-shadow: 0 2px 8px rgba(0,0,0,0.08); z-index: 2; transition: transform var(--dur-fast) var(--ease-out); }
.map__option:active { transform: translate(-30%, -50%) scale(0.95); }
.map__dot { width: 8px; height: 8px; border-radius: 50%; background: var(--text-primary); }
.devhint { align-self: center; color: var(--text-secondary); border-bottom: 1px dashed var(--border-hairline); text-decoration: none; }
```

- [ ] **Step 6: Demo in `src/App.tsx` (temporary) and verify**

```tsx
import { useState } from 'react';
import { PrototypeStateProvider } from './state';
import { Screen } from './components/Screen';
import { Button } from './components/Button';
import { Sheet } from './components/Sheet';
import { ActionSheet } from './components/ActionSheet';
import { LocationPicker } from './components/LocationPicker';

function Demo() {
  const [sheet, setSheet] = useState(false);
  const [action, setAction] = useState(false);
  return (
    <Screen title="Overlays" footer={<><Button onClick={() => setSheet(true)}>Open sheet</Button><Button variant="secondary" onClick={() => setAction(true)}>Open action sheet</Button></>}>
      <LocationPicker context="host" />
      <Sheet open={sheet} onClose={() => setSheet(false)} title="Your location" subtitle="Only used to find a fair spot.">
        <Button onClick={() => setSheet(false)}>Use this location</Button>
      </Sheet>
      <ActionSheet open={action} title="Open Tavola Verde in" options={[{ label: 'Apple Maps' }, { label: 'Google Maps' }]} onClose={() => setAction(false)} />
    </Screen>
  );
}

export default function App() {
  return <PrototypeStateProvider><div className="phone"><Demo /></div></PrototypeStateProvider>;
}
```

Run: `npm run dev`. Expected: permission dialog scales in on load; Allow → ring + pulsing dot appear on the Denver map; switching to Drop a pin drops the pin; radius chips resize the ring with a spring; sheet slides up over a fading scrim; action sheet slides up as two white groups.

- [ ] **Step 7: Commit**

```bash
git add src/components src/app.css src/App.tsx
git commit -m "feat: add sheets, permission dialog, SMS mockup, Denver map and location picker

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Router, flow gating, screen transitions, Playwright harness

**Files:**
- Create: `src/router.tsx`, `src/screens/NotFound.tsx`, `playwright.config.ts`, `tests/smoke.spec.ts`, `src/vite-env.d.ts` (augment)
- Modify: `src/main.tsx`, `src/app.css` (append transition CSS)
- Delete: `src/App.tsx`

**Interfaces:**
- Produces: `FLOW: 'host' | 'participant' | 'all'`; route paths (used by every screen's `navigate()`):
  - Organizer: `/org`, `/org/create`, `/org/sms-link`, `/org/verify`, `/org/hub`, `/org/list-ready`, `/org/options`, `/org/reserve`, `/org/walk-in`, `/org/confirmed`, `/org/party`, `/org/sms-after`
  - Participant: `/p`, `/p/verify`, `/p/lobby`, `/p/join`, `/p/waiting`, `/p/sms-confirmed`, `/p/party`, `/p/dropped`, `/p/sms-after`
  - `RouteShell` wraps every page in `.phone` and animates on location change.
  - Until screens exist (Tasks 6–9) each path renders a `Stub` showing its own path; the smoke test only asserts routing.

- [ ] **Step 1: Write `src/vite-env.d.ts` augmentation**

```ts
/// <reference types="vite/client" />
interface ImportMetaEnv { readonly VITE_FLOW?: 'host' | 'participant' | 'all' }
```

- [ ] **Step 2: Write `src/screens/NotFound.tsx`**

```tsx
import { Link } from 'react-router-dom';
import { Screen } from '../components/Screen';
import { FLOW } from '../router';

export function NotFound() {
  const home = FLOW === 'participant' ? '/p' : '/org';
  return (
    <Screen title="Not part of this prototype" subtitle="This screen isn't built into the flow you're testing.">
      <Link className="link" to={home}>Back to the start</Link>
    </Screen>
  );
}
```

- [ ] **Step 3: Write `src/router.tsx`**

```tsx
import { createBrowserRouter, Navigate, Outlet, useLocation, useNavigationType, type RouteObject } from 'react-router-dom';
import { NotFound } from './screens/NotFound';

export const FLOW: 'host' | 'participant' | 'all' = import.meta.env.VITE_FLOW ?? 'all';

function Stub() {
  const { pathname } = useLocation();
  return <div className="screen"><div className="screen__body"><p className="t-body">{pathname}</p></div></div>;
}

export function RouteShell() {
  const location = useLocation();
  const navType = useNavigationType();
  return (
    <div className="phone">
      <div key={location.key} className={`route ${navType === 'POP' ? 'route--back' : 'route--forward'}`}>
        <Outlet />
      </div>
    </div>
  );
}

// Screens are registered here as tasks land. Replace `Stub` with the real component.
export const orgRoutes: RouteObject[] = [
  { path: '/org', element: <Stub /> },
  { path: '/org/create', element: <Stub /> },
  { path: '/org/sms-link', element: <Stub /> },
  { path: '/org/verify', element: <Stub /> },
  { path: '/org/hub', element: <Stub /> },
  { path: '/org/list-ready', element: <Stub /> },
  { path: '/org/options', element: <Stub /> },
  { path: '/org/reserve', element: <Stub /> },
  { path: '/org/walk-in', element: <Stub /> },
  { path: '/org/confirmed', element: <Stub /> },
  { path: '/org/party', element: <Stub /> },
  { path: '/org/sms-after', element: <Stub /> },
];

export const pRoutes: RouteObject[] = [
  { path: '/p', element: <Stub /> },
  { path: '/p/verify', element: <Stub /> },
  { path: '/p/lobby', element: <Stub /> },
  { path: '/p/join', element: <Stub /> },
  { path: '/p/waiting', element: <Stub /> },
  { path: '/p/sms-confirmed', element: <Stub /> },
  { path: '/p/party', element: <Stub /> },
  { path: '/p/dropped', element: <Stub /> },
  { path: '/p/sms-after', element: <Stub /> },
];

const entry = FLOW === 'participant' ? '/p' : '/org';

export const router = createBrowserRouter([
  {
    element: <RouteShell />,
    children: [
      { path: '/', element: <Navigate to={entry} replace /> },
      ...(FLOW !== 'participant' ? orgRoutes : []),
      ...(FLOW !== 'host' ? pRoutes : []),
      { path: '*', element: <NotFound /> },
    ],
  },
]);
```

- [ ] **Step 4: Replace `src/main.tsx`, delete `src/App.tsx`**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './app.css';
import { router } from './router';
import { PrototypeStateProvider } from './state';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PrototypeStateProvider>
      <RouterProvider router={router} />
    </PrototypeStateProvider>
  </React.StrictMode>,
);
```

```bash
rm src/App.tsx
```

- [ ] **Step 5: Append route transition CSS to `src/app.css`**

```css
/* Route transitions */
.route { min-height: 100dvh; }
.route--forward { animation: slide-in var(--dur-base) var(--ease-out) both; }
.route--back { animation: slide-back var(--dur-base) var(--ease-out) both; }
@keyframes slide-in { from { transform: translateX(24px); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes slide-back { from { transform: translateX(-24px); opacity: 0; } to { transform: none; opacity: 1; } }
```

- [ ] **Step 6: Write `playwright.config.ts` and the routing smoke test**

`playwright.config.ts`:
```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  use: { baseURL: 'http://localhost:4173', ...devices['iPhone 13'] },
  webServer: { command: 'npm run build && npm run preview -- --port 4173', port: 4173, reuseExistingServer: !process.env.CI },
  reporter: 'list',
});
```

`tests/smoke.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

test('root redirects to the organizer entry', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/org$/);
});

test('unknown routes show the not-found screen', async ({ page }) => {
  await page.goto('/nope');
  await expect(page.getByRole('heading', { name: 'Not part of this prototype' })).toBeVisible();
});
```

Run: `npm run test:e2e`
Expected: 2 passed.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add flow-gated router, route transitions and Playwright harness

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Organizer screens A — Landing, Create Party (+ location drawer), SMS link, Verify, Hub (+ See everyone, Remind)

**Files:**
- Create: `src/screens/org/OrgLanding.tsx`, `OrgCreateParty.tsx`, `OrgSmsLink.tsx`, `OrgVerify.tsx`, `OrgHub.tsx`, `src/components/GatheringCircle.tsx`, `src/components/GuestRow.tsx`
- Modify: `src/router.tsx` (replace stubs), `src/app.css` (append)

**Interfaces:**
- Consumes: primitives (Task 3), overlays + `LocationPicker` (Task 4), `party`, `guests`, `sms` (Task 2), `usePrototypeState`.
- Produces: `<GatheringCircle initials={string[]} centerCheck? />` — the avatar ring illustration used by Landing and List's ready; `<GuestRow guest right />` — avatar + name + right-side content, hairline bottom.

- [ ] **Step 1: Write `GatheringCircle.tsx` and `GuestRow.tsx`**

`GatheringCircle.tsx`:
```tsx
import { Avatar } from './Avatar';
import { Check } from './icons';

export function GatheringCircle({ initials, centerCheck }: { initials: string[]; centerCheck?: boolean }) {
  const n = initials.length;
  return (
    <div className={`circle ${centerCheck ? 'circle--done' : ''}`} aria-hidden>
      <span className="circle__ring" />
      {initials.map((i, k) => {
        const a = (k / n) * Math.PI * 2 - Math.PI / 2;
        return <span key={k} className="circle__seat" style={{ left: `${50 + 50 * Math.cos(a)}%`, top: `${50 + 50 * Math.sin(a)}%`, animationDelay: `${k * 60}ms` }}><Avatar initial={i} /></span>;
      })}
      {centerCheck && <span className="circle__check"><Check /></span>}
    </div>
  );
}
```

`GuestRow.tsx`:
```tsx
import type { ReactNode } from 'react';
import type { Guest } from '../fixtures';
import { Avatar } from './Avatar';

export function GuestRow({ guest, right }: { guest: Guest; right?: ReactNode }) {
  return (
    <div className="guest-row">
      <div className="hstack" style={{ gap: 12 }}><Avatar initial={guest.initial} /><span className="t-body">{guest.name}</span></div>
      <div className="hstack">{right}</div>
    </div>
  );
}
```

- [ ] **Step 2: Write `OrgLanding.tsx`**

```tsx
// Figma: ORG 0 — Landing
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { GatheringCircle } from '../../components/GatheringCircle';

export function OrgLanding() {
  const navigate = useNavigate();
  return (
    <Screen className="landing" footer={<>
      <Button onClick={() => navigate('/org/create')}>Start a party</Button>
      <Button variant="secondary" onClick={() => navigate('/org/join-code')}>Join with a code</Button>
      <p className="t-caption c-secondary" style={{ textAlign: 'center' }}>Got a text invite? Tap the link. No account needed.</p>
    </>}>
      <p className="t-label" style={{ textAlign: 'center' }}>Gather</p>
      <GatheringCircle initials={['J', 'P', 'M', 'A', 'S', 'L']} />
      <h1 className="t-display" style={{ textAlign: 'center' }}>Bring everyone <em>together</em></h1>
      <p className="t-secondary c-secondary" style={{ textAlign: 'center' }}>Tell us where everyone's coming from. We'll find the spot that's fair for all of you.</p>
    </Screen>
  );
}
```

`/org/join-code` is second-pass; it will hit NotFound until then, which is acceptable.

- [ ] **Step 3: Write `OrgCreateParty.tsx`**

```tsx
// Figma: ORG 1 — Create Party (+ ORG 1a/1b/1c location drawer states)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Sheet } from '../../components/Sheet';
import { LocationPicker } from '../../components/LocationPicker';
import { Chevron } from '../../components/icons';
import { party, radiusOptions } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function OrgCreateParty() {
  const navigate = useNavigate();
  const [state] = usePrototypeState();
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const radius = radiusOptions.find((o) => o.value === state.radiusMi)!.label;
  const summary = touched ? `${state.locationMode === 'pin' ? 'RiNo' : 'Downtown'} · within ${radius}` : 'Tap to set';

  return (
    <Screen back title="Start a party" subtitle="Everyone else just adds where they're coming from."
      footer={<Button onClick={() => navigate('/org/sms-link')}>Create party</Button>}>
      <Input label="Your name" value={party.hostName} />
      <Input label="Party name (optional)" value={party.name} />
      <Input label="When" value={`${party.dateShort} at ${party.time}`} />
      <Input label="Your phone" value={party.hostPhone} inputMode="tel" />
      <button className="card row location-row" onClick={() => setOpen(true)}>
        <span className="t-body-med">Your location</span>
        <span className="hstack c-secondary t-secondary">{summary}<Chevron size={20} /></span>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Your location" subtitle="Only used to find a fair spot. Guests never see it.">
        <LocationPicker context="host" />
        <Button onClick={() => { setTouched(true); setOpen(false); }}>Use this location</Button>
      </Sheet>
    </Screen>
  );
}
```

- [ ] **Step 4: Write `OrgSmsLink.tsx` and `OrgVerify.tsx`**

`OrgSmsLink.tsx`:
```tsx
// Figma: ORG 2 — SMS: Management link
import { SmsScreen } from '../../components/SmsScreen';
import { sms } from '../../fixtures';

export function OrgSmsLink() {
  return <SmsScreen {...sms.manageLink} to="/org/verify" />;
}
```

`OrgVerify.tsx`:
```tsx
// Figma: ORG 3 — Verify Code
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { CodeInput } from '../../components/CodeInput';
import { party } from '../../fixtures';

export function OrgVerify() {
  const navigate = useNavigate();
  const [code, setCode] = useState('42');
  return (
    <Screen back title="Verify it's you" subtitle={`We texted a 6-digit code to ${party.hostPhone}.`}
      footer={<Button onClick={() => navigate('/org/hub')}>Continue</Button>}>
      <CodeInput value={code} onChange={setCode} />
      <button className="link t-secondary" style={{ alignSelf: 'flex-start' }}>Didn't get it? Resend code</button>
    </Screen>
  );
}
```

- [ ] **Step 5: Write `OrgHub.tsx`**

The hub owns the See-everyone sheet, the per-guest Remind transient, and the scripted "everyone responds" event: tapping **Remind the 2 who haven't** marks both waiting guests as reminded, animates the progress bar to 100% and navigates to `/org/list-ready` after 1400 ms.

```tsx
// Figma: ORG 4 — Invite & Party Details (+ ORG 4c See everyone, ORG 4e Reminder sent)
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Avatar } from '../../components/Avatar';
import { Sheet } from '../../components/Sheet';
import { GuestRow } from '../../components/GuestRow';
import { Chevron, Plus } from '../../components/icons';
import { guests, party } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function OrgHub() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const [everyone, setEveryone] = useState(false);
  const [sending, setSending] = useState(false);
  const responded = state.everyoneIn ? guests.length : guests.filter((g) => g.status !== 'waiting').length;
  const waiting = guests.filter((g) => g.status === 'waiting');

  useEffect(() => {
    if (!sending) return;
    const t = setTimeout(() => { update({ everyoneIn: true }); navigate('/org/list-ready'); }, 1400);
    return () => clearTimeout(t);
  }, [sending, navigate, update]);

  const remindOne = (id: string) => update({ remindedIds: [...state.remindedIds, id] });

  return (
    <Screen footer={<>
      <Button variant="secondary" onClick={() => setSending(true)} disabled={sending}>Remind the {waiting.length} who haven't</Button>
      <Button>Share invite link</Button>
    </>}>
      <div className="cover">
        <img src="/photos/cover.jpg" alt="" />
        <Chip className="cover__edit">Edit cover</Chip>
      </div>
      <div className="screen__title">
        <h1 className="t-title">{party.name}</h1>
        <p className="t-secondary c-secondary">{party.roughTime}</p>
      </div>
      <div className="card row">
        <div className="stack" style={{ gap: 2 }}><span className="t-caption c-secondary">Invite link</span><span className="t-body-med">{party.inviteLink}</span></div>
        <button className="link t-body-med">Copy</button>
      </div>
      <div className="row">
        <h2 className="t-heading">Guests</h2>
        <button className="icon-btn icon-btn--right" aria-label="Add a guest"><Plus /></button>
      </div>
      <div className="card">
        <div className="row">
          <div className="avatar-stack">{guests.slice(0, 4).map((g) => <Avatar key={g.id} initial={g.initial} />)}</div>
          <button className="hstack link t-label" onClick={() => setEveryone(true)}>See everyone <Chevron size={18} /></button>
        </div>
        <p className="t-secondary">{sending || state.everyoneIn ? guests.length : responded} of {guests.length} have responded</p>
        <div className="progress"><span className="progress__bar" style={{ width: `${((sending || state.everyoneIn ? guests.length : responded) / guests.length) * 100}%` }} /></div>
      </div>
      <Sheet open={everyone} onClose={() => setEveryone(false)} title="Guests" subtitle={`${responded} of ${guests.length} have responded`}>
        <div className="list">
          {guests.map((g) => (
            <GuestRow key={g.id} guest={g} right={
              g.status === 'host' ? <Chip variant="info">Host</Chip>
              : g.status === 'responded' || state.everyoneIn ? <Chip variant="success">Responded</Chip>
              : state.remindedIds.includes(g.id) ? <Chip variant="success" className="chip--swap">Reminder sent</Chip>
              : <><button className="link t-label" onClick={() => remindOne(g.id)}>Remind</button><Chip>Waiting</Chip></>
            } />
          ))}
        </div>
      </Sheet>
    </Screen>
  );
}
```

On sheet close, clear the transient: add `onClose={() => { setEveryone(false); update({ remindedIds: [] }); }}` so reopening shows Remind + Waiting again (this is the ORG 4e rule).

- [ ] **Step 6: Append CSS**

```css
.landing .screen__body { justify-content: center; gap: var(--space-5); }
.circle { position: relative; width: 200px; height: 200px; margin: var(--space-4) auto; }
.circle__ring { position: absolute; inset: 35px; border-radius: 50%; border: 1.5px solid var(--accent); }
.circle__seat { position: absolute; transform: translate(-50%, -50%); animation: seat-in var(--dur-slow) var(--ease-spring) both; }
@keyframes seat-in { from { transform: translate(-50%, -50%) scale(0); } to { transform: translate(-50%, -50%) scale(1); } }
.circle__check { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); color: var(--accent); }
.circle--done .circle__ring { animation: ring-pulse 900ms var(--ease-out) 300ms 1; }
.circle--done .check-path { stroke-dasharray: 24; stroke-dashoffset: 24; animation: draw var(--dur-slow) var(--ease-out) 200ms forwards; }
@keyframes ring-pulse { 0% { box-shadow: 0 0 0 0 rgba(63,74,63,0.3); } 100% { box-shadow: 0 0 0 24px rgba(63,74,63,0); } }
@keyframes draw { to { stroke-dashoffset: 0; } }
.cover { position: relative; height: 170px; border-radius: 20px; overflow: hidden; background: var(--bg-info-tint); }
.cover img { width: 100%; height: 100%; object-fit: cover; }
.cover__edit { position: absolute; top: 12px; right: 12px; }
.location-row { text-align: left; width: 100%; transition: transform var(--dur-fast) var(--ease-out), background var(--dur-fast); }
.location-row:active { transform: scale(0.99); background: var(--bg-subtle); }
.progress { height: 6px; border-radius: 3px; background: var(--bg-subtle); overflow: hidden; }
.progress__bar { display: block; height: 100%; background: var(--accent); border-radius: 3px; transition: width var(--dur-slow) var(--ease-out); animation: grow var(--dur-slow) var(--ease-out) both; }
@keyframes grow { from { width: 0; } }
.list { display: flex; flex-direction: column; }
.guest-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-hairline); }
.guest-row:last-child { border-bottom: 0; }
.chip--swap { animation: fade-in var(--dur-base) var(--ease-out) both; }
@keyframes fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
```

- [ ] **Step 7: Register in `src/router.tsx`**

Replace the five `Stub` elements for `/org`, `/org/create`, `/org/sms-link`, `/org/verify`, `/org/hub` with `<OrgLanding />`, `<OrgCreateParty />`, `<OrgSmsLink />`, `<OrgVerify />`, `<OrgHub />` and add the imports.

- [ ] **Step 8: Verify in the browser**

Run: `npm run dev`. Walk `/org` → Start a party → tap Your location (permission dialog → Allow → ring) → Use this location (row shows "Downtown · within 2 mi") → Create party → SMS → link → Verify → Continue → Hub. Tap See everyone → Remind on Alex → chip reads "Reminder sent" → close → reopen shows Remind + Waiting. Tap Remind the 2 who haven't → bar fills → lands on `/org/list-ready` (stub).
Expected: every step above works; nothing overflows at 375px width.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: organizer landing, create party, verify and hub screens

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Organizer screens B — List's ready, Options (+ detail sheet, map), Reservation, Walk-in, Confirmed, Party page, SMS after; host smoke test

**Files:**
- Create: `src/screens/org/OrgListReady.tsx`, `OrgOptions.tsx`, `OrgReservation.tsx`, `OrgWalkIn.tsx`, `OrgConfirmed.tsx`, `OrgParty.tsx`, `OrgSmsAfter.tsx`, `src/components/RestaurantCard.tsx`, `tests/host.spec.ts`
- Modify: `src/router.tsx`, `src/app.css`

**Interfaces:**
- Consumes: `restaurants`, `usePrototypeState` (`selectedRestaurant`, `selectedTime`, `booked`).
- Produces: `<RestaurantCard restaurant onOpen />`.

- [ ] **Step 1: Write `OrgListReady.tsx`**

```tsx
// Figma: ORG 5 — List's ready
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { GatheringCircle } from '../../components/GatheringCircle';
import { Close } from '../../components/icons';
import { guests } from '../../fixtures';

export function OrgListReady() {
  const navigate = useNavigate();
  return (
    <Screen className="landing" right={<button className="icon-btn icon-btn--right" aria-label="Close" onClick={() => navigate('/org/hub')}><Close /></button>}
      footer={<Button onClick={() => navigate('/org/options')}>Browse places</Button>}>
      <GatheringCircle initials={guests.map((g) => g.initial)} centerCheck />
      <h1 className="t-display" style={{ textAlign: 'center' }}>Everyone's in</h1>
      <p className="t-secondary c-secondary" style={{ textAlign: 'center' }}>All {guests.length} responded. We found 3 places that are fair for the whole group.</p>
    </Screen>
  );
}
```

- [ ] **Step 2: Write `RestaurantCard.tsx` and `OrgOptions.tsx`**

`RestaurantCard.tsx`:
```tsx
import type { Restaurant } from '../fixtures';
import { Chip } from './Chip';
import { Chevron } from './icons';

export function RestaurantCard({ restaurant: r, onOpen }: { restaurant: Restaurant; onOpen: () => void }) {
  return (
    <button className="rcard" onClick={onOpen} aria-label={r.name}>
      <div className="rcard__photo"><img src={r.photo} alt="" /><Chip className="rcard__tag">{r.reservations ? 'Takes reservations' : 'Walk-in only'}</Chip></div>
      <div className="stack" style={{ padding: '0 4px 4px' }}>
        <Chip variant="success" className="rcard__fair">Fair for everyone</Chip>
        <div className="row"><span className="t-heading">{r.name}</span><Chevron size={20} /></div>
        <span className="t-secondary c-secondary">{r.cuisine}</span>
        <div className="chip-row">{r.times.map((t) => <Chip key={t}>{t.replace(' PM', '')}</Chip>)}</div>
      </div>
    </button>
  );
}
```

`OrgOptions.tsx`:
```tsx
// Figma: ORG 6 — Options, ORG 6b — Options (Map), ORG 6c — Restaurant detail (sheet)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Segmented } from '../../components/Segmented';
import { Sheet } from '../../components/Sheet';
import { MapView } from '../../components/MapView';
import { RestaurantCard } from '../../components/RestaurantCard';
import { restaurants, type RestaurantId } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function OrgOptions() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const [view, setView] = useState<'list' | 'map'>('list');
  const [openId, setOpenId] = useState<RestaurantId | null>(null);
  const open = restaurants.find((r) => r.id === openId);
  const time = state.selectedTime;

  const book = () => {
    if (!open) return;
    update({ selectedRestaurant: open.id });
    setOpenId(null);
    navigate(open.reservations ? '/org/reserve' : '/org/walk-in');
  };

  return (
    <Screen back title="3 places that work" subtitle="Fair for where everyone's coming from.">
      <Segmented options={[{ value: 'list', label: 'List' }, { value: 'map', label: 'Map' }]} value={view} onChange={setView} />
      {view === 'list'
        ? restaurants.map((r) => <RestaurantCard key={r.id} restaurant={r} onOpen={() => setOpenId(r.id)} />)
        : <MapView mode="options" height={620} onSelectPin={setOpenId} />}
      <Sheet open={!!open} onClose={() => setOpenId(null)} title={open?.name}>
        {open && (
          <>
            <div className="rcard__photo rcard__photo--tall"><img src={open.photo} alt="" /></div>
            <Chip variant="success" className="rcard__fair">Fair for everyone</Chip>
            <p className="t-secondary c-secondary">{open.cuisine}. {open.address}. {open.hours}.</p>
            <p className="t-caption c-secondary">{open.reservations ? 'Available tonight' : 'Walk-in only'}</p>
            <div className="chip-row">{open.times.map((t) => <Chip key={t} variant={t === time ? 'selected' : 'neutral'} onClick={() => update({ selectedTime: t })}>{t}</Chip>)}</div>
            <Button onClick={book}>{open.reservations ? `Book ${time} with [Partner]` : `Set ${time} for the group`}</Button>
            <Button variant="ghost">See full menu</Button>
          </>
        )}
      </Sheet>
    </Screen>
  );
}
```

- [ ] **Step 3: Write `OrgReservation.tsx` and `OrgWalkIn.tsx`**

`OrgReservation.tsx`:
```tsx
// Figma: ORG 8 — Reservation
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { party, restaurants } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function OrgReservation() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const r = restaurants.find((x) => x.id === state.selectedRestaurant)!;
  return (
    <Screen back title={r.name} subtitle={`Table for ${party.size} on ${party.dateLong}`}
      footer={<Button onClick={() => { update({ booked: true }); navigate('/org/confirmed'); }}>Book {state.selectedTime}</Button>}>
      <p className="t-caption c-secondary">Pick a time</p>
      <div className="chip-row">{[...r.times, '8:30 PM'].map((t) => <Chip key={t} variant={t === state.selectedTime ? 'selected' : 'neutral'} onClick={() => update({ selectedTime: t })}>{t}</Chip>)}</div>
      <div className="card">
        <p className="t-body-med">What happens next</p>
        <p className="t-secondary c-secondary">We book the table and text everyone the details. You can change or cancel later from the party page.</p>
      </div>
    </Screen>
  );
}
```

`OrgWalkIn.tsx`:
```tsx
// Figma: ORG 8b — Walk-in notice
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { restaurants } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function OrgWalkIn() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const r = restaurants.find((x) => x.id === state.selectedRestaurant)!;
  return (
    <Screen back title={r.name} subtitle="Walk-in only"
      footer={<Button onClick={() => { update({ booked: true }); navigate('/org/confirmed'); }}>Set {state.selectedTime} and notify everyone</Button>}>
      <div className="card" style={{ background: 'var(--bg-accent-tint)', borderColor: 'transparent' }}>
        <p className="t-body-med">No reservations here</p>
        <p className="t-secondary c-secondary">We'll tell the group to head over around {state.selectedTime}. Arrive together and you'll usually be seated within 15 minutes.</p>
      </div>
      <p className="t-caption c-secondary">Meet-up time</p>
      <div className="chip-row">{r.times.map((t) => <Chip key={t} variant={t === state.selectedTime ? 'selected' : 'neutral'} onClick={() => update({ selectedTime: t })}>{t}</Chip>)}</div>
    </Screen>
  );
}
```

- [ ] **Step 4: Write `OrgConfirmed.tsx`, `OrgParty.tsx`, `OrgSmsAfter.tsx`**

`OrgConfirmed.tsx`:
```tsx
// Figma: ORG 9 — Confirmed
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Check } from '../../components/icons';
import { party, restaurants } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function OrgConfirmed() {
  const navigate = useNavigate();
  const [state] = usePrototypeState();
  const r = restaurants.find((x) => x.id === state.selectedRestaurant)!;
  return (
    <Screen className="landing" footer={<>
      <Button>Add to calendar</Button>
      <Button variant="secondary" onClick={() => navigate('/org/party')}>Back to the party</Button>
    </>}>
      <span className="success-badge"><Check /></span>
      <h1 className="t-display" style={{ textAlign: 'center' }}>You're all set</h1>
      <p className="t-secondary c-secondary" style={{ textAlign: 'center' }}>Everyone's been texted the details.</p>
      <div className="card">
        <p className="t-body-med">{r.name}</p>
        <p className="t-body">{party.dateLong} at {state.selectedTime}</p>
        <p className="t-secondary c-secondary">Table for {party.size}. {r.address}.</p>
      </div>
    </Screen>
  );
}
```

`OrgParty.tsx`:
```tsx
// Figma: ORG 10 — Party page (confirmed)
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Avatar } from '../../components/Avatar';
import { DevHint } from '../../components/DevHint';
import { Chevron } from '../../components/icons';
import { guests, party, restaurants } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function OrgParty() {
  const [state] = usePrototypeState();
  const r = restaurants.find((x) => x.id === state.selectedRestaurant)!;
  return (
    <Screen title={party.name} subtitle={`${party.dateLong} at ${state.selectedTime}`}>
      <div className="card">
        <div className="row"><Chip variant="success">Booked</Chip><span className="t-caption c-secondary">Table for {party.size}</span></div>
        <p className="t-heading">{r.name}</p>
        <p className="t-secondary c-secondary">{r.address}. Fair for everyone.</p>
        <div className="hstack"><Button variant="secondary" inline>Directions</Button><Button variant="secondary" inline>Add to calendar</Button></div>
      </div>
      <div className="row"><h2 className="t-heading">Guests</h2><div className="avatar-stack">{guests.map((g) => <Avatar key={g.id} initial={g.initial} size={32} />)}</div></div>
      <div className="card" style={{ gap: 0, padding: '0 16px' }}>
        {['Change time or place', 'Change party size'].map((l) => <button key={l} className="row menu-row t-body">{l}<Chevron size={20} /></button>)}
        <button className="row menu-row t-body" style={{ color: 'var(--error)' }}>Cancel reservation<Chevron size={20} /></button>
      </div>
      <p className="t-caption c-secondary" style={{ textAlign: 'center' }}>Any change texts everyone and updates their calendar invite.</p>
      <DevHint to="/org/sms-after">the morning after</DevHint>
    </Screen>
  );
}
```

`OrgSmsAfter.tsx`:
```tsx
// Figma: ORG 12 — SMS: After the dinner
import { SmsScreen } from '../../components/SmsScreen';
import { sms } from '../../fixtures';

export function OrgSmsAfter() {
  return <SmsScreen {...sms.afterHost} to="/org" />;
}
```

- [ ] **Step 5: Append CSS**

```css
.rcard { width: 100%; text-align: left; background: var(--bg-surface); border: 1px solid var(--border-hairline); border-radius: var(--radius-card); padding: 12px; display: flex; flex-direction: column; gap: 11px; transition: transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast); }
.rcard:active { transform: scale(0.985); }
.rcard__photo { position: relative; height: 140px; border-radius: 10px; overflow: hidden; }
.rcard__photo--tall { height: 160px; border-radius: 14px; }
.rcard__photo img { width: 100%; height: 100%; object-fit: cover; }
.rcard__tag { position: absolute; top: 10px; left: 10px; }
.rcard__fair { align-self: flex-start; }
.menu-row { width: 100%; min-height: 52px; border-bottom: 1px solid var(--border-hairline); }
.menu-row:last-child { border-bottom: 0; }
.success-badge { width: 72px; height: 72px; margin: var(--space-6) auto 0; border-radius: 50%; background: var(--accent); color: var(--text-on-accent); display: grid; place-items: center; animation: seat-in var(--dur-slow) var(--ease-spring) both; }
.success-badge .check-path { stroke-dasharray: 24; stroke-dashoffset: 24; animation: draw var(--dur-slow) var(--ease-out) 250ms forwards; }
```

- [ ] **Step 6: Register routes**

In `src/router.tsx` replace the stubs for `/org/list-ready`, `/org/options`, `/org/reserve`, `/org/walk-in`, `/org/confirmed`, `/org/party`, `/org/sms-after` with the components above.

- [ ] **Step 7: Write the failing host spine test `tests/host.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test('organizer spine: landing to the morning after', async ({ page }) => {
  await page.goto('/org');
  await page.getByRole('button', { name: 'Start a party' }).click();
  await page.getByRole('button', { name: 'Your location' }).click();
  await page.getByRole('button', { name: 'Allow' }).click();
  await page.getByRole('button', { name: '5 mi' }).click();
  await page.getByRole('button', { name: 'Use this location' }).click();
  await expect(page.getByText('within 5 mi')).toBeVisible();
  await page.getByRole('button', { name: 'Create party' }).click();
  await page.getByRole('link', { name: 'gather.app/m/9k2p1' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: "Jordan's Dinner" })).toBeVisible();
  await page.getByRole('button', { name: 'See everyone' }).click();
  await page.getByRole('button', { name: 'Remind' }).first().click();
  await expect(page.getByText('Reminder sent')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: "Remind the 2 who haven't" }).click();
  await expect(page.getByRole('heading', { name: "Everyone's in" })).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'Browse places' }).click();
  await page.getByRole('button', { name: 'Tavola Verde' }).click();
  await page.getByRole('button', { name: 'Book 7:00 PM with [Partner]' }).click();
  await page.getByRole('button', { name: 'Book 7:00 PM' }).click();
  await expect(page.getByRole('heading', { name: "You're all set" })).toBeVisible();
  await page.getByRole('button', { name: 'Back to the party' }).click();
  await page.getByRole('link', { name: /morning after/ }).click();
  await expect(page.getByText('Thanks for hosting')).toBeVisible();
});
```

Run: `npm run test:e2e -- tests/host.spec.ts`
Expected: FAIL only if a step is mis-wired — fix the screen, not the test, unless the test's selector is wrong.

- [ ] **Step 8: Run until green, then commit**

Run: `npm run test:e2e`
Expected: smoke + host passed.

```bash
git add -A
git commit -m "feat: organizer options, booking, confirmed and party screens with host smoke test

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: Participant screens A — SMS invite, Verify, Lobby (before), Join & Submit, Waiting (+ Can't make it → Dropped)

**Files:**
- Create: `src/screens/p/PSmsInvite.tsx`, `PVerify.tsx`, `PLobby.tsx`, `PJoin.tsx`, `PWaiting.tsx`, `PDropped.tsx`
- Modify: `src/router.tsx`, `src/app.css`

**Interfaces:**
- Consumes: `me` (Priya), `party`, `sms`, `LocationPicker`, `Sheet`, store (`joined`, `flexible`, `droppedOut`, `radiusMi`, `locationMode`).

- [ ] **Step 1: Write `PSmsInvite.tsx` and `PVerify.tsx`**

```tsx
// Figma: P 1 — SMS: Invite
import { SmsScreen } from '../../components/SmsScreen';
import { sms } from '../../fixtures';
export function PSmsInvite() { return <SmsScreen {...sms.invite} to="/p/verify" />; }
```

```tsx
// Figma: P 2 — Verify code
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { CodeInput } from '../../components/CodeInput';

export function PVerify() {
  const navigate = useNavigate();
  const [code, setCode] = useState('42');
  return (
    <Screen title="Verify it's you" subtitle="We texted a 6-digit code to your number."
      footer={<Button onClick={() => navigate('/p/lobby')}>Continue</Button>}>
      <CodeInput value={code} onChange={setCode} />
      <button className="link t-secondary" style={{ alignSelf: 'flex-start' }}>Didn't get it? Resend code</button>
    </Screen>
  );
}
```

- [ ] **Step 2: Write `PLobby.tsx`**

```tsx
// Figma: P 3 — Party page (before joining)
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Avatar } from '../../components/Avatar';
import { party } from '../../fixtures';

export function PLobby() {
  const navigate = useNavigate();
  return (
    <Screen footer={<Button onClick={() => navigate('/p/join')}>Join the party</Button>}>
      <div className="cover"><img src="/photos/cover.jpg" alt="" /></div>
      <div className="screen__title" style={{ alignItems: 'center', textAlign: 'center' }}>
        <h1 className="t-title">{party.name}</h1>
        <p className="t-secondary c-secondary">{party.roughTime}</p>
      </div>
      <div className="hstack" style={{ justifyContent: 'center' }}><Avatar initial="J" size={32} /><span className="t-secondary">Hosted by {party.hostFirst}</span></div>
      <div className="divider" />
      <div className="avatar-stack" style={{ justifyContent: 'center' }}><Avatar initial="A" /><Avatar initial="C" /><span className="avatar avatar--more t-label" style={{ width: 40, height: 40 }}>+3</span></div>
      <p className="t-secondary c-secondary" style={{ textAlign: 'center' }}>A., C., and 3 others are in. Names show once you join.</p>
    </Screen>
  );
}
```

- [ ] **Step 3: Write `PJoin.tsx`**

```tsx
// Figma: P 3 — Join & Submit (+ P 3a permission, P 3c Drop a pin)
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { LocationPicker } from '../../components/LocationPicker';
import { usePrototypeState } from '../../state';

export function PJoin() {
  const navigate = useNavigate();
  const [, update] = usePrototypeState();
  const go = (flexible: boolean) => { update({ joined: true, flexible, droppedOut: false }); navigate('/p/waiting'); };
  return (
    <Screen title="Where are you coming from?" subtitle="We use this to find a spot that's fair for everyone. Nobody sees your exact location."
      footer={<><Button onClick={() => go(false)}>Count me in</Button><Button variant="ghost" onClick={() => go(true)}>I'm flexible, skip this</Button></>}>
      <LocationPicker context="guest" />
      <div className="row">
        <button className="link t-body-med">Add preferences (optional)</button>
        <div className="hstack"><Chip>Vegetarian</Chip><Chip>$$</Chip></div>
      </div>
    </Screen>
  );
}
```

- [ ] **Step 4: Write `PWaiting.tsx` and `PDropped.tsx`**

`PWaiting.tsx` owns the Can't-make-it sheet and a scripted event: 2500 ms after mount, a banner "Jordan booked a spot" appears with a link to `/p/sms-confirmed` (also reachable via `DevHint`).

```tsx
// Figma: P 3b — Party page (waiting) (+ P 3d Can't make it sheet)
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Input } from '../../components/Input';
import { Sheet } from '../../components/Sheet';
import { GuestRow } from '../../components/GuestRow';
import { DevHint } from '../../components/DevHint';
import { guests, party, radiusOptions } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function PWaiting() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const [leaving, setLeaving] = useState(false);
  const [note, setNote] = useState('Sorry, a work thing came up');
  const [booked, setBooked] = useState(false);
  const radius = radiusOptions.find((o) => o.value === state.radiusMi)!.label;

  useEffect(() => { const t = setTimeout(() => setBooked(true), 2500); return () => clearTimeout(t); }, []);

  return (
    <Screen footer={<>
      <Button variant="ghost" onClick={() => setLeaving(true)}>Can't make it anymore? Let {party.hostFirst} know</Button>
      <p className="t-caption c-secondary" style={{ textAlign: 'center' }}>Only the host sees who has responded.</p>
    </>}>
      <div className="cover"><img src="/photos/cover.jpg" alt="" /></div>
      <div className="screen__title"><h1 className="t-title">{party.name}</h1><p className="t-secondary c-secondary">{party.roughTime}</p></div>
      {booked ? (
        <Link to="/p/sms-confirmed" className="card banner" style={{ background: 'var(--bg-accent-tint)', borderColor: 'transparent', textDecoration: 'none', color: 'inherit' }}>
          <p className="t-body-med">{party.hostFirst} booked a spot</p>
          <p className="t-secondary c-secondary">You've got a text with the details. Open it →</p>
        </Link>
      ) : (
        <div className="card" style={{ background: 'var(--bg-accent-tint)', borderColor: 'transparent' }}>
          <p className="t-body-med">You're in</p>
          <p className="t-secondary c-secondary">{party.hostFirst} is picking a place. We'll text you the moment it's booked.</p>
        </div>
      )}
      <div className="card" style={{ padding: '4px 16px' }}><GuestRow guest={guests[0]} right={<Chip variant="info">Host</Chip>} /></div>
      <div className="card">
        <div className="row"><span className="t-body-med">Your info</span><button className="link t-label">Edit</button></div>
        <p className="t-secondary c-secondary">{state.flexible ? "You're flexible." : `${state.locationMode === 'pin' ? 'RiNo' : 'Downtown'}, within ${radius}.`} Vegetarian, $$.</p>
      </div>
      <DevHint to="/p/sms-confirmed">{party.hostFirst} books a spot</DevHint>
      <Sheet open={leaving} onClose={() => setLeaving(false)} title="Can't make it?" subtitle={`We'll take you off the headcount and let ${party.hostFirst} know. If plans change again, rejoin from your link.`}>
        <Input label={`Add a note for ${party.hostFirst} (optional)`} value={note} onChange={setNote} />
        <Button variant="danger" onClick={() => { update({ droppedOut: true }); setLeaving(false); navigate('/p/dropped'); }}>I can't make it</Button>
        <Button variant="ghost" onClick={() => setLeaving(false)}>Never mind</Button>
      </Sheet>
    </Screen>
  );
}
```

`PDropped.tsx`:
```tsx
// Figma: P 3e — Dropped out
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { GuestRow } from '../../components/GuestRow';
import { guests, party } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function PDropped() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const back = state.booked ? '/p/party' : '/p/waiting';
  return (
    <Screen footer={<Button variant="ghost" onClick={() => { update({ droppedOut: false }); navigate(back); }}>Changed your mind? Rejoin</Button>}>
      <div className="cover"><img src="/photos/cover.jpg" alt="" /></div>
      <div className="screen__title"><h1 className="t-title">{party.name}</h1><p className="t-secondary c-secondary">{party.roughTime}</p></div>
      <div className="card" style={{ background: 'var(--bg-subtle)', borderColor: 'transparent' }}>
        <p className="t-body-med">You're out</p>
        <p className="t-secondary c-secondary">{party.hostFirst}'s been told. If plans change, you can rejoin from this link any time before the dinner.</p>
      </div>
      <div className="card" style={{ padding: '4px 16px' }}><GuestRow guest={guests[0]} right={<Chip variant="info">Host</Chip>} /></div>
    </Screen>
  );
}
```

- [ ] **Step 5: Append CSS and register routes**

```css
.banner { animation: fade-in var(--dur-slow) var(--ease-out) both; }
```

Replace stubs for `/p`, `/p/verify`, `/p/lobby`, `/p/join`, `/p/waiting`, `/p/dropped`.

- [ ] **Step 6: Verify in the browser**

Walk `/p` → link → Continue → Join the party → permission → Allow → Count me in → waiting (banner appears after ~2.5s) → Can't make it → I can't make it → Dropped → Rejoin → waiting.
Expected: all steps work; Deny on the permission dialog switches the picker to Drop a pin with the pin dropped.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: participant invite, verify, lobby, join, waiting and drop-out screens

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: Participant screens B — SMS confirmed, Party is here (+ Who's coming, Directions, Calendar, Can't make it), SMS after; participant smoke test

**Files:**
- Create: `src/screens/p/PSmsConfirmed.tsx`, `PParty.tsx`, `PSmsAfter.tsx`, `tests/participant.spec.ts`
- Modify: `src/router.tsx`

- [ ] **Step 1: Write `PSmsConfirmed.tsx` and `PSmsAfter.tsx`**

```tsx
// Figma: P 6 — SMS: Spot confirmed
import { SmsScreen } from '../../components/SmsScreen';
import { sms } from '../../fixtures';
export function PSmsConfirmed() { return <SmsScreen {...sms.spotConfirmed} to="/p/party" />; }
```

```tsx
// Figma: P 10 — SMS: After the dinner
import { SmsScreen } from '../../components/SmsScreen';
import { sms } from '../../fixtures';
export function PSmsAfter() { return <SmsScreen {...sms.afterGuest} to="/p" />; }
```

- [ ] **Step 2: Write `PParty.tsx`**

```tsx
// Figma: P 9 — Party is here (+ P 9b Who's coming, P 9c Directions, P 9d Add to calendar, P 3d Can't make it)
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Avatar } from '../../components/Avatar';
import { Input } from '../../components/Input';
import { Sheet } from '../../components/Sheet';
import { ActionSheet } from '../../components/ActionSheet';
import { GuestRow } from '../../components/GuestRow';
import { DevHint } from '../../components/DevHint';
import { Chevron } from '../../components/icons';
import { guests, me, party, restaurants } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function PParty() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const r = restaurants.find((x) => x.id === state.selectedRestaurant)!;
  const [who, setWho] = useState(false);
  const [directions, setDirections] = useState(false);
  const [calendar, setCalendar] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [note, setNote] = useState('Sorry, a work thing came up');
  useEffect(() => { if (!state.booked) update({ booked: true }); }, [state.booked, update]);

  return (
    <Screen footer={<Button variant="ghost" onClick={() => setLeaving(true)}>Can't make it? Let {party.hostFirst} know</Button>}>
      <div className="cover"><img src={r.photo} alt="" /></div>
      <div className="stack">
        <Chip variant="success" className="rcard__fair">Booked</Chip>
        <h1 className="t-title">{r.name}</h1>
        <p className="t-body">{party.dateLong} at {state.selectedTime}. Table for {party.size}.</p>
        <p className="t-secondary c-secondary">{r.address}.</p>
      </div>
      <div className="hstack">
        <Button variant="secondary" onClick={() => setDirections(true)}>Directions</Button>
        <Button variant="secondary" onClick={() => setCalendar(true)}>Add to calendar</Button>
      </div>
      <div className="row">
        <h2 className="t-heading">Who's coming</h2>
        <button className="hstack link t-label" onClick={() => setWho(true)}>See everyone <Chevron size={18} /></button>
      </div>
      <div className="avatar-stack">
        {guests.slice(0, 3).map((g) => <Avatar key={g.id} initial={g.initial} />)}
        <span className="avatar avatar--more t-label" style={{ width: 40, height: 40 }}>+{guests.length - 3}</span>
      </div>
      <DevHint to="/p/sms-after">the morning after</DevHint>

      <Sheet open={who} onClose={() => setWho(false)} title="Who's coming" subtitle={`${guests.length} people, including you`}>
        <div className="list">
          {guests.map((g) => <GuestRow key={g.id} guest={g} right={g.status === 'host' ? <Chip variant="info">Host</Chip> : g.id === me.id ? <Chip>You</Chip> : null} />)}
        </div>
      </Sheet>
      <ActionSheet open={directions} onClose={() => setDirections(false)} title={`Open ${r.name} in`}
        options={[{ label: 'Apple Maps' }, { label: 'Google Maps' }, { label: 'Waze' }, { label: 'Copy address' }]} />
      <ActionSheet open={calendar} onClose={() => setCalendar(false)} title={`Add ${party.name} to`}
        options={[{ label: 'Apple Calendar' }, { label: 'Google Calendar' }, { label: 'Outlook' }, { label: 'Download .ics file' }]} />
      <Sheet open={leaving} onClose={() => setLeaving(false)} title="Can't make it?" subtitle={`We'll take you off the headcount and let ${party.hostFirst} know. If plans change again, rejoin from your link.`}>
        <Input label={`Add a note for ${party.hostFirst} (optional)`} value={note} onChange={setNote} />
        <Button variant="danger" onClick={() => { update({ droppedOut: true }); setLeaving(false); navigate('/p/dropped'); }}>I can't make it</Button>
        <Button variant="ghost" onClick={() => setLeaving(false)}>Never mind</Button>
      </Sheet>
    </Screen>
  );
}
```

- [ ] **Step 3: Register routes**

Replace stubs for `/p/sms-confirmed`, `/p/party`, `/p/sms-after`.

- [ ] **Step 4: Write the failing participant spine test `tests/participant.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test('participant spine: invite to the morning after, including dropping out and rejoining', async ({ page }) => {
  await page.goto('/p');
  await page.getByRole('link', { name: 'gather.app/p/7k3m9' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: "Jordan's Dinner" })).toBeVisible();
  await page.getByRole('button', { name: 'Join the party' }).click();
  await page.getByRole('button', { name: 'Allow' }).click();
  await page.getByRole('tab', { name: 'Drop a pin' }).click();
  await page.getByRole('button', { name: '1 mi' }).click();
  await page.getByRole('button', { name: 'Count me in' }).click();
  await expect(page.getByText("You're in")).toBeVisible();
  await expect(page.getByText('RiNo, within 1 mi.')).toBeVisible();
  await page.getByRole('link', { name: /books a spot/ }).click();
  await page.getByRole('link', { name: 'gather.app/p/7k3m9' }).click();
  await expect(page.getByRole('heading', { name: 'Tavola Verde' })).toBeVisible();
  await page.getByRole('button', { name: 'Directions' }).click();
  await page.getByRole('button', { name: 'Google Maps' }).click();
  await page.getByRole('button', { name: 'Add to calendar' }).click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('button', { name: 'See everyone' }).click();
  await expect(page.getByText('5 people, including you')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: "Can't make it? Let Jordan know" }).click();
  await page.getByRole('button', { name: "I can't make it" }).click();
  await expect(page.getByText("You're out")).toBeVisible();
  await page.getByRole('button', { name: 'Changed your mind? Rejoin' }).click();
  await expect(page.getByRole('heading', { name: 'Tavola Verde' })).toBeVisible();
  await page.getByRole('link', { name: /morning after/ }).click();
  await expect(page.getByText('It was a blast!')).toBeVisible();
});
```

- [ ] **Step 5: Run until green, then commit**

Run: `npm run test:e2e`
Expected: smoke + host + participant passed.

```bash
git add -A
git commit -m "feat: participant party page with choosers and smoke test

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 10: Motion pass and reduced-motion check

**Files:**
- Modify: `src/app.css`, `src/components/Chip.tsx` (selected pulse), `src/components/Sheet.tsx` (staggered children)
- Test: manual + one Playwright assertion that reduced motion still lands on the same screens

- [ ] **Step 1: Stagger sheet content and pulse selected chips**

Append to `src/app.css`:
```css
.overlay--in .sheet > * { animation: fade-in var(--dur-base) var(--ease-out) both; }
.overlay--in .sheet > *:nth-child(2) { animation-delay: 40ms; }
.overlay--in .sheet > *:nth-child(3) { animation-delay: 80ms; }
.overlay--in .sheet > *:nth-child(4) { animation-delay: 120ms; }
.overlay--in .sheet > *:nth-child(n+5) { animation-delay: 160ms; }
.chip--selected { animation: chip-pop var(--dur-base) var(--ease-spring); }
@keyframes chip-pop { 0% { transform: scale(0.9); } 100% { transform: scale(1); } }
.screen__footer .btn { animation: fade-in var(--dur-base) var(--ease-out) both; animation-delay: 60ms; }
```

- [ ] **Step 2: Reduced-motion end-to-end guard**

Append to `tests/smoke.spec.ts`:
```ts
test('flows work with reduced motion', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/org');
  await page.getByRole('button', { name: 'Start a party' }).click();
  await page.getByRole('button', { name: 'Your location' }).click();
  await page.getByRole('button', { name: 'Allow' }).click();
  await page.getByRole('button', { name: 'Use this location' }).click();
  await expect(page.getByText('within 2 mi')).toBeVisible();
  await context.close();
});
```

Run: `npm run test:e2e`
Expected: all passed. Manually toggle "Reduce motion" in macOS Accessibility and reload: sheets appear instantly with no translation.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: motion pass — staggered sheets, chip pop, reduced-motion guard

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 11: Vercel config, flow branches, README

**Files:**
- Create: `vercel.json`, `README.md`, `.github/workflows/e2e.yml`; on flow branches only: `.env.production`
- Modify: `package.json` (`"engines"`)

- [ ] **Step 1: Write `vercel.json` (SPA rewrite)**

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

- [ ] **Step 2: Write `README.md`**

```markdown
# Gather prototype

Scripted, browser-based click-through of the Gather flow (Figma "Design Process" → Flow1 v4). No backend; each phone runs its own walk-through.

## Links
| Flow | Branch | URL |
|---|---|---|
| Everything | `main` | https://gather-prototype.vercel.app |
| Host | `host-flow` | https://gather-host-prototype.vercel.app |
| Participant | `participant-flow` | https://gather-participant-prototype.vercel.app |

## Run
    npm install
    npm run dev          # http://localhost:5173
    npm test             # store tests
    npm run test:e2e     # Playwright spines

## How it's built
- `src/tokens.css` — every colour, type, radius and motion value. Branding pass edits only this file.
- `src/fixtures.ts` — Jordan's Dinner, five guests, three restaurants, SMS copy.
- `src/screens/org|p/*` — one file per Figma frame; the first line names it.
- `VITE_FLOW=host|participant|all` picks which routes exist. Flow branches set it in `.env.production`.

Map tiles © OpenStreetMap contributors.
```

- [ ] **Step 3: CI workflow `.github/workflows/e2e.yml`**

```yaml
name: e2e
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm test
      - run: npm run test:e2e
```

- [ ] **Step 4: Commit and push `main`**

```bash
git add -A
git commit -m "chore: Vercel SPA config, README and CI

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git push
```

- [ ] **Step 5: Create the flow branches**

```bash
git checkout -b host-flow
printf 'VITE_FLOW=host\n' > .env.production
git add .env.production
git commit -m "chore: host-flow deploys only the organizer track

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git push -u origin host-flow

git checkout main
git checkout -b participant-flow
printf 'VITE_FLOW=participant\n' > .env.production
git add .env.production
git commit -m "chore: participant-flow deploys only the guest track

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git push -u origin participant-flow
git checkout main
```

- [ ] **Step 6: Vercel (done by the user in the dashboard, or via `npx vercel` once logged in)**

1. Import `zeliferg/gather-prototype` as project **gather-prototype**, production branch `main`.
2. Import the same repo twice more as **gather-host-prototype** (production branch `host-flow`) and **gather-participant-prototype** (production branch `participant-flow`). Vercel allows one repo across several projects.
3. Each project gets `<name>.vercel.app` automatically; confirm the three URLs in the README load and the host project 404s on `/p` (NotFound screen) as intended.

Expected: three live links, each on its own branch.

---

## Self-review

**Spec coverage.** Purpose/non-goals → Tasks 2, 5 (no backend, scripted). Stack → Task 1. Structure rules → Tasks 2–5 (fixtures-only data, overlays owned by screens, SmsScreen route, session store). Responsive → Task 1 CSS (`.phone`, `dvh`, safe-area). Flows & branches → Task 5 gating + Task 11 branches/Vercel. First-pass scope → Tasks 6–9 cover every listed screen; second-pass screens (join code, add guest, edit cover, edit reservation, reminder SMS variants) are deliberately absent — Landing's "Join with a code" and the hub's "+" are wired to NotFound / no-op as stated. Screens ↔ Figma comment → every screen file's first line. Motion → Tasks 3, 4, 6, 7, 10 with reduced-motion guard. Testing → Tasks 5, 7, 9, 10, 11 (CI). Error handling → NotFound in Task 5.

**Placeholder scan.** No TBD/TODO; every code step is complete. `Add preferences` and `See full menu` are intentionally inert (spec: second pass / no-op).

**Type consistency.** `usePrototypeState` returns `[state, update, reset]` everywhere; `RadiusMi` values `0.5|1|2|5` match `radiusOptions` and `RING_PX`; `RestaurantId` union matches fixtures; route paths in screens match `router.tsx`; `Chip` accepts `className` (used by `cover__edit`, `rcard__tag`, `rcard__fair`, `chip--swap`); `Button` `inline` prop used in `OrgParty`; `Screen` `right` prop used in `OrgListReady`.
