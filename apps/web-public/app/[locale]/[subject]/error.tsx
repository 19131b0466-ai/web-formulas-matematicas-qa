'use client';

import { CatalogUnavailable } from '@/components/feedback/CatalogUnavailable';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function SubjectError({ error }: Props) {
  return <CatalogUnavailable logLabel="[subject page]" title="No se pudo cargar el contenido" error={error} />;
}
