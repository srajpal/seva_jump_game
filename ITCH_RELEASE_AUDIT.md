# Seva Jump itch.io release audit

Date: September 11, 2026. Build: web v0.13.1. Audited commit: `9c97d93647d246966f4d90a332ac5fca790d086c` on `main`.

This is the original audit, retained as history. Fixes and verification for v0.13.2 are tracked in [RELEASE_PROGRESS.md](RELEASE_PROGRESS.md).

**Recommendation: not ready for public itch.io release.** The game has substantial implemented features and passing rule simulations, but browser integration defects need fixing before launch. No public upload, release, game/runtime source-code fix, asset change, version bump, or commit was made during this audit. Documentation was updated; local test evidence is retained separately.

## Scope and evidence

`git pull --ff-only` completed: already up to date. Five pre-existing untracked alternative sprites were preserved. All 25 runtime image references resolve to tracked files with matching spelling/case; those five alternatives are not required by the game.

Three parallel reviewers examined gameplay/tests, security, and documentation. The lead reran all six tests, syntax checks and the live dependency audit, inspected source and asset/version evidence, and independently exercised browser behavior. A reviewer incorrectly identified untracked bird alternatives as active assets; this was checked, retracted, and excluded from the findings.

Browser: automated Microsoft Edge 152.0.4191.66, headless, using bundled Playwright. Layouts: desktop 1280×720, embed-sized 500×800, touch 320×568, 390×844, 768×1024 and landscape 844×390. These are browser emulations, not physical device tests. Tests used isolated temporary browser profiles; personal game saves were not accessed.

Local evidence in `screenshots/itch-audit/` is intentionally gitignored:

- `browser-audit.cjs`, `browser-results.json`: normal UI journeys, viewport measurements, storage fault injection, local cross-origin iframe, service-worker hosting checks.
- `state-audit.cjs`, `state-results.json`: browser integration checks with a test-only inspection hook inserted into the served script, without changing production files. Purchases and win/loss tests use explicitly seeded state.
- `offline-audit.cjs`, `offline-results.json`: first-visit versus second-visit offline behavior.
- Home and Settings/Escape PNGs for all six viewports. Desktop, small-phone and landscape home captures were visually inspected. Other captures are retained, not claimed as individually visually reviewed.

These scripts reference this workstation's bundled Playwright path; they are audit evidence, not a portable CI suite. Scenarios below are reproducible manually. No permanent regression tests were added because fixes are deferred for discussion.

## Confirmed defects

Priority definitions: P1 should be resolved before launch; P2 should be fixed or explicitly accepted with a tested limitation; P3 is follow-up hardening/polish. These are release priorities, not security vulnerability scores.

### F1 — P1: Escape resumes gameplay underneath menus

Reproduce: begin first-run tutorial and press Escape; or start a run, pause, open Settings, press Escape. The overlay remains visible while `state.running=true` and `state.paused=false`. A browser inspection confirmed the player moves behind Settings. `resumeGame()` hides only the pause overlay; the global keyboard handler ignores which menu is active (`game.js:701–714`, `728–750`).

Fix direction: centralize menu/run transitions; permit resume only from the pause screen. Decide consistent Escape behavior for tutorial, Settings, reset confirmation, and ordinary menus. Regression-test each transition and repeated Escape presses.

### F2 — P1: unavailable storage interrupts initialization and user actions

`loadProfile()` catches read/JSON failures, but `saveProfile()` and reset removal are unguarded (`game.js:80–81`, `94–100`). Injected `SecurityError` on writes produced an uncaught error during initialization; injected quota failures produced errors on settings changes and left the tutorial visible after Skip because saving interrupts its close operation. Browser storage restrictions and quota failures must not prevent playing.

Fix direction: safely read/write/remove through one storage boundary, fall back to session-only progress, and explain when progress cannot persist. Test denied reads, writes, removal, full quota, malformed JSON, and valid JSON with invalid field types. Corrupt JSON recovered in this audit; a small invalid-field sample did not crash startup, but field schema/range validation remains absent.

### F3 — P1: game does not fit common desktop/embed heights

At 1280×720 and 500×800, the document is approximately 908px high; the canvas runs from y=68 to y=889. Lower gameplay and menu content therefore require scrolling. A 500×800 itch frame is not sufficient for this CSS. The desktop layout primarily sizes from width, with height-aware rules applying only to larger tablet-sized viewports (`styles.css:4–9`, `50–54`).

Fix direction: fit the portrait game to available width AND height; preserve aspect ratio and keep menus scrollable. Test a short laptop viewport, zoom, embed, fullscreen and dynamic resize. Do not solve this only by choosing a tall itch frame: click-to-fullscreen still inherits the player's window height.

### F4 — P1 for mobile/tablet: touch targeting ignores letterboxing

