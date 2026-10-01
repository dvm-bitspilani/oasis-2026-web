# Oasis 2026 preview optimisation plan

The owner approved testing the audited optimisation pass on a new branch and
Cloudflare preview. Keep main, the active deployment, backend calls, OAuth,
maintainer work and every existing image, font and video file unchanged.

Implement the measured CPU and navigation fixes before the ordered loader,
which is the last optimisation in this pass.

1. Replace the preloader's 400 runtime SVG geometry queries with the same
   full-precision samples generated from the original hidden path. Preserve
   the visible original SVG and existing intro timing.
2. Process the curtain once per presented video frame, with a supported-API
   fallback. Stop work while paused and clean up callbacks on unmount. Preserve
   the original 1920 by 1080 video, chroma threshold and motion.
3. Revert About's ScrollTrigger pin during React layout cleanup, before React
   removes its container. Keep both browser Back and the page Back control
   working. Scope route-wide styles and defer route-specific initialisation so
   importing a page in the background cannot restyle or mount the current page.
4. Load only visible Home essentials initially. Once Home's full intro completes,
   warm transition, registration, About, then remaining pages in that order.

The loader shares route-import and typed-resource promises with navigation.
Run one group at a time, at most two speculative image transfers, and yield
between short launches. Original images use native loading; fonts use valid CSS
font specifications and their existing URLs. Cache the curtain's original bytes
as a Blob URL for reuse without a second media transfer; release it on cleanup.
Use bounded timeouts and fallback to the original media source when needed.

Actual navigation takes precedence, reuses work already in flight, and pauses
unrelated speculative work. Direct route entry loads on demand. Hidden pages
must never mount or trigger speculative auth, backend, analytics or YouTube
effects. Suspend background work when hidden, offline or save-data is enabled;
defer large originals on slow connections. Load the original Contact map late
and avoid decoding it until needed. A warmed About page can skip its loading-only
preloader; cold entry retains loading feedback.

Implementation ownership: preloader sampling and curtain frame handling;
About layout cleanup and scoped styles; shared route/resource manifests and
background scheduling; App/Home/route/transition integration. Shared loader
contracts and failure states are reviewed together before the preview build.

Validate the production build and applicable lint, all 236 original asset
fingerprints, desktop/mobile visuals, queue order and concurrency, early and
direct navigation, browser Back/Forward, menu, failed-resource and slow/offline
cases. Compare performance with the saved audit baseline. Existing intro timing
still limits LCP; no unmeasured score is promised. Never submit real login,
registration or payment data during validation.

Commit and push the new branch, then publish its preview to the existing
dvm-portfolio-oasis-2026 Cloudflare Pages project using that branch name. Do not
deploy main or alter the original oasis-2026-web project's production settings.

The full measured audit and primary-source research are saved outside the repo
in portfolio-evidence/refinement/OASIS_2026_FINAL_AUDIT.md and the accompanying
JSON, Lighthouse and headless-browser reports.
