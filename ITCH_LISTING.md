# Seva Jump — itch.io listing and upload plan

Candidate: **0.13.2**. Current verification and remaining gates: [RELEASE_PROGRESS.md](RELEASE_PROGRESS.md).

## Ready-to-use page copy

**Title:** Seva Jump  
**Short description:** A cheerful skyward adventure inspired by Sikh culture. Jump, collect parshad, and keep climbing!

The birds have flown away with the parshad! Choose your young Sikh jumper, bounce through a bright gurdwara-inspired world, and help bring it back.

Play four ways:

- **Endless Run:** see how high you can climb.
- **Arcade Mode:** reach 1,000 points and break through the finish banner.
- **Challenge Mode:** collect all 50 parshad bowls to complete the course.
- **Hard Mode:** take on smaller moving and breakable platforms, with birds arriving earlier.

Collect tokens during runs to unlock upgrades, earn badges, and beat your own best scores. Includes a first-run guide, music and sound controls, reduced motion, and an About & Help screen explaining Sikh terms used in the game.

### Controls

Your jumper bounces automatically. Drag with a mouse or finger to move left and right, or use the **Left/Right Arrow keys**. Press **Escape** or the pause button to pause. A paused game stays paused when you visit Settings; use Resume to continue.

The game uses a portrait play area. On short or landscape screens, scroll through menus when needed. Fullscreen gives you more room.

### Free to play, with progress on your device

The game has no ads, purchases, accounts, or analytics. Your scores, upgrades, badges, statistics, and settings stay in this browser on this site; they do not sync between devices. Clearing browser or site data may erase them. If saving is blocked, you can still play for the current session.

For offline play, download the ZIP, extract it, and open `index.html` in a modern browser. The hosted game can cache its files after a successful first visit in a supported browser, but the surrounding itch.io page may still need a connection. The host's own privacy policy also applies when you visit its website.

### About the creator

Created by **Khalsa Game Studio**. The Sikh creator directed and approved the game's current cultural content. The artwork and synthesized music were made with ChatGPT assistance from the creator's ideas; the creator confirms that no outside assets were used.

[Visit Khalsa Game Studio](https://www.khalsagamestudio.com/)

Feedback is welcome in this game's itch.io comments. When reporting a problem, include your browser/device, game mode, and what happened; please do not post personal information.

## Creator configuration

| Field | Prepared choice |
| --- | --- |
| Kind | HTML Game |
| Pricing | Free; no required payment |
| Release status | Released only after final draft verification; keep candidate restricted until then |
| Genre | Platformer |
| Suggested tags | 2D, Arcade, Casual, Pixel Art, Singleplayer, Family Friendly |
| Upload | `dist/seva-jump-0.13.2-itch.zip`; mark as playable in browser |
| Download | Offer the same ZIP as an optional offline download if the upload controls permit, otherwise add a separate downloadable copy |
| Desktop embed | Click-to-play; start with 500×800; fullscreen button on |
| Mobile friendly | Enable only after the hosted mobile check; touch browser/emulator verification is recorded separately |
| Orientation | Portrait preferred; responsive menus support landscape |
| Comments | Enable as the proposed support route; moderate as needed |
| Cover | `release-media/itch-cover-630x500.png` |
| Screenshots | `release-media/home.png`, `gameplay.png`, `upgrades.png`, `about.png` |

The cover is a composition of existing game art. Screenshots show the actual interface and a natural opening run; no fabricated score or victory is shown. All generated media should be checked in the itch preview for cropping and legibility.

Official references: [HTML5 upload guide](https://itch.io/docs/creators/html5), [page design guide](https://itch.io/docs/creators/design). The ZIP includes only runtime files; cover/screenshots are uploaded separately, not included in the game payload.

## Build, verify, then upload

1. Run the validation commands in `RELEASE_CHECKLIST.md`.
2. Run `npm run itch:build`, then `npm run test:package`.
3. Check the ZIP SHA-256 against its `.sha256` and `.manifest.json` sidecars. Extract to a fresh folder and test the extracted files over HTTP and from local `index.html`.
4. Keep the previous approved ZIP. Do not upload `.tmp`, native builds, node_modules or the repository itself.
5. In a private/restricted itch draft, upload the ZIP and media, enter the page copy, and verify fullscreen, keyboard/touch, external links, saves/reload, offline behavior and returning from another tab.
6. Publish only after the draft works and the owner approves the public page. Record the final page URL and uploaded checksum in `RELEASE_PROGRESS.md`.

## Release note: 0.13.2

Improved browser play: menus now keep the game paused, saves fail gracefully when browser storage is blocked, touch steering aligns with the portrait canvas, and shorter screens keep the full game visible. Added keyboard focus handling and automatic pause when leaving the game. Fixed first-visit offline caching and high-speed landings. Progress stays local, and the game remains free of ads, purchases and accounts.

## Saved draft

Created September 11, 2026: https://khalsagamestudio.itch.io/seva-jump (owner sign-in required). Project 4999359. Current choices: Draft, In development, No payments, HTML, 500×800, fullscreen enabled, mobile-friendly disabled pending device checks. Tags: pixel-art, singleplayer. All four AI disclosure categories selected. The hosted copy omits offline promises while hosted offline and optional download setup remain unverified. See RELEASE_PROGRESS.md for host checks.

## Studio profile branding

The public profile at https://khalsagamestudio.itch.io/ was aligned with the updated https://www.khalsagamestudio.com/ on September 11, 2026.

- Display name: Khalsa Game Studio; avatar: the original website logo.jpg.
- Theme: background #f7f3e9, text #17211f, links #23493f, Sans Serif font.
- Updated headline: Come play Seva Jump. Description reflects the Sikh-led studio, family play, seva, and upcoming Sikhi Word Games v2.
- Links point to the website, its playable game, family information, playtest contact section, Instagram, Facebook, and the published studio email.
- Adult contact guidance follows the updated website. No child personal details are requested.
- Verified saved profile text and theme after navigation, and visually checked desktop and narrow layouts. The game project remains a separate unpublished draft.

## Publication

Published with owner authorization on September 11, 2026 at 21:19 EDT: https://khalsagamestudio.itch.io/seva-jump. Visibility is Public, status remains In development, pricing is No payments. Public visibility was verified after reloading the editor. This supersedes the earlier draft-only status; outstanding validation remains in RELEASE_PROGRESS.md.

Source note for the game page and devlog: Source code is available on [GitHub](https://github.com/srajpal/seva_jump_game). Bug reports and suggestions are welcome. Do not label the project open source until a license is chosen.
