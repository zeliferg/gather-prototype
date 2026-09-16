import { createBrowserRouter, Navigate, Outlet, useLocation, useNavigationType, type RouteObject } from 'react-router-dom';
import { NotFound } from './screens/NotFound';
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
  { path: '/org', element: <Stub /> },
  { path: '/org/create', element: <Stub /> },
  { path: '/org/sms-link', element: <Stub /> },
  { path: '/org/verify', element: <Stub /> },
  { path: '/org/hub', element: <Stub /> },
  { path: '/org/list-ready', element: <Stub /> },
  { path: '/org/options', element: <Stub /> },
  { path: '/org/reserve', element: <Stub /> },
  { path: '/org/walk-in', element: <Stub /> },
  { path: '/org/confirmed', element: <Stub /> },
  { path: '/org/party', element: <Stub /> },
  { path: '/org/sms-after', element: <Stub /> },
];

export const pRoutes: RouteObject[] = [
  { path: '/p', element: <Stub /> },
  { path: '/p/verify', element: <Stub /> },
  { path: '/p/lobby', element: <Stub /> },
  { path: '/p/join', element: <Stub /> },
  { path: '/p/waiting', element: <Stub /> },
  { path: '/p/sms-confirmed', element: <Stub /> },
  { path: '/p/party', element: <Stub /> },
  { path: '/p/dropped', element: <Stub /> },
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
