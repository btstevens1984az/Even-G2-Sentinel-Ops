#!/usr/bin/env node
/**
 * Capture REAL glasses screenshots of the running plugin from the Even Hub
 * simulator automation API (576×288 RGBA PNG — exact format the portal expects).
 *
 * Auto-starts the dev server and simulator when they are not already running:
 *   npm run capture-media
 */
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const DEV_URL = process.env.DEV_URL ?? 'http://localhost:5173'
const PORT = process.env.SIM_AUTOMATION_PORT ?? '9898'
const BASE = `http://127.0.0.1:${PORT}`
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const mediaDir = join(root, 'media')

const TITLE_SPLASH_MS = 5000
const ITEM_SPLASH_MS = 2600

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function devUp() {
  try {
    const res = await fetch(DEV_URL, { method: 'HEAD', signal: AbortSignal.timeout(2500) })
    return res.ok
  } catch {
    return false
  }
}

async function simUp() {
  try {
    const res = await fetch(`${BASE}/api/ping`, { signal: AbortSignal.timeout(2500) })
    return res.ok && (await res.text()).includes('pong')
  } catch {
    return false
  }
}

async function waitFor(check, label, timeoutMs = 45_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await check()) {
      console.log(`  ✓ ${label}`)
      return
    }
    await sleep(400)
  }
  throw new Error(`Timed out waiting for ${label}`)
}

function spawnDetached(cmd, args, cwd) {
  const child = spawn(cmd, args, { cwd, stdio: 'ignore', detached: true })
  child.unref()
  return child
}

async function stopChild(child) {
  if (!child?.pid) return
  try {
    process.kill(-child.pid, 'SIGTERM')
  } catch {
    try { process.kill(child.pid, 'SIGTERM') } catch { /* already dead */ }
  }
  await sleep(900)
}

async function input(action) {
  const res = await fetch(`${BASE}/api/input`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action }),
  })
  if (!res.ok) throw new Error(`input ${action} → ${res.status}`)
  await sleep(500)
}

async function shot(file) {
  const res = await fetch(`${BASE}/api/screenshot/glasses`)
  if (!res.ok) throw new Error(`screenshot → ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(join(mediaDir, `${file}.png`), buf)
  console.log('  ✓', `${file}.png`, `(${buf.length} bytes)`)
}

async function down(n) {
  for (let i = 0; i < n; i++) await input('down')
}

async function captureCoverFallback() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewportSize({ width: 576, height: 288 })
  await page.goto(`file://${join(root, 'cover.html')}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('body[data-ready="1"]')
  await page.screenshot({
    path: join(mediaDir, '00-cover-glasses.png'),
    type: 'png',
    clip: { x: 0, y: 0, width: 576, height: 288 },
  })
  await browser.close()
  console.log('  ✓ 00-cover-glasses.png (cover.html fallback)')
}

async function captureScreens() {
  // Title splash — always export cover.html for Hub hero (matches in-app splash art).
  await captureCoverFallback()

  // Wait for live 5s title splash to finish, then capture main menu.
  await sleep(TITLE_SPLASH_MS + 800)
  await shot('01-menu-glasses')

  // Core Ops → Password Forge (each selection shows a 2.5s splash first).
  await down(2)
  await input('click')
  await sleep(ITEM_SPLASH_MS + 300)
  await input('click')
  await sleep(ITEM_SPLASH_MS + 300)
  await shot('02-forge-glasses')
  await down(3)
  await input('click')

  // Subnet Calculator.
  await down(2)
  await input('click')
  await sleep(ITEM_SPLASH_MS)
  await shot('03-subnet-glasses')
  await down(2)
  await input('click')

  // Port Reference.
  await down(3)
  await input('click')
  await sleep(ITEM_SPLASH_MS)
  await shot('04-ports-glasses')

  // Phone companion webview.
  try {
    const res = await fetch(`${BASE}/api/screenshot/webview`)
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer())
      await writeFile(join(mediaDir, '05-companion-webview.png'), buf)
      console.log('  ✓ 05-companion-webview.png', `(${buf.length} bytes)`)
    } else {
      console.log('  (webview screenshot unavailable:', res.status, ')')
    }
  } catch (e) {
    console.log('  (webview screenshot error:', e.message, ')')
  }
}

async function main() {
  await mkdir(mediaDir, { recursive: true })

  let devChild = null
  let simChild = null
  const startedDev = !(await devUp())
  const startedSim = !(await simUp())

  if (startedDev) {
    console.log('[capture] starting vite dev server…')
    devChild = spawnDetached('npm', ['run', 'dev'], root)
    await waitFor(devUp, 'dev server')
  }

  if (startedSim) {
    console.log('[capture] starting evenhub-simulator…')
    simChild = spawnDetached(
      'npx',
      ['evenhub-simulator', DEV_URL, '--automation-port', PORT, '--no-glow'],
      root,
    )
    await waitFor(simUp, 'simulator')
  }

  try {
    console.log('[capture] navigating plugin and grabbing frames…')
    await captureScreens()
    console.log('Done — real plugin screenshots in media/.')
  } finally {
    if (startedSim) await stopChild(simChild)
    if (startedDev) await stopChild(devChild)
  }
}

main().catch(e => {
  console.error(e.message ?? e)
  process.exit(1)
})