Canvas `object-fit: contain` preserves the drawing but the pointer handler maps against the entire element width (`styles.css:83`, `game.js:747–748`). In the 768×1024 touch viewport the element is 768px wide while the drawn 450×800 game is 534.375px wide. A real browser pointer press at the drawing's quarter-width position should target logical x=112.5, but targets x=146.7224. The same mismatch becomes larger in landscape.

Fix direction: use the rendered content rectangle, including letterbox offset, or size the canvas element to its drawing. Test left/center/right steering across phone, tablet, resized and rotated views.

### F5 — P1 if offline support is advertised: first-visit offline reload breaks scripts

Fresh browser context: visit the local HTTP game, wait for the service worker to activate, disconnect, reload. Three scripts fail with `Unexpected token '<'`; `SEVA_RULES` is undefined. Repeating with an additional online reload before disconnecting works. The HTML requests versioned script/style URLs, while precaching stores unversioned URLs; uncached requests fall back to HTML (`index.html:14`, `217–219`, `sw.js:2–9`, `46–57`). Merely seeing HTML or an overlay is not proof that offline gameplay works.

Fix direction: align precache and requested URLs and use appropriate resource-specific fallbacks. Verify first visit → worker ready → offline reload → start and play, and also upgrades between two releases.

### F6 — P2 / offline launch condition: directory precache conflicts with itch hosting

The precache includes `./`. itch's official guide says directory requests receive 403 responses. A local subdirectory-hosted simulation that returns 403 for this directory URL causes service-worker installation to fail (`cache.addAll` is atomic); offline reload then fails. The same server allowing directory requests installs the worker. Registration errors are silently swallowed (`sw.js:3`, `38–40`; `game.js:752`).

This is a confirmed simulated hosting failure, **not a test of an actual itch upload**. Remove the directory dependency and verify service-worker permissions/behavior on the eventual itch draft. Do not promise offline access through itch's surrounding page without testing it; offering a downloadable self-contained ZIP is another product option.

### F7 — P2: focus loss leaves input active and does not pause

A blur event during a held Right Arrow left `paused=false` and `keys=['ArrowRight']`. Clicking outside the game in a locally hosted cross-origin iframe also did not show pause. Source registers keyup but no blur/visibility cleanup, and pointer input has no pointercancel/lostpointercapture handler (`game.js:747–750`).

Fix direction: clear held input on focus/capture loss and pause when the player leaves active gameplay. Test switching tabs, clicking the itch page outside the iframe, interrupted touch and returning. Browser throttling differs; no claim is made that every browser advances at the same rate in the background.

### F8 — P2: small-screen home content starts above the scrollable area

At 320×568 the initial screenshot omits the title/eyebrow and begins with the story card. Landscape 844×390 clips more of the upper content. Lower options are below the initial viewport; automation can scroll to and open them, so they are not reported as permanently unreachable. The touch home overlay combines centered flex content with overflow (`styles.css:87–90`).

Fix direction: align overflowing content to the start, or use safe centering. Recheck narrow phones, landscape, enlarged text and menu scroll-to-top/bottom. Browser portrait-only behavior is not enforced by the native Android orientation setting; decide whether landscape should work or show a rotate prompt.

### F9 — P2: modal focus escapes the dialog

In Settings, focus Back and press Tab. Focus leaves the dialog (the recorded active element is BODY); there is no focus trap or explicit initial/return focus. `aria-modal` alone does not implement this behavior. Pause controls and external links remain relevant background focus targets. About/Upgrades also lack the dialog semantics applied to some other overlays.

Fix direction: consistently move/contain/restore focus and make background controls inert while a modal is open. Perform a real keyboard-only and screen-reader pass. Canvas gameplay itself is visual; do not claim full nonvisual accessibility based on menu labels.

### F10 — P2/P3: reset leaves the character UI inconsistent

Choose boy, open Settings, reset and confirm. Stored profile resets to girl and storage clears, but the boy button still has `aria-pressed=true`. `resetAllProgress()` replaces the profile without synchronizing `selectedCharacter` and the character UI (`game.js:94–100`). Cancel correctly preserves the choice.

Fix direction: reset both profile and selected UI state together; verify the next run and reload agree. Resetting during a paused run should also be included in regression coverage.

### F11 — P2: studio home link replaces the embedded game

The top `Back to home` anchor (`index.html:18`) uses same-context navigation. Inside itch it navigates the game iframe to the studio site, ending the current play session; the destination might itself reject framing. This is established from markup/browser navigation semantics, not a live navigation test against the external site. The About link already uses a new tab with `noopener noreferrer`.

Fix direction: choose an itch-appropriate label/destination and safe new-tab behavior, or hide this site-navigation element for the itch build. Verify on the draft upload.

## Tests completed

