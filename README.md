# Seva Jump

**A skyward seva adventure.**

Current release-candidate build: **v0.11.2**.

The birds have flown away with the parshad. Choose a young Sikh boy or girl, leap from platform to platform, and bring it back in this cheerful browser game prototype.

Seva Jump is designed for ages 8-15, with touch-first controls, a calm gurdwara-inspired setting, and a respectful introduction to a few Sikh terms used in the game.

## Play

Open **`index.html`** in a modern browser. On a phone or tablet, drag anywhere across the game to steer left and right. On a desktop, you can also use the arrow keys or on-screen controls.

New players receive a short three-step guide after choosing their first mode. It can be replayed later from Settings.

The game is self-contained: no login, ads, purchases, or network connection are needed to play locally. When opened from the published site, it also caches the game after the first successful visit so it remains playable offline.

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
node tests\rule-checks.js
node tests\soak-test.js
node tests\full-run-checks.js
node tests\endless-bird-checks.js
node tests\hard-mode-checks.js
```

These checks verify core rules, full-mode outcomes, Challenge Mode’s 50-bowl placement, Hard Mode’s platform and bird limits, power-up/Falcon behavior, procedural platform reachability, and platform pacing.

## Project structure

```text
index.html          Game shell and menus
styles.css          Responsive visual design
game.js             Canvas rendering, input, gameplay, and animations
game-config.js      Central tuning values
game-rules.js       Shared mode and completion rules
assets/             Pixel-art game assets
tests/              Rule and procedural-generation checks
android/            Native Android wrapper
scripts/            Web asset sync script for native builds
```

## Release status

The feature set is frozen for the first Android release candidate. Use [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) for regression testing and signing, and [STORE_LISTING.md](STORE_LISTING.md) for the prepared Google Play copy and declarations.

Remaining launch work is external to the game code: final community/content review, store screenshots, an upload signing key, Play Console forms, and closed testing. iOS packaging and localization remain planned follow-up work.

## License

All rights reserved for now. Please do not reuse the game artwork or code without permission.
