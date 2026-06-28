# Even Hub — Sentinel Ops submission

Use this when uploading to the [Even Hub project portal](https://hub.evenrealities.com/).

## Package

| Field | Value |
|-------|-------|
| **File** | `sentinel-ops.ehpk` (project root — **not** inside `dist/`) |
| **Package ID** | `dev.sentinelops.g2` |
| **Version** | `1.1.0` |
| **Name** | Sentinel Ops |
| **Min app / SDK** | `2.0.0` / `0.0.11` |

## Title

**Sentinel Ops**

## Short description (≤50 chars)

```
Offline IT security toolkit for G2 & R1
```
(39 characters)

## Long description (≤500 chars)

```
Sentinel Ops is a futuristic, fully offline IT security toolkit for Even G2 glasses and the R1 ring. Generate strong passwords and memorable passphrases with live entropy ratings, run a CIDR subnet calculator, and look up common ports, hardening controls (MFA, patching, segmentation), the NIST incident-response phases, and the NATO phonetic alphabet — all on the heads-up display. No network, no permissions, nothing leaves your glasses. Scroll to browse, tap to select, double-tap to exit.
```
(492 characters)

## Tools included

1. **Password Forge** — CSPRNG passwords (12–32 chars, optional symbols), guaranteed character classes, live entropy + strength.
2. **Passphrase** — diceware-style memorable passphrases (4–7 words), selectable separator, optional number, honest entropy.
3. **Subnet Calculator** — CIDR /8–/30 over common RFC1918 bases: mask, wildcard, network, broadcast, host range, usable/total.
4. **Port Reference** — common ports by category (remote, web, mail, file/dir, database, infra) with risk flags.
5. **Hardening Checklist** — CIS-style quick wins across identity, patching, network, detect & recover.
6. **Incident Response** — the six NIST SP 800-61 phases with concrete actions per phase.
7. **NATO Phonetic** — full alphabet + digits for reading serials, hashes, and codes aloud.
8. **How to Use** — on-glass control reference.

## Tags (5+)

```
security
infosec
sysadmin
devops
password
network
subnet
utility
offline
R1
G2
```

Suggested Hub categories (pick what the portal allows): **Utility**, **Productivity**, **Developer Tools**.

## Permissions / security requirements

**None required.** `app.json` declares `"permissions": []`.

- No `network` permission (the previous scanner needed it — this build deliberately does not).
- No location, camera, microphone, IMU, or album access.
- Randomness comes from the WebView CSPRNG (`crypto.getRandomValues`); generated secrets are **never** stored or transmitted.
- The only persistence is non-sensitive UI preferences (chosen length, separator, etc.) via Even Hub local storage.

There is nothing for the reviewer to flag — mark all permission boxes as **not used**.

## Media assets (upload from `media/`)

| Asset | File | Use |
|-------|------|-----|
| **Cover** | `00-cover-glasses.png` | Store hero (576×288) |
| Screenshot 1 | `01-menu-glasses.png` | Tool menu |
| Screenshot 2 | `02-forge-glasses.png` | Password Forge |
| Screenshot 3 | `03-subnet-glasses.png` | Subnet Calculator |
| Screenshot 4 | `04-ports-glasses.png` | Port Reference |
| Phone companion | `05-companion-webview.png` | WebView proof |
| Icon (fg) | `icon-foreground.png` | Monochrome store icon |
| Icon (bg) | `icon-background.png` | Icon background |

## Hub upload (required)

These builds do **not** appear under the Even Hub tab QR / dev sideload area. Follow this flow:

1. Sign in at [hub.evenrealities.com](https://hub.evenrealities.com/) with the **same account** as your iPhone Even app.
2. **Create a new project** with `package_id` exactly: `dev.sentinelops.g2`
3. Fill store metadata: title, short/long description, tags, and the monochrome icon (`media/icon-foreground.png` + `media/icon-background.png`), plus screenshots from `media/`.
4. Open **Private builds** → upload `sentinel-ops.ehpk` from the project root.
5. On iPhone: force-quit the Even app, reopen → **Me → Apps → Private builds** → Install.

## Pre-submission checklist

- [x] `npm run build` passes (tsc strict, no errors)
- [x] `npm run pack` produces `sentinel-ops.ehpk` at project root (40,886 bytes)
- [x] Phone shows the companion screen on launch (`index.html`)
- [x] Glasses render HUD + selectable list reliably (createStartUpPageContainer + rebuild fallback)
- [x] Double-tap triggers the system exit dialog (`shutDownPageContainer(1)`)
- [x] `permissions: []` — nothing to declare
- [x] `min_sdk_version` is `"0.0.11"`

## Install on phone (important)

Hub portal uploads do **not** appear under the Even Hub tab QR / **dev sideload** area.

After uploading to **Private builds** on [hub.evenrealities.com](https://hub.evenrealities.com/):

1. Force-quit the Even app on iPhone, then reopen it.
2. Go to **Me → Apps → Private builds** (not “Dev apps” / QR sideload).
3. Tap **Install** on Sentinel Ops.

**Corrupt pack check:** a healthy `sentinel-ops.ehpk` is about **35–45 KB**. If the file is ~**80 KB**, it was double-packed with a nested `.ehpk` inside `dist/` — rebuild with `npm run pack` and upload the new file from the **project root**.

## Changelog (v1.1.0)

- Red Team Arsenal submenu: Token Forge, Payload Lab, MITRE ATT&CK, LOLBins, PrivEsc, Recon, C2/Exfil references.
- Blue Team Defense submenu: Hash Fingerprints, IOC, Sigma, Windows Event IDs, Threat Hunting, Detection Matrix.
- Core Ops submenu retains Password Forge, Passphrase, Subnet, ports, hardening, IR, NATO.
- Same G2 HUD + list layout and green-on-black aesthetic. Still 100% offline.

## Changelog (v1.0.1)

- Fix pack script: strip stale `.ehpk` and `.DS_Store` from `dist/` before packing (prevents silent phone rejection).
- Stop copying `.ehpk` back into `dist/` (nested-pack bug).
- Tighten HUD layouts so all tool screens fit the G2 top panel without clipping.
- Real simulator screenshots in `media/` (576×288 RGBA).

## Changelog (v1.0.0)

- Initial release: 8-tool offline IT security toolkit for G2 + R1.
- Reliable two-panel HUD + list rendering (no flaky network path that broke the old scanner).
- Password/passphrase entropy ratings, CIDR subnet math, port/hardening/IR/phonetic references.
- Futuristic monochrome-green glasses UI and neon phone companion.
