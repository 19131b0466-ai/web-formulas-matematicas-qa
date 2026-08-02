import katex from 'katex';

export interface RenderLatexOptions {
  displayMode?: boolean;
  throwOnError?: boolean;
}

/** Render LaTeX string to HTML (used by frontends in later phases). */
export function renderLatex(latex: string, options: RenderLatexOptions = {}): string {
  return katex.renderToString(latex, {
    displayMode: options.displayMode ?? false,
    throwOnError: options.throwOnError ?? false,
    output: 'html',
  });
}

export { katex };
