import { defineConfig } from 'cf/config';

export default defineConfig({
  worker: {
    name: 'event-master-pro',
    compatibilityDate: '2026-10-19',
    // Angular routes are client-side, so any path that is not a file gets index.html.
    assets: { notFoundHandling: 'single-page-application' },
    domains: ['joshies.app'],
    observability: { enabled: true },
  },
});
