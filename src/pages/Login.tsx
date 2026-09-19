import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { CONFIG } from '../config';
import { useAuth } from '../context/AuthContext';

const input =
  'w-full rounded border border-line bg-bg px-3 py-2.5 text-ink placeholder:text-mute focus:border-steel';

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
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-md border border-line bg-panel p-6" noValidate>
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Logo className="h-14 w-14" />
          <h1 className="font-display text-3xl font-semibold tracking-wide">Conveyor Health Monitoring</h1>
        </div>

        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm text-mute">Email or username</span>
          <input
            className={input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
            required
          />
        </label>

        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm text-mute">Password</span>
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
              className="absolute inset-y-0 right-0 px-3 text-sm text-steel hover:underline"
              aria-pressed={show}
            >
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        {error && (
          <p role="alert" className="mb-4 text-sm text-crit">
            {error}
          </p>
        )}

        <button type="submit" className="w-full rounded bg-steel py-2.5 font-medium text-black hover:bg-steel/85">
          Log in
        </button>

        <p className="mt-4 text-center text-xs text-mute">
          Prototype login: {CONFIG.AUTH.username} / {CONFIG.AUTH.password}
        </p>
      </form>
    </div>
  );
}
