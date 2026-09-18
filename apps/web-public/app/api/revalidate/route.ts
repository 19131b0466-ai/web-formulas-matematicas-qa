import { revalidatePath, revalidateTag } from 'next/cache';
import { routing } from '@/i18n/routing';

export async function POST(req: Request) {
  const secret = req.headers.get('x-revalidate-secret');
  if (!secret || secret !== process.env.CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    subject?: string;
    formulaId?: string;
    all?: boolean;
  };

  if (body.all || body.subject === 'calculo-diferencial') {
    revalidateTag('formulas');
    revalidateTag('calculo-diferencial');
    for (let i = 1; i <= 161; i += 1) {
      const id = `DIF-${String(i).padStart(3, '0')}`;
      for (const locale of routing.locales) {
        const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
        revalidatePath(`${prefix}/calculo-diferencial/formula/${id}`);
      }
    }
    for (const locale of routing.locales) {
      const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
      revalidatePath(`${prefix}/calculo-diferencial`, 'layout');
    }
    return Response.json({ revalidated: true, scope: 'calculo-diferencial' });
  }

  if (body.subject && body.formulaId) {
    const id = body.formulaId.trim().toUpperCase();
    revalidateTag(`formula-${body.subject}-${id}`);
    for (const locale of routing.locales) {
      const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
      revalidatePath(`${prefix}/${body.subject}/formula/${id}`);
    }
    return Response.json({ revalidated: true, formulaId: id, subject: body.subject });
  }

  return Response.json({ error: 'Missing subject/formulaId or all flag' }, { status: 400 });
}
