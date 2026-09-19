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

`npm test` runs the six original rule/procedural simulations. `test:runtime` exercises the actual game code with a small DOM harness, including saves, menus, input, platform collision, boosts, rescue, and repeated-run results; it also tests the service worker. Test-only inspection hooks are inserted into an in-memory copy, never the production file. Package checks validate references, versions, filenames and ZIP contents.

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

The suite starts its own local server and closes it afterward. It checks six viewport sizes, menu focus and scrolling, pause, pointer mapping, storage denial, reset, a local cross-origin iframe, and actual first-visit offline play. Screenshots and JSON results are written to ignored `screenshots/release-1.0.0/<engine>/`. Browser emulation is not a physical-device test; WebKit on Windows is not iPhone Safari.

## Release artifact

```powershell
npm run itch:build
npm run test:package
```

The builder writes a ZIP plus manifest and checksum into `dist/`. Extract the ZIP into a fresh folder, point `TEST_WEB_ROOT` at it, and rerun the browser suite. Open its local `index.html` as a separate download/offline check. Confirm the archive hash matches both sidecars before upload. Same input files produce the same ZIP with the same Node/zlib version; the manifest records that toolchain.

`npm run release:media` captures a cover and screenshots using the same optional Playwright setup. It writes only to `release-media/`; it does not alter source art. Check the images before uploading them.

## Android and iOS

Android requires Java 21, the Android SDK and the installed Capacitor dependencies:

```powershell
npm run android:debug
```

If your default Java is older, set `JAVA_HOME` for the build session to your Java 21 installation (Android Studio's bundled `jbr` is one option). Do not change the machine-wide setting just for this project.

Install the debug APK on a test phone and tablet/emulator. Check portrait/safe areas, touch, pause, Settings, Android Back and local saves. `tests/native-smoke.cjs` can attach to a forwarded debug WebView using `WEBVIEW_CDP` and `DEVICE_LABEL`; it must target a test emulator, not a personal browsing session.

Build iOS in Xcode and test on an iPhone/iPad. This Windows workspace cannot verify an iOS archive.

## Before public release

Test the exact ZIP on the actual itch draft, including mobile fullscreen and browser save restrictions. Record the build/hash, browser/device, outcome and any exceptions in `RELEASE_PROGRESS.md`. Keep incomplete checks open; passing simulations do not establish host behavior, human completion, accessibility for every player, or long-term performance.

Additional packaged-candidate journeys: `node tests/final-release-journeys.cjs` (same Playwright environment). Mode entry, purchases, preferences, and persistence use UI actions; win/loss results use controlled test state and do not certify natural complete playthroughs.
