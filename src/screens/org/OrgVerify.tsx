// Figma: ORG 3 — Verify Code
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { ProgressButton } from '../../components/ProgressButton';
import { CodeInput, ResendCode, FIRST_CODE } from '../../components/CodeInput';
import { party } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function OrgVerify() {
  const navigate = useNavigate();
  const [state] = usePrototypeState();
  const [code, setCode] = useState('');
  const [autofill, setAutofill] = useState(FIRST_CODE);
  const [fillNonce, setFillNonce] = useState(0);
  const phone = state.hostPhone || party.hostPhone;

  return (
    <Screen back title="Verify it's you" subtitle={`We texted a 6-digit code to ${phone}.`}
      footer={
        <ProgressButton idle="Continue" busy="Verifying…" done="Verified" disabled={code.length < 6}
          onDone={() => navigate('/org/hub', { state: { banner: 'manageLink' } })} />
      }>
      <CodeInput value={code} onChange={setCode} autofill={autofill} fillNonce={fillNonce} />
      <ResendCode onResent={(c) => { setAutofill(c); setFillNonce((n) => n + 1); }} />
    </Screen>
  );
}
