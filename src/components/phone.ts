/** Formats a US number as it is typed, matching the "(111) 111-1111" placeholder. */
export function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 10);
  if (d.length === 0) return '';
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** Ten digits typed, whatever the formatting. */
export function isCompletePhone(value: string): boolean {
  return value.replace(/\D/g, '').length === 10;
}
