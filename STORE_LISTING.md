# SevaJump store listing

This document targets Google Play. For Apple App Store preparation, use [APP_STORE_LISTING.md](APP_STORE_LISTING.md). For itch.io browser distribution, use [ITCH_LISTING.md](ITCH_LISTING.md). Current verification and remaining work are tracked in [RELEASE_PROGRESS.md](RELEASE_PROGRESS.md).

October 17, 2026: published the approved full description below and refreshed phone/7-inch/10-inch tablet galleries with production 1.0.11 / build 49. These changes were submitted October 10 and approved before publication. Managed publishing remains enabled. Screenshots are labeled as using AI-created artwork, consistent with `CONTENT_REVIEW.md` and the existing icon/feature graphic declarations. The owner chose to publish the approved listing first and optimize the short description separately afterward.

## Core listing

**App name:** SevaJump

**Short description:** Leap skyward, recover the parshad, and master four colorful jumping modes.

**Post-launch short-description update (revised October 17; review/publication pending):** An offline pixel-art jumping game inspired by Sikhi, with four ways to play.

The initial short-description submission included “no ads”; Console subsequently flagged that phrase as promotional wording. The revised text above removes it from the preview while retaining the accurate explanation in the full description. It was submitted alongside the corrected tablet galleries and production build 50 on October 17. Console confirms Changes in review, with quick checks still running before forwarding for review. Managed publishing remains on, so approval must be followed by publication. Build 49 and its previously approved listing are already published.

