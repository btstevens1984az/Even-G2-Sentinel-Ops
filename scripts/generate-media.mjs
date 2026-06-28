#!/usr/bin/env node
/** Generate all store media PNGs (no dev server needed) via headless Chromium. */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const mediaDir = join(root, 'media')

// Canvas tool screens render reliably from the backing store via toDataURL.
const GLASSES = [
  { media: 'menu', file: '01-menu-glasses' },
  { media: 'forge', file: '02-forge-glasses' },
  { media: 'subnet', file: '03-subnet-glasses' },
  { media: 'ports', file: '04-ports-glasses' },
]

async function main() {
  await mkdir(mediaDir, { recursive: true })
  const browser = await chromium.launch({ headless: true })

  // Cover is an HTML/SVG layout captured via full-page screenshot (most robust).
  const cover = await browser.newPage()
  await cover.setViewportSize({ width: 576, height: 288 })
  await cover.goto(`file://${join(root, 'cover.html')}`, { waitUntil: 'networkidle' })
  await cover.waitForSelector('body[data-ready="1"]')
  await cover.screenshot({ path: join(mediaDir, '00-cover-glasses.png'), type: 'png', clip: { x: 0, y: 0, width: 576, height: 288 } })
  await cover.close()
  console.log('  ✓ 00-cover-glasses')

  for (const scene of GLASSES) {
    const page = await browser.newPage()
    await page.setViewportSize({ width: 576, height: 288 })
    await page.goto(`file://${join(root, 'media-export.html')}?media=${scene.media}`, { waitUntil: 'networkidle' })
    await page.waitForSelector('body[data-ready="1"]')
    // Export straight from the canvas backing store (avoids headless compositor
    // quirks where an element screenshot can come back blank).
    const dataUrl = await page.evaluate(() => document.getElementById('frame').toDataURL('image/png'))
    const buf = Buffer.from(dataUrl.split(',')[1], 'base64')
    await writeFile(join(mediaDir, `${scene.file}.png`), buf)
    await page.close()
    console.log('  ✓', scene.file)
  }

  const phone = await browser.newPage()
  await phone.setViewportSize({ width: 390, height: 844 })
  await phone.goto(`file://${join(root, 'index.html')}`, { waitUntil: 'networkidle' })
  // Reflect the connected state for the screenshot.
  await phone.evaluate(() => document.getElementById('companion')?.classList.add('glasses-live'))
  await phone.waitForTimeout(400)
  await phone.screenshot({ path: join(mediaDir, '05-companion-webview.png'), type: 'png' })
  await phone.close()
  console.log('  ✓ 05-companion-webview')

  await browser.close()
  console.log('Done — media/ ready for Even Hub upload.')
}

main().catch(e => { console.error(e); process.exit(1) })
