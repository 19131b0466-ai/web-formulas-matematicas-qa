import { afterEach, describe, expect, it, vi } from 'vitest';
import { revalidateSeededSubject } from './revalidate-subject.js';

describe('revalidateSeededSubject', () => {
  const prevUrl = process.env.WEB_PUBLIC_URL;
  const prevSecret = process.env.CRON_SECRET;

  afterEach(() => {
    vi.unstubAllGlobals();
    if (prevUrl === undefined) delete process.env.WEB_PUBLIC_URL;
    else process.env.WEB_PUBLIC_URL = prevUrl;
    if (prevSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = prevSecret;
  });

  it('does not call the site when the public URL or secret is unset', async () => {
    delete process.env.WEB_PUBLIC_URL;
    delete process.env.CRON_SECRET;
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await revalidateSeededSubject('algebra');

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts a single subject invalidation', async () => {
    process.env.WEB_PUBLIC_URL = 'https://www.example.com/';
    process.env.CRON_SECRET = 'secret';
    const fetchMock = vi.fn(async () => new Response('{"revalidated":true}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await revalidateSeededSubject('algebra');

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://www.example.com/api/revalidate');
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({ 'x-revalidate-secret': 'secret' });
    expect(JSON.parse(String(init.body))).toEqual({ type: 'subject', subject: 'algebra' });
  });

  it('throws when the revalidate endpoint rejects the call', async () => {
    process.env.WEB_PUBLIC_URL = 'https://www.example.com';
    process.env.CRON_SECRET = 'secret';
    vi.stubGlobal('fetch', vi.fn(async () => new Response('no', { status: 500 })));

    await expect(revalidateSeededSubject('calculo-ii')).rejects.toThrow(/calculo-ii/);
  });
});
