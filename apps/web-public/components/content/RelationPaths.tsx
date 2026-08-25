import { Link } from '@/i18n/navigation';
import { splitRelationPath } from '@/lib/relation-maps';
import { searchHref, type SubjectSlug } from '@/lib/subjects';

export function RelationPaths({
  lines,
  subject,
}: {
  lines: string[];
  subject?: SubjectSlug;
}) {
  return (
    <div className="space-y-3">
      {lines.map((line) => {
        const { nodes, edges } = splitRelationPath(line);
        return (
          <ol
            key={line}
            className="flex flex-wrap items-center gap-x-2 gap-y-2 rounded-xl border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-3"
          >
            {nodes.map((node, i) => (
              <li key={`${node}-${String(i)}`} className="flex items-center gap-2">
                {i > 0 ? (
                  <span className="font-mono text-sm text-[var(--fg-muted)]" aria-hidden>
                    {edges[i - 1] ?? '→'}
                  </span>
                ) : null}
                {subject ? (
                  <Link
                    href={`${searchHref(subject)}?q=${encodeURIComponent(node)}` as '/'}
                    className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-sm font-medium text-[var(--fg)] transition hover:border-[var(--accent-strong)] hover:text-[var(--accent-strong)]"
                  >
                    {node}
                  </Link>
                ) : (
                  <span className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-sm font-medium">
                    {node}
                  </span>
                )}
              </li>
            ))}
          </ol>
        );
      })}
    </div>
  );
}
