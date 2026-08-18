import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightLlmsTxt from 'starlight-llms-txt'
import { LLMS_DETAILS, LLMS_SETS } from './llms.config.mjs'

const HOME_URL = process.env.LAYN_HOME_URL ?? 'https://layn.io'
const PLAYGROUND_URL = process.env.LAYN_PLAYGROUND_URL ?? 'https://play.layn.io'
const REPO_URL = process.env.LAYN_REPO_URL ?? 'https://github.com/laynjs/layn'

export default defineConfig({
  site: process.env.LAYN_DOCS_URL ?? 'https://docs.layn.io',
  integrations: [
    starlight({
      title: 'layn',
      plugins: [
        starlightLlmsTxt({
          projectName: 'layn',
          description:
            'Headless, framework-agnostic web layout engine. SSR-deterministic masonry, justified, packing, quilt and more, with first-class virtualization.',
          details: LLMS_DETAILS,
          customSets: LLMS_SETS,
          optionalLinks: [
            { label: 'Playground', url: PLAYGROUND_URL, description: 'every algorithm, live' },
            {
              label: 'Runnable template',
              url: 'https://stackblitz.com/github/laynjs/layn/tree/main/templates/react',
              description: 'a working React project on StackBlitz',
            },
            { label: 'Source', url: REPO_URL, description: 'MIT, monorepo, all ten packages' },
          ],
          exclude: ['404'],
          customSelectors: { all: ['.sl-anchor-link'] },
        }),
      ],
      description:
        'Headless, framework-agnostic web layout engine. SSR-deterministic masonry, justified, packing, quilt and more, with first-class virtualization.',
      tagline: 'The headless layout engine for the modern web.',
      favicon: '/favicon.svg',
      logo: { src: './src/assets/logo.svg', replacesTitle: false },
      components: {
        Head: './src/components/Head.astro',
        ThemeSelect: './src/components/ThemeSelect.astro',
      },
      social: [{ icon: 'github', label: 'GitHub', href: REPO_URL }],
      editLink: { baseUrl: `${REPO_URL}/edit/main/apps/docs/` },
      lastUpdated: true,
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        {
          label: 'Start here',
          items: [
            { label: 'Introduction', slug: 'index' },
            { label: 'Installation', slug: 'getting-started/installation' },
            { label: 'Quick start', slug: 'getting-started/quick-start' },
            { label: 'Core concepts', slug: 'getting-started/concepts' },
            { label: 'Design decisions', slug: 'getting-started/design-decisions' },
          ],
        },
        {
          label: 'Engine',
          items: [
            { label: 'The engine', slug: 'core/engine' },
            { label: 'Algorithms', slug: 'core/algorithms' },
            { label: 'Measurement', slug: 'core/measurement' },
            { label: 'Virtualization', slug: 'core/virtualization' },
            { label: 'Serialization & hydration', slug: 'core/serialization' },
            { label: 'API reference', slug: 'core/api' },
          ],
        },
        {
          label: 'Framework adapters',
          items: [
            { label: 'Overview', slug: 'adapters/overview' },
            { label: 'React', slug: 'adapters/react' },
            { label: 'Vue', slug: 'adapters/vue' },
            { label: 'Svelte', slug: 'adapters/svelte' },
            { label: 'Solid', slug: 'adapters/solid' },
            { label: 'Angular', slug: 'adapters/angular' },
            { label: 'Qwik', slug: 'adapters/qwik' },
            { label: 'Vanilla', slug: 'adapters/vanilla' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Styling', slug: 'guides/styling' },
            { label: 'Sections', slug: 'guides/sections' },
            { label: 'Animations', slug: 'guides/animations' },
            { label: 'Scrolling', slug: 'guides/scrolling' },
            { label: 'Infinite scroll', slug: 'guides/infinite-scroll' },
            { label: 'Drag and drop', slug: 'guides/drag-and-drop' },
            { label: 'Write your own algorithm', slug: 'guides/custom-algorithms' },
            { label: 'Devtools overlay', slug: 'guides/devtools' },
            { label: 'SSR & hydration', slug: 'guides/ssr' },
            { label: 'Accessibility', slug: 'guides/accessibility' },
            { label: 'Performance', slug: 'guides/performance' },
            { label: 'Run the benchmark', slug: 'guides/benchmark' },
          ],
        },
        {
          label: 'Recipes',
          items: [
            { label: 'Photo gallery', slug: 'recipes/gallery' },
            { label: 'Infinite feed', slug: 'recipes/feed' },
            { label: 'Dashboard', slug: 'recipes/dashboard' },
          ],
        },
        {
          label: 'More',
          items: [
            { label: 'Playground', link: PLAYGROUND_URL, attrs: { target: '_blank' } },
            { label: 'Homepage', link: HOME_URL, attrs: { target: '_blank' } },
          ],
        },
      ],
    }),
  ],
})
