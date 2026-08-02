'use client';

import { useState } from 'react';

export function CopyLatexButton({ latex }: { latex: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(latex);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className="inline-flex h-9 items-center rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 text-xs font-medium text-[var(--fg-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
    >
      {copied ? 'Copiado' : 'Copiar LaTeX'}
    </button>
  );
}
