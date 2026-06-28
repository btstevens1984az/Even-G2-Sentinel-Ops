/**
 * Static, offline reference content shown on the G2 HUD. Each page is kept to a
 * title plus at most 4 body lines so nothing clips the top panel (~5 lines).
 */

export interface RefPage {
  title: string
  lines: string[]
}

export const PORT_PAGES: RefPage[] = [
  {
    title: 'PORTS · REMOTE',
    lines: [
      '22   SSH    secure shell',
      '23   Telnet cleartext!',
      '3389 RDP    brute-force target',
      '5900 VNC    screen share',
    ],
  },
  {
    title: 'PORTS · WEB',
    lines: [
      '80   HTTP   cleartext',
      '443  HTTPS  TLS',
      '8080 HTTP   alt / proxy',
      '3000 dev    app server',
    ],
  },
  {
    title: 'PORTS · MAIL',
    lines: [
      '25  SMTP  relay',
      '587 SMTP  submission TLS',
      '143 IMAP  / 993 IMAPS',
      '110 POP3  / 995 POP3S',
    ],
  },
  {
    title: 'PORTS · FILE / DIR',
    lines: [
      '21  FTP   cleartext!',
      '445 SMB   ransomware target',
      '389 LDAP  / 636 LDAPS',
      '2049 NFS  file share',
    ],
  },
  {
    title: 'PORTS · DATABASE',
    lines: [
      '1433 MSSQL   3306 MySQL',
      '5432 Postgres',
      '6379 Redis  no-auth risk!',
      '27017 Mongo  1521 Oracle',
    ],
  },
  {
    title: 'PORTS · INFRA',
    lines: [
      '53  DNS    123 NTP',
      '161 SNMP   default creds!',
      '514 Syslog',
      '6443 Kubernetes API',
    ],
  },
]

export const HARDENING_PAGES: RefPage[] = [
  {
    title: 'HARDENING · IDENTITY',
    lines: [
      '> Enforce MFA everywhere',
      '> Kill legacy / basic auth',
      '> Unique named admin accts',
      '> Least privilege, no local admin',
    ],
  },
  {
    title: 'HARDENING · PATCH',
    lines: [
      '> Patch criticals < 14 days',
      '> Auto-update where safe',
      '> Disable unused services',
      '> Apply CIS baseline',
    ],
  },
  {
    title: 'HARDENING · NETWORK',
    lines: [
      '> Segment flat nets (VLAN)',
      '> Default-deny firewall',
      '> VPN / ZTNA for remote',
      '> Kill SMBv1 & TLS 1.0/1.1',
    ],
  },
  {
    title: 'HARDENING · RECOVER',
    lines: [
      '> EDR on every endpoint',
      '> Central logging + alerting',
      '> 3-2-1 encrypted backups',
      '> Test restores quarterly',
    ],
  },
]

export const IR_PAGES: RefPage[] = [
  {
    title: 'IR · PREPARATION',
    lines: [
      'Build it before you need it:',
      '- Runbooks & contact tree',
      '- Tooling, logging, training',
    ],
  },
  {
    title: 'IR · DETECTION',
    lines: [
      'Detection & Analysis:',
      '- Triage the alert',
      '- Scope, impact, confirm',
    ],
  },
  {
    title: 'IR · CONTAINMENT',
    lines: [
      'Stop the spread:',
      '- Isolate affected hosts',
      '- Block IOCs, disable accts',
    ],
  },
  {
    title: 'IR · ERADICATION',
    lines: [
      'Remove the threat:',
      '- Wipe malware / artifacts',
      '- Close vector, rotate creds',
    ],
  },
  {
    title: 'IR · RECOVERY',
    lines: [
      'Return to operations:',
      '- Restore from clean backup',
      '- Validate & monitor closely',
    ],
  },
  {
    title: 'IR · POST-INCIDENT',
    lines: [
      'Lessons learned:',
      '- Root-cause analysis',
      '- Update controls & runbooks',
    ],
  },
]

export const NATO_PAGES: RefPage[] = [
  {
    title: 'PHONETIC · A-F',
    lines: ['A Alfa     B Bravo', 'C Charlie  D Delta', 'E Echo     F Foxtrot'],
  },
  {
    title: 'PHONETIC · G-L',
    lines: ['G Golf     H Hotel', 'I India    J Juliett', 'K Kilo     L Lima'],
  },
  {
    title: 'PHONETIC · M-R',
    lines: ['M Mike     N November', 'O Oscar    P Papa', 'Q Quebec   R Romeo'],
  },
  {
    title: 'PHONETIC · S-X',
    lines: ['S Sierra   T Tango', 'U Uniform  V Victor', 'W Whiskey  X X-ray'],
  },
  {
    title: 'PHONETIC · Y-Z 0-4',
    lines: ['Y Yankee   Z Zulu', '0 Zero  1 One  2 Two', '3 Three  4 Four'],
  },
  {
    title: 'PHONETIC · 5-9',
    lines: ['5 Five   6 Six', '7 Seven  8 Eight', '9 Nine'],
  },
]
