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
      <div className="flex min-h-screen items-center justify-center text-[var(--fg-muted)]">
        Cargando…
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
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-xl"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
          Superadmin
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold text-white">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-[var(--fg-muted)]">
          Acceso al panel de métricas del formulario público.
        </p>

        <label className="mt-8 block text-sm text-[var(--fg-muted)]" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 text-white outline-none ring-[var(--accent)] focus:ring-2"
        />

        <label className="mt-4 block text-sm text-[var(--fg-muted)]" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 text-white outline-none ring-[var(--accent)] focus:ring-2"
        />

        {error ? (
          <p className="mt-4 rounded-lg border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 min-h-12 w-full rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-[#1a1406] transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
