import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function NotFound() {
  const t = await getTranslations('notFound');

  return (
    <div className="py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
        404
      </p>
      <h1 className="font-display mt-2 text-3xl font-semibold">{t('title')}</h1>
      <p className="mt-3 text-[var(--fg-muted)]">{t('body')}</p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-white"
      >
        {t('back')}
      </Link>
    </div>
  );
}
