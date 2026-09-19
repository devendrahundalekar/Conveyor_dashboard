import { NavLink, Outlet } from 'react-router-dom';
import { CONFIG } from '../config';
import { useAuth } from '../context/AuthContext';
import { useMonitoring } from '../context/MonitoringContext';
import Logo from './Logo';

const NAV = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/inspection', label: 'AI Inspection', end: false },
  { to: '/alerts', label: 'Alerts', end: false },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { error } = useMonitoring();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-line bg-panel">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-1 px-4 pt-3 md:py-0">
          <div className="flex items-center gap-3 md:py-3">
            <Logo />
            <span className="font-display text-xl font-semibold tracking-wide">Conveyor Health Monitoring</span>
          </div>

          <nav className="order-3 -mx-1 flex w-full gap-1 overflow-x-auto md:order-none md:mx-0 md:w-auto" aria-label="Main">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors md:py-[1.05rem] ${
                    isActive ? 'border-steel text-ink' : 'border-transparent text-mute hover:text-ink'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3 md:py-3">
            {CONFIG.USE_MOCK && (
              <span className="rounded border border-warn/40 px-2 py-0.5 text-xs font-medium text-warn">Demo data</span>
            )}
            <span className="hidden text-sm text-mute sm:inline">{user}</span>
            <button
              onClick={logout}
              className="rounded border border-line px-3 py-1.5 text-sm text-ink hover:bg-raised"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-4 px-4 py-4">
        {error && (
          <div role="alert" className="rounded-md border border-crit/50 bg-crit/10 px-4 py-3 text-sm text-crit">
            Cannot load sensor data: {error}. Retrying every {Math.round(CONFIG.POLL_MS / 1000)} s.
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
