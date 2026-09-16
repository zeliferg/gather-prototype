// Figma: ORG 12 — SMS: After the dinner
import { SmsScreen } from '../../components/SmsScreen';
import { sms } from '../../fixtures';

export function OrgSmsAfter() {
  return <SmsScreen {...sms.afterHost} to="/org" />;
}
