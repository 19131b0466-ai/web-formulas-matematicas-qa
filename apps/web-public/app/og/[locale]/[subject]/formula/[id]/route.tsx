import { ImageResponse } from 'next/og';
import { hasLocale } from 'next-intl';
import { fetchFormula } from '@/lib/api';
import { latexToPlainSnippet } from '@/lib/seo';
import { isSubjectSlug, type SubjectSlug } from '@/lib/subjects';
import { routing, type AppLocale } from '@/i18n/routing';

export const runtime = 'edge';
/** CDN keeps the PNG for 7 days and may serve it stale for 30 days while regenerating. */
export const revalidate = 604800;

const BRAND = 'Math Theory and Tools';

type RouteParams = {
  params: Promise<{ locale: string; subject: string; id: string }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { locale: rawLocale, subject: subjectRaw, id } = await params;
  const locale = (
    hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale
  ) as AppLocale;

  let title = id.trim().toUpperCase();
  let latex = '';
  let subjectLabel = subjectRaw;

  if (isSubjectSlug(subjectRaw)) {
    const subject = subjectRaw as SubjectSlug;
    try {
      const detail = await fetchFormula(subject, id);
      if (detail) {
        title = detail.title ?? title;
        latex = latexToPlainSnippet(detail.content.latex, 120);
        subjectLabel = detail.section.title;
      }
    } catch {
      // Fallback to code-only card when the API is unavailable.
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 64px',
          background: 'linear-gradient(145deg, #0b1614 0%, #12352f 55%, #1a4d42 100%)',
          color: '#f3f6f4',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p
            style={{
              margin: 0,
              fontSize: 22,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#8fd4c4',
            }}
          >
            {subjectLabel}
          </p>
          <h1
            style={{
              margin: 0,
              fontSize: 56,
              lineHeight: 1.1,
              fontWeight: 700,
              maxWidth: 980,
            }}
          >
            {title}
          </h1>
          {latex ? (
            <p
              style={{
                margin: 0,
                fontSize: 34,
                fontFamily: 'ui-monospace, monospace',
                color: '#d7efe8',
                maxWidth: 980,
              }}
            >
              {latex}
            </p>
          ) : null}
        </div>
        <p style={{ margin: 0, fontSize: 24, color: '#9bb8af' }}>{BRAND}</p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=2592000',
      },
    },
  );
}
