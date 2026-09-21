import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { CONFIG } from '../config';
import { useAuth } from '../context/AuthContext';
import { useMonitoring } from '../context/MonitoringContext';
import Logo from './Logo';
import DemoControl from './DemoControl';
import SearchBar from './SearchBar';
import Footer from './Footer';

export default function Layout() {
  const { user, logout } = useAuth();
  const { error } = useMonitoring();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">

      {/* Main Orbit Blue Header */}
      <header className="sticky top-0 z-30 bg-[#0b4ea2] text-white shadow-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 focus:outline-none flex-shrink-0">
            <Logo />
          </Link>

          {/* Search Bar */}
          <div className="flex flex-1 max-w-md md:max-w-lg mx-2 sm:mx-6">
            <SearchBar />
          </div>

          {/* Right Controls: User Greeting, Fullscreen, Logout */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold tracking-wide text-white uppercase">
              Hi, {user || 'MUSKAN'}
            </span>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              className="p-1.5 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle Fullscreen"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isFullscreen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9L4 4m0 0h5m-5 0v5m11 11l5 5m0 0h-5m5 0v-5m-5-11l5-5m0 0h-5m5 0v5M4 20l5-5m-5 5h5m-5 0v-5" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5h-4m4 0v-4m0 4l-5-5" />
                )}
              </svg>
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Subheader: Breadcrumbs & Navigation Tabs */}
      <div className="bg-white border-b border-line shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="flex items-center gap-1.5 font-bold text-[#0b4ea2] hover:underline">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span>Home</span>
            </Link>
            <span className="text-slate-400 font-bold">&gt;</span>
            <div className="flex items-center gap-1.5 font-bold text-[#0b4ea2]">
              <span className="text-base">🛞</span>
              <span className="underline decoration-[#0b4ea2] decoration-2 underline-offset-4">
                Conveyor Belt Monitoring
              </span>
            </div>
          </div>

          {/* Navigation Tab Pills (matching reference photo tabs) */}
          <nav className="flex items-center gap-2 overflow-x-auto" aria-label="Main Navigation">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-1.5 rounded text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#0b4ea2] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 3l6 4-6 4V6z" />
              </svg>
              <span>Feed</span>
            </NavLink>

            <NavLink
              to="/alerts"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-1.5 rounded text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#0b4ea2] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Alert</span>
            </NavLink>

            <NavLink
              to="/inspection"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-1.5 rounded text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#0b4ea2] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>AI Inspection</span>
            </NavLink>

            {CONFIG.USE_MOCK && (
              <div className="ml-2">
                <DemoControl />
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl w-full flex-1 space-y-4 px-4 py-4 sm:px-6">
        {error && (
          <div role="alert" className="rounded-md border border-crit/40 bg-red-50 px-4 py-3 text-sm text-crit font-medium flex items-center justify-between">
            <span>Cannot load sensor data: {error}. Retrying every {Math.round(CONFIG.POLL_MS / 1000)} s.</span>
          </div>
        )}
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
