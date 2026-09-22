/** Rounds a datetime-local value ("YYYY-MM-DDTHH:MM") to the nearest `step` minutes; anything unparsable passes through. */
export function snapMinutes(value: string, step: number): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!m) return value;
  const d = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  d.setMinutes(Math.round(d.getMinutes() / step) * step, 0, 0);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
