'use client';

import { CatalogUnavailable } from '@/components/feedback/CatalogUnavailable';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GuideError({ error }: Props) {
  return <CatalogUnavailable logLabel="[guide page]" title="No se pudo cargar la guía" error={error} />;
}
