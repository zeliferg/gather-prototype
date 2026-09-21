// A committing button that plays spinner → check before moving on (Verify, Join, Book).
import { useEffect, useState, type ReactNode } from 'react';
import { Button } from './Button';
import { Check } from './icons';

type Phase = 'idle' | 'busy' | 'done';
type Props = {
  idle: ReactNode; busy: ReactNode; done: ReactNode;
  disabled?: boolean;
  busyMs?: number; doneMs?: number;
  /** Fired when the tap lands, before the spinner. */
  onStart?: () => void;
  /** Fired as the spinner turns into the check: the moment the thing "happened". */
  onBusyEnd?: () => void;
  /** Fired after the check has been seen: navigate away here. */
  onDone: () => void;
};

export function ProgressButton({ idle, busy, done, disabled, busyMs = 1000, doneMs = 550, onStart, onBusyEnd, onDone }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  useEffect(() => {
    if (phase === 'idle') return;
    const t = setTimeout(() => {
      if (phase === 'busy') { onBusyEnd?.(); setPhase('done'); } else onDone();
    }, phase === 'busy' ? busyMs : doneMs);
    return () => clearTimeout(t);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Button className={`btn--progress btn--${phase}`} disabled={disabled || phase !== 'idle'} aria-live="polite"
      onClick={() => { onStart?.(); setPhase('busy'); }}>
      {phase === 'idle' && idle}
      {phase === 'busy' && <><span className="spinner" aria-hidden />{busy}</>}
      {phase === 'done' && <><span className="btn__check" aria-hidden><Check size={20} /></span>{done}</>}
    </Button>
  );
}
