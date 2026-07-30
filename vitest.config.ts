import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@laynjs/adapter-utils': fileURLToPath(
        new URL('./packages/adapter-utils/src/index.ts', import.meta.url),
      ),
      '@laynjs/angular': fileURLToPath(new URL('./packages/angular/src/index.ts', import.meta.url)),
      '@laynjs/core': fileURLToPath(new URL('./packages/core/src/index.ts', import.meta.url)),
      '@laynjs/dom': fileURLToPath(new URL('./packages/dom/src/index.ts', import.meta.url)),
      '@laynjs/qwik': fileURLToPath(new URL('./packages/qwik/src/index.ts', import.meta.url)),
      '@laynjs/solid': fileURLToPath(new URL('./packages/solid/src/index.ts', import.meta.url)),
      '@laynjs/svelte': fileURLToPath(new URL('./packages/svelte/src/index.ts', import.meta.url)),
      '@laynjs/vanilla': fileURLToPath(new URL('./packages/vanilla/src/index.ts', import.meta.url)),
      '@laynjs/vue': fileURLToPath(new URL('./packages/vue/src/index.ts', import.meta.url)),
    },
  },
  test: {
    include: ['packages/*/src/**/*.test.{ts,tsx}'],
    environment: 'node',
  },
})
