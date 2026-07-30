import { qwikVite } from '@builder.io/qwik/optimizer'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [qwikVite({ csr: true })],
  optimizeDeps: { include: ['@laynjs/qwik'] },
  server: { port: 5202 },
})
