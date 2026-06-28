import {
  DISPLAY_W,
  HUD_H,
  PANEL_H,
  PANEL_W,
} from '../sdk/layout'
import { C, encodeRegion } from './grey-codec'

export type SplashKey =
  | 'title'
  | 'red_team' | 'blue_team' | 'core_ops' | 'howto'
  | 'token' | 'payload' | 'mitre' | 'lolbins' | 'privesc' | 'recon' | 'c2'
  | 'hash' | 'ioc' | 'sigma' | 'events' | 'hunt' | 'detect'
  | 'forge' | 'passphrase' | 'subnet' | 'ports' | 'hardening' | 'ir' | 'nato'

const BANNER_W = DISPLAY_W
const BANNER_H = HUD_H

interface SplashMeta {
  kicker: string
  title: string
  accent: string
  subtitle: string
  icon: SplashKey | 'shield'
}

const META: Record<SplashKey, SplashMeta> = {
  title: {
    kicker: 'EVEN · G2 · R1',
    title: 'SENTINEL',
    accent: 'OPS',
    subtitle: 'RED · BLUE TEAM ARSENAL',
    icon: 'shield',
  },
  red_team: {
    kicker: 'OFFENSIVE OPS',
    title: 'RED TEAM',
    accent: 'ARSENAL',
    subtitle: '7 lab tools · tokens · TTPs',
    icon: 'red_team',
  },
  blue_team: {
    kicker: 'DEFENSIVE OPS',
    title: 'BLUE TEAM',
    accent: 'DEFENSE',
    subtitle: '6 detect · hunt · respond tools',
    icon: 'blue_team',
  },
  core_ops: {
    kicker: 'DAILY DRIVER',
    title: 'CORE',
    accent: 'OPS',
    subtitle: '7 passwords · network · refs',
    icon: 'core_ops',
  },
  howto: {
    kicker: 'CONTROLS',
    title: 'HOW TO',
    accent: 'USE',
    subtitle: 'Scroll · tap · double-tap exit',
    icon: 'howto',
  },
  token: { kicker: 'RED TEAM', title: 'TOKEN', accent: 'FORGE', subtitle: 'API keys · JWT · secrets', icon: 'token' },
  payload: { kicker: 'RED TEAM', title: 'PAYLOAD', accent: 'LAB', subtitle: 'Base64 · hex · URL encode', icon: 'payload' },
  mitre: { kicker: 'RED TEAM', title: 'MITRE', accent: 'ATT&CK', subtitle: 'Tactics · techniques · procedures', icon: 'mitre' },
  lolbins: { kicker: 'RED TEAM', title: 'LOL', accent: 'BINS', subtitle: 'Living-off-the-land binaries', icon: 'lolbins' },
  privesc: { kicker: 'RED TEAM', title: 'PRIV', accent: 'ESC', subtitle: 'Elevation paths · misconfigs', icon: 'privesc' },
  recon: { kicker: 'RED TEAM', title: 'RECON', accent: 'PLAYBOOK', subtitle: 'OSINT · enum · mapping', icon: 'recon' },
  c2: { kicker: 'RED TEAM', title: 'C2 /', accent: 'EXFIL', subtitle: 'Channels · staging · egress', icon: 'c2' },
  hash: { kicker: 'BLUE TEAM', title: 'HASH', accent: 'FINGERPRINTS', subtitle: 'MD5 · SHA · NTLM samples', icon: 'hash' },
  ioc: { kicker: 'BLUE TEAM', title: 'IOC', accent: 'FORMATS', subtitle: 'STIX · OpenIOC · YARA tags', icon: 'ioc' },
  sigma: { kicker: 'BLUE TEAM', title: 'SIGMA', accent: 'RULES', subtitle: 'Detection logic patterns', icon: 'sigma' },
  events: { kicker: 'BLUE TEAM', title: 'WIN', accent: 'EVENT IDS', subtitle: 'Security log event codes', icon: 'events' },
  hunt: { kicker: 'BLUE TEAM', title: 'THREAT', accent: 'HUNTING', subtitle: 'Hypothesis-driven search', icon: 'hunt' },
  detect: { kicker: 'BLUE TEAM', title: 'DETECTION', accent: 'MATRIX', subtitle: 'Coverage · gaps · priorities', icon: 'detect' },
  forge: { kicker: 'CORE OPS', title: 'PASSWORD', accent: 'FORGE', subtitle: 'CSPRNG · entropy · strength', icon: 'forge' },
  passphrase: { kicker: 'CORE OPS', title: 'PASS', accent: 'PHRASE', subtitle: 'Diceware · memorable · strong', icon: 'passphrase' },
  subnet: { kicker: 'CORE OPS', title: 'SUBNET', accent: 'CALC', subtitle: 'CIDR · mask · host ranges', icon: 'subnet' },
  ports: { kicker: 'CORE OPS', title: 'PORT', accent: 'REFERENCE', subtitle: 'Common services · risk flags', icon: 'ports' },
  hardening: { kicker: 'CORE OPS', title: 'HARDENING', accent: 'CHECKLIST', subtitle: 'CIS-style quick wins', icon: 'hardening' },
  ir: { kicker: 'CORE OPS', title: 'INCIDENT', accent: 'RESPONSE', subtitle: 'NIST SP 800-61 phases', icon: 'ir' },
  nato: { kicker: 'CORE OPS', title: 'NATO', accent: 'PHONETIC', subtitle: 'Alpha · Bravo · read-aloud', icon: 'nato' },
}

