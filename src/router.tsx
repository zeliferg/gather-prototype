import { createBrowserRouter, Navigate, Outlet, useLocation, useNavigationType, type RouteObject } from 'react-router-dom';
import { NotFound } from './screens/NotFound';
import { OrgLanding } from './screens/org/OrgLanding';
import { OrgCreateParty } from './screens/org/OrgCreateParty';
import { OrgVerify } from './screens/org/OrgVerify';
import { OrgHub } from './screens/org/OrgHub';
import { OrgListReady } from './screens/org/OrgListReady';
import { OrgOptions } from './screens/org/OrgOptions';
import { OrgConfirmed } from './screens/org/OrgConfirmed';
import { OrgParty } from './screens/org/OrgParty';
import { OrgEditReservation } from './screens/org/OrgEditReservation';
import { OrgSmsAfter } from './screens/org/OrgSmsAfter';
import { PSmsInvite } from './screens/p/PSmsInvite';
import { PJoinCode } from './screens/p/PJoinCode';
import { PVerify } from './screens/p/PVerify';
import { PLobby } from './screens/p/PLobby';
import { PJoin } from './screens/p/PJoin';
import { PJoinInfo } from './screens/p/PJoinInfo';
import { BookingWatcher } from './screens/p/BookingWatcher';
import { NudgeWatcher } from './screens/org/NudgeWatcher';
import { PWaiting } from './screens/p/PWaiting';
import { PDropped } from './screens/p/PDropped';
import { PBooked } from './screens/p/PBooked';
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
      {location.pathname.startsWith('/p') && <BookingWatcher />}
      {location.pathname.startsWith('/org') && <NudgeWatcher />}
    </div>
  );
}

// ORG 0 is the app's front door for both tracks: the participant build reaches it from "start over" on P 3b.
const landingRoute: RouteObject = { path: '/org', element: <OrgLanding /> };

export const orgRoutes: RouteObject[] = [
  landingRoute,
  { path: '/org/create', element: <OrgCreateParty /> },
  { path: '/org/verify', element: <OrgVerify /> },
  { path: '/org/hub', element: <OrgHub /> },
  { path: '/org/list-ready', element: <OrgListReady /> },
  { path: '/org/options', element: <OrgOptions /> },
  { path: '/org/confirmed', element: <OrgConfirmed /> },
  { path: '/org/party', element: <OrgParty /> },
  { path: '/org/edit', element: <OrgEditReservation /> },
  { path: '/org/sms-after', element: <OrgSmsAfter /> },
];

export const pRoutes: RouteObject[] = [
  { path: '/p', element: <PSmsInvite /> },
  { path: '/p/join-code', element: <PJoinCode /> },
  { path: '/p/verify', element: <PVerify /> },
  { path: '/p/lobby', element: <PLobby /> },
  { path: '/p/join', element: <PJoinInfo /> },
  { path: '/p/location', element: <PJoin /> },
  { path: '/p/waiting', element: <PWaiting /> },
  { path: '/p/booked', element: <PBooked /> },
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
      ...(FLOW === 'participant' ? [landingRoute] : []),
      { path: '*', element: <NotFound /> },
    ],
  },
]);
