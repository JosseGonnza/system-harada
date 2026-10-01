// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import AstroPWA from '@vite-pwa/astro';

export default defineConfig({
  devToolbar: { enabled: false },
  vite: { plugins: [tailwindcss()] },
  integrations: [
    AstroPWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon-96x96.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Harada',
        short_name: 'Harada',
        description: 'Tu cuadrícula Harada de un vistazo: qué toca hoy, qué está hecho y qué pilar va flojo.',
        lang: 'es',
        theme_color: '#1b1d24',
        background_color: '#1b1d24',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,ico,woff2,webmanifest}'],
        navigateFallback: '/',
      },
    }),
  ],
});
