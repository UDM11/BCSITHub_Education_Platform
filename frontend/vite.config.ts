import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.png', 'icon-512.png', 'logo.png'],
      manifest: {
        name: '​',
        short_name: '​',
        description: 'Notes, courses & resources for BCSIT students. Install for offline access to unit notes.',
        theme_color: '#4f46e5',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/favicon.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        globIgnores: ['**/version.json', 'notes/**/*.html'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024, // 6 MB (icons are ~5 MB)
        navigateFallbackDenylist: [/\/api\//, /\/sitemap\.xml$/, /\/robots\.txt$/, /\/googleac19bc2bcb3cb960\.html$/, /\/BingSiteAuth\.xml$/, /\/version\.json$/],
        runtimeCaching: [
          {
            urlPattern: /\/notes\/.*\.html/,
            handler: 'NetworkFirst',          // Always try network first; fall back to cache if offline
            options: {
              cacheName: 'bcsithub-notes-cache',
              networkTimeoutSeconds: 5,       // If network takes >5s, serve cached version
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 7 }, // 7 days (was 365)
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