| Check | Result and scope |
| --- | --- |
| JavaScript syntax | PASS: game.js, game-config.js, game-rules.js, sw.js, scripts/sync-web.mjs |
| rule-checks | PASS; modeled Challenge has exactly 50 bowls in its first 150 platforms |
| full-run-checks | PASS; 5,000 iterations simulating Endless, Arcade and Challenge |
| endless-bird-checks | PASS; 10,000 runs, 366,005 spawns in lead verification, 0 unsafe modeled lanes |
| hard-mode-checks | PASS; 10,000 routes, 836,454 moving and 1,363,546 breakable platforms in lead verification |
| power-jump-checks | PASS; levels 0–5, linear height bonus 100% through 150% |
| soak-test | PASS; 10,000 climbs, 3,500,000 modeled landings, 0 vertical/horizontal reachability failures |
| All mode/character starts | PASS; all 8 combinations start with expected mode/character |
| Menu open/back | PASS; Upgrades, Badges, Stats, About, Settings across all 6 viewport configurations, with automatic scrolling where needed |
| First tutorial | Normal three-step progression PASS; Escape and storage-failure paths FAIL as above |
| Preferences | Music off, sound off, reduced motion on persist through reload; reduced-motion class applied |
| Character persistence | Boy selection survives reload; reset UI mismatch found |
| Reset | Cancel preserves profile; confirm clears storage/restores preference defaults; character synchronization FAIL |
| Purchases | Seeded 300 earned tokens; Falcon + Shield + five Power Jump levels leave 85, owned values 1/1/5, maximum label correct |
| Results/statistics/badge | Injected Arcade victory shows correct heading, best 1000, one Arcade win and badge; injected bird loss shows results and increments bird deaths |
| Runtime errors | No uncaught errors in normal six-viewport menu/tutorial journeys; fault-injected and first-visit offline errors recorded separately |
| Storage input | Invalid JSON recovers; representative invalid fields did not crash startup, not exhaustive schema testing |
| Assets | PASS: 25 required images, all tracked and present with exact path/case |
| Dependency audit | PASS: live npm audit, 0 known vulnerabilities, 93 total dependency entries; npm dependency tree resolves |

Simulation counts vary because tests use random inputs. Existing tests exercise rules and duplicated simulation math, not a real complete game played through `game.js`. Injected end states verify result plumbing, not the fairness/reachability of a human victory. No full Arcade/Challenge victory was achieved through natural browser play during this audit.

## Security and privacy assessment

No confirmed critical/high exploitable security issue was found in the reviewed web surface. The game has no authentication, server-side APIs, payments or account authorization to attack. Dependency audit results are a dated advisory check, not a guarantee of safety. Capacitor dependencies are native tooling and should not be shipped in the itch web archive.

- No remote scripts/fonts, analytics, advertising, cookies, XHR/WebSocket services or dynamic eval were found in the web code. Explicit external studio links and service-worker fetches are the network surfaces.
- Current DOM templates use fixed metadata or numeric formatting; no practical player-input DOM injection was identified. Persisted fields still need type/range validation for resilience, especially token/upgrade values.
- Current-tree signature and tracked/historical filename scans found no matching common credentials/private-key files. Historical blob contents were not exhaustively scanned; no dedicated secret-history scanner was used.
- Service worker caches responses without checking status/origin/type, returns HTML for missing non-HTML resources, and deletes every other named cache on the origin during activation. Restrict cleanup to game-owned cache names and cache only suitable successful responses. Shared-origin host behavior is unverified; these are hardening/reliability findings, not demonstrated cross-game exploits.
- No CSP is declared in the HTML. A compatible policy is optional defense in depth after testing; do not present it as an existing exploitable vulnerability or add a policy that prevents embedding.
- The game's local-only privacy statements fit its code. itch's site/platform has its own privacy behavior; listing copy should distinguish the game from the host and explain browser-local saves, clearing site data and possible storage restrictions. No legal compliance certification is implied.
- Android backup/cleartext settings and broad FileProvider paths were reviewed by the security reviewer. Native signing, native privacy declarations and provider hardening are outside this itch browser release gate.

## Packaging, performance and release materials

The minimal referenced web payload is 33 files: 8 shell/code/manifest/privacy files plus 25 images, totaling **26,253,352 bytes (~26.3 MB)** uncompressed. The entire assets folder has 46 images totaling 52,152,502 bytes; current `web:sync` copies all of them. Excluding unused variants almost halves image bytes without deleting source art. These are filesystem sizes, not measured compressed download sizes or a startup speed benchmark.

There is no itch ZIP command, reproducible curated artifact or checksum manifest yet. The runtime uses relative URLs, suitable for subpath hosting, but SW directory requests need attention. Prepare the ZIP from an explicit allowlist; include index.html at its root and all referenced resources. Exclude native projects, node_modules, repository history, signing material, audit captures and unused variants. Extract and test the exact ZIP before uploading; retain the previous working ZIP for rollback.

