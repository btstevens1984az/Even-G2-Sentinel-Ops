/**
 * Offline security primitives — all randomness comes from the WebView's
 * crypto.getRandomValues (CSPRNG). No network, no storage of secrets.
 */
import { WORDLIST } from './wordlist'

const LOWER = 'abcdefghijkmnpqrstuvwxyz' // no l/o (ambiguous)
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ' // no I/O
const DIGITS = '23456789' // no 0/1
const SYMBOLS = '!@#$%^&*-_=+?'

export type Strength = 'Weak' | 'Fair' | 'Strong' | 'Excellent'

export function rateEntropy(bits: number): Strength {
  if (bits < 50) return 'Weak'
  if (bits < 70) return 'Fair'
  if (bits < 100) return 'Strong'
  return 'Excellent'
}

/** Uniform random integer in [0, max) using rejection sampling (no modulo bias). */
function randInt(max: number): number {
  if (max <= 0) return 0
  const limit = Math.floor(0xffffffff / max) * max
  const buf = new Uint32Array(1)
  let x = 0
  do {
    crypto.getRandomValues(buf)
    x = buf[0]
  } while (x >= limit)
  return x % max
}

function pick(chars: string): string {
  return chars[randInt(chars.length)]
}

export interface PasswordResult {
  value: string
  bits: number
  strength: Strength
  poolSize: number
}

export function generatePassword(length: number, useSymbols: boolean): PasswordResult {
  const pool = LOWER + UPPER + DIGITS + (useSymbols ? SYMBOLS : '')
  // Guarantee at least one of each required class for policy compliance.
  const required = [pick(LOWER), pick(UPPER), pick(DIGITS)]
  if (useSymbols) required.push(pick(SYMBOLS))
  const out: string[] = [...required]
  for (let i = out.length; i < length; i++) out.push(pick(pool))
  // Fisher–Yates shuffle so required chars aren't always at the front.
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  const value = out.join('')
  const bits = Math.round(length * Math.log2(pool.length))
  return { value, bits, strength: rateEntropy(bits), poolSize: pool.length }
}

export interface PassphraseResult {
  value: string
  bits: number
  strength: Strength
  words: number
}

export function generatePassphrase(
  words: number,
  separator: string,
  appendNumber: boolean,
): PassphraseResult {
  const parts: string[] = []
  for (let i = 0; i < words; i++) {
    const w = WORDLIST[randInt(WORDLIST.length)]
    parts.push(w.charAt(0).toUpperCase() + w.slice(1))
  }
  let value = parts.join(separator)
  let bits = words * Math.log2(WORDLIST.length)
  if (appendNumber) {
    const n = randInt(100)
    value += separator + String(n).padStart(2, '0')
    bits += Math.log2(100)
  }
  const rounded = Math.round(bits)
  return { value, bits: rounded, strength: rateEntropy(rounded), words }
}

// ---------------------------------------------------------------- subnet calc
export interface SubnetResult {
  cidr: string
  mask: string
  wildcard: string
  network: string
  broadcast: string
  firstHost: string
  lastHost: string
  usable: number
  total: number
}

function toOctets(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.')
}

export function parseIp(ip: string): number {
  const o = ip.split('.').map(Number)
  return ((o[0] << 24) | (o[1] << 16) | (o[2] << 8) | o[3]) >>> 0
}

export function calcSubnet(baseIp: string, prefix: number): SubnetResult {
  const ipNum = parseIp(baseIp)
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0
  const wildcard = (~mask) >>> 0
  const network = (ipNum & mask) >>> 0
  const broadcast = (network | wildcard) >>> 0
  const total = 2 ** (32 - prefix)
  const usable = prefix >= 31 ? (prefix === 31 ? 2 : 1) : Math.max(0, total - 2)
  const firstHost = prefix >= 31 ? network : (network + 1) >>> 0
  const lastHost = prefix >= 31 ? broadcast : (broadcast - 1) >>> 0
  return {
    cidr: `${toOctets(network)}/${prefix}`,
    mask: toOctets(mask),
    wildcard: toOctets(wildcard),
    network: toOctets(network),
    broadcast: toOctets(broadcast),
    firstHost: toOctets(firstHost),
    lastHost: toOctets(lastHost),
    usable,
    total,
  }
}
