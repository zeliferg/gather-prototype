import { createBrowserRouter, Navigate, Outlet, useLocation, useNavigationType, type RouteObject } from 'react-router-dom';
import { NotFound } from './screens/NotFound';
import { OrgLanding } from './screens/org/OrgLanding';
import { OrgCreateParty } from './screens/org/OrgCreateParty';
import { OrgVerify } from './screens/org/OrgVerify';
import { OrgHub } from './screens/org/OrgHub';
import { OrgListReady } from './screens/org/OrgListReady';
import { OrgOptions } from './screens/org/OrgOptions';
import { OrgReservation } from './screens/org/OrgReservation';
import { OrgWalkIn } from './screens/org/OrgWalkIn';
import { OrgConfirmed } from './screens/org/OrgConfirmed';
import { OrgParty } from './screens/org/OrgParty';
import { OrgEditReservation } from './screens/org/OrgEditReservation';
import { OrgSmsAfter } from './screens/org/OrgSmsAfter';
import { PSmsInvite } from './screens/p/PSmsInvite';
import { PVerify } from './screens/p/PVerify';
import { PLobby } from './screens/p/PLobby';
import { PJoin } from './screens/p/PJoin';
import { PWaiting } from './screens/p/PWaiting';
import { PDropped } from './screens/p/PDropped';
import { PSmsConfirmed } from './screens/p/PSmsConfirmed';
import { PParty } from './screens/p/PParty';
import { PSmsAfter } from './screens/p/PSmsAfter';
import { FLOW } from './flow';

export { FLOW } from './flow';

export function RouteShell() {
  const location = useLocation();
  const navType = useNavigationType();
  return (
    <div className="phone">
      <div key={location.key} className={`route ${navType === 'POP' ? 'route--back' : 'route--forward'}`}>
        <Outlet />
      </div>
    </div>
  );
}

export const orgRoutes: RouteObject[] = [
  { path: '/org', element: <OrgLanding /> },
  { path: '/org/create', element: <OrgCreateParty /> },
  { path: '/org/verify', element: <OrgVerify /> },
  { path: '/org/hub', element: <OrgHub /> },
  { path: '/org/list-ready', element: <OrgListReady /> },
  { path: '/org/options', element: <OrgOptions /> },
  { path: '/org/reserve', element: <OrgReservation /> },
  { path: '/org/walk-in', element: <OrgWalkIn /> },
  { path: '/org/confirmed', element: <OrgConfirmed /> },
  { path: '/org/party', element: <OrgParty /> },
  { path: '/org/edit', element: <OrgEditReservation /> },
  { path: '/org/sms-after', element: <OrgSmsAfter /> },
];

export const pRoutes: RouteObject[] = [
  { path: '/p', element: <PSmsInvite /> },
  { path: '/p/verify', element: <PVerify /> },
  { path: '/p/lobby', element: <PLobby /> },
  { path: '/p/join', element: <PJoin /> },
  { path: '/p/waiting', element: <PWaiting /> },
  { path: '/p/sms-confirmed', element: <PSmsConfirmed /> },
  { path: '/p/party', element: <PParty /> },
  { path: '/p/dropped', element: <PDropped /> },
  { path: '/p/sms-after', element: <PSmsAfter /> },
];

const entry = FLOW === 'participant' ? '/p' : '/org';

export const router = createBrowserRouter([
  {
    element: <RouteShell />,
    children: [
      { path: '/', element: <Navigate to={entry} replace /> },
      ...(FLOW !== 'participant' ? orgRoutes : []),
      ...(FLOW !== 'host' ? pRoutes : []),
      { path: '*', element: <NotFound /> },
    ],
  },
]);
