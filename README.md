# Gather prototype

Scripted, browser-based click-through of the Gather flow (Figma "Design Process" → Flow1 v4). No backend; each phone runs its own walk-through.

## Links
| Flow | Branch | URL |
|---|---|---|
| Everything | `main` | https://gather-prototype-rho.vercel.app/org |
| Host | `host-flow` | https://gather-host-prototype.vercel.app/org |
| Participant | `participant-flow` | https://gather-participant-prototype.vercel.app/p |

Each Vercel project tracks its branch (Settings → Environments → Production). Shared changes land on `main`; then `git checkout host-flow && git rebase main && git push --force-with-lease` (same for `participant-flow`) to roll them out.

## Run
    npm install
    npx playwright install webkit   # once, for the e2e tests
    npm run dev          # http://localhost:5173
    npm test             # store tests
    npm run test:e2e     # Playwright spines

## How it's built
- `src/tokens.css` — every colour, type, radius and motion value. Branding pass edits only this file.
- `src/fixtures.ts` — Jordan's Dinner, five guests, three restaurants, SMS copy.
- `src/screens/org|p/*` — one file per Figma frame; the first line names it.
- `VITE_FLOW=host|participant|all` picks which routes exist. Flow branches set it in `.env.production`.

Map tiles © OpenStreetMap contributors.
