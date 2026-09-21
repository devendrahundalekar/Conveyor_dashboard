import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

const input =
  'w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#0b4ea2] focus:outline-none focus:ring-1 focus:ring-[#0b4ea2] text-sm';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to="/" replace />;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (login(username, password)) navigate('/', { replace: true });
    else setError('Incorrect username or password.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f0f3f8] px-4 py-8">
      <div className="w-full max-w-md">
        <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-card" noValidate>
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            <div className="bg-[#0b4ea2] px-5 py-2.5 rounded-xl shadow-sm mb-2">
              <Logo />
            </div>
            <h1 className="text-xl font-bold text-slate-800">Conveyor Belt Monitoring</h1>
            <p className="text-xs text-slate-500 font-medium">Predictive Maintenance & Computer Vision Inspection</p>
          </div>

          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">Email or Username</span>
            <input
              className={input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. muskan / admin"
              autoComplete="username"
              autoFocus
              required
            />
          </label>

          <label className="mb-5 block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">Password</span>
            <div className="relative">
              <input
                className={`${input} pr-16`}
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute inset-y-0 right-0 px-3.5 text-xs font-bold text-[#0b4ea2] hover:underline"
                aria-pressed={show}
              >
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          {error && (
            <p role="alert" className="mb-4 text-xs font-semibold text-crit bg-red-50 p-2.5 rounded border border-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-[#0b4ea2] py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#083c7d] transition-all"
          >
            Log in to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
