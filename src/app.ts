import type { EvenAppBridge } from '@evenrealities/even_hub_sdk'
import { renderSplash, splashListLabel, type SplashKey } from './render/splash-renderer'
import { createGlassesUi, type PageView } from './sdk/glasses-ui'
import { bindBridgeInput, bindKeyboardInput, type InputHandlers } from './sdk/input'
import { showCompanionReady } from './sdk/phone-companion'
import {
  ITEM_SPLASH_MS,
  TITLE_SPLASH_MS,
  splashForBlueItem,
  splashForCoreItem,
  splashForMainItem,
  splashForRedItem,
} from './splash/flow'
import {
  DETECT_PAGES,
  EVENTID_PAGES,
  HASH_SAMPLES,
  HASH_TYPES,
  HUNT_PAGES,
  IOC_PAGES,
  SIGMA_PAGES,
} from './security/blueteam'
import { HARDENING_PAGES, IR_PAGES, NATO_PAGES, PORT_PAGES, type RefPage } from './security/reference'
import {
  C2_PAGES,
  ENCODE_MODES,
  generateToken,
  encodePayload,
  LOLBINS_PAGES,
  MITRE_PAGES,
  PAYLOAD_SAMPLES,
  PRIVESC_PAGES,
  RECON_PAGES,
  TOKEN_TYPES,
} from './security/redteam'
import {
  calcSubnet,
  generatePassphrase,
  generatePassword,
  type PassphraseResult,
  type PasswordResult,
} from './security/tools'
import { DEFAULT_PREFS, loadPrefs, savePrefs, type Prefs } from './storage'

type RefScreen =
  | 'ports' | 'hardening' | 'ir' | 'nato'
  | 'mitre' | 'lolbins' | 'privesc' | 'recon' | 'c2'
  | 'ioc' | 'sigma' | 'events' | 'hunt' | 'detect'

type Screen =
  | 'menu' | 'red_menu' | 'blue_menu' | 'core_menu'
  | 'forge' | 'passphrase' | 'subnet' | 'token' | 'payload' | 'hash'
  | RefScreen | 'howto'

const BAR = '----------------------------'

const LENGTHS = [12, 16, 20, 24, 32]
const WORD_COUNTS = [4, 5, 6, 7]
const SEPARATORS = ['-', '.', '_']
const SEP_LABELS = ['dash', 'dot', 'underscore']
const BASES = ['10.0.0.0', '172.16.0.0', '192.168.0.0', '192.168.1.0']
const PREFIXES = [8, 16, 24, 25, 26, 27, 28, 29, 30]

const REF_PAGES: Record<RefScreen, RefPage[]> = {
  ports: PORT_PAGES,
  hardening: HARDENING_PAGES,
  ir: IR_PAGES,
  nato: NATO_PAGES,
  mitre: MITRE_PAGES,
  lolbins: LOLBINS_PAGES,
  privesc: PRIVESC_PAGES,
  recon: RECON_PAGES,
  c2: C2_PAGES,
  ioc: IOC_PAGES,
  sigma: SIGMA_PAGES,
  events: EVENTID_PAGES,
  hunt: HUNT_PAGES,
  detect: DETECT_PAGES,
}

const REF_SCREENS = new Set<Screen>(Object.keys(REF_PAGES) as RefScreen[])

function trunc(s: string, max = 44): string {
  return s.length <= max ? s : s.slice(0, max - 3) + '...'
}

