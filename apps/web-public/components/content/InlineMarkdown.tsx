import { Fragment, type ReactNode } from 'react';
import { Katex } from './Katex';

/** Renders markdown-ish text with inline \(...\) / $...$ math and light emphasis. */
export function InlineMarkdown({ text }: { text: string }) {
  const nodes = tokenize(text);
  return (
    <span className="whitespace-pre-wrap [overflow-wrap:anywhere]">
      {nodes.map((node, i) => (
        <Fragment key={i}>{node}</Fragment>
      ))}
    </span>
  );
}

function tokenize(input: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern =
    /(\\\[[\s\S]+?\\\])|(\\\([\s\S]+?\\\))|(\$\$[\s\S]+?\$\$)|(\$[^$\n]+?\$)|(\*\*[^*\n]+?\*\*)|(`[^`\n]+?`)/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(input)) !== null) {
    if (match.index > last) {
      nodes.push(input.slice(last, match.index));
    }
    const token = match[0];
    if (token.startsWith('\\[') || token.startsWith('$$')) {
      const latex = token.startsWith('\\[') ? token.slice(2, -2) : token.slice(2, -2);
      nodes.push(
        <span key={`d-${String(match.index)}`} className="my-2 block overflow-x-auto">
          <Katex latex={latex.trim()} displayMode />
        </span>,
      );
    } else if (token.startsWith('\\(') || (token.startsWith('$') && !token.startsWith('$$'))) {
      const latex = token.startsWith('\\(') ? token.slice(2, -2) : token.slice(1, -1);
      nodes.push(<Katex key={`i-${String(match.index)}`} latex={latex.trim()} />);
    } else if (token.startsWith('**')) {
      nodes.push(<strong key={`b-${String(match.index)}`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('`')) {
      nodes.push(
        <code
          key={`c-${String(match.index)}`}
          className="rounded bg-[var(--accent-soft)] px-1 py-0.5 font-mono text-[0.9em]"
        >
          {token.slice(1, -1)}
        </code>,
      );
    }
    last = match.index + token.length;
  }

  if (last < input.length) nodes.push(input.slice(last));
  return nodes;
}
