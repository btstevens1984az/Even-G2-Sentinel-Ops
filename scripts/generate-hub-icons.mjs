#!/usr/bin/env node
/** Generate monochrome Hub icon assets (foreground shield + background) via SVG. */
import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const media = join(root, 'media')
const label = process.env.ICON_LABEL || 'SENTINEL'

async function renderHtml(file, html) {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewportSize({ width: 512, height: 512 })
  await page.setContent(html, { waitUntil: 'networkidle' })
  await page.screenshot({ path: file, type: 'png', clip: { x: 0, y: 0, width: 512, height: 512 } })
  await browser.close()
}

const foreground = `<!doctype html><html><body style="margin:0;width:512px;height:512px;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:monospace">
  <svg width="300" height="300" viewBox="0 0 64 64" fill="none" stroke="#fff" stroke-width="3.4">
    <path d="M32 4 L56 13 V32 C56 47 45 56 32 60 C19 56 8 47 8 32 V13 Z" stroke-linejoin="round"/>
    <path d="M22 32 l7 8 l13 -16" stroke-linecap="round" stroke-linejoin="round" stroke-width="4.4"/>
  </svg>
  <div style="color:#fff;font-size:38px;font-weight:700;letter-spacing:3px;margin-top:6px">${label.slice(0, 12)}</div>
</body></html>`

const background = `<!doctype html><html><body style="margin:0;width:512px;height:512px;background:#000;background-image:linear-gradient(#0e0e0e 1px,transparent 1px),linear-gradient(90deg,#0e0e0e 1px,transparent 1px);background-size:32px 32px"></body></html>`

await mkdir(media, { recursive: true })
await renderHtml(join(media, 'icon-foreground.png'), foreground)
await renderHtml(join(media, 'icon-background.png'), background)
console.log('  ✓ icon-foreground.png')
console.log('  ✓ icon-background.png')
