// Figma: P 1 — SMS: Invite
import { SmsScreen } from '../../components/SmsScreen';
import { sms } from '../../fixtures';
import { usePrototypeState } from '../../state';

export function PSmsInvite() {
  const [, , reset] = usePrototypeState();
  return (
    <>
      <SmsScreen {...sms.invite} to="/p/verify" />
      <div style={{ padding: '0 var(--gutter) var(--space-6)' }}>
        <button className="devhint t-caption" onClick={reset}>Prototype: start over</button>
      </div>
    </>
  );
}
