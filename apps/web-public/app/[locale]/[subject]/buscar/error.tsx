'use client';

import { CatalogUnavailable } from '@/components/feedback/CatalogUnavailable';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function SearchError({ error }: Props) {
  return (
    <CatalogUnavailable
      logLabel="[search page]"
      title="No se pudo completar la búsqueda"
      detail="La API de búsqueda no respondió a tiempo. Esto no significa que el contenido no exista: vuelve a intentarlo."
      error={error}
    />
  );
}
