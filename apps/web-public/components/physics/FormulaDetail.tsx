import { getTranslations } from 'next-intl/server';
import { calculoVizForFormulaId, fisicaVizForFormulaId, type FormulaDetailResponse } from '@repo/shared-types';
import { ComputationalCostPanel } from '@/components/algebra/ComputationalCostPanel';
import { FormulaVisualizationLazy } from '@/components/algebra/FormulaVisualizationLazy';
import { CalculoVisualization } from '@/components/calculo/CalculoVisualization';
import { PhysicsVisualization } from '@/components/physics/PhysicsVisualization';
import { DeferredMount } from '@/components/perf/DeferredMount';
import { CopyLatexButton } from '@/components/content/CopyLatexButton';
import { InlineMarkdown } from '@/components/content/InlineMarkdown';
import { Katex } from '@/components/content/Katex';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Link } from '@/i18n/navigation';
import { parseVariableSymbols } from '@/lib/parse-variables';
import type { SubjectSlug } from '@/lib/subjects';
import { mergeSearchKeywords } from '@/lib/seo';
import { topicHubsForFormula } from '@/lib/topic-hubs';
import {
  formulaHref,
  searchHref,
  sectionHref,
  subjectHomeHref,
  topicHubHref,
} from '@/lib/subjects';

type FormulaDetailProps = {
  subject: SubjectSlug;
  subjectTitle: string;
  detail: FormulaDetailResponse;
};

