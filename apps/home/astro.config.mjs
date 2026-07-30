import sitemap from '@astrojs/sitemap'
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: process.env.LAYN_HOME_URL ?? 'https://layn.io',
  integrations: [sitemap()],
})
