import { useCallback, useState } from 'react';
import { isCompletePhone } from './phone';

/** One form field's validity: `error` is the one-line message under it, or null when it's satisfied. */
export type Field = { key: string; error: string | null };

export function requiredError(value: string, message: string): string | null {
  return value.trim() === '' ? message : null;
}

export function phoneError(value: string): string | null {
  if (value.replace(/\D/g, '').length === 0) return 'Add your phone number';
  return isCompletePhone(value) ? null : 'Enter all 10 digits';
}

export function codeError(value: string, length: number): string | null {
  return value.length === length ? null : `Enter the ${length}-character code`;
}

/** The caption above a disabled button: the first unmet field's message, as a reason. */
export function continueHint(fields: Field[]): string | null {
  const first = fields.find((f) => f.error);
  return first ? `${first.error} to continue` : null;
}

/**
 * Which fields the tester has been in and left. A field's message shows only once it is touched,
 * so a form filled top to bottom never flashes red; it clears on its own as soon as the rule passes.
 */
export function useTouched() {
  const [set, setSet] = useState<Set<string>>(() => new Set());
  const touch = useCallback((key: string) => setSet((s) => (s.has(key) ? s : new Set(s).add(key))), []);
  const shown = useCallback((key: string, error: string | null) => (set.has(key) ? error : null), [set]);
  return { touch, shown };
}
