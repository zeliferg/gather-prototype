// Figma: P 1 — SMS: Invite
import { SmsScreen } from '../../components/SmsScreen';
import { sms } from '../../fixtures';
export function PSmsInvite() { return <SmsScreen {...sms.invite} to="/p/verify" />; }
