import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const LIMIT = 200
const ROOTS = ['packages']
const SKIP_DIR = /^(node_modules|dist)$/
const SKIP_FILE = /\.test\.ts$|\.bench\.ts$|__fixtures__/

const walk = (dir) => {
  const files = []
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIR.test(entry)) {
      continue
    }
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      files.push(...walk(full))
    } else if (full.endsWith('.ts') && !SKIP_FILE.test(full)) {
      files.push(full)
    }
  }
  return files
}

const offenders = []
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const lines = readFileSync(file, 'utf8').split('\n').length
    if (lines > LIMIT) {
      offenders.push(`  ${file}: ${lines} lines`)
    }
  }
}

if (offenders.length > 0) {
  console.error(`Source files exceeding ${LIMIT} LOC (split by concern):\n${offenders.join('\n')}`)
  process.exit(1)
}

console.log(`LOC check passed: all source files within ${LIMIT} lines.`)
