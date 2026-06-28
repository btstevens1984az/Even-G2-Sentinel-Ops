import type { SplashKey } from '../render/splash-renderer'

export const TITLE_SPLASH_MS = 5000
export const ITEM_SPLASH_MS = 2500

export function splashForMainItem(item: string): SplashKey | null {
  if (item.startsWith('>> RED TEAM')) return 'red_team'
  if (item.startsWith('>> BLUE TEAM')) return 'blue_team'
  if (item.startsWith('>> CORE OPS')) return 'core_ops'
  if (item === 'How to Use') return 'howto'
  return null
}

export function splashForRedItem(item: string): SplashKey | null {
  const map: Record<string, SplashKey> = {
    'Token Forge': 'token',
    'Payload Lab': 'payload',
    'MITRE ATT&CK': 'mitre',
    'LOLBins': 'lolbins',
    'PrivEsc Guide': 'privesc',
    'Recon Playbook': 'recon',
    'C2 / Exfil Ref': 'c2',
  }
  return map[item] ?? null
}

export function splashForBlueItem(item: string): SplashKey | null {
  const map: Record<string, SplashKey> = {
    'Hash Fingerprints': 'hash',
    'IOC Formats': 'ioc',
    'Sigma Rules': 'sigma',
    'Win Event IDs': 'events',
    'Threat Hunting': 'hunt',
    'Detection Matrix': 'detect',
  }
  return map[item] ?? null
}

export function splashForCoreItem(item: string): SplashKey | null {
  const map: Record<string, SplashKey> = {
    'Password Forge': 'forge',
    'Passphrase': 'passphrase',
    'Subnet Calculator': 'subnet',
    'Port Reference': 'ports',
    'Hardening Checklist': 'hardening',
    'Incident Response': 'ir',
    'NATO Phonetic': 'nato',
  }
  return map[item] ?? null
}
