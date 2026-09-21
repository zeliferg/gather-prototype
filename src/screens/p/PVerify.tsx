// Figma: P 2 — Verify code
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { CodeInput, ResendCode, FIRST_CODE } from '../../components/CodeInput';

export function PVerify() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [autofill, setAutofill] = useState(FIRST_CODE);
  const [fillNonce, setFillNonce] = useState(0);
  return (
    <Screen back title="Verify it's you" subtitle="We texted a 6-digit code to your number."
      footer={<Button onClick={() => navigate('/p/join')} disabled={code.length < 6}>Continue</Button>}>
      <CodeInput value={code} onChange={setCode} autofill={autofill} fillNonce={fillNonce} />
      <ResendCode onResent={(c) => { setAutofill(c); setFillNonce((n) => n + 1); }} />
    </Screen>
  );
}
