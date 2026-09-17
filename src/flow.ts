const raw = import.meta.env.VITE_FLOW;
const valid = ['host', 'participant', 'all'] as const;
export type Flow = (typeof valid)[number];
export const FLOW: Flow = (valid as readonly string[]).includes(raw ?? '') ? (raw as Flow) : 'all';
if (raw && FLOW !== raw) console.warn(`VITE_FLOW="${raw}" is not one of ${valid.join('|')}; falling back to "all"`);
