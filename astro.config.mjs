// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://anastasia-design.pages.dev',
  i18n: {
    defaultLocale: 'ru',
    locales: ['ru'],
  },
  integrations: [sitemap()],
  fonts: [
    {
      name: 'EB Garamond',
      cssVariable: '--font-main',
      provider: fontProviders.fontsource(),
      weights: [400, 600],
      styles: ['normal', 'italic'],
      subsets: ['cyrillic', 'latin'],
      fallbacks: ['serif'],
    },
  ],
});
