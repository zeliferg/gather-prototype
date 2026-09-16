// Figma: ORG 2 — SMS: Management link
import { SmsScreen } from '../../components/SmsScreen';
import { sms } from '../../fixtures';

export function OrgSmsLink() {
  return <SmsScreen {...sms.manageLink} to="/org/verify" />;
}