let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null

function ensureCanvas(): CanvasRenderingContext2D {
  if (!canvas) {
    canvas = document.createElement('canvas')
    canvas.width = BANNER_W
    canvas.height = BANNER_H
    ctx = canvas.getContext('2d')!
  }
  return ctx!
}

function clear(): void {
  const c = ensureCanvas()
  c.fillStyle = C.bg
  c.fillRect(0, 0, BANNER_W, BANNER_H)
}

function grid(): void {
  const c = ensureCanvas()
  c.strokeStyle = 'rgba(94,232,94,0.08)'
  c.lineWidth = 1
  for (let x = 0; x <= BANNER_W; x += 24) {
    c.beginPath(); c.moveTo(x, 0); c.lineTo(x, BANNER_H); c.stroke()
  }
  for (let y = 0; y <= BANNER_H; y += 24) {
    c.beginPath(); c.moveTo(0, y); c.lineTo(BANNER_W, y); c.stroke()
  }
}

function cornerTicks(): void {
  const c = ensureCanvas()
  c.strokeStyle = C.mid
  c.lineWidth = 2
  const m = 8
  const L = 16
  const corners: [number, number, number, number][] = [
    [m, m, 1, 1], [BANNER_W - m, m, -1, 1],
    [m, BANNER_H - m, 1, -1], [BANNER_W - m, BANNER_H - m, -1, -1],
  ]
  for (const [x, y, dx, dy] of corners) {
    c.beginPath()
    c.moveTo(x, y + dy * L)
    c.lineTo(x, y)
    c.lineTo(x + dx * L, y)
    c.stroke()
  }
}

function drawShield(cx: number, cy: number, s: number, pulse: number): void {
  const c = ensureCanvas()
  c.strokeStyle = C.bright
  c.lineWidth = 2.5
  c.beginPath()
  c.moveTo(cx, cy - s)
  c.lineTo(cx + s * 0.88, cy - s * 0.38)
  c.lineTo(cx + s * 0.88, cy + s * 0.38)
  c.lineTo(cx, cy + s)
  c.lineTo(cx - s * 0.88, cy + s * 0.38)
  c.lineTo(cx - s * 0.88, cy - s * 0.38)
  c.closePath()
  c.stroke()
  c.lineWidth = 2.5 + pulse
  c.lineCap = 'round'
  c.lineJoin = 'round'
  c.beginPath()
  c.moveTo(cx - s * 0.32, cy + s * 0.02)
  c.lineTo(cx - s * 0.06, cy + s * 0.28)
  c.lineTo(cx + s * 0.38, cy - s * 0.26)
  c.stroke()
  c.lineCap = 'butt'
}

function drawTarget(cx: number, cy: number, s: number): void {
  const c = ensureCanvas()
  c.strokeStyle = C.bright
  c.lineWidth = 2
  for (const r of [s, s * 0.65, s * 0.3]) {
    c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke()
  }
}

function drawLock(cx: number, cy: number, s: number): void {
  const c = ensureCanvas()
  c.strokeStyle = C.bright
  c.lineWidth = 2
  c.strokeRect(cx - s * 0.55, cy - s * 0.05, s * 1.1, s * 0.75)
  c.beginPath()
  c.arc(cx, cy - s * 0.05, s * 0.42, Math.PI, 0)
  c.stroke()
}

