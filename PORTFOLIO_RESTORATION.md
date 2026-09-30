# OASIS 2026 portfolio restoration

Starting main commit: `bf9e33641e09ae9bd3f0a391c7d71f96de566872`. Scope follows the approved restoration design: preserve original Arabian Nights artwork, animation, loading choreography, layout, typography and lazy routes; make the unavailable backend a clearly labeled local demo. No remote push, deployment or browser operations were performed in this task.

All remote Cloudinary artwork references in page code and SCSS now resolve to matching existing repository assets. The original star-logo preloader remains. Fonts use the FontFace API with a valid CSS font specification; videos and font binaries are not loaded through Image. Image failures count toward readiness, and a five-second readiness deadline prevents unavailable assets blocking entry. Registration keeps its original book-opening transition, form layout, event interactions and confirmation modal, now using a prefilled sample identity, sample colleges and labeled sample event selections. Form schema validation remains active, confirmation rejects empty/invalid selections, and completion is simulated in memory. No OAuth SDK, cookies, backend redirects, analytics, payment, emails or persistent storage remain. Detailed instructions explain the demo. Existing hardcoded public event content is retained.

Original font families and weight declarations remain. All 10 served fonts were converted to WOFF2 with full glyph sets retained; transferred font bytes 3,593,500 → 1,132,952. Added the missing local `EB Garamond` family alias used by About and Events, preserving its variable 400–800 range. Original font source files remain available.

## Assets and delivery

- Public files: 7,461,243 → 4,744,498 bytes.
- Source assets: 108,484,846 → 73,200,670 bytes.
- Contact map converted from the approximately 14 MB PNG to 1,257,158-byte WebP, preserving the original map design. Unused duplicate map background, duplicate GIFs and unused alternate curtain video removed; original transition video retained.
- Both unused tracked `about/bgBack.png` and `about/bgback.png` removed to fix the macOS case collision. Used local `bgback.webp` remains.
- Frozen deployment output: 36,794,137 bytes; every asset is below Pages' 25 MiB limit.
- Wrangler 4.145.0 pinned, project `dvm-portfolio-oasis-2026`, output `dist`, compatibility date 2026-09-30, account provided through deployment environment variable.
- Native Pages SPA fallback used, with no looping catchall redirect or top-level 404. Unknown client routes show helpful navigation.
- Secure CSP allows same-origin artwork/fonts/media and optional YouTube playback/API; no JavaScript unsafe-eval, remote font stylesheet or Cloudinary allowlist required.
- Duplicate canonical/social/EventScheduled metadata and duplicate modal portal IDs removed. Archive canonical/social URLs use the requested original domain; DNS binding is handled separately.
- Validation-only CI added; remote deployment stays with the coordinating agent.

## Evidence

`npm ci --ignore-scripts`, `npm run build`, `npm run verify`, and `git diff --check` pass. Full and production dependency audits report zero vulnerabilities. Meaningful checks cover valid sample form data, missing-name and invalid-phone errors, empty/invalid/valid sample selection, local font paths, absence of legacy APIs/OAuth/storage/CDN dependencies, deployment size limits and one canonical URL. Logs and machine reports are committed under `restoration-evidence/`.

## Limits

The original animation/GSAP runtime still produces a large main JS chunk. Extended mobile UX/performance testing and exhaustive image/video optimization were skipped as requested in the narrowed user scope. Optional YouTube playback and external contact/social links still depend on those third-party sites. The coordinating agent performs desktop rendering/font/main-interaction review and publication from the frozen build.
