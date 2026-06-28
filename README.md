# Sentinel Ops — IT Security Toolkit for Even G2

A futuristic, **fully offline** IT security toolkit for Even Realities G2 smart glasses and the R1 ring. Eight pro tools on a heads-up display — no network, no permissions.

## Screenshots

| View | Preview |
|------|---------|
| [Cover](#) | ![Cover art](media/00-cover-glasses.png) |
| [Main menu](#) | ![Tool menu on glasses](media/01-menu-glasses.png) |
| [Password Forge](#) | ![Password generator](media/02-forge-glasses.png) |
| [Subnet Calculator](#) | ![Subnet calculator](media/03-subnet-glasses.png) |
| [Port Reference](#) | ![Port reference](media/04-ports-glasses.png) |
| [Phone companion](#) | ![Phone WebView](media/05-companion-webview.png) |

![Cover](media/00-cover-glasses.png)

![Main menu on glasses](media/01-menu-glasses.png)

![Password Forge tool](media/02-forge-glasses.png)

![Subnet calculator](media/03-subnet-glasses.png)

## Tools

| Tool | What it does |
|------|--------------|
| **Password Forge** | CSPRNG passwords (12–32 chars), entropy + strength rating |
| **Passphrase** | Diceware-style memorable passphrases |
| **Subnet Calculator** | CIDR /8–/30 — mask, wildcard, network, broadcast, host range |
| **Port Reference** | Common ports by category with risk flags |
| **Hardening Checklist** | CIS-style quick wins |
| **Incident Response** | NIST SP 800-61 phases with concrete actions |
| **NATO Phonetic** | Full alphabet + digits |
| **How to Use** | On-glass control reference |

## Run

Requires **Node.js 20+**.

### Linux / macOS

```bash
git clone <your-repo-url>
cd sentinel-ops-g2
npm install
npm run dev          # http://localhost:5173
npm run simulate     # Even Hub simulator
npm run build
npm run pack         # → sentinel-ops.ehpk
npm run capture-media
npm run icons
```

### Windows

```powershell
git clone <your-repo-url>
cd sentinel-ops-g2
npm install
npm run dev
npm run simulate
npm run pack
```

## Controls

- **Scroll** the bottom menu with temple touchpad or R1 ring
- **Tap** to select; tap HUD to re-run current tool
- **Double-tap** to exit

See [SUBMISSION.md](SUBMISSION.md) for Even Hub store listing and upload steps.
