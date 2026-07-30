import { createServer } from 'node:http'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { masonry } from '@laynjs/core'
import { renderToString } from '@laynjs/vanilla'
import * as esbuild from 'esbuild'

const srcDir = fileURLToPath(new URL('./src/', import.meta.url))
const PORT = 5197

const items = Array.from({ length: 500 }, (_, index) => ({
  id: index,
  aspectRatio: 1,
  data: index,
}))
const ssr = renderToString({
  algorithm: masonry({ columns: 3 }),
  items,
  gap: { x: 8, y: 8 },
  viewport: { width: 900, height: 600 },
  overscan: 200,
  renderItem: (item) => String(item.data),
})

const clientBundle = await esbuild.build({
  entryPoints: [join(srcDir, 'entry-client.ts')],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  write: false,
  logLevel: 'silent',
  define: { 'process.env.NODE_ENV': '"development"' },
})
const clientJs = clientBundle.outputFiles[0].text

const document = `<!doctype html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0}</style></head><body><div id="root" data-testid="container" style="width:900px;height:600px">${ssr}</div><script type="module" src="/client.js"></script></body></html>`

createServer((request, response) => {
  if (request.url === '/client.js') {
    response.setHeader('content-type', 'text/javascript')
    response.end(clientJs)
    return
  }
  response.setHeader('content-type', 'text/html')
  response.end(document)
}).listen(PORT, () => {
  console.log(`vanilla e2e server on http://localhost:${PORT}`)
})
