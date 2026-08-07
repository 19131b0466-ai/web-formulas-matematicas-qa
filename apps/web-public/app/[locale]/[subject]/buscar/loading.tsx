import { getTranslations } from 'next-intl/server';

export default async function Loading() {
  const t = await getTranslations('search');
  return <p className="text-sm text-[var(--fg-muted)]">{t('loading')}</p>;
}
