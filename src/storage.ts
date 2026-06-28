import type { EvenAppBridge } from '@evenrealities/even_hub_sdk'

export interface Prefs {
  lenIdx: number
  symbols: boolean
  wordsIdx: number
  sepIdx: number
  appendNumber: boolean
  baseIdx: number
  prefixIdx: number
  tokenTypeIdx: number
  payloadSampleIdx: number
  payloadModeIdx: number
  hashTypeIdx: number
}

export const DEFAULT_PREFS: Prefs = {
  lenIdx: 1,
  symbols: true,
  wordsIdx: 1,
  sepIdx: 0,
  appendNumber: true,
  baseIdx: 3,
  prefixIdx: 2,
  tokenTypeIdx: 0,
  payloadSampleIdx: 0,
  payloadModeIdx: 0,
  hashTypeIdx: 0,
}

const KEY = 'sentinel-ops-prefs'

export async function loadPrefs(bridge: EvenAppBridge): Promise<Prefs> {
  try {
    const raw = await bridge.getLocalStorage(KEY)
    if (!raw) return { ...DEFAULT_PREFS }
    return { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<Prefs>) }
  } catch {
    return { ...DEFAULT_PREFS }
  }
}

export async function savePrefs(bridge: EvenAppBridge, prefs: Prefs): Promise<void> {
  try {
    await bridge.setLocalStorage(KEY, JSON.stringify(prefs))
  } catch {
    /* best-effort */
  }
}
