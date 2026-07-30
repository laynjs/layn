import { fileURLToPath } from 'node:url'
import angular from '@analogjs/vite-plugin-angular'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [angular({ tsconfig: fileURLToPath(new URL('./tsconfig.json', import.meta.url)) })],
  optimizeDeps: { include: ['@laynjs/angular'] },
  server: { port: 5193 },
})
