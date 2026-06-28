/**
 * Red-team generators + offline reference pages (educational / lab use only).
 */
import type { RefPage } from './reference'

const HEX = '0123456789abcdef'
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

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

function randFrom(chars: string, len: number): string {
  let out = ''
  for (let i = 0; i < len; i++) out += chars[randInt(chars.length)]
  return out
}

export const TOKEN_TYPES = ['API Key', 'Bearer Token', 'UUID v4', 'Hex Secret', 'JWT-style'] as const
export type TokenType = (typeof TOKEN_TYPES)[number]

export function generateToken(type: TokenType): string {
  switch (type) {
    case 'API Key':
      return `sk_live_${randFrom(HEX + 'ABCDEF', 32)}`
    case 'Bearer Token':
      return randFrom(B64, 48) + '=='
    case 'UUID v4': {
      const h = () => randFrom(HEX, 4)
      return `${h()}${h()}-${h()}-4${randFrom(HEX, 3)}-${['8', '9', 'a', 'b'][randInt(4)]}${randFrom(HEX, 3)}-${h()}${h()}${h()}`
    }
    case 'Hex Secret':
      return randFrom(HEX, 64)
    case 'JWT-style': {
      const seg = (n: number) => randFrom(B64, n)
      return `${seg(12)}.${seg(24)}.${seg(16)}`
    }
  }
}

export const PAYLOAD_SAMPLES = [
  'whoami',
  'hostname',
  'id -u',
  'uname -a',
  'ipconfig /all',
  'systeminfo',
] as const

export const ENCODE_MODES = ['Plain', 'Base64', 'Hex', 'URL', 'Reverse'] as const
export type EncodeMode = (typeof ENCODE_MODES)[number]

export function encodePayload(sample: string, mode: EncodeMode): string {
  switch (mode) {
    case 'Plain':
      return sample
    case 'Base64':
      return btoa(sample)
    case 'Hex':
      return [...sample].map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
    case 'URL':
      return encodeURIComponent(sample)
    case 'Reverse':
      return [...sample].reverse().join('')
  }
}

export const MITRE_PAGES: RefPage[] = [
  {
    title: 'MITRE · INITIAL ACCESS',
    lines: [
      'T1566  Phishing',
      'T1190  Exploit public app',
      'T1133  External remote svc',
      'T1078  Valid accounts',
    ],
  },
  {
    title: 'MITRE · EXECUTION',
    lines: [
      'T1059  Command/script',
      'T1204  User execution',
      'T1047  WMI',
      'T1053  Scheduled task',
    ],
  },
  {
    title: 'MITRE · PERSISTENCE',
    lines: [
      'T1547  Boot/logon autostart',
      'T1053  Scheduled task',
      'T1136  Create account',
      'T1543  Create/modify svc',
    ],
  },
  {
    title: 'MITRE · PRIV ESC',
    lines: [
      'T1068  Exploit for privesc',
      'T1548  Abuse elevation',
      'T1134  Access token',
      'T1574  Hijack execution',
    ],
  },
  {
    title: 'MITRE · LATERAL',
    lines: [
      'T1021  Remote services',
      'T1570  Lateral tool xfer',
      'T1550  Use alt auth',
      'T1080  Taint shared content',
    ],
  },
  {
    title: 'MITRE · EXFIL',
    lines: [
      'T1041  Exfil over C2',
      'T1567  Exfil to cloud',
      'T1048  Exfil alt protocol',
      'T1030  Data transfer size',
    ],
  },
]

export const LOLBINS_PAGES: RefPage[] = [
  {
    title: 'LOLBINS · WINDOWS',
    lines: [
      'certutil  download/decode',
      'mshta     script exec',
      'rundll32  load DLL/code',
      'regsvr32  scriptlet SCT',
    ],
  },
  {
    title: 'LOLBINS · MORE WIN',
    lines: [
      'powershell IEX cradle',
      'wmic      remote exec',
      'bitsadmin file transfer',
      'msiexec   remote install',
    ],
  },
  {
    title: 'LOLBINS · LINUX',
    lines: [
      'curl/wget  fetch payload',
      'bash -i    reverse shell',
      'python -c  one-liner',
      'nc -e      netcat shell',
    ],
  },
  {
    title: 'LOLBINS · MACOS',
    lines: [
      'osascript  AppleScript',
      'curl       download',
      'python3    interpreter',
      'ssh        remote access',
    ],
  },
]

export const PRIVESC_PAGES: RefPage[] = [
  {
    title: 'PRIVESC · LINUX',
    lines: [
      'sudo -l    misconfig',
      'SUID bins  find / -perm',
      'cron jobs  writable scripts',
      'kernel     dirty/cow CVEs',
    ],
  },
  {
    title: 'PRIVESC · WINDOWS',
    lines: [
      'whoami /priv  SeImpersonate',
      'Unquoted svc paths',
      'AlwaysInstallElevated',
      'Token impersonation',
    ],
  },
  {
    title: 'PRIVESC · AD',
    lines: [
      'Kerberoasting SPN accounts',
      'AS-REP roast no preauth',
      'DCSync     replication',
      'Golden ticket  KRBTGT',
    ],
  },
  {
    title: 'PRIVESC · CLOUD',
    lines: [
      'IAM over-permission scan',
      'Metadata SSRF creds',
      'S3 bucket misconfig',
      'Role assumption chain',
    ],
  },
]

export const RECON_PAGES: RefPage[] = [
  {
    title: 'RECON · NETWORK',
    lines: [
      'nmap -sV -sC target',
      'masscan -p1-65535',
      'arp-scan local subnet',
      'traceroute path map',
    ],
  },
  {
    title: 'RECON · DNS',
    lines: [
      'dig any domain.com',
      'subfinder / amass',
      'dnsrecon -d domain',
      'zone transfer AXFR',
    ],
  },
  {
    title: 'RECON · WEB',
    lines: [
      'gobuster dir -u URL',
      'nikto -h target',
      'whatweb fingerprint',
      'ffuf fuzz endpoints',
    ],
  },
  {
    title: 'RECON · OSINT',
    lines: [
      'theHarvester emails',
      'Shodan / Censys dorks',
      'LinkedIn org chart',
      'breach corpus search',
    ],
  },
]

export const C2_PAGES: RefPage[] = [
  {
    title: 'C2 · PROTOCOLS',
    lines: [
      'HTTPS  blend w/ traffic',
      'DNS    tunnel exfil',
      'ICMP   covert channel',
      'DoH    DNS over HTTPS',
    ],
  },
  {
    title: 'C2 · FRAMEWORKS',
    lines: [
      'Cobalt Strike beacon',
      'Sliver   open C2',
      'Havoc    modern kit',
      'Metasploit meterpreter',
    ],
  },
  {
    title: 'C2 · EVASION',
    lines: [
      'Sleep/jitter timing',
      'Domain fronting',
      'Process injection',
      'AMSI / ETW bypass',
    ],
  },
  {
    title: 'C2 · OPSEC',
    lines: [
      'Rotate infra often',
      'Kill dates on beacons',
      'Separate staging/prod',
      'Log your own actions',
    ],
  },
]
