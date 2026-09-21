import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-12 border-t-2 border-slate-800 bg-[#071322] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-12">
          {/* Left Column: Logo, Description & Socials */}
          <div className="md:col-span-8 space-y-4">
            <div className="flex items-center gap-3">
              {/* Logo Emblem Icon */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0b4ea2] to-blue-500 border-2 border-white/20 p-1 flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <ellipse cx="12" cy="12" rx="9" ry="4.5" transform="rotate(-25 12 12)" strokeWidth="2" />
                  <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                </svg>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Orbit
              </span>
            </div>

            <p className="max-w-xl text-sm leading-relaxed text-slate-400">
              An intelligent prototype platform for AI-driven real-time conveyor belt health monitoring, 
              computer vision defect detection, and predictive maintenance across industrial material handling lines.
            </p>

            {/* Social / External Action Icons */}
            <div className="flex items-center gap-3 pt-2">
              {/* GitHub Link */}
              <a
                href="https://github.com/devendrahundalekar/Conveyor_dashboard"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-slate-400 hover:border-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                title="GitHub Repository"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              </a>

              {/* Email / Contact Link */}
              <a
                href="mailto:devendrahundalekar80@gmail.com"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-slate-400 hover:border-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                title="Contact Devendra Hundalekar"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>

              {/* Web Link */}
              <a
                href="https://github.com/devendrahundalekar"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-slate-400 hover:border-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                title="Developer Profile"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right Column: Important Links */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
              IMPORTANT LINKS
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-slate-400 hover:text-white hover:underline transition-colors">
                  Feed & Live Dashboard
                </Link>
              </li>
              <li>
                <Link to="/alerts" className="text-slate-400 hover:text-white hover:underline transition-colors">
                  Incident Alerts Log
                </Link>
              </li>
              <li>
                <Link to="/inspection" className="text-slate-400 hover:text-white hover:underline transition-colors">
                  AI Camera Belt Inspection
                </Link>
              </li>
              <li>
                <Link to="/?scroll=sensor-vibration" className="text-slate-400 hover:text-white hover:underline transition-colors">
                  Vibration Waveform Diagnostics
                </Link>
              </li>
              <li>
                <Link to="/?scroll=sensor-belt_health" className="text-slate-400 hover:text-white hover:underline transition-colors">
                  Belt Health Analytics
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Orbit · Intelligent Conveyor Belt Monitoring System.</p>
          <p>Developed by <span className="text-slate-300 font-semibold">Devendra Hundalekar</span></p>
        </div>
      </div>
    </footer>
  );
}
