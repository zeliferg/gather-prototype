import { useCallback, useEffect, useRef, useState } from 'react';
import { Notification } from './Notification';

type Props = { value: string; onChange: (v: string) => void; autofill?: string; /** bump to replay the autofill (a resent code) */ fillNonce?: number };

export const FIRST_CODE = '428913';
export const RESENT_CODE = '917204';

// Boxes start empty. Tapping the field plays the one-time-code autofill: digits land one by
// one (each box pops via .code__box:not(:empty)), the way iOS fills a code from Messages.
export function CodeInput({ value, onChange, autofill = FIRST_CODE, fillNonce = 0 }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [filling, setFilling] = useState(false);
  const digits = value.replace(/\D/g, '').slice(0, 6);

  useEffect(() => {
    if (!filling) return;
    if (digits.length >= autofill.length) { setFilling(false); return; }
    const step = getComputedStyle(document.documentElement).getPropertyValue('--dur-fill').trim();
    const ms = step.endsWith('ms') ? parseFloat(step) : parseFloat(step) * 1000;
    const t = setTimeout(() => onChange(autofill.slice(0, digits.length + 1)), Number.isFinite(ms) ? ms : 90);
    return () => clearTimeout(t);
  }, [filling, digits, autofill, onChange]);

  // A resent code arrives the same way: the boxes empty, then fill again.
  useEffect(() => {
    if (fillNonce === 0) return;
    onChange('');
    setFilling(true);
  }, [fillNonce]); // eslint-disable-line react-hooks/exhaustive-deps

  const tap = () => { ref.current?.focus(); if (digits.length === 0) setFilling(true); };

  return (
    <div className="code" onClick={tap}>
      <input ref={ref} className="code__hidden" inputMode="numeric" autoComplete="one-time-code" aria-label="6-digit code"
        value={digits} onFocus={() => { if (digits.length === 0) setFilling(true); }} onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))} />
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} className={`code__box t-heading ${i === digits.length ? 'code__box--active' : ''}`}>{digits[i] ?? ''}</span>
      ))}
    </div>
  );
}

const ARRIVE_MS = 700;
const SEND_MS = 900;
const SENT_MS = 2400;

/** The code arrives as a Messages banner a beat after Verify opens (tapping it fills the boxes, the way iOS
 *  offers a code from Messages); "Didn't get it? Resend code" sends again, the banner brings the new code,
 *  and the boxes refill with it. One banner: a resend replaces the first text. */
export function CodeTexts({ onCode }: { onCode: (code: string) => void }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [banner, setBanner] = useState<string | null>(null);
  const closeBanner = useCallback(() => setBanner(null), []);

  useEffect(() => {
    const t = setTimeout(() => setBanner(FIRST_CODE), ARRIVE_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (state === 'idle') return;
    const t = setTimeout(() => {
      if (state === 'sending') { setState('sent'); setBanner(RESENT_CODE); onCode(RESENT_CODE); } else setState('idle');
    }, state === 'sending' ? SEND_MS : SENT_MS);
    return () => clearTimeout(t);
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <button className="link t-secondary" style={{ alignSelf: 'center' }} disabled={state !== 'idle'} aria-live="polite" onClick={() => setState('sending')}>
        {state === 'idle' && "Didn't get it? Resend code"}
        {state === 'sending' && 'Sending a new code…'}
        {state === 'sent' && 'New code sent'}
      </button>
      <Notification open={banner !== null} onClose={closeBanner} onTap={() => banner && onCode(banner)} text={`Your Gather code is ${banner ?? ''}. It expires in 10 minutes.`} />
    </>
  );
}
