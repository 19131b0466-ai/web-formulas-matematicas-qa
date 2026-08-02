import { renderLatex } from '@repo/math-renderer';

type KatexProps = {
  latex: string;
  displayMode?: boolean;
  className?: string;
};

export function Katex({ latex, displayMode = false, className }: KatexProps) {
  const html = renderLatex(latex, { displayMode, throwOnError: false });
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
      suppressHydrationWarning
    />
  );
}
