/** The pieces of a datetime-local value ("YYYY-MM-DDTHH:MM"); `month` is 0-based like Date. */
export type WhenParts = { year: number; month: number; day: number; hour: number; minute: number };

export function parseWhen(value: string): WhenParts | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!m) return null;
  return { year: +m[1], month: +m[2] - 1, day: +m[3], hour: +m[4], minute: +m[5] };
}

/** Builds the value back; a day past the end of the month clamps to its last day (31 Aug → 30 Sep). */
export function toWhen({ year, month, day, hour, minute }: WhenParts): string {
  const last = new Date(year, month + 1, 0).getDate();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${year}-${p(month + 1)}-${p(Math.min(day, last))}T${p(hour)}:${p(minute)}`;
}

/** Weeks of a month, Sunday first, padded with null so every week has seven cells. */
export function monthGrid(year: number, month: number): (number | null)[][] {
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array<null>(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** "Fri, Sep 12 · 7:00 PM", or '' when nothing is set. */
export function whenLabel(value: string): string {
  const w = parseWhen(value);
  if (!w) return '';
  const d = new Date(w.year, w.month, w.day, w.hour, w.minute);
  const date = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${date} · ${time}`;
}
