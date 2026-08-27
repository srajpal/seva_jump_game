# Seva Jump

**A skyward seva adventure.**

Current playtest build: **v0.7.2**.

The birds have flown away with the parshad. Choose a young Sikh boy or girl, leap from platform to platform, and bring it back in this cheerful browser game prototype.

Seva Jump is designed for ages 8–15, with touch-first controls, a calm gurdwara-inspired setting, and a respectful introduction to a few Sikh terms used in the game.

## Play

Open **`index.html`** in a modern browser. On a phone or tablet, drag anywhere across the game to steer left and right. On a desktop, you can also use the arrow keys or on-screen controls.

The game is self-contained: no login, ads, purchases, or network connection are needed to play locally. When opened from the published site, it also caches the game after the first successful visit so it remains playable offline.

## Game modes

| Mode | Goal |
| --- | --- |
| **Endless Run** | Keep climbing for as long as you can. The course continues indefinitely. |
| **Arcade Mode** | Reach 1,000 points, break through the finish banner, and celebrate. |
| **Challenge Mode** | Reach the finish with every one of the 50 parshad bowls collected. |

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

No build step or package installation is required. With Node.js available, run:

```powershell
node tests\rule-checks.js
node tests\soak-test.js
node tests\full-run-checks.js
node tests\endless-bird-checks.js
```

These checks verify core rules, full-mode outcomes, Challenge Mode’s 50-bowl placement, power-up/Falcon behavior, procedural platform reachability, and platform pacing.

## Project structure

```text
index.html          Game shell and menus
styles.css          Responsive visual design
game.js             Canvas rendering, input, gameplay, and animations
game-config.js      Central tuning values
game-rules.js       Shared mode and completion rules
assets/             Pixel-art game assets
tests/              Rule and procedural-generation checks
```

## Roadmap

- Add more replaceable character and environment art directions
- Improve sound, accessibility controls, and localization (starting with English)
- Continue playtesting the balance for every game mode
- Package the browser version for Android and iOS

## License

All rights reserved for now. Please do not reuse the game artwork or code without permission.