export function createApp(bridge: EvenAppBridge) {
  const ui = createGlassesUi(bridge)

  let screen: Screen = 'menu'
  let selected = 0
  let phase: 'splash' | 'normal' = 'splash'
  let splashTarget: Screen = 'menu'
  let splashFrame = 0
  let splashTimer: ReturnType<typeof setTimeout> | null = null
  let splashAnim: ReturnType<typeof setInterval> | null = null
  let prefs: Prefs = { ...DEFAULT_PREFS }
  let pwd: PasswordResult = generatePassword(LENGTHS[prefs.lenIdx], prefs.symbols)
  let phrase: PassphraseResult = generatePassphrase(
    WORD_COUNTS[prefs.wordsIdx], SEPARATORS[prefs.sepIdx], prefs.appendNumber)
  let token = generateToken(TOKEN_TYPES[prefs.tokenTypeIdx])
  let page = 0

  // -------------------------------------------------------------- view build
  function menuView(): PageView {
    return {
      hudText: [
        'SENTINEL OPS v1.3.0',
        'RED · BLUE TEAM ARSENAL',
        BAR,
        'Pick a branch below:',
        'Scroll · Tap · 2x exit',
      ].join('\n'),
      listItems: [
        '>> RED TEAM (7 tools)',
        '>> BLUE TEAM (6 tools)',
        '>> CORE OPS (7 tools)',
        'How to Use',
      ],
    }
  }

  function redMenuView(): PageView {
    return {
      hudText: [
        'RED TEAM ARSENAL',
        'Offensive ops · lab use only',
        BAR,
        'Gen tokens · encode · TTPs',
      ].join('\n'),
      listItems: [
        'Token Forge',
        'Payload Lab',
        'MITRE ATT&CK',
        'LOLBins',
        'PrivEsc Guide',
        'Recon Playbook',
        'C2 / Exfil Ref',
        'Back to Menu',
      ],
    }
  }

  function blueMenuView(): PageView {
    return {
      hudText: [
        'BLUE TEAM DEFENSE',
        'Detect · hunt · respond',
        BAR,
        'Hash ID · IOC · Sigma · logs',
      ].join('\n'),
      listItems: [
        'Hash Fingerprints',
        'IOC Formats',
        'Sigma Rules',
        'Win Event IDs',
        'Threat Hunting',
        'Detection Matrix',
        'Back to Menu',
      ],
    }
  }

  function coreMenuView(): PageView {
    return {
      hudText: [
        'CORE OPS',
        'Passwords · network · refs',
        BAR,
        'Daily driver toolkit',
      ].join('\n'),
      listItems: [
        'Password Forge',
        'Passphrase',
        'Subnet Calculator',
        'Port Reference',
        'Hardening Checklist',
        'Incident Response',
        'NATO Phonetic',
        'Back to Menu',
      ],
    }
  }

  function forgeView(): PageView {
    return {
      hudText: [
        'PASSWORD FORGE',
        pwd.value,
        `${LENGTHS[prefs.lenIdx]} chars · ${prefs.symbols ? '+symbols' : 'no symbols'}`,
        `~${pwd.bits} bits · ${pwd.strength.toUpperCase()}`,
      ].join('\n'),
      listItems: [
        'Regenerate',
        `Length: ${LENGTHS[prefs.lenIdx]}`,
        `Symbols: ${prefs.symbols ? 'ON' : 'OFF'}`,
        'Back to Menu',
      ],
    }
  }

  function passphraseView(): PageView {
    return {
      hudText: [
        'PASSPHRASE',
        phrase.value,
        `${phrase.words} words${prefs.appendNumber ? '+num' : ''} · ~${phrase.bits} bits · ${phrase.strength.toUpperCase()}`,
      ].join('\n'),
      listItems: [
        'Regenerate',
        `Words: ${WORD_COUNTS[prefs.wordsIdx]}`,
        `Separator: ${SEP_LABELS[prefs.sepIdx]}`,
        `Number: ${prefs.appendNumber ? 'ON' : 'OFF'}`,
        'Back to Menu',
      ],
    }
  }

  function subnetView(): PageView {
    const s = calcSubnet(BASES[prefs.baseIdx], PREFIXES[prefs.prefixIdx])
    return {
      hudText: [
        `SUBNET ${s.cidr} · ${s.usable.toLocaleString()} hosts`,
        `Mask  ${s.mask}`,
        `Net   ${s.network}`,
        `Bcast ${s.broadcast}`,
        `Range ${s.firstHost} - ${s.lastHost}`,
      ].join('\n'),
      listItems: [
        `Prefix: /${PREFIXES[prefs.prefixIdx]}`,
        `Base: ${BASES[prefs.baseIdx]}`,
        'Back to Menu',
      ],
    }
  }

  function tokenView(): PageView {
    const kind = TOKEN_TYPES[prefs.tokenTypeIdx]
    return {
      hudText: [
        'TOKEN FORGE',
        trunc(token, 40),
        `Type: ${kind}`,
        'CSPRNG · never stored',
      ].join('\n'),
      listItems: [
        'Regenerate',
        `Type: ${kind}`,
        'Back to Menu',
      ],
    }
  }

  function payloadView(): PageView {
    const sample = PAYLOAD_SAMPLES[prefs.payloadSampleIdx]
    const mode = ENCODE_MODES[prefs.payloadModeIdx]
    const encoded = encodePayload(sample, mode)
    return {
      hudText: [
        'PAYLOAD LAB',
        trunc(encoded, 40),
        `${mode} · src: ${sample}`,
        'Encode only · lab use',
      ].join('\n'),
      listItems: [
        'Next Encode',
        `Mode: ${mode}`,
        `Sample: ${sample}`,
        'Back to Menu',
      ],
    }
  }

  function hashView(): PageView {
    const kind = HASH_TYPES[prefs.hashTypeIdx]
    const h = HASH_SAMPLES[kind]
    return {
      hudText: [
        `HASH ID · ${kind}`,
        trunc(h.sample, 40),
        h.hint,
      ].join('\n'),
      listItems: [
        `Type: ${kind}`,
        'Back to Menu',
      ],
    }
  }

  function refView(kind: RefScreen): PageView {
    const pages = REF_PAGES[kind]
    const i = ((page % pages.length) + pages.length) % pages.length
    const p = pages[i]
    return {
      hudText: [`${p.title}  ${i + 1}/${pages.length}`, ...p.lines].join('\n'),
      listItems: ['Next', 'Previous', 'Back to Menu'],
    }
  }

  function howtoView(): PageView {
    return {
      hudText: [
        'HOW TO USE v1.3.0',
        '>> RED / BLUE / CORE branches',
        'Scroll: temple pad or R1 ring',
        'Tap: select · Tap HUD: re-run',
        'Double-tap: exit Sentinel Ops',
      ].join('\n'),
      listItems: ['Back to Menu'],
    }
  }

  function buildView(): PageView {
    switch (screen) {
      case 'menu': return menuView()
      case 'red_menu': return redMenuView()
      case 'blue_menu': return blueMenuView()
      case 'core_menu': return coreMenuView()
      case 'forge': return forgeView()
      case 'passphrase': return passphraseView()
      case 'subnet': return subnetView()
      case 'token': return tokenView()
      case 'payload': return payloadView()
      case 'hash': return hashView()
      case 'howto': return howtoView()
      default:
        if (REF_SCREENS.has(screen)) return refView(screen as RefScreen)
        return menuView()
    }
  }

  async function render(): Promise<void> {
    if (phase === 'splash') return
    await ui.refresh(buildView())
  }

  function clearSplashTimers(): void {
    if (splashTimer) clearTimeout(splashTimer)
    if (splashAnim) clearInterval(splashAnim)
    splashTimer = splashAnim = null
  }

  async function paintSplash(key: SplashKey): Promise<void> {
    const label = splashListLabel(key)
    await ui.refreshSplash(renderSplash(key, splashFrame), [label, 'Tap to skip'])
  }

  function beginSplash(key: SplashKey, target: Screen, ms: number): void {
    phase = 'splash'
    splashTarget = target
    splashFrame = 0
    selected = 0
    clearSplashTimers()
    void paintSplash(key)
    splashAnim = setInterval(() => {
      splashFrame += 1
      void paintSplash(key)
    }, 150)
    splashTimer = setTimeout(() => { void finishSplash() }, ms)
  }

  async function finishSplash(): Promise<void> {
    if (phase !== 'splash') return
    clearSplashTimers()
    phase = 'normal'
    goto(splashTarget)
    await ui.refresh(buildView())
  }

  function queueSplash(key: SplashKey, target: Screen): void {
    beginSplash(key, target, ITEM_SPLASH_MS)
  }

  function regenForge(): void {
    pwd = generatePassword(LENGTHS[prefs.lenIdx], prefs.symbols)
  }
  function regenPhrase(): void {
    phrase = generatePassphrase(WORD_COUNTS[prefs.wordsIdx], SEPARATORS[prefs.sepIdx], prefs.appendNumber)
  }
  function regenToken(): void {
    token = generateToken(TOKEN_TYPES[prefs.tokenTypeIdx])
  }

  function goto(s: Screen): void {
    screen = s
    selected = 0
    page = 0
  }

  function backTarget(): Screen {
    if (['token', 'payload', 'mitre', 'lolbins', 'privesc', 'recon', 'c2'].includes(screen)) {
      return 'red_menu'
    }
    if (['hash', 'ioc', 'sigma', 'events', 'hunt', 'detect'].includes(screen)) {
      return 'blue_menu'
    }
    if (['forge', 'passphrase', 'subnet', 'ports', 'hardening', 'ir', 'nato'].includes(screen)) {
      return 'core_menu'
    }
    return 'menu'
  }

  async function openFromRed(item: string): Promise<boolean> {
    const targets: Record<string, Screen> = {
      'Token Forge': 'token',
      'Payload Lab': 'payload',
      'MITRE ATT&CK': 'mitre',
      'LOLBins': 'lolbins',
      'PrivEsc Guide': 'privesc',
      'Recon Playbook': 'recon',
      'C2 / Exfil Ref': 'c2',
    }
    const target = targets[item]
    const key = splashForRedItem(item)
    if (!target || !key) return false
    queueSplash(key, target)
    return true
  }

  async function openFromBlue(item: string): Promise<boolean> {
    const targets: Record<string, Screen> = {
      'Hash Fingerprints': 'hash',
      'IOC Formats': 'ioc',
      'Sigma Rules': 'sigma',
      'Win Event IDs': 'events',
      'Threat Hunting': 'hunt',
      'Detection Matrix': 'detect',
    }
    const target = targets[item]
    const key = splashForBlueItem(item)
    if (!target || !key) return false
    queueSplash(key, target)
    return true
  }

  async function openFromCore(item: string): Promise<boolean> {
    const targets: Record<string, Screen> = {
      'Password Forge': 'forge',
      'Passphrase': 'passphrase',
      'Subnet Calculator': 'subnet',
      'Port Reference': 'ports',
      'Hardening Checklist': 'hardening',
      'Incident Response': 'ir',
      'NATO Phonetic': 'nato',
    }
    const target = targets[item]
    const key = splashForCoreItem(item)
    if (!target || !key) return false
    queueSplash(key, target)
    return true
  }

  // --------------------------------------------------------------- selection
  async function handleSelect(index: number): Promise<void> {
    if (phase === 'splash') {
      await finishSplash()
      return
    }

    selected = index
    const items = buildView().listItems
    const item = items[index] ?? ''

    if (screen === 'menu') {
      const key = splashForMainItem(item)
      if (key === 'red_team') queueSplash(key, 'red_menu')
      else if (key === 'blue_team') queueSplash(key, 'blue_menu')
      else if (key === 'core_ops') queueSplash(key, 'core_menu')
      else if (key === 'howto') queueSplash(key, 'howto')
      return
    }

    if (item === 'Back to Menu') {
      goto(backTarget())
      return render()
    }

    if (screen === 'red_menu') {
      await openFromRed(item)
      return
    }
    if (screen === 'blue_menu') {
      await openFromBlue(item)
      return
    }
    if (screen === 'core_menu') {
      await openFromCore(item)
      return
    }

    switch (screen) {
      case 'forge':
        if (item === 'Regenerate') regenForge()
        else if (item.startsWith('Length')) {
          prefs.lenIdx = (prefs.lenIdx + 1) % LENGTHS.length
          regenForge()
          await savePrefs(bridge, prefs)
        } else if (item.startsWith('Symbols')) {
          prefs.symbols = !prefs.symbols
          regenForge()
          await savePrefs(bridge, prefs)
        }
        return render()
      case 'passphrase':
        if (item === 'Regenerate') regenPhrase()
        else if (item.startsWith('Words')) {
          prefs.wordsIdx = (prefs.wordsIdx + 1) % WORD_COUNTS.length
          regenPhrase()
          await savePrefs(bridge, prefs)
        } else if (item.startsWith('Separator')) {
          prefs.sepIdx = (prefs.sepIdx + 1) % SEPARATORS.length
          regenPhrase()
          await savePrefs(bridge, prefs)
        } else if (item.startsWith('Number')) {
          prefs.appendNumber = !prefs.appendNumber
          regenPhrase()
          await savePrefs(bridge, prefs)
        }
        return render()
      case 'subnet':
        if (item.startsWith('Prefix')) {
          prefs.prefixIdx = (prefs.prefixIdx + 1) % PREFIXES.length
          await savePrefs(bridge, prefs)
        } else if (item.startsWith('Base')) {
          prefs.baseIdx = (prefs.baseIdx + 1) % BASES.length
          await savePrefs(bridge, prefs)
        }
        return render()
      case 'token':
        if (item === 'Regenerate') regenToken()
        else if (item.startsWith('Type')) {
          prefs.tokenTypeIdx = (prefs.tokenTypeIdx + 1) % TOKEN_TYPES.length
          regenToken()
          await savePrefs(bridge, prefs)
        }
        return render()
      case 'payload':
        if (item === 'Next Encode') {
          prefs.payloadModeIdx = (prefs.payloadModeIdx + 1) % ENCODE_MODES.length
          await savePrefs(bridge, prefs)
        } else if (item.startsWith('Mode')) {
          prefs.payloadModeIdx = (prefs.payloadModeIdx + 1) % ENCODE_MODES.length
          await savePrefs(bridge, prefs)
        } else if (item.startsWith('Sample')) {
          prefs.payloadSampleIdx = (prefs.payloadSampleIdx + 1) % PAYLOAD_SAMPLES.length
          await savePrefs(bridge, prefs)
        }
        return render()
      case 'hash':
        if (item.startsWith('Type')) {
          prefs.hashTypeIdx = (prefs.hashTypeIdx + 1) % HASH_TYPES.length
          await savePrefs(bridge, prefs)
        }
        return render()
      default:
        if (REF_SCREENS.has(screen)) {
          const pages = REF_PAGES[screen as RefScreen]
          if (item === 'Next') page = (page + 1) % pages.length
          else if (item === 'Previous') page = (page - 1 + pages.length) % pages.length
        }
        return render()
    }
  }

  function primaryAction(): void {
    if (phase === 'splash') {
      void finishSplash()
      return
    }
    if (screen === 'forge') { regenForge(); void render() }
    else if (screen === 'passphrase') { regenPhrase(); void render() }
    else if (screen === 'token') { regenToken(); void render() }
    else if (screen === 'payload') {
      prefs.payloadModeIdx = (prefs.payloadModeIdx + 1) % ENCODE_MODES.length
      void savePrefs(bridge, prefs).then(() => render())
    } else if (REF_SCREENS.has(screen)) {
      const pages = REF_PAGES[screen as RefScreen]
      page = (page + 1) % pages.length
      void render()
    }
  }

  const handlers: InputHandlers = {
    onSelect: (i) => { void handleSelect(i) },
    onHudTap: () => primaryAction(),
    onScroll: () => {},
    onDoubleTap: () => { void bridge.shutDownPageContainer(1) },
    onExit: () => {},
  }

  return {
    async start(): Promise<void> {
      prefs = await loadPrefs(bridge)
      regenForge()
      regenPhrase()
      regenToken()
      showCompanionReady()
      bindBridgeInput(bridge, handlers)
      bindKeyboardInput(
        handlers,
        () => selected,
        (i) => { selected = i },
        () => phase === 'splash' ? 2 : buildView().listItems.length,
      )
      beginSplash('title', 'menu', TITLE_SPLASH_MS)
    },
  }
}
