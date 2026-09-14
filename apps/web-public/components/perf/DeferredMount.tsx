'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

type DeferredMountProps = {
  children: ReactNode;
  /** Reserve space before the block enters the viewport (px). */
  minHeight?: number;
  /** IntersectionObserver rootMargin. */
  rootMargin?: string;
  className?: string;
  label?: string;
};

/**
 * Defers mounting heavy client subtrees (visualizations) until near the viewport.
 * Improves LCP/TTI on formula pages with interactive charts below the fold.
 */
export function DeferredMount({
  children,
  minHeight = 280,
  rootMargin = '240px 0px',
  className,
  label = 'Cargando visualización…',
}: DeferredMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, visible]);

  return (
    <div
      ref={ref}
      className={className}
      data-deferred-viz={visible ? 'mounted' : 'pending'}
      style={visible ? undefined : { minHeight }}
    >
      {visible ? (
        children
      ) : (
        <div
          aria-hidden
          className="min-h-[inherit] rounded-xl border border-[var(--border)] bg-[var(--formula-bg)] motion-safe:animate-pulse"
          style={{ minHeight }}
        >
          <span className="sr-only">{label}</span>
        </div>
      )}
    </div>
  );
}
