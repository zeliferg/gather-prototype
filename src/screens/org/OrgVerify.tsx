// Figma: ORG 3 — Verify Code
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { CodeInput } from '../../components/CodeInput';
import { Check } from '../../components/icons';
import { party } from '../../fixtures';

const VERIFY_MS = 1000;
const DONE_MS = 550;

export function OrgVerify() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [phase, setPhase] = useState<'idle' | 'busy' | 'done'>('idle');

  useEffect(() => {
    if (phase === 'idle') return;
    const t = setTimeout(() => {
      if (phase === 'busy') setPhase('done');
      else navigate('/org/hub', { state: { banner: 'manageLink' } });
    }, phase === 'busy' ? VERIFY_MS : DONE_MS);
    return () => clearTimeout(t);
  }, [phase, navigate]);

  return (
    <Screen back title="Verify it's you" subtitle={`We texted a 6-digit code to ${party.hostPhone}.`}
      footer={
        <Button className={`btn--progress btn--${phase}`} onClick={() => setPhase('busy')} disabled={phase !== 'idle' || code.length < 6} aria-live="polite">
          {phase === 'idle' && 'Continue'}
          {phase === 'busy' && <><span className="spinner" aria-hidden />Verifying…</>}
          {phase === 'done' && <><span className="btn__check" aria-hidden><Check size={20} /></span>Verified</>}
        </Button>
      }>
      <CodeInput value={code} onChange={setCode} />
      <button className="link t-secondary" style={{ alignSelf: 'center' }}>Didn't get it? Resend code</button>
    </Screen>
  );
}
