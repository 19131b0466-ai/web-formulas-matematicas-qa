'use client';

import { useState, type FormEvent } from 'react';
import { useAuth } from '@/components/AuthProvider';

export default function LoginPage() {
  const { login, ready, user } = useAuth();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!ready || user) {
    return (
      <div className="flex min-h-screen items-center justify-center tracking-[0.14em] text-[var(--fg-muted)] uppercase">
        <span className="hud-status-dot mr-3" aria-hidden />
        Authenticating…
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(34,230,255,0.12),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(255,43,214,0.1),transparent_40%)]"
      />
      <form onSubmit={onSubmit} className="hud-panel relative z-10 w-full max-w-md p-8">
        <p className="hud-label flex items-center gap-2">
          <span className="hud-status-dot" aria-hidden />
          Secure access
        </p>
        <h1 className="font-display mt-3 text-3xl font-semibold text-[var(--accent-strong)]">
          Iniciar sesión
        </h1>
        <p className="mt-2 text-sm text-[var(--fg-muted)]">
          Consola de operaciones del formulario público.
        </p>

        <label className="hud-label mt-8 block" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="hud-input mt-2"
        />

        <label className="hud-label mt-5 block" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="hud-input mt-2"
        />

        {error ? (
          <p className="mt-4 border border-[var(--danger)]/50 bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={loading} className="hud-btn mt-6 w-full px-4 text-sm">
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
