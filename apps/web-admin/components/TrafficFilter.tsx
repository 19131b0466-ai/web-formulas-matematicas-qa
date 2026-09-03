'use client';

import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { TrafficAudience } from '@repo/shared-types';

type TrafficFilterValue = {
  audience: TrafficAudience;
  setAudience: (value: TrafficAudience) => void;
};

const TrafficFilterContext = createContext<TrafficFilterValue | null>(null);

export function defaultAudienceForPath(pathname: string): TrafficAudience {
  if (pathname.startsWith('/analytics/logs')) return 'all';
  if (pathname.startsWith('/analytics/bots')) return 'bot';
  return 'human';
}

export function TrafficFilterProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [audience, setAudience] = useState<TrafficAudience>(() => defaultAudienceForPath(pathname));

  useEffect(() => {
    setAudience(defaultAudienceForPath(pathname));
  }, [pathname]);

  const value = useMemo(() => ({ audience, setAudience }), [audience]);
  return <TrafficFilterContext.Provider value={value}>{children}</TrafficFilterContext.Provider>;
}

export function useTrafficFilter(): TrafficFilterValue {
  const ctx = useContext(TrafficFilterContext);
  if (!ctx) {
    return { audience: 'human', setAudience: () => undefined };
  }
  return ctx;
}

export function TrafficAudienceSelector() {
  const { audience, setAudience } = useTrafficFilter();
  const options: Array<{ id: TrafficAudience; label: string }> = [
    { id: 'human', label: 'Humanos' },
    { id: 'bot', label: 'Bots' },
    { id: 'unknown', label: 'Desconocidos' },
    { id: 'all', label: 'Todo el tráfico' },
  ];

  return (
    <div className="flex flex-wrap gap-1" role="group" aria-label="Filtro de audiencia">
      {options.map((opt) => {
        const active = audience === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setAudience(opt.id)}
            className={`border px-2 py-1 text-[10px] tracking-[0.1em] uppercase ${
              active
                ? 'border-[var(--accent)] text-[var(--accent-strong)] shadow-[var(--glow)]'
                : 'border-[var(--border)] text-[var(--fg-muted)]'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