function drawNetwork(cx: number, cy: number, s: number): void {
  const c = ensureCanvas()
  c.strokeStyle = C.bright
  c.lineWidth = 2
  const nodes: [number, number][] = [
    [cx, cy - s * 0.5], [cx - s * 0.6, cy + s * 0.1],
    [cx + s * 0.6, cy + s * 0.1], [cx, cy + s * 0.55],
  ]
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      c.beginPath()
      c.moveTo(nodes[i][0], nodes[i][1])
      c.lineTo(nodes[j][0], nodes[j][1])
      c.stroke()
    }
  }
  for (const [x, y] of nodes) {
    c.beginPath(); c.arc(x, y, s * 0.14, 0, Math.PI * 2); c.stroke()
  }
}

function drawBinary(cx: number, cy: number, s: number): void {
  const c = ensureCanvas()
  c.font = `bold ${Math.round(s * 0.55)}px ui-monospace, Menlo, monospace`
  c.fillStyle = C.bright
  c.textAlign = 'center'
  c.fillText('01', cx - s * 0.35, cy + s * 0.1)
  c.fillText('10', cx + s * 0.35, cy + s * 0.1)
  c.strokeStyle = C.rule
  c.strokeRect(cx - s * 0.75, cy - s * 0.45, s * 1.5, s * 0.9)
}

function drawGear(cx: number, cy: number, s: number): void {
  const c = ensureCanvas()
  c.strokeStyle = C.bright
  c.lineWidth = 2
  c.beginPath(); c.arc(cx, cy, s * 0.35, 0, Math.PI * 2); c.stroke()
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    c.beginPath()
    c.moveTo(cx + Math.cos(a) * s * 0.42, cy + Math.sin(a) * s * 0.42)
    c.lineTo(cx + Math.cos(a) * s * 0.62, cy + Math.sin(a) * s * 0.62)
    c.stroke()
  }
}

function drawBook(cx: number, cy: number, s: number): void {
  const c = ensureCanvas()
  c.strokeStyle = C.bright
  c.lineWidth = 2
  c.strokeRect(cx - s * 0.55, cy - s * 0.55, s * 1.1, s * 1.1)
  c.beginPath()
  c.moveTo(cx, cy - s * 0.55); c.lineTo(cx, cy + s * 0.55)
  c.stroke()
}

function drawIcon(key: SplashKey | 'shield', cx: number, cy: number, frame: number): void {
  const s = 42
  const pulse = frame % 4 === 0 ? 1 : 0
  switch (key) {
    case 'shield': case 'title': case 'blue_team': case 'hunt': case 'detect': case 'ir':
      drawShield(cx, cy, s, pulse); break
    case 'red_team': case 'mitre': case 'recon': case 'c2': case 'privesc':
      drawTarget(cx, cy, s); break
    case 'core_ops': case 'hardening':
      drawGear(cx, cy, s); break
    case 'howto': case 'passphrase': case 'nato':
      drawBook(cx, cy, s); break
    case 'token': case 'forge':
      drawLock(cx, cy, s); break
    case 'payload': case 'lolbins': case 'hash': case 'ioc': case 'sigma': case 'events':
      drawBinary(cx, cy, s); break
    case 'subnet': case 'ports':
      drawNetwork(cx, cy, s); break
    default:
      drawShield(cx, cy, s, 0); break
  }
}

function drawCopy(meta: SplashMeta): void {
  const c = ensureCanvas()
  c.textAlign = 'left'
  c.fillStyle = C.mid
  c.font = 'bold 12px ui-monospace, Menlo, monospace'
  c.fillText(meta.kicker, 118, 36)
  c.strokeStyle = C.dim
  c.lineWidth = 1
  c.beginPath(); c.moveTo(118, 42); c.lineTo(560, 42); c.stroke()
  c.fillStyle = C.bright
  c.font = 'bold 34px ui-monospace, Menlo, monospace'
  c.fillText(meta.title, 118, 78)
  c.fillStyle = C.mid
  c.fillText(meta.accent, 118, 112)
  c.fillStyle = C.rule
  c.font = '14px ui-monospace, Menlo, monospace'
  c.fillText(meta.subtitle, 120, 132)
}

export interface SplashTiles {
  left: Uint8Array
  right: Uint8Array
}

export function renderSplash(key: SplashKey, frame = 0): SplashTiles {
  const meta = META[key]
  clear()
  grid()
  cornerTicks()
  drawIcon(meta.icon, 58, 72, frame)
  drawCopy(meta)
  const full = ensureCanvas().getImageData(0, 0, BANNER_W, BANNER_H)
  return {
    left: encodeRegion(full, 0, 0, PANEL_W, PANEL_H),
    right: encodeRegion(full, PANEL_W, 0, PANEL_W, PANEL_H),
  }
}

export function splashListLabel(key: SplashKey): string {
  const m = META[key]
  return `▸ ${m.title} ${m.accent}`.trim()
}
