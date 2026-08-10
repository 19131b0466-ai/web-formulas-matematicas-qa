/** Full-bleed atmospheric math plane for the hub hero (decorative). */
export function HeroMathPlane() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1200 720"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="heroWash" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
          <stop offset="45%" stopColor="var(--info)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="heroGlow" cx="72%" cy="38%" r="42%">
          <stop offset="0%" stopColor="var(--accent-strong)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="720" fill="url(#heroWash)" />
      <ellipse cx="860" cy="260" rx="380" ry="260" fill="url(#heroGlow)" />

      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.14"
        className="text-[var(--fg)]"
      >
        <path d="M80 520 C 220 420, 340 610, 520 500 S 820 380, 1100 460" className="hero-draw" />
        <path d="M60 180 H1140" />
        <path d="M200 80 V640" />
      </g>

      <g className="hero-float text-[var(--fg)]" fill="currentColor" opacity="0.28">
        <text x="120" y="160" fontSize="42" fontFamily="var(--font-display), Georgia, serif">
          ∫ f(x) dx
        </text>
        <text x="760" y="150" fontSize="36" fontFamily="var(--font-mono), monospace">
          |a−b|
        </text>
        <text x="880" y="520" fontSize="40" fontFamily="var(--font-display), Georgia, serif">
          ∇·F
        </text>
        <text x="180" y="580" fontSize="34" fontFamily="var(--font-mono), monospace">
          Ax = b
        </text>
        <text x="520" y="300" fontSize="48" fontFamily="var(--font-display), Georgia, serif" opacity="0.45">
          e^{'{iπ}'}
        </text>
      </g>
    </svg>
  );
}
