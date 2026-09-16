// Figma: ORG 3 — Verify Code
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { CodeInput } from '../../components/CodeInput';
import { party } from '../../fixtures';

export function OrgVerify() {
  const navigate = useNavigate();
  const [code, setCode] = useState('42');
  return (
    <Screen back title="Verify it's you" subtitle={`We texted a 6-digit code to ${party.hostPhone}.`}
      footer={<Button onClick={() => navigate('/org/hub')}>Continue</Button>}>
      <CodeInput value={code} onChange={setCode} />
      <button className="link t-secondary" style={{ alignSelf: 'flex-start' }}>Didn't get it? Resend code</button>
    </Screen>
  );
}
