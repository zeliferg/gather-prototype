// Figma: ORG 0b — Join with a code
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { formatPhone, isCompletePhone } from '../../components/phone';
import { party } from '../../fixtures';
import { usePrototypeState } from '../../state';

const CODE_LENGTH = party.code.length;

/** Party codes are short and case-insensitive: uppercase as typed, letters and digits only. */
export function formatCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH);
}

export function PJoinCode() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const [code, setCode] = useState('');
  const complete = code.length === CODE_LENGTH && isCompletePhone(state.guestPhone);
  return (
    <Screen back title="Join with a code" subtitle="Your host has it, or it's in the text they sent you."
      footer={<Button onClick={() => navigate('/p/lobby')} disabled={!complete}>Continue</Button>}>
      <div className="form">
        <Input label="Party code" value={code} onChange={(v) => setCode(formatCode(v))} placeholder={party.code} autoFocus />
        <Input label="Your phone" value={state.guestPhone} onChange={(v) => update({ guestPhone: formatPhone(v) })} inputMode="tel" type="tel" placeholder={party.guestPhone} />
      </div>
      <p className="t-secondary c-secondary">We'll text you a code to confirm it's you. If the host added this number, you'll join as that guest; otherwise you're added as a new guest and the host is told.</p>
    </Screen>
  );
}
