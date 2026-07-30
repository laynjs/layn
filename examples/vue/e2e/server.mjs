import { writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import * as esbuild from 'esbuild'

const srcDir = fileURLToPath(new URL('./src/', import.meta.url))
const appDir = fileURLToPath(new URL('./', import.meta.url))
const PORT = 5198

const vueFlags = {
  __VUE_OPTIONS_API__: 'true',
  __VUE_PROD_DEVTOOLS__: 'false',
  __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true',
}

const clientBundle = await esbuild.build({
  entryPoints: [join(srcDir, 'entry-client.ts')],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  write: false,
  logLevel: 'silent',
  define: { 'process.env.NODE_ENV': '"development"', ...vueFlags },
})
const clientJs = clientBundle.outputFiles[0].text

const serverBundle = await esbuild.build({
  entryPoints: [join(srcDir, 'entry-server.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  packages: 'external',
  write: false,
  logLevel: 'silent',
})
const serverFile = join(appDir, '.server-render.mjs')
await writeFile(serverFile, serverBundle.outputFiles[0].text)
const { render } = await import(pathToFileURL(serverFile).href)

const document = (html) =>
  `<!doctype html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0}</style></head><body><div id="root">${html}</div><script type="module" src="/client.js"></script></body></html>`

createServer(async (request, response) => {
  if (request.url === '/client.js') {
    response.setHeader('content-type', 'text/javascript')
    response.end(clientJs)
    return
  }
  response.setHeader('content-type', 'text/html')
  response.end(document(await render()))
}).listen(PORT, () => {
  console.log(`vue e2e server on http://localhost:${PORT}`)
})
