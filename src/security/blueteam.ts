/**
 * Blue-team identification helpers + offline reference pages.
 */
import type { RefPage } from './reference'

export const HASH_TYPES = ['MD5', 'SHA-1', 'SHA-256', 'NTLM', 'bcrypt', 'SHA-512'] as const
export type HashType = (typeof HASH_TYPES)[number]

/** Educational samples — known test vectors / format examples. */
export const HASH_SAMPLES: Record<HashType, { sample: string; hint: string }> = {
  MD5: {
    sample: '5d41402abc4b2a76b9719d911017c592',
    hint: '32 hex chars · no $ prefix',
  },
  'SHA-1': {
    sample: 'aaf4c61ddcc5e8a2dabede0f3b4821ec61d8',
    hint: '40 hex chars · legacy Git',
  },
  'SHA-256': {
    sample: '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b7934',
    hint: '64 hex chars · most common',
  },
  NTLM: {
    sample: '209c6174da490caeb422f3fa18a049e',
    hint: '32 hex · Windows auth',
  },
  bcrypt: {
    sample: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8',
    hint: '$2a/$2b$ rounds$ salt+hash',
  },
  'SHA-512': {
    sample: '9b71d224bd62f3785b96cfc9',
    hint: '128 hex chars · truncated',
  },
}

export const IOC_PAGES: RefPage[] = [
  {
    title: 'IOC · NETWORK',
    lines: [
      'IPv4 / IPv6 addresses',
      'Domain / FQDN / URL',
      'Email sender / subject',
      'User-Agent strings',
    ],
  },
  {
    title: 'IOC · HOST',
    lines: [
      'File hash MD5/SHA256',
      'File path / filename',
      'Registry key / value',
      'Mutex / named pipe',
    ],
  },
  {
    title: 'IOC · STIX FORMAT',
    lines: [
      'indicator type: file',
      'pattern: [file:hashes',
      'valid_from / valid_until',
      'confidence score 0-100',
    ],
  },
  {
    title: 'IOC · TI FEEDS',
    lines: [
      'MISP event export',
      'OpenCTI STIX bundle',
      'AlienVault OTX pulses',
      'VirusTotal livehunt',
    ],
  },
]

export const SIGMA_PAGES: RefPage[] = [
  {
    title: 'SIGMA · BASICS',
    lines: [
      'title / id / status',
      'logsource: product',
      'detection: selection',
      'condition: selection',
    ],
  },
  {
    title: 'SIGMA · POWERSHELL',
    lines: [
      'EventID 4104 script',
      'EncodedCommand -enc',
      'IEX / DownloadString',
      'Bypass -ExecutionPolicy',
    ],
  },
  {
    title: 'SIGMA · PERSISTENCE',
    lines: [
      'Run key modification',
      'Scheduled task create',
      'Service install 7045',
      'WMI subscription',
    ],
  },
  {
    title: 'SIGMA · LATERAL',
    lines: [
      '4624 type 3 network',
      '4648 explicit creds',
      '7045 remote service',
      '5140 share access',
    ],
  },
]

export const EVENTID_PAGES: RefPage[] = [
  {
    title: 'EVENTS · AUTH',
    lines: [
      '4624  successful logon',
      '4625  failed logon',
      '4648  explicit creds',
      '4672  admin special priv',
    ],
  },
  {
    title: 'EVENTS · ACCOUNT',
    lines: [
      '4720  account created',
      '4726  account deleted',
      '4732  added to group',
      '4740  account locked out',
    ],
  },
  {
    title: 'EVENTS · PROCESS',
    lines: [
      '4688  new process',
      '4104  PS script block',
      '4103  PS module log',
      '4697  service installed',
    ],
  },
  {
    title: 'EVENTS · DEFENSE',
    lines: [
      '1102  audit log cleared',
      '4719  audit policy chg',
      '4907  object permissions',
      '5156  WFP allowed conn',
    ],
  },
]

export const HUNT_PAGES: RefPage[] = [
  {
    title: 'HUNT · INITIAL',
    lines: [
      'Rare process parent/child',
      'Unsigned binary exec',
      'LOLBin command lines',
      'New scheduled tasks',
    ],
  },
  {
    title: 'HUNT · LATERAL',
    lines: [
      '4624 type 3 + 4648 pair',
      'PsExec service names',
      'SMB 445 spike internal',
      'RDP 3389 off-hours',
    ],
  },
  {
    title: 'HUNT · EXFIL',
    lines: [
      'Large outbound HTTPS',
      'DNS query length anomaly',
      'Cloud upload volume',
      'Archive before transfer',
    ],
  },
  {
    title: 'HUNT · PERSIST',
    lines: [
      'Run/RunOnce key adds',
      'Startup folder writes',
      'New local admin acct',
      'GPO modification',
    ],
  },
]

export const DETECT_PAGES: RefPage[] = [
  {
    title: 'DETECT · EDR',
    lines: [
      'Process injection API',
      'Credential dump LSASS',
      'Tamper w/ AV/EDR svc',
      'Kernel driver load',
    ],
  },
  {
    title: 'DETECT · SIEM',
    lines: [
      'Correlation rules',
      'Threshold + anomaly',
      'Threat intel enrichment',
      'UEBA baseline drift',
    ],
  },
  {
    title: 'DETECT · NETWORK',
    lines: [
      'IDS/IPS signature hit',
      'NetFlow beacon pattern',
      'TLS JA3 fingerprint',
      'DNS tunnel entropy',
    ],
  },
  {
    title: 'DETECT · CLOUD',
    lines: [
      'GuardDuty findings',
      'Impossible travel login',
      'Root API key created',
      'Public bucket expose',
    ],
  },
]
