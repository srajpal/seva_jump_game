# Seva Jump

**A skyward seva adventure.**

Current release-candidate build: **v1.0.0** (native build 38). The published itch.io version remains 0.13.2 until a new upload is approved.

The birds have flown away with the parshad. Choose a young Sikh boy or girl, leap from platform to platform, and bring it back in this cheerful browser game prototype.

Seva Jump is designed for ages 8-15, with touch-first controls, a calm gurdwara-inspired setting, and a respectful introduction to a few Sikh terms used in the game.

## Play

Open **`index.html`** in a modern browser. On a phone or tablet, drag across the game to steer left and right. On a desktop, drag with a mouse or use the left and right arrow keys. Press Escape to pause during gameplay.

New players receive a short three-step guide after choosing their first mode. It can be replayed later from Settings.

The game is self-contained: no login, ads, purchases, or network connection are needed to play from local files. Hosted play uses a service worker for offline caching. The original September 2026 browser audit is preserved in [ITCH_RELEASE_AUDIT.md](ITCH_RELEASE_AUDIT.md); follow the current fixes and remaining verification in [RELEASE_PROGRESS.md](RELEASE_PROGRESS.md).

## Android device build

The project now includes a Capacitor Android wrapper for direct device testing. With Android Studio, Java 21, and the Android SDK installed, run:

```powershell
npm install
npm run android:debug
```

The debug APK is written to `android\app\build\outputs\apk\debug\app-debug.apk`. With USB debugging enabled on a connected Android device, install it with:

```powershell
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
```

## iOS device build

The repository includes a dependency-free native iOS wrapper in
`ios/SevaJump.xcodeproj`. It packages the same local HTML, JavaScript, CSS, and
pixel art as the Android app, so gameplay and saved progress remain offline.

With the full Xcode app installed (not Command Line Tools alone):

1. Open `ios/SevaJump.xcodeproj` in Xcode.
2. In **Signing & Capabilities**, select your Apple Developer team and use a
   unique bundle identifier if `org.sevajump.game` is already registered.
3. Choose an iPhone or iPad running iOS 15 or later, then run the **Seva Jump**
   scheme.
4. For TestFlight or App Store distribution, use **Product > Archive**.

The web files are referenced directly from the repository by the Xcode project.
When changing game code or artwork, rebuild in Xcode; there is no separate web
sync step for iOS.

## Game modes

| Mode | Goal |
| --- | --- |
| **Endless Run** | Keep climbing for as long as you can. The course continues indefinitely. |
| **Arcade Mode** | Reach 1,000 points, break through the finish banner, and celebrate. |
| **Challenge Mode** | Reach the finish with every one of the 50 parshad bowls collected. |
| **Hard Mode** | Keep climbing on small moving and breakable platforms while earlier birds remain limited to one per screen. |

## Collectibles, platforms, and boosts

- **Parshad bowls** add to your score. In Challenge Mode, every bowl counts.
- **Khanda tokens** are used for the upgrade shop.
- **Kara boost** gives one higher jump.
- **Nishan boost** gives one stronger jump and brief protection from birds.
- **Dhal Shield** blocks one bird hit when owned.
- **Falcon Save** gives a second chance after falling.
- **Grass, spring, moving, and wooden breakable platforms** each change how you plan your next jump.

## A note on language and setting

*Seva* means selfless service. *Parshad* (also written *prashad*) is a blessed offering shared in a gurdwara. A *gurdwara* is a Sikh place of worship. The in-game **About** screen explains these and other terms in more detail.

The setting is gurdwara-inspired and avoids using sacred spaces or symbols as obstacles. The game is a work in progress, and feedback on its respectful presentation is welcome.

## Run the checks

With Node.js available, run:

```powershell
node --check game.js
node tests\rule-checks.js
node tests\soak-test.js
node tests\full-run-checks.js
node tests\endless-bird-checks.js
node tests\hard-mode-checks.js
node tests\power-jump-checks.js
```

These checks verify core rules, full-mode outcomes, Challenge Mode’s 50-bowl placement, Hard Mode’s platform and bird limits, power-up/Falcon behavior, procedural platform reachability, and platform pacing.

Run `npm run test:runtime` for the actual game-state and service-worker regressions, and `npm run test:package` for the release payload. Browser, offline and native test setup is in [TESTING.md](TESTING.md).

## Project structure

```text
index.html          Game shell and menus
styles.css          Responsive visual design
game.js             Canvas rendering, input, gameplay, and animations
game-config.js      Central tuning values
game-rules.js       Shared mode and completion rules
sw.js               Hosted offline cache lifecycle
assets/             Pixel-art game assets
tests/              Rule and procedural-generation checks
android/            Native Android wrapper
ios/                Native iOS wrapper
scripts/            Web asset sync script for native builds
ARCHITECTURE.md      Runtime, packaging, and platform architecture
```

## Release status

The feature set is frozen for the current release candidate. Use [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) for regression testing and signing, [STORE_LISTING.md](STORE_LISTING.md) for the prepared Google Play copy and declarations, and [ITCH_LISTING.md](ITCH_LISTING.md) for the browser listing and upload plan.

The September 11, 2026 itch.io audit records the problems found in v0.13.1. Work on the v0.13.2 candidate is tracked in [RELEASE_PROGRESS.md](RELEASE_PROGRESS.md). Do not treat either document as approval to publish; the release checklist still requires hosted-draft and device checks.

Native-store work still includes screenshots, signing credentials, console forms, device testing, and applicable store testing. Check [RELEASE_PROGRESS.md](RELEASE_PROGRESS.md) and the platform metadata before naming a native build ready. Localization remains planned follow-up work.

## License

All rights reserved for now. Please do not reuse the game artwork or code without permission.

## Source and feedback

Source code is available at https://github.com/srajpal/seva_jump_game. Bug reports and suggestions are welcome. No project license has been selected; public source availability is not an open-source license.
