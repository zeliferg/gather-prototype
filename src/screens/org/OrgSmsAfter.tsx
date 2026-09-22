// Figma: ORG 12 — SMS: After the dinner
import { SmsScreen } from '../../components/SmsScreen';
import { restaurants, sms } from '../../fixtures';
import { usePrototypeState } from '../../state';
import { useParty } from '../../party';

export function OrgSmsAfter() {
  const [state] = usePrototypeState();
  const { name } = useParty();
  const r = restaurants.find((x) => x.id === state.selectedRestaurant)!;
  return <SmsScreen {...sms.afterHost(name, r.name)} to="/org" />;
}