export async function FormulaDetailView({ subject, subjectTitle, detail }: FormulaDetailProps) {
  const t = await getTranslations('formula');
  const tn = await getTranslations('nav');
  const { content, related, section, formulaId, title, tags } = detail;
  const symbols = parseVariableSymbols(content.variables);
  const calcViz =
    subject === 'calculo-ii' ? calculoVizForFormulaId(formulaId) : undefined;
  const physViz =
    subject === 'fisica-basica' ? fisicaVizForFormulaId(formulaId) : undefined;
  const alsoKnownAs = mergeSearchKeywords(
    content.equivalentNotations,
    content.searchAliases,
  );
  const relatedTopics = topicHubsForFormula(subject, formulaId);
  const tTopics = await getTranslations('topicHubs');

  const crumbs = [
    { label: tn('home'), href: '/' },
    { label: subjectTitle, href: subjectHomeHref(subject) },
    { label: section.title, href: sectionHref(subject, section.slug) },
    { label: title ?? t('primary') },
  ];

  const latexForms: Array<{ latex: string; label: string | null }> = [
    { latex: content.latex, label: content.latexLabel ?? null },
    ...(content.additionalLatex ?? []).map((latex, i) => ({
      latex,
      label: content.additionalLatexLabels?.[i] ?? null,
    })),
  ];

  return (
    <article>
      <Breadcrumbs items={crumbs} />

      <header className="mb-8 animate-rise">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
          {section.number ? `${section.number}. ${section.title}` : section.title}
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {title ? <InlineMarkdown text={title} /> : t('primary')}
        </h1>
        {content.level ? (
          <p className="mt-3">
            <span className="inline-flex rounded-lg bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--accent-strong)]">
              {t('level')}: {content.level}
            </span>
          </p>
        ) : null}
        <p className="mt-2 text-sm text-[var(--fg-muted)]">
          {t('inSection')}{' '}
          <Link
            href={sectionHref(subject, section.slug) as '/'}
            className="text-[var(--accent-strong)] underline-offset-2 hover:underline"
          >
            {section.number ? `${section.number}. ` : ''}
            <InlineMarkdown text={section.title} />
          </Link>
        </p>
      </header>

      <div className="space-y-5">
        {latexForms.map((form, i) => (
          <div
            key={`${formulaId}-${String(i)}`}
            className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--formula-bg)] shadow-[var(--shadow)] animate-rise"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-2">
              <span
                className={
                  form.label
                    ? 'text-sm font-medium text-[var(--fg-muted)]'
                    : 'text-xs font-medium uppercase tracking-wider text-[var(--fg-muted)]'
                }
              >
                {form.label ? (
                  <InlineMarkdown text={form.label} />
                ) : i === 0 ? (
                  t('primary')
                ) : (
                  t('variant')
                )}
              </span>
              <CopyLatexButton latex={form.latex} />
            </div>
            <div className="overflow-x-auto px-4 py-5">
              <Katex latex={form.latex} displayMode />
            </div>
          </div>
        ))}

        {tags.length > 0 ? (
          <section className="animate-rise" style={{ animationDelay: '70ms' }}>
            <h2 className="font-display text-xl font-semibold tracking-tight">{t('tags')}</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={`${searchHref(subject)}?tags=${encodeURIComponent(tag)}` as '/'}
                    className="inline-flex rounded-full border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-1 text-sm text-[var(--accent-strong)] underline-offset-2 hover:underline"
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {content.detail ? (
          <section className="animate-rise" style={{ animationDelay: '80ms' }}>
            <h2 className="font-display text-xl font-semibold tracking-tight">{t('detail')}</h2>
            <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--formula-bg)] px-4 py-3 text-base leading-relaxed text-[var(--fg)]">
              <InlineMarkdown text={content.detail} />
            </div>
          </section>
        ) : null}

        {calcViz ? (
          <section className="animate-rise" style={{ animationDelay: '90ms' }}>
            <h2 className="font-display mb-3 text-xl font-semibold tracking-tight">{t('visualization')}</h2>
            <DeferredMount minHeight={320} label={t('visualization')}>
              <CalculoVisualization type={calcViz.type} concept={calcViz.concept} formulaId={formulaId} />
            </DeferredMount>
          </section>
        ) : physViz ? (
          <section className="animate-rise" style={{ animationDelay: '90ms' }}>
            <h2 className="font-display mb-3 text-xl font-semibold tracking-tight">{t('visualization')}</h2>
            <DeferredMount minHeight={320} label={t('visualization')}>
              <PhysicsVisualization type={physViz.type} concept={physViz.concept} mode={physViz.mode} formulaId={formulaId} />
            </DeferredMount>
          </section>
        ) : content.visual && content.formulaId ? (
          <DeferredMount minHeight={320} label={t('visualization')}>
            <FormulaVisualizationLazy
              formulaId={content.formulaId}
              visual={content.visual}
              title={t('visualization')}
            />
          </DeferredMount>
        ) : null}

        {content.computationalCost?.applicable ? (
          <ComputationalCostPanel
            cost={content.computationalCost}
            title={t('complexity')}
            showLabel={t('showComplexity')}
            hideLabel={t('hideComplexity')}
          />
        ) : null}

        {symbols.length > 0 ? (
          <section className="animate-rise" style={{ animationDelay: '100ms' }}>
            <h2 className="font-display text-xl font-semibold tracking-tight">{t('variables')}</h2>
            <ul className="mt-3 space-y-2">
              {symbols.map((entry) => (
                <li
                  key={`${entry.symbol}-${entry.meaning}`}
                  className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2.5"
                >
                  <span className="shrink-0 rounded-lg bg-[var(--accent-soft)] px-2.5 py-1 font-mono text-sm font-medium text-[var(--accent-strong)]">
                    <InlineMarkdown text={entry.symbol} />
                  </span>
                  {entry.meaning ? (
                    <span className="pt-0.5 text-base leading-relaxed text-[var(--fg)]">
                      <InlineMarkdown text={entry.meaning} />
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : content.variables ? (
          <section className="animate-rise" style={{ animationDelay: '100ms' }}>
            <h2 className="font-display text-xl font-semibold tracking-tight">{t('variables')}</h2>
            <p className="mt-2 text-base leading-relaxed text-[var(--fg)]">
              <InlineMarkdown text={content.variables} />
            </p>
          </section>
        ) : null}

        {content.constraints?.length ? (
          <section className="animate-rise" style={{ animationDelay: '120ms' }}>
            <h2 className="font-display text-xl font-semibold tracking-tight">{t('conditions')}</h2>
            <ul className="mt-3 space-y-2">
              {content.constraints.map((c) => (
                <li
                  key={c}
                  className="rounded-xl border border-[color-mix(in_oklab,var(--warning)_35%,var(--border))] bg-[color-mix(in_oklab,var(--warning)_10%,transparent)] px-4 py-3 text-base leading-relaxed text-[var(--fg)]"
                >
                  <InlineMarkdown text={c} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {content.intuitiveExplanation ? (
          <section className="animate-rise">
            <h2 className="font-display text-xl font-semibold tracking-tight">{t('intuitive')}</h2>
            <p className="mt-3 text-base leading-relaxed">
              <InlineMarkdown text={content.intuitiveExplanation} />
            </p>
          </section>
        ) : null}

        {content.derivation ? (
          <section className="animate-rise">
            <h2 className="font-display text-xl font-semibold tracking-tight">{t('derivation')}</h2>
            <div className="mt-3 text-base leading-relaxed">
              <InlineMarkdown text={content.derivation} />
            </div>
          </section>
        ) : null}

        {content.formalDefinition ? (
          <section className="animate-rise">
            <h2 className="font-display text-xl font-semibold tracking-tight">{t('formal')}</h2>
            <p className="mt-3 text-base leading-relaxed">
              <InlineMarkdown text={content.formalDefinition} />
            </p>
          </section>
        ) : null}

        {content.workedExample ? (
          <section className="animate-rise">
            <h2 className="font-display text-xl font-semibold tracking-tight">{t('workedExample')}</h2>
            <div className="mt-3 text-base leading-relaxed">
              <InlineMarkdown text={content.workedExample} />
            </div>
          </section>
        ) : null}

        {content.commonErrors?.length ? (
          <section className="animate-rise">
            <h2 className="font-display text-xl font-semibold tracking-tight">{t('commonErrors')}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              {content.commonErrors.map((item) => (
                <li key={item}>
                  <InlineMarkdown text={item} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {content.faq?.length ? (
          <section className="animate-rise">
            <h2 className="font-display text-xl font-semibold tracking-tight">{t('faq')}</h2>
            <dl className="mt-3 space-y-4">
              {content.faq.map((item) => (
                <div
                  key={item.question}
                  className="rounded-xl border border-[var(--border)] bg-[var(--formula-bg)] px-4 py-3"
                >
                  <dt className="font-semibold text-[var(--fg)]">
                    <InlineMarkdown text={item.question} />
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-[var(--fg-muted)]">
                    <InlineMarkdown text={item.answer} />
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {alsoKnownAs.length > 0 ? (
          <section className="animate-rise">
            <h2 className="font-display text-xl font-semibold tracking-tight">{t('alsoKnownAs')}</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {alsoKnownAs.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-1 text-sm"
                >
                  <InlineMarkdown text={item} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {relatedTopics.length > 0 ? (
          <section className="animate-rise">
            <h2 className="font-display text-xl font-semibold tracking-tight">{tTopics('relatedTopics')}</h2>
            <ul className="mt-3 space-y-2">
              {relatedTopics.map((hub) => (
                <li key={hub.slug}>
                  <Link
                    href={topicHubHref(subject, hub.slug) as '/'}
                    className="text-[var(--accent-strong)] underline-offset-2 hover:underline"
                  >
                    {tTopics(`${hub.messageKey}.title`)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {content.sources?.length ? (
          <section className="animate-rise">
            <h2 className="font-display text-xl font-semibold tracking-tight">{t('sources')}</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              {content.sources.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {content.conventions?.length ? (
          <section className="animate-rise">
            <h2 className="font-display text-xl font-semibold tracking-tight">{t('conventions')}</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              {content.conventions.map((item) => (
                <li key={item}>
                  <InlineMarkdown text={item} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {content.assumptions?.length ? (
          <section className="animate-rise">
            <h2 className="font-display text-xl font-semibold tracking-tight">{t('assumptions')}</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              {content.assumptions.map((item) => (
                <li key={item}>
                  <InlineMarkdown text={item} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {content.references?.length || content.referenceLinks?.length ? (
          <section className="animate-rise">
            <h2 className="font-display text-xl font-semibold tracking-tight">{t('references')}</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              {content.references?.map((item) => (
                <li key={item}>{item}</li>
              ))}
              {content.referenceLinks?.map((item) => (
                <li key={item.url}>
                  <a href={item.url} className="text-[var(--accent-strong)] underline-offset-2 hover:underline">
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {content.lastReviewedAt || content.reviewedBy ? (
          <p className="text-sm text-[var(--fg-muted)]">
            {content.lastReviewedAt ? `${t('lastReviewed')}: ${content.lastReviewedAt}` : null}
            {content.lastReviewedAt && content.reviewedBy ? ' · ' : null}
            {content.reviewedBy ? `${t('reviewedBy')}: ${content.reviewedBy}` : null}
          </p>
        ) : null}

        <p className="text-sm">
          <Link href="/contacto" className="text-[var(--accent-strong)] underline-offset-2 hover:underline">
            {t('reportError')}
          </Link>
        </p>

        {related.length > 0 ? (
          <section className="animate-rise" style={{ animationDelay: '140ms' }}>
            <h2 className="font-display text-xl font-semibold tracking-tight">{t('related')}</h2>
            <ul className="mt-3 space-y-3">
              {related.map((r) => (
                <li
                  key={r.formulaId}
                  className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--formula-bg)]"
                >
                  <Link
                    href={formulaHref(subject, r.formulaId) as '/'}
                    prefetch={false}
                    className="block px-4 pt-3 transition hover:bg-[color-mix(in_oklab,var(--accent-soft)_45%,transparent)]"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-strong)]">
                      {t('relatedItem')}
                    </p>
                    <p className="font-display mt-1 text-lg font-semibold text-[var(--fg)]">
                      {r.title ? <InlineMarkdown text={r.title} /> : t('primary')}
                    </p>
                    {r.latex ? (
                      <div className="overflow-x-auto py-3">
                        <Katex latex={r.latex} displayMode />
                      </div>
                    ) : null}
                  </Link>
                  <div className="flex flex-wrap items-center gap-4 border-t border-[var(--border)] px-4 py-2.5 text-sm">
                    <Link
                      href={formulaHref(subject, r.formulaId) as '/'}
                      prefetch={false}
                      className="font-semibold text-[var(--accent-strong)] underline-offset-2 hover:underline"
                    >
                      {t('openFormula')}
                    </Link>
                    <Link
                      href={sectionHref(subject, r.sectionSlug) as '/'}
                      prefetch={false}
                      className="text-[var(--fg-muted)] underline-offset-2 hover:underline"
                    >
                      {t('openInSection')}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </article>
  );
}