Before publishing, prepare a game title/short description, four-mode description, desktop/touch controls, browser/save/offline limitations, free pricing configuration, appropriate genre/tags, cover image and representative screenshots, credits/rights record, support route and a short release note. Do not reuse Google Play dimensions/declarations blindly. The repository's “All rights reserved” statement defines a reuse policy but does not establish asset provenance; confirm distribution rights without assuming they are absent. The checklist's Sikh community/content review remains open and needs an owner decision.

Official itch requirements checked September 11, 2026: [HTML5 upload guide](https://itch.io/docs/creators/html5). It specifies ZIP uploads for multi-file games, relative/case-sensitive paths, iframe embedding, mobile fullscreen behavior, and directory-request failures. Its listed extracted limits are 1,000 files, 500 MB total, 200 MB per file and 240-character paths. The measured proposed payload fits those numerical limits; this does not replace uploading and testing it. See [page design guidance](https://itch.io/docs/creators/design) when preparing the listing.

Recommended initial configuration after fixes: HTML Game, click-to-play, responsive portrait composition with fullscreen available. Mark mobile-friendly only after physical mobile testing. Choose/embed-test the actual dimensions after correcting F3. Publication and any upload remain a later user-approved step.

## Documentation accuracy

Corrections made with this audit:

- AGENTS.md now describes the iOS wrapper and separate browser/itch release validation, including iOS version locations. Existing core structure/testing guidance remains valid.
- README and RELEASE_CHECKLIST now include the Power Jump check and syntax check, and link this assessment rather than claiming all remaining launch work is external.
- RELEASE_CHECKLIST now has a separate itch checklist; existing unchecked community/device/regression gates remain unchecked.
- STORE_LISTING remains explicitly Google Play material and points browser distribution readers to the itch checklist.

Remaining discrepancy: iOS project marketing version and Info.plist remain 0.13.0/build 35; web/package/Android are 0.13.1, Android code 36. This was verified directly, not fixed during an audit. It is not an itch blocker but must be resolved before calling a native iOS release v0.13.1. README's old on-screen-controls claim and the checklist's obsolete “buttons” preference wording were also corrected.

## Untested risks and required follow-up

- Real itch draft: sandbox, storage permissions, keyboard focus, fullscreen transitions, service worker, cached update, external navigation and loading under the actual CDN. No itch page/account was accessed or changed.
- Real Android Chrome and iPhone/iPad Safari; desktop Firefox/Safari. Bundled Firefox/WebKit executables were unavailable. Chromium touch emulation is not evidence of Safari/mobile-engine correctness.
- Human full victories, misses, natural bird/fall losses, every boost/shield/rescue animation, repeated natural sessions, complete badge earning and long-duration actual frame-step play. Use age-appropriate playtests with players 8–15 and complete community review.
- Low-FPS collision correctness: landing uses a final-frame 25px band instead of swept collision (`game.js:455`). A tunneling risk was identified but not reproduced in ordinary gameplay.
- Challenge checks course completion before collectible overlap in the frame (`game.js:473–492`). A last-bowl/cutoff edge case is possible; reachability of that condition in generated ordinary play was not established, so it is not listed as a confirmed defect.
- Performance: measure startup/download size after compression, low-end device frame rate, long-run memory, CPU/battery/audio behavior, and slow/missing asset loads. No performance or battery pass is claimed.
- Accessibility: screen reader announcements, keyboard-only entire journeys, visible focus, contrast, text zoom/large text, OS reduced-motion preference, and sensory comfort. Menu semantics and focus were sampled; no WCAG certification or automated axe scan was performed.
- Offline/cache: update from prior release, interrupted precache, cache eviction and server errors. First-load failure and simulated directory rejection are confirmed; recovery paths are not yet validated.
- Native Android/iOS builds and device testing were not rerun because no native/game source changed and the release target here is itch. Existing checklist checkmarks are historical claims, not renewed certification.

## Proposed order for the next work session

1. Fix F1–F4 and F7; add real browser regression coverage for menu state, storage and input mapping. Address F8–F11 alongside the layout/menu work.
2. Resolve F5/F6 and agree on the offline promise. Add a repeatable minimal ZIP build and an extracted-artifact smoke test.
3. Test real devices/browsers and full natural game journeys, including remaining gameplay risks. Optimize artwork only if measured loading performance warrants it.
4. Confirm rights/community review, finish itch copy/media/support details, and review the resulting candidate together.
5. With upload approval, test a private/restricted itch draft, then publish only after the remaining gates pass. Keep a known-good artifact for rollback.

Owners: implementation/testing work can be handled in the next development pass; rights, cultural review, audience-facing promises and publishing decisions need the project owner's input. Current recommendation remains **not ready with the confirmed browser blockers above**.
