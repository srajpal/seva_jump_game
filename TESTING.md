# Testing Seva Jump

Use Node.js from the project root. No formatter or lint command is configured.

## Automated checks

```powershell
node --check game.js
node --check sw.js
npm test
npm run test:runtime
npm run test:package
```

`npm test` runs the rule and power-jump checks plus seeded soak, full-run, bird, and Hard Mode checks that call the actual `game.js` generator through the DOM harness. These inspect generated platforms, collectibles, birds, and finish runways on both 450- and 640-wide canvases; platform-odds boundary probes catch unintended balance drift. `test:runtime` exercises saves, menus, input, platform collision, boosts, rescue, and repeated-run results; it also tests the service worker. Test-only inspection hooks and random sources stay in the harness, never the production file. Package checks validate references, versions, filenames and ZIP contents. GitHub Actions runs the commands above on every push and pull request with Node 22, without installing npm dependencies.

The soak also compares observed collectible, token, boost, and Arcade-bird rates with config using a 4% relative tolerance over eligible generated rows. Boost sampling uses Arcade score bands; Endless has no level-gated boosts and Challenge disables them. Package checks compare all displayed/cache web versions and Android/iOS marketing versions with `package.json`, including both Xcode build configurations.

Runtime coverage includes keyboard and standard gamepad edges, deadzone and
disconnect handling, audio-clock scheduling under timer jitter, null canvas
fallback, breakable platform lifetime/collision, first-visible bird counts, and
lag-frame Challenge bowl recovery with Falcon. Generator checks assert birds
use the configured spawn offset and current-platform clearance. Package checks keep the iOS asset folder
aligned with the runtime allowlist.

## Browser checks

`tests/browser-checks.cjs` uses Playwright as an optional development tool. It is not part of the shipped game. Set `PLAYWRIGHT_MODULE` to your installed Playwright module directory, or install Playwright locally so Node can resolve it. Edge is the default test browser.

```powershell
# Set this to your own Playwright installation if it is not in node_modules.
$env:PLAYWRIGHT_MODULE = 'C:\path\to\node_modules\playwright'
npm run test:browser
```

Optional settings:

- `BROWSER_ENGINE`: `chromium` (default), `firefox`, or `webkit`.
- `BROWSER_CHANNEL`: Chromium-family channel, default `msedge`.
- `PLAYWRIGHT_BROWSERS_PATH`: directory containing installed Playwright browsers.
- `TEST_WEB_ROOT`: an extracted release folder; default is the project source.
- `SKIP_OFFLINE=1`: skip only the offline test, explicitly recorded as not run. Never use this to claim an offline pass.

The suite starts its own local server and closes it afterward. It checks six viewport sizes, menu focus and scrolling, pause, pointer mapping, storage denial, reset, a local cross-origin iframe, and actual first-visit offline play. Screenshots and JSON results are written to ignored `screenshots/release-1.0.1/<engine>/`. Browser emulation is not a physical-device test; WebKit on Windows is not iPhone Safari.

Run `node tests/android-layout-checks.cjs` with the same Playwright setup for Android layout regressions without an APK. It simulates the Android bridge and changing safe areas at compact, large and short tablet sizes, with touch/mouse input, plus a phone. It checks the entire canvas and HUD remain visible after focus/resume, menu headings and scrolling after gameplay, and exclusion of Android styling from iOS. Captures are saved under `screenshots/android-layout/`. The test uses desktop Edge with simulated Android state; actual WebView/system-bar checks still require the native smoke test on a device or emulator.

## Release artifact

```powershell
npm run itch:build
npm run test:package
```

The builder writes a ZIP plus manifest and checksum into `dist/`. Extract the ZIP into a fresh folder, point `TEST_WEB_ROOT` at it, and rerun the browser suite. Open its local `index.html` as a separate download/offline check. Confirm the archive hash matches both sidecars before upload. Same input files produce the same ZIP with the same Node/zlib version; the manifest records that toolchain.

`npm run release:media` captures a cover and screenshots using the same optional Playwright setup. It writes only to `release-media/`; it does not alter source art. Check the images before uploading them.

## Android and iOS

Android uses Capacitor 8, Node 22+, Java 21, Android SDK 36, AGP 8.13.0 and Gradle 8.14.3. Use Android Studio Otter 2025.2.1+ when opening the project. The minimum device version is Android 7.0 (API 24):

```powershell
npm run android:debug
```

If your default Java is older, set `JAVA_HOME` for the build session to your Java 21 installation (Android Studio's bundled `jbr` is one option). Do not change the machine-wide setting just for this project.

Install the debug APK on a test phone and tablet/emulator. Check portrait/safe areas, touch, pause, Settings, Android Back and local saves. `tests/native-smoke.cjs` can attach to a forwarded debug WebView using `WEBVIEW_CDP`, `DEVICE_LABEL`, `ADB_SERIAL=emulator-<port>` and optionally `ADB_PATH`; it must target a test emulator, not a personal browsing session. The check repeats reloads, asserts inset publication and portrait/canvas layout, dispatches Back through ADB and an edge swipe when gesture navigation is enabled, and saves WebView/device screenshots plus window dumps under ignored `screenshots/release-1.0.1/native/`. Acknowledge Android's first-use fullscreen tutorial before collecting unobstructed captures. Run on Android 15 and 16 phone/tablet profiles. Inspect device captures and window dumps to confirm system bars show in menus and hide in gameplay; also check gesture Back, three-button navigation, cutouts, rotation and resume. Automated WebView assertions alone do not establish device visual correctness.

Build iOS in Xcode and test on an iPhone/iPad. This Windows workspace cannot verify an iOS archive.

## Before public release

Test the exact ZIP on the actual itch draft, including mobile fullscreen and browser save restrictions. Record the build/hash, browser/device, outcome and any exceptions in `RELEASE_PROGRESS.md`. Keep incomplete checks open; passing simulations do not establish host behavior, human completion, accessibility for every player, or long-term performance.

Additional packaged-candidate journeys: `node tests/final-release-journeys.cjs` (same Playwright environment). Mode entry, purchases, preferences, and persistence use UI actions; win/loss results use controlled test state and do not certify natural complete playthroughs.
