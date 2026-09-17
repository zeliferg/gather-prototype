// Figma: P 6 — SMS: Spot confirmed
import { SmsScreen } from '../../components/SmsScreen';
import { sms } from '../../fixtures';
export function PSmsConfirmed() { return <SmsScreen {...sms.spotConfirmed} to="/p/party" />; }
