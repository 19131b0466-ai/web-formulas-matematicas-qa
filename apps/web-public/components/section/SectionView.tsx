import { getTranslations } from 'next-intl/server';
import {
  calculoDiferencialVizForSectionNumber,
  calculoVizForSectionNumber,
  electronicaVizForSectionNumber,
  fisicaVizForSectionNumber,
  type SectionDetailResponse,
} from '@repo/shared-types';
import { CalculoDiferencialVisualization } from '@/components/calculo-diferencial/CalculoDiferencialVisualization';
import { CalculoVisualization } from '@/components/calculo/CalculoVisualization';
import { ElectronicaVisualization } from '@/components/electronica/ElectronicaVisualization';
import { PhysicsVisualization } from '@/components/physics/PhysicsVisualization';
import { ContentBlocks } from '@/components/content/ContentBlocks';
import { FormulaCatalog } from '@/components/physics/FormulaCatalog';
import { InlineMarkdown } from '@/components/content/InlineMarkdown';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Link } from '@/i18n/navigation';
import type { SubjectSlug } from '@/lib/subjects';
import { sectionHref, subjectHomeHref, subjectUsesFormulaCatalog } from '@/lib/subjects';

type SectionViewProps = {
  subject: SubjectSlug;
  subjectTitle: string;
  detail: SectionDetailResponse;
  parent?: { slug: string; title: string } | null;
};

export async function SectionView({
  subject,
  subjectTitle,
  detail,
  parent = null,
}: SectionViewProps) {
  const t = await getTranslations('section');
  const tn = await getTranslations('nav');
  const tf = await getTranslations('formula');
  const { section, blocks, subsections } = detail;
  const catalog = subjectUsesFormulaCatalog(subject);
  const calcViz = subject === 'calculo-ii' ? calculoVizForSectionNumber(section.number) : undefined;
  const difViz =
    subject === 'calculo-diferencial' ? calculoDiferencialVizForSectionNumber(section.number) : undefined;
  const physViz = subject === 'fisica-basica' ? fisicaVizForSectionNumber(section.number) : undefined;
  const elecViz =
    subject === 'fisica-electronica' ? electronicaVizForSectionNumber(section.number) : undefined;

  const crumbs = [
    { label: tn('home'), href: '/' },
    { label: subjectTitle, href: subjectHomeHref(subject) },
    ...(parent ? [{ label: parent.title, href: sectionHref(subject, parent.slug) }] : []),
    { label: section.title },
  ];

  return (
    <article>
      <Breadcrumbs items={crumbs} />

      <header className="mb-8 animate-rise">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
          {section.number ? t('label', { number: section.number }) : t('content')}
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          <InlineMarkdown text={section.title} />
        </h1>
        {section.description ? (
          <p className="mt-3 text-lg text-[var(--fg-muted)]">
            <InlineMarkdown text={section.description} />
          </p>
        ) : null}
      </header>

      {subsections.length > 0 ? (
        <nav
          aria-label={t('subsections')}
          className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--formula-bg)] p-4"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
            {t('inThisSection')}
          </p>
          <ol className="space-y-1">
            {subsections.map((sub) => (
              <li key={sub.slug}>
                <Link
                  href={sectionHref(subject, sub.slug) as '/'}
                  className="inline-flex min-h-10 items-center text-sm text-[var(--accent-strong)] underline-offset-2 hover:underline"
                >
                  {sub.number ? `${sub.number} ` : ''}
                  <InlineMarkdown text={sub.title} />
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      {catalog ? (
        <FormulaCatalog subject={subject} blocks={blocks} sectionNumber={section.number} />
      ) : (
        <ContentBlocks blocks={blocks} sectionNumber={section.number} subject={subject} />
      )}

      {calcViz ? (
        <div className="mt-8">
          <h2 className="font-display mb-3 text-xl font-semibold tracking-tight">{tf('visualization')}</h2>
          <CalculoVisualization type={calcViz.type} concept={calcViz.concept} />
        </div>
      ) : null}
      {difViz ? (
        <div className="mt-8">
          <h2 className="font-display mb-3 text-xl font-semibold tracking-tight">{tf('visualization')}</h2>
          <CalculoDiferencialVisualization type={difViz.type} concept={difViz.concept} mode={difViz.mode} />
        </div>
      ) : null}
      {physViz ? (
        <div className="mt-8">
          <h2 className="font-display mb-3 text-xl font-semibold tracking-tight">{tf('visualization')}</h2>
          <PhysicsVisualization type={physViz.type} concept={physViz.concept} mode={physViz.mode} />
        </div>
      ) : null}
      {elecViz ? (
        <div className="mt-8">
          <h2 className="font-display mb-3 text-xl font-semibold tracking-tight">{tf('visualization')}</h2>
          <ElectronicaVisualization type={elecViz.type} concept={elecViz.concept} mode={elecViz.mode} />
        </div>
      ) : null}
    </article>
  );
}
