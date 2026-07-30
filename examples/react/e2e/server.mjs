import { writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import * as esbuild from 'esbuild'

const srcDir = fileURLToPath(new URL('./src/', import.meta.url))
const appDir = fileURLToPath(new URL('./', import.meta.url))
const PORT = 5199

const clientBundle = await esbuild.build({
  entryPoints: [join(srcDir, 'entry-client.tsx')],
  bundle: true,
  format: 'esm',
  jsx: 'automatic',
  platform: 'browser',
  write: false,
  logLevel: 'silent',
  define: { 'process.env.NODE_ENV': '"development"' },
})
const clientJs = clientBundle.outputFiles[0].text

const serverBundle = await esbuild.build({
  entryPoints: [join(srcDir, 'entry-server.tsx')],
  bundle: true,
  format: 'esm',
  jsx: 'automatic',
  platform: 'node',
  packages: 'external',
  write: false,
  logLevel: 'silent',
})
const serverFile = join(appDir, '.server-render.mjs')
await writeFile(serverFile, serverBundle.outputFiles[0].text)
const { render } = await import(pathToFileURL(serverFile).href)

const document = () =>
  `<!doctype html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0}</style></head><body><div id="root">${render()}</div><script type="module" src="/client.js"></script></body></html>`

createServer((request, response) => {
  if (request.url === '/client.js') {
    response.setHeader('content-type', 'text/javascript')
    response.end(clientJs)
    return
  }
  response.setHeader('content-type', 'text/html')
  response.end(document())
}).listen(PORT, () => {
  console.log(`e2e server on http://localhost:${PORT}`)
})
