import type { ReactNode } from 'react';
import { optIntoQaDynamicRender } from '@/lib/qa-dynamic';

/** Root layout required by Next.js; locale-specific html/body live under `[locale]`. */
export default async function RootLayout({ children }: { children: ReactNode }) {
  await optIntoQaDynamicRender();
  return children;
}
