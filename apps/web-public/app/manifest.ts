import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Formulario de Cálculo II',
    short_name: 'Cálculo II',
    description: 'Formulario en línea de Cálculo Integral',
    start_url: '/',
    display: 'standalone',
    background_color: '#eef5f3',
    theme_color: '#0f6e56',
    lang: 'es',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
    ],
  };
}
