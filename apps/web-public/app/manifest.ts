import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Fórmulas matemáticas',
    short_name: 'Fórmulas',
    description: 'Fórmulas matemáticas en línea: Cálculo II y Física Básica',
    start_url: '/',
    display: 'standalone',
    background_color: '#f3f6f4',
    theme_color: '#0d6b52',
    lang: 'es',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
