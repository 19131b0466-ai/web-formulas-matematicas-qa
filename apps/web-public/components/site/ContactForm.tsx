'use client';

import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';

function contactEmail(): string {
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || 'contacto@formulasmatematicas.app';
}

export function ContactForm() {
  const t = useTranslations('contact');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sentHint, setSentHint] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(t('mailSubject', { name: name || t('anonymous') }));
    const body = encodeURIComponent(
      `${t('mailFrom')}: ${name || '—'}\n${t('mailReply')}: ${email || '—'}\n\n${message}`,
    );
    window.location.href = `mailto:${contactEmail()}?subject=${subject}&body=${body}`;
    setSentHint(true);
  }

  const field =
    'w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-[var(--fg)] outline-none transition focus:border-[var(--accent)]';

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      <div>
        <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-[var(--fg)]">
          {t('name')}
        </label>
        <input
          id="contact-name"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={field}
          required
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-[var(--fg)]">
          {t('email')}
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={field}
          required
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-[var(--fg)]">
          {t('message')}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${field} resize-y`}
          required
        />
      </div>
      <button
        type="submit"
        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
      >
        {t('submit')}
      </button>
      <p className="text-sm text-[var(--fg-muted)]">
        {t('mailtoHint')}{' '}
        <a className="text-[var(--accent-strong)] underline-offset-2 hover:underline" href={`mailto:${contactEmail()}`}>
          {contactEmail()}
        </a>
      </p>
      {sentHint ? <p className="text-sm text-[var(--accent-strong)]">{t('openedMail')}</p> : null}
    </form>
  );
}
