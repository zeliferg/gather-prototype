// Figma: P 2 — Verify code
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { CodeInput } from '../../components/CodeInput';

export function PVerify() {
  const navigate = useNavigate();
  const [code, setCode] = useState('42');
  return (
    <Screen title="Verify it's you" subtitle="We texted a 6-digit code to your number."
      footer={<Button onClick={() => navigate('/p/lobby')}>Continue</Button>}>
      <CodeInput value={code} onChange={setCode} />
      <button className="link t-secondary" style={{ alignSelf: 'flex-start' }}>Didn't get it? Resend code</button>
    </Screen>
  );
}