The revised text uses 76 of 80 characters and brings the genre, offline play, visual style, Sikhi inspiration and four modes into the listing preview. The app name and full description are unchanged. This is an editorial improvement, not a measured conversion or search-ranking claim. Review reference: [Google Play listing best practices](https://support.google.com/googleplay/android-developer/answer/13393723?hl=en) and [metadata policy](https://support.google.com/googleplay/android-developer/answer/9898842?hl=en).

**Full description (English; November 4 language addition submitted for review):**

The birds have scattered the parshad! Choose your jumper and climb through peaceful, Gurdwara-inspired skies to help bring it back.

SevaJump is a cheerful, touch-friendly jumping adventure designed for ages 8-15. Steer through bright pixel-art scenery, collect parshad bowls and Khanda tokens, avoid flying birds, and unlock helpful upgrades. The game has no ads, purchases, or accounts, and gameplay does not need an internet connection.

Play in English, Hindi or Punjabi, with a language choice on Home and in Settings.

Four ways to play:

- Endless Run: climb as high as you can.
- Arcade Mode: reach 1,000 points and break through the finish banner.
- Challenge Mode: recover all 50 parshad bowls before reaching the finish.
- Hard Mode: tackle smaller moving and breakable platforms with earlier bird encounters.

The About & Help section explains the controls, game items, accessibility settings, and the difference between Sikh and Sikhi. Learn about seva: serving others without expecting a reward. Inspired by Sikhi, this is one creator's make-believe adventure, made for everyone and intended to spark curiosity. It does not replace Sikh teachings. Help includes an optional link to learn more. Everyone is welcome to play. Progress, preferences, upgrades, badges, and statistics stay locally on your device and can be erased from Settings. Android backup is disabled, so progress is not restored after uninstalling and reinstalling the app.

## November 4, 2026 — production publication and English language description

Google Play confirms **1.0.13/build51 Available on Google Play**, released November 4 at **7:25 PM America/New_York**, with **100% rollout** in all 178 existing countries/regions. The published update uses the English release notes below. Managed publishing remains on.

The full description above adds only **Play in English, Hindi or Punjabi, with a language choice on Home and in Settings.** before Four ways to play. Owner authorized this sentence; saved and submitted exactly one default English full-description change at approximately 7:28 PM America/New_York. Console shows Changes in review with quick checks running and forwarding after successful checks. The prior description remains public until this copy is approved and published. Short description, assets and declarations were retained; Hindi/Punjabi listing drafts remain separately unapproved. Evidence and remaining device validation are in `RELEASE_PROGRESS.md`.

## 1.0.13 / build 51 Google Play upload preparation — October 31, 2026

The game catalogs are owner-approved in Punjabi and Hindi (Hindi approved for now). Prepare this binary with the existing English listing; translated listing drafts still require separate approval. Keep existing privacy/Data safety declarations: language preference is local and no data collection was added.

**English update notes:**

```text
Adds Hindi and Punjabi alongside English, with a language choice on Home and in Settings.
Offline fonts and improved layouts make translated text easier to read.
Adds computer controls to the first-run guide and an optional Write a review link.
Your progress stays on your device.
```

The upload-ready notes file is `dist/SevaJump-1.0.13-build51-play-release-notes.txt`. Signed artifact hashes and remaining Play-delivered/device validation are in `RELEASE_PROGRESS.md`. October 31 status: the signed bundle and these English update notes were published to Internal testing at approximately 4:02 PM America/New_York; Console confirms availability to internal testers. Production review submission followed at approximately 4:24 PM America/New_York: exactly one Production change, with quick checks running and managed publishing retained. Subsequently approved and published November 4 at 7:25 PM America/New_York; see the dated publication record above.

## Localization candidate drafts

Hindi and Punjabi (Gurmukhi) listing copy and update notes for the published **1.0.13 / build 51** release are in [docs/localization-play-drafts.md](docs/localization-play-drafts.md). November 4: Codex reviewed/revised the copy against the English listing and accepted game catalogs, aligned menu labels, clarified in-app purchases and prepared copy-ready UTF-8 fields. This is editorial review, not independent human language certification or owner acceptance of the final store prose. Hindi **hi-IN** counts: app name 8/30, short 68/80, full 1,524/4,000, notes 286/500. Punjabi **pa** counts: 8/30, 66/80, 1,541/4,000 and 285/500. Console field counts/rendering still need verification at entry. Neither localized listing has been entered, submitted or published. Retain English as default and existing graphic assets. Accept final store prose before submission; game-catalog approval is separate. No binary or privacy/Data safety change is needed.

## Google Play trader-status declaration — checked November 4, 2026

All active developer accounts worldwide must complete the account trader/non-trader declaration by **February 1, 2027**. The assessment concerns commercial purpose, including business setup and intended revenue; a free app alone does not establish non-trader status. If the account is a trader, confirm the declaration for each app. An individual trader must provide a public contact phone number and will have their address displayed. Follow the actual Console prompts for self-certification and any app Terms of Service link. Missing the deadline may block updates and trigger global removal. See Google's [trader declaration guidance](https://support.google.com/googleplay/android-developer/answer/17594752?hl=en).

November 4 follow-through: the owner completed the final account public-profile consent and legal self-certification after phone verification. Verified Account details explicitly shows **Trader**, with no unsaved account changes. SevaJump inherits that status; saved **Yes, my trader status applies to this app** and submitted exactly one app-level trader change. Initial submission showed quick checks running; subsequent verification explicitly shows **Your changes are now in review**, with no quick-check panel; approval/publication remain pending and managed publishing stays on. The live app form explicitly labels the Terms of Service URL **If available**, so it was left blank. Account completion does not establish completion for every other app.

The owner remains responsible for accurate account/app status. Keep personal contact details, verification codes and documents out of this repository. Apple DSA status is a separate declaration and was not changed; the October 12 non-trader entry remains historical evidence requiring reassessment if the studio/app's commercial purpose changes.

## November 5, 2026 — website verified for requested Organization conversion

Play Account details now verifies **https://khalsagamestudio.com/** and enables **Change account type**. Matched the Website field to the existing non-www Search Console URL-prefix property and approved the exact Play Developer Account association using its already verified studio owner. The account remains **Personal / Trader**; website verification alone does not convert the account or change its public legal address. Evidence is in `RELEASE_PROGRESS.md`.

For the requested conversion, provide a verified organization identity/D-U-N-S number, organization payments profile and required business/contact documents, then complete Google's verification/linking flow. An Organization account displays its verified legal business address publicly: conversion will not hide a home address if that address is also the business address. [Conversion requirements](https://support.google.com/googleplay/android-developer/answer/16260648?hl=en), [organization public-profile requirements](https://support.google.com/googleplay/android-developer/answer/13628312?hl=en). Keep private business verification documents and contact details outside this repository. No conversion or address change has been performed.

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

October 17 tablet refresh for **1.0.12 / build 50**: both tablet galleries now have four 1800 × 3200 captures ordered **Arcade / Home / Challenge / Upgrades**, submitted together with build 50 and pending review/publication. Images come from the signed candidate's extracted web payload and show its corrected tablet layout; Arcade uses the girl and Challenge uses the boy. Both gameplay images are natural opening runs, with no fabricated victory. AI-artwork labels are retained. Phone gallery, icon and feature graphic remain unchanged. Local captures and previous images are retained under ignored `screenshots/play-1.0.12/` and `screenshots/play-1.0.11/`.

1. Home screen with both characters and all four modes visible.
2. Active Arcade play showing platforms, collectibles, HUD, and Gurdwara backdrop.
3. Challenge completion with the finish banner and fireworks.
4. Upgrades or badges screen showing progression.
5. Optional Hard Mode action shot showing a bird and breakable route.

Keep screenshots free of browser chrome, debug overlays, test currency, and notification/status information that is not part of the app. Use the same art and color treatment across the icon, screenshots, and feature graphic.

## Before submission

Confirm the developer name, support email, website, and privacy-policy contact information in Play Console. Earlier creator approval does not certify subsequent changes. Apply [SIKHI_TEXT_REVIEW.md](SIKHI_TEXT_REVIEW.md) to the final copy and imagery before release; the September 27 text revisions were verified in the saved October 10 Console change and published October 17.

October 10 contact check: Console support email `khalsagamestudio.apps@gmail.com` matches the live public policy; optional website and phone are empty. PR #50 fixed and deployed the worker-navigation defect. The same returning browser now opens the policy after worker activation, with a working return link to v1.0.11. No site data was cleared. Production approval and the remaining device/pre-launch checks stay separate.
