# Seva Jump architecture

Seva Jump is a browser game packaged for Android and iOS. The browser source is the source of truth. It has no server, account system, analytics, or gameplay network dependency.

## Source map

- `index.html` contains the canvas, menus, dialogs, HUD, help, and in-game privacy text.
- `styles.css` lays out the portrait canvas, responsive menus, safe areas, and reduced-motion presentation. The canvas is 450 × 800 in browsers and 640 × 800 on native tablets.
- `game.js` owns runtime state, course generation, collision handling, input, audio, persistence, menu flow, and canvas drawing.
- `game-config.js` contains gameplay tuning. `game-rules.js` contains shared calculations that the Node checks can exercise without a browser.
- `assets/` contains the pixel art used at runtime.
- `sw.js` caches the hosted web release. `manifest.webmanifest` describes the installable web app.
- `scripts/web-files.mjs` is the allowlist shared by native sync and itch.io packaging. `tests/` contains rule, runtime, service-worker, and package checks.

## Runtime flow

`game.js` loads the saved profile, applies its settings and character choice, builds an initial run state, and starts a `requestAnimationFrame` loop. Active gameplay and end-of-run animations redraw each frame. Menus and paused scenes redraw once when marked dirty, including after late sprite loads, and then keep their canvas frame. Menu screens are HTML overlays above the canvas; menu functions show and hide overlays; `syncModalAccessibility()` follows the visible dialog, manages focus and makes background controls inert.

`reset(mode)` creates a run state containing the player, platforms, collectibles, birds, effects, camera position, score, and mode progress. Platform creation reads tuning from `game-config.js` and decisions from `game-rules.js`. Arcade and Challenge add a finish runway. Endless and Hard continue until the player loses or leaves.

The renderer draws the backdrop, platforms, collectibles, hazards, player, effects, and transitions from the current state. Bowl and token glow canvases are baked when their sprites load and reused without per-frame shadow blur. The mobile HUD is HTML so it remains legible over the portrait canvas. Bird hit-stop, Falcon carry, and upgrade flashes accumulate active update time; pausing freezes their progress rather than counting wall-clock time.

## Input and lifecycle

Pointer input maps screen coordinates into the current canvas size, including letterboxing, and steers toward the pointer position. Left and Right Arrow keys provide keyboard steering. Escape and the pause button pause a run. Losing focus or hiding the page also pauses active gameplay and clears held input.

Opening Settings from a paused run keeps the run paused. Leaving or restarting a paused run records that the player left early. Android Back opens the exit confirmation away from the home screen; Back on the home screen exits through Capacitor's App plugin. The Android bridge also switches system bars between menu and gameplay presentation.

## Saves and audio

One profile is stored under `seva-jump-profile` in `localStorage`. It contains scores, upgrades, badges, statistics, preferences, tutorial completion, and the character choice. Reads are normalized before use. If browser storage is blocked or fails, the game keeps an in-memory profile for the current session and shows a warning. Reset removes the stored profile when possible and always resets the in-memory profile.

Music and sound effects are generated at runtime with the Web Audio API. Noise buffers are cached by duration for the current audio context; each playback still creates its own source and filters. Playback begins after player interaction, follows the sound settings, stops on pause and menus, and resumes with gameplay when music is enabled. If Web Audio is unavailable, the game disables the sound controls, shows a short notice, and continues silently. No audio files or streaming service are required.

## Hosted offline lifecycle

On HTTP or HTTPS, `game.js` registers `sw.js` after page load. The service worker uses a release- and path-scoped cache name, installs only after every listed app file is cached, takes control, and removes older Seva Jump caches for the same path. Same-scope GET requests use the release cache first and fetch missing files from the network. Navigation returns the cached `index.html`. Local `file:` play does not register a service worker and reads the extracted files directly.

## Builds and native wrappers

`npm run web:sync` recreates generated `www/` from the web-file allowlist. `npm run android:debug` runs that sync, updates the Capacitor Android project, and builds a debug APK. The Android wrapper lives under `android/`; `MainActivity.java` publishes system insets to CSS and controls immersive system bars.

`npm run itch:build` creates a ZIP that is deterministic for the same input files and Node/zlib version from the same allowlist, plus a SHA-256 file and JSON manifest in `dist/`. Package checks verify the curated payload and its references.

The native iOS project lives under `ios/`. Its Xcode project references the browser files directly, so there is no `www/` sync step. `GameViewController.swift` loads the bundled `index.html`, applies iOS presentation rules, and opens external links outside the game view.

## Invariants

- Keep browser source authoritative; never edit generated `www/` by hand.
- Keep release versions aligned across web and native metadata before store builds.
- Preserve portrait play, safe areas, touch steering, Android Back behavior, and pause-on-background behavior.
- Keep progress local and gameplay free of ads, purchases, accounts, analytics, and required network access.
- Put shared gameplay calculations in `game-rules.js` and add or update focused checks when rules, generation, balance, collectibles, birds, boosts, or completion change.
- Add runtime files through `scripts/web-files.mjs` so Android sync and itch.io packaging stay aligned.

## Validation and known limits

The commands and manual checks required for each release are listed in `RELEASE_CHECKLIST.md`; current evidence and unfinished work belong in `RELEASE_PROGRESS.md`. Automated checks cover rules, simulated runs, selected browser behavior, the service worker, and the packaged file set. They do not prove behavior on an actual itch.io page, physical phones or tablets, every browser storage policy, Android production signing, or an iOS archive. Those checks remain release gates when applicable.
