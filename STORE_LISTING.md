# SevaJump store listing

This document targets Google Play. For itch.io browser distribution, use [ITCH_LISTING.md](ITCH_LISTING.md). Current verification and remaining work are tracked in [RELEASE_PROGRESS.md](RELEASE_PROGRESS.md).

October 10, 2026: submitted the full description below and refreshed phone/7-inch/10-inch tablet galleries with production 1.0.11 / build 49. Quick checks completed and Console confirms the changes are now in review; managed publishing is enabled. Not yet approved or published. New screenshots are labeled as using AI-created artwork, consistent with `CONTENT_REVIEW.md` and the existing icon/feature graphic declarations. The short description and app name already match this document.

## Core listing

**App name:** SevaJump

**Short description:** Leap skyward, recover the parshad, and master four colorful jumping modes.

**Full description:**

The birds have scattered the parshad! Choose your jumper and climb through peaceful, Gurdwara-inspired skies to help bring it back.

SevaJump is a cheerful, touch-friendly jumping adventure designed for ages 8-15. Steer through bright pixel-art scenery, collect parshad bowls and Khanda tokens, avoid flying birds, and unlock helpful upgrades. The game has no ads, purchases, or accounts, and gameplay does not need an internet connection.

Four ways to play:

- Endless Run: climb as high as you can.
- Arcade Mode: reach 1,000 points and break through the finish banner.
- Challenge Mode: recover all 50 parshad bowls before reaching the finish.
- Hard Mode: tackle smaller moving and breakable platforms with earlier bird encounters.

The About & Help section explains the controls, game items, accessibility settings, and the difference between Sikh and Sikhi. Learn about seva: serving others without expecting a reward. Inspired by Sikhi, this is one creator's make-believe adventure, made for everyone and intended to spark curiosity. It does not replace Sikh teachings. Help includes an optional link to learn more. Everyone is welcome to play. Progress, preferences, upgrades, badges, and statistics stay locally on your device and can be erased from Settings. Android backup is disabled, so progress is not restored after uninstalling and reinstalling the app.

## Suggested Play Console declarations

These are preparation notes, not a substitute for reviewing the final Play Console questions and every bundled SDK.

- App or game: Game
- Category: Casual
- Ads: No
- In-app purchases: No
- App access: All functionality is available without login or special access
- Data collection or sharing: None
- Primary audience: ages 9-12 and 13-15, subject to the developer's final target-audience review
- Online interaction or user-generated content: None
- Location, camera, microphone, contacts, and photos: Not used
- Privacy policy: `https://srajpal.github.io/seva_jump_game/privacy.html`

Live Console verification October 10, 2026: ten declarations are actioned and none need attention. Saved answers confirm no data collected/shared, no ads, no restricted access, not a government app and the policy URL above. Existing audience groups are 6-8, 9-12, 13-15 and 16-17 (retained); ratings include ESRB Everyone and PEGI 3. These are the current saved selections, separate from the suggested primary audience above.

## Screenshot plan

1. Home screen with both characters and all four modes visible.
2. Active Arcade play showing platforms, collectibles, HUD, and Gurdwara backdrop.
3. Challenge completion with the finish banner and fireworks.
4. Upgrades or badges screen showing progression.
5. Optional Hard Mode action shot showing a bird and breakable route.

Keep screenshots free of browser chrome, debug overlays, test currency, and notification/status information that is not part of the app. Use the same art and color treatment across the icon, screenshots, and feature graphic.

## Before submission

Confirm the developer name, support email, website, and privacy-policy contact information in Play Console. Earlier creator approval does not certify subsequent changes. Apply [SIKHI_TEXT_REVIEW.md](SIKHI_TEXT_REVIEW.md) to the final copy and imagery before release; the September 27 text revisions were verified in the saved October 10 Console change, with publication pending review.

October 10 contact check: Console support email `khalsagamestudio.apps@gmail.com` matches the policy source; optional website and phone are empty. Reverify the public privacy URL after deploying the worker-navigation fix: a returning browser currently gets the cached game instead of the policy. Hold public production publication until this is verified resolved.
