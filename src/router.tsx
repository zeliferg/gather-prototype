import { createBrowserRouter, Navigate, Outlet, useLocation, useNavigationType, type RouteObject } from 'react-router-dom';
import { NotFound } from './screens/NotFound';
import { OrgLanding } from './screens/org/OrgLanding';
import { OrgCreateParty } from './screens/org/OrgCreateParty';
import { OrgSmsLink } from './screens/org/OrgSmsLink';
import { OrgVerify } from './screens/org/OrgVerify';
import { OrgHub } from './screens/org/OrgHub';
import { OrgListReady } from './screens/org/OrgListReady';
import { OrgOptions } from './screens/org/OrgOptions';
import { OrgReservation } from './screens/org/OrgReservation';
import { OrgWalkIn } from './screens/org/OrgWalkIn';
import { OrgConfirmed } from './screens/org/OrgConfirmed';
import { OrgParty } from './screens/org/OrgParty';
import { OrgSmsAfter } from './screens/org/OrgSmsAfter';
import { PSmsInvite } from './screens/p/PSmsInvite';
import { PVerify } from './screens/p/PVerify';
import { PLobby } from './screens/p/PLobby';
import { PJoin } from './screens/p/PJoin';
import { PWaiting } from './screens/p/PWaiting';
import { PDropped } from './screens/p/PDropped';
import { FLOW } from './flow';

export { FLOW } from './flow';

function Stub() {
  const { pathname } = useLocation();
  return <div className="screen"><div className="screen__body"><p className="t-body">{pathname}</p></div></div>;
}

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

// Screens are registered here as tasks land. Replace `Stub` with the real component.
export const orgRoutes: RouteObject[] = [
  { path: '/org', element: <OrgLanding /> },
  { path: '/org/create', element: <OrgCreateParty /> },
  { path: '/org/sms-link', element: <OrgSmsLink /> },
  { path: '/org/verify', element: <OrgVerify /> },
  { path: '/org/hub', element: <OrgHub /> },
  { path: '/org/list-ready', element: <OrgListReady /> },
  { path: '/org/options', element: <OrgOptions /> },
  { path: '/org/reserve', element: <OrgReservation /> },
  { path: '/org/walk-in', element: <OrgWalkIn /> },
  { path: '/org/confirmed', element: <OrgConfirmed /> },
  { path: '/org/party', element: <OrgParty /> },
  { path: '/org/sms-after', element: <OrgSmsAfter /> },
];

export const pRoutes: RouteObject[] = [
  { path: '/p', element: <PSmsInvite /> },
  { path: '/p/verify', element: <PVerify /> },
  { path: '/p/lobby', element: <PLobby /> },
  { path: '/p/join', element: <PJoin /> },
  { path: '/p/waiting', element: <PWaiting /> },
  { path: '/p/sms-confirmed', element: <Stub /> },
  { path: '/p/party', element: <Stub /> },
  { path: '/p/dropped', element: <PDropped /> },
  { path: '/p/sms-after', element: <Stub /> },
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
