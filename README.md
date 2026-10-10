# Seva Jump

**A skyward seva adventure.**

Current public [itch.io browser release](https://khalsagamestudio.itch.io/seva-jump): **v1.0.10**. Android **1.0.3 / build 41** is available in Google Play closed testing. Production access was granted and verified October 10, 2026. Android **1.0.11 / build 49** is being prepared for Internal testing and production; iOS build 45 is metadata only. See `RELEASE_PROGRESS.md` for validation and publication details.

The birds have flown away with the parshad. Choose a young Sikh boy or girl, leap from platform to platform, and bring it back in this cheerful browser game.

Seva Jump is designed for ages 8-15, with touch-first controls, a calm Gurdwara-inspired setting, and a respectful introduction to a few Sikh terms used in the game.

## Play

Open **`index.html`** in a modern browser. On a phone or tablet, drag across the game to steer left and right. On a desktop, drag with a mouse or steer with A/D or the left and right arrow keys. Enter or Space starts Endless from Home when a button or other control is not focused. Press Escape to pause; the ⛶ button toggles fullscreen during play where supported.

Standard gamepads use the left stick or D-pad to steer, A to start Endless from Home, confirm pre-run upgrade choices, or resume, and B or Start to pause or cancel pre-run choices. Breakable platforms stop supporting the player immediately after landing, then fall and fade over 0.3 seconds (fade only with reduced motion). “Birds seen” counts their first appearance during play.

Touch dragging is relative to where each touch begins: lift and reposition your thumb without steering toward the new contact point. Personal best scores live in Records & Stats, accessible from the bottom of Home.

On Android, Back returns through menus and dismisses dialogs. During play it pauses; from Pause it resumes. Back from Home returns to the Android launcher without a close confirmation. Landings require the feet to overlap the visible platform surface; bird collisions cover the character's head and body while allowing space around wing tips and outstretched hands.

New players receive a short three-step guide after choosing their first mode. It can be replayed later from Settings.

The game is self-contained: no login, ads, purchases, or network connection are needed to play from local files. Hosted play uses a service worker for offline caching. The original September 2026 browser audit is preserved in [ITCH_RELEASE_AUDIT.md](ITCH_RELEASE_AUDIT.md); follow the current fixes and remaining verification in [RELEASE_PROGRESS.md](RELEASE_PROGRESS.md).

## Android device build

The project now includes a Capacitor Android wrapper for direct device testing. With Node 22+, Android Studio Otter 2025.2.1 or newer, Java 21, and Android SDK 36 installed, run:

```powershell
npm install
npm run android:debug
```

Capacitor 8 targets Android 16 (API 36) and requires Android 7.0 (API 24) or newer.

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

Arcade introduces occasional single-bird encounters from 200 points, with more frequent encounters from 500. Vertical spacing limits the visible scene to two birds, including partial sprites at the screen edges; the introductory section keeps encounters one at a time.

Each run can activate at most one Falcon Save and one Dhal Shield. Starting or abandoning a run does not spend an unused item. The run HUD shows one available, Off when disabled, or Used after activation; the shop and pre-run panel show total inventory. A shield's four-second protection still applies, but further hits after it expires cannot consume another shield until the next run. Power Jump remains a permanent level with an optional off switch; collectible boosts are unchanged.

When you own a Falcon Save, Dhal Shield, or Power Jump level, selecting a mode opens **Upgrades for this run**. Only owned upgrades appear. Switch consumables off to preserve inventory or Power Jump off to use the base jump height; purchased levels are retained. Choices are saved locally for future runs, and the HUD marks disabled upgrades **Off**. With no upgrades, mode selection starts normally. Restarting also offers these choices; Back cancels to Home. Kara and Nishan boosts collected during play remain active.

| Mode | Goal |
| --- | --- |
| **Endless Run** | Keep climbing for as long as you can. The course continues indefinitely. |
| **Arcade Mode** | Reach 1,000 points, break through the finish banner, and celebrate. |
| **Challenge Mode** | Reach the finish with every one of the 50 parshad bowls collected. |
| **Hard Mode** | Keep climbing on small moving and breakable platforms while earlier birds remain limited to one per screen. |

Challenge Mode warns once when an uncollected bowl scrolls out of reach and keeps **MISSED** beside the bowl count while any missed bowl remains uncollected. A last-moment pickup before Falcon rescue clears that bowl's miss without clearing other misses. You can restart from the pause menu or continue practicing; an incomplete run still ends at score 972, before the finish banner. Challenge courses omit Kara and Nishan boosts and spring platforms immediately below bowl rows so those jumps cannot skip the next bowl.

## Collectibles, platforms, and boosts

- **Parshad bowls** add to your score. In Challenge Mode, every bowl counts.
- **Khanda tokens** are used for the upgrade shop.
- **Kara boost** gives one higher jump, or stretches a Nishan flight if you catch one mid-air.
- **Nishan boost** launches a short guided flight: about 1.2 seconds of steady climbing that you steer as you go, plus brief protection from birds.
- **Dhal Shield** blocks one bird hit when owned.
- **Falcon Save** gives a second chance after falling.
- **Grass, spring, moving, and wooden breakable platforms** each change how you plan your next jump.
- **Helping Hand** (on by default, switchable in Settings; Endless and Arcade only) steps in when a broken row leaves the next platform out of reach, too high or too far to the side: after about three seconds without climbing, the platform you are bouncing on becomes a spring, and if even a spring cannot get there, helper platforms appear to bridge the way. With assistance disabled in Endless or Arcade, a stuck run is warned at three seconds and ends at six. Challenge and Hard instead display a persistent banner while stranded and never end solely for being stuck: keep trying, or use Pause to restart or return home. Normal falls, bird collisions and Challenge completion rules still apply.

## A note on language and setting

Use **Sikh** for a person or as an adjective for people, culture, institutions, and articles of faith; use **Sikhi** for the path and teachings. *Seva* is service with love and humility, without expecting a reward. Here, *parshad* means *karah parshad*, a blessed sweet offering shared equally with everyone, Sikh or non-Sikh. A *Gurdwara* is a Sikh place of worship, learning, and community gathering, open to everyone. The in-game **About** screen explains these terms, shares the creator's approach to playful allegory inspired by Sikhi, and offers an optional SikhRI link and local-Gurdwara learning suggestion. The game welcomes everyone and does not seek to proselytize or replace Sikh teachings. Do not depict the Sikh Gurus in game or promotional imagery.

See [SIKHI_TEXT_REVIEW.md](SIKHI_TEXT_REVIEW.md) for the September 27, 2026 text review, sources, the creator's direction and imagery boundaries, wording decisions, optional art observations, and external-site verification checklist.

The setting is Gurdwara-inspired and avoids using sacred spaces or symbols as obstacles. The game is a work in progress, and feedback on its respectful presentation is welcome.

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

The September 11, 2026 itch.io audit records the problems found in v0.13.1. Current source, published builds, and outstanding checks are tracked separately in [RELEASE_PROGRESS.md](RELEASE_PROGRESS.md). The October review fixes are included in the 1.0.11 candidate and are newer than the published 1.0.10 browser ZIP and Play's 1.0.3 test build. Candidate preparation and store publication are recorded separately.

Native-store work still includes screenshots, signing credentials, console forms, device testing, and applicable store testing. Check [RELEASE_PROGRESS.md](RELEASE_PROGRESS.md) and the platform metadata before naming a native build ready. Localization remains planned follow-up work.

## License

All rights reserved for now. Please do not reuse the game artwork or code without permission.

## Source and feedback

Source code is available at https://github.com/srajpal/seva_jump_game. Bug reports and suggestions are welcome. No project license has been selected; public source availability is not an open-source license.

## Art direction

See [ART_DIRECTION.md](ART_DIRECTION.md) for the approved visual style, asset review decisions, avatar continuity references, and the interactive before/after gallery.

Badge definitions and progression: [BADGES.md](BADGES.md).
