// Figma: P 10 — SMS: After the dinner
import { SmsScreen } from '../../components/SmsScreen';
import { sms } from '../../fixtures';
export function PSmsAfter() { return <SmsScreen {...sms.afterGuest} to="/p" />; }
