'use client';

import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import { getApiBaseUrl } from '@/lib/api';
import type { AppLocale } from '@/i18n/routing';

export function ReviewForm({ locale }: { locale: AppLocale }) {
  const t = useTranslations('reviews');
  const [displayName, setDisplayName] = useState('');
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error' | 'rate'>('idle');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch(`${getApiBaseUrl()}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          displayName: displayName.trim() || null,
          rating,
          body: body.trim(),
          locale,
          website,
        }),
      });
      if (res.status === 429) {
        setStatus('rate');
        return;
      }
      if (!res.ok) {
        setStatus('error');
        return;
      }
      setDisplayName('');
      setBody('');
      setRating(5);
      setStatus('ok');
    } catch {
      setStatus('error');
    }
  }

  const field =
    'w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-[var(--fg)] outline-none transition focus:border-[var(--accent)]';

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="review-name" className="mb-1.5 block text-sm font-medium text-[var(--fg)]">
          {t('name')}
        </label>
        <input
          id="review-name"
          name="displayName"
          autoComplete="nickname"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className={field}
          maxLength={80}
          placeholder={t('namePlaceholder')}
        />
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-[var(--fg)]">{t('rating')}</legend>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                rating === n
                  ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                  : 'border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
              aria-pressed={rating === n}
              aria-label={t('stars', { count: n })}
            >
              {'★'.repeat(n)}
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="review-body" className="mb-1.5 block text-sm font-medium text-[var(--fg)]">
          {t('body')}
        </label>
        <textarea
          id="review-body"
          name="body"
          required
          minLength={12}
          maxLength={800}
          rows={5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className={`${field} resize-y`}
        />
      </div>
      <div className="hidden" aria-hidden>
        <label htmlFor="review-website">{t('website')}</label>
        <input
          id="review-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>
      {status === 'ok' ? <p className="text-sm text-[var(--accent-strong)]">{t('thanks')}</p> : null}
      {status === 'error' ? <p className="text-sm text-rose-700 dark:text-rose-300">{t('error')}</p> : null}
      {status === 'rate' ? <p className="text-sm text-amber-800 dark:text-amber-200">{t('rateLimit')}</p> : null}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:opacity-60"
      >
        {status === 'sending' ? t('sending') : t('submit')}
      </button>
    </form>
  );
}
