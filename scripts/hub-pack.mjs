#!/usr/bin/env node
/**
 * Pack an Even Hub plugin — same flow as working craps-g2 / focus-pulse-g2.
 *
 * CRITICAL: never leave a stale .ehpk inside dist/ before packing. A nested
 * .ehpk doubles the archive (~80 KB) and the phone app silently rejects it.
 */
import { execSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const appJsonPath = join(root, 'app.json')
const outName = process.env.EHPK_OUT || process.argv[2] || 'sentinel-ops.ehpk'
const outPath = join(root, outName)

function fail(msg) {
  console.error(`[pack] ${msg}`)
  process.exit(1)
}

console.log('[pack] building…')
execSync('npm run build', { cwd: root, stdio: 'inherit' })

if (!existsSync(appJsonPath)) fail('app.json missing')
if (!existsSync(join(dist, 'index.html'))) fail('dist/index.html missing — run build first')

let manifest
try {
  manifest = JSON.parse(readFileSync(appJsonPath, 'utf8'))
} catch {
  fail('app.json is not valid JSON')
}

for (const key of ['package_id', 'edition', 'name', 'version', 'min_app_version', 'min_sdk_version', 'entrypoint']) {
  if (!manifest[key]) fail(`app.json missing required field: ${key}`)
}

const entry = join(dist, manifest.entrypoint)
if (!existsSync(entry)) fail(`entrypoint not found in dist/: ${manifest.entrypoint}`)

// Strip anything that must not ship inside the bundle.
rmSync(join(dist, '.DS_Store'), { force: true })
rmSync(join(dist, 'sentinel-ops.ehpk'), { force: true })
for (const f of ['app.ehpk', 'out.ehpk']) {
  rmSync(join(dist, f), { force: true })
}

if (existsSync(outPath)) rmSync(outPath, { force: true })

console.log('[pack] packing with evenhub…')
execSync(`npx evenhub pack "${appJsonPath}" "${dist}" -o "${outPath}"`, {
  cwd: root,
  stdio: 'inherit',
})

if (!existsSync(outPath)) fail(`pack failed — ${outName} not created`)

const bytes = statSync(outPath).size
if (bytes > 55_000) {
  fail(`suspiciously large (${bytes} bytes) — dist/ may still contain a nested .ehpk. Expected ~35–45 KB.`)
}

console.log(`[pack] ✓ ${outPath} (${bytes} bytes)`)
console.log(`[pack] package_id: ${manifest.package_id}`)
console.log(`[pack] version: ${manifest.version}`)
console.log('[pack] upload THIS file from the project root (not dist/)')
