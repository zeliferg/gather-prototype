// The When picker (ORG 1, and Edit details on ORG 4 / ORG 10): an iOS-style month calendar with a
// three-column time wheel under it. Value in and out is the datetime-local string everything else reads.
import { useEffect, useRef, useState } from 'react';
import { Sheet } from './Sheet';
import { Button } from './Button';
import { Back, Chevron } from './icons';
import { monthGrid, parseWhen, toWhen, type WhenParts } from './when';

type Props = { open: boolean; onClose: () => void; value: string; onSave: (when: string) => void; /** minutes step for the wheel */ minuteStep?: number };

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);

/** Tomorrow at 7 PM: the first thing a host sees, so the wheel never opens on a blank. */
function defaultParts(): WhenParts {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate(), hour: 19, minute: 0 };
}

export function WhenSheet({ open, onClose, value, onSave, minuteStep = 5 }: Props) {
  return (
    <Sheet open={open} onClose={onClose} title="When">
      {/* The Sheet unmounts its children when closed, so the draft starts from `value` on every open. */}
      <Draft value={value} minuteStep={minuteStep} onSave={(v) => { onSave(v); onClose(); }} />
    </Sheet>
  );
}

function Draft({ value, minuteStep, onSave }: { value: string; minuteStep: number; onSave: (v: string) => void }) {
  const [draft, setDraft] = useState<WhenParts>(() => parseWhen(value) ?? defaultParts());
  const [view, setView] = useState({ year: draft.year, month: draft.month }); // the month on screen
  const today = new Date();
  const minutes = Array.from({ length: 60 / minuteStep }, (_, i) => i * minuteStep);
  const monthName = new Date(view.year, view.month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const shift = (by: number) => { const d = new Date(view.year, view.month + by, 1); setView({ year: d.getFullYear(), month: d.getMonth() }); };
  const pickDay = (day: number) => setDraft({ ...draft, year: view.year, month: view.month, day });
  const isPicked = (day: number) => draft.year === view.year && draft.month === view.month && draft.day === day;
  const isToday = (day: number) => today.getFullYear() === view.year && today.getMonth() === view.month && today.getDate() === day;
  const hour12 = draft.hour % 12 || 12;
  const pm = draft.hour >= 12;
  const setHour = (h: number) => setDraft({ ...draft, hour: (h % 12) + (pm ? 12 : 0) });
  const setPm = (isPm: boolean) => setDraft({ ...draft, hour: (draft.hour % 12) + (isPm ? 12 : 0) });

  return (
    <>
      <div className="cal">
        <div className="cal__head">
          <span className="t-body-med">{monthName}</span>
          <span className="hstack" style={{ gap: 0 }}>
            <button className="icon-btn c-accent" aria-label="Previous month" onClick={() => shift(-1)}><Back size={20} /></button>
            <button className="icon-btn c-accent" aria-label="Next month" onClick={() => shift(1)}><Chevron size={20} /></button>
          </span>
        </div>
        <div className="cal__grid" role="grid" aria-label={monthName}>
          {WEEKDAYS.map((w, i) => <span key={i} className="cal__wd t-caption c-secondary" aria-hidden>{w}</span>)}
          {monthGrid(view.year, view.month).flat().map((day, i) => day === null
            ? <span key={i} />
            : <button key={i} className={`cal__day t-body ${isPicked(day) ? 'cal__day--on' : ''} ${isToday(day) ? 'cal__day--today' : ''}`}
                aria-label={new Date(view.year, view.month, day).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                aria-pressed={isPicked(day)} onClick={() => pickDay(day)}>{day}</button>)}
        </div>
      </div>
      <div className="wheel" aria-label="Time">
        <span className="wheel__bar" aria-hidden />
        <Wheel label="Hour" items={HOURS} value={hour12} onChange={setHour} />
        <Wheel label="Minute" items={minutes} value={draft.minute} onChange={(minute) => setDraft({ ...draft, minute })} format={(m) => String(m).padStart(2, '0')} />
        <Wheel label="AM or PM" items={['AM', 'PM']} value={pm ? 'PM' : 'AM'} onChange={(v) => setPm(v === 'PM')} />
      </div>
      <Button onClick={() => onSave(toWhen(draft))}>Done</Button>
    </>
  );
}

const ROW = 40; // px per wheel row, matches .wheel__item in app.css

/** One snapping column of the time wheel. A drag settles on a row a beat after it stops and reports it;
 *  a tap picks the row and glides to it; a value set from outside jumps to it. */
function Wheel<T extends string | number>({ label, items, value, onChange, format = String }: { label: string; items: T[]; value: T; onChange: (v: T) => void; format?: (v: T) => string }) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<number>(0);
  const gliding = useRef<number>(0); // until when scroll events are our own smooth scroll, not the finger
  const index = items.indexOf(value);
  useEffect(() => {
    const el = ref.current;
    if (el && Math.round(el.scrollTop / ROW) !== index) el.scrollTo({ top: index * ROW, behavior: 'instant' as ScrollBehavior });
  }, [index]);
  const settle = () => {
    const el = ref.current;
    if (!el || Date.now() < gliding.current) return;
    const i = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / ROW)));
    if (items[i] !== value) onChange(items[i]);
  };
  const onScroll = () => { window.clearTimeout(timer.current); timer.current = window.setTimeout(settle, 120); };
  const pick = (it: T) => {
    gliding.current = Date.now() + 600;
    onChange(it);
    ref.current?.scrollTo({ top: items.indexOf(it) * ROW, behavior: 'smooth' });
  };
  return (
    <div ref={ref} className="wheel__col" role="listbox" aria-label={label} onScroll={onScroll}>
      {items.map((it) => (
        <button key={String(it)} className={`wheel__item t-body ${it === value ? 'wheel__item--on' : ''}`} role="option" aria-selected={it === value} onClick={() => pick(it)}>{format(it)}</button>
      ))}
    </div>
  );
}
