import { copyFileSync, cpSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const packageDir = dirname(require.resolve('pdfjs-dist/package.json'))
const assetsDir = 'public/vidyala-print-assets'
mkdirSync(assetsDir, { recursive: true })
copyFileSync(join(packageDir, 'build/pdf.worker.min.mjs'), join(assetsDir, 'pdf.worker.min.mjs'))
cpSync(join(packageDir, 'wasm'), join(assetsDir, 'wasm'), { recursive: true })
