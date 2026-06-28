# Hub media — upload these PNGs to the Even Hub project portal.

| File | Use | Size |
|------|-----|------|
| `00-cover-glasses.png` | Store cover / hero — **title splash screen** | 576×288 |
| `01-menu-glasses.png` | Glasses screenshot — tool menu | 576×288 |
| `02-forge-glasses.png` | Glasses screenshot — Password Forge | 576×288 |
| `03-subnet-glasses.png` | Glasses screenshot — Subnet Calculator | 576×288 |
| `04-ports-glasses.png` | Glasses screenshot — Port Reference | 576×288 |
| `05-companion-webview.png` | Phone companion / WebView proof | 390×844 |
| `icon-foreground.png` | Hub store icon (monochrome, transparent-friendly) | 512×512 |
| `icon-background.png` | Hub store icon background | 512×512 |

Regenerate everything (real plugin play via simulator — required for Hub policy):

```
npm run capture-media   # auto-starts dev + simulator, captures glasses + webview
npm run icons           # monochrome shield icons
```

Screenshots are captured from the live Even Hub simulator automation API (`576×288` RGBA glasses framebuffer), not from mock HTML canvases.
