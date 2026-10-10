# Release notes

## 1.0.11 — Android build 49 / iOS build 45 metadata

Prepared October 10, 2026 for Google Play Internal testing and the first production release following production-access approval. Includes the merged October review fixes and all updates since Play's 1.0.3 / build 41. Not yet uploaded or published; iOS metadata only, no Xcode build. The public itch.io edition remains 1.0.10.

- Confirm or cancel pre-run upgrade choices with a controller; keyboard focus stays inside the panel when an upgrade is unowned.
- Tap Settings row text to change its setting; the info and music-preview buttons retain their own actions.
- Fetch refreshed artwork when installing a hosted browser cache, and remove old native caches so later launches use the installed app version.
- Keep the play area and Pause control visible on older WebViews with compatible viewport sizing, including desktop fullscreen.
- Includes the refreshed characters and artwork, clearer badges, pre-run upgrade choices, one-use consumables and gentler introductory Arcade birds from versions 1.0.4–1.0.10.

Android update check: an existing installation may show the previous version on its first launch after updating while the outgoing worker unregisters. Reopening must use the new packaged version and retain saved progress. A direct debug update on the physical K70 PRO tablet confirmed this transition October 9; physical-phone and Play-delivered update verification remain pending. Release packaging now rejects incomplete signing settings; the test autopilot's pointer handling is also corrected.

## 1.0.10 — Android build 48 / iOS build 44 metadata

Prepared September 30, 2026. Browser edition published on itch.io September 30, 2026. Android build 48 remains a local debug candidate; no iOS build produced.

- Choose owned upgrades before each run, with remembered choices and an optional base-height jump.
- Use at most one Falcon Save and one Dhal Shield per run; items are spent only when activated, and unused inventory is kept.
- Arcade introduces occasional single birds from 200 points and limits later encounters to two visible birds.
- Clearer upgrade status during play and a more compact Badges heading.

## 1.0.9 — Android build 47 (September 29 testing rebuild)

- Arcade introduces occasional single birds from 200 points, then allows up to two visible birds from 500 points. Spacing prevents crowded groups, including partially visible birds.

Prepared September 29, 2026 for direct phone testing, retaining version/build as requested. Not published.

- Equip at most one Falcon Save and one Dhal Shield per run. Items are consumed only on activation; unused items stay in inventory.
- The run HUD shows the available item or “Used”, with a short explanation before starting.

## 1.0.9 — Android build 47 / iOS build 43 metadata

Prepared September 29, 2026 for local testing; not published. No iOS build produced.

- Choose which owned upgrades to use before each run. Save Falcons and shields for later, or try the original jump height without losing purchased levels.
- Choices are remembered; players without upgrades start normally. Boosts found during play still work.
- Removed the extra “Your collection” subtitle from Badges.

## 1.0.8 — Android build 46 / iOS build 42 metadata

Prepared September 27, 2026 for local Android testing; not published. iOS metadata aligned; no iOS build produced.

- Added Perfect Arcade, Boost Master, Both Feet In and Comeback Kid.
- Renamed Power Seeker to Boost Seeker, preserving unlocks and cumulative boost progress.
- Ordered 14 badges from introductory milestones to harder achievements.
- Capitalized Gurdwara in Help and prepared store copy.

## 1.0.7 — Android build 45 / iOS build 41 metadata

Prepared September 27, 2026 for local device testing; not published. No iOS build produced.

- All menu screens center their content vertically when it fits, including Upgrades, Settings, Badges and Records.
- Longer menus start at the top and remain fully scrollable on smaller screens.

## 1.0.6 — Android build 44 / iOS build 40 metadata

Prepared September 27, 2026 for local device testing; not published. No iOS build produced.

- Khanda tokens now spin in place like coins, turning around the vertical axis. Reduced Motion keeps them face-on.
- Refreshed app icons and Seva Jump title logo match the cleaner, colorful game artwork.
- Updated local promotional cover with the matching icon and logo.

## 1.0.5 — Android build 43 / iOS build 39 metadata

Prepared September 27, 2026 for local Android device testing; not published. iOS metadata aligned; no iOS build produced.

- Cleaner gold-rimmed Khanda tokens with a larger silver emblem and fewer decorations.
- Compact badge cards place medals beside the text, fitting the collection on typical phone screens.
- Includes the refreshed avatars, extra jump poses, matching item artwork, character-shadow and shoe-crop fixes, and Sikhi Help updates from the local 1.0.4 candidate.

## 1.0.4 — Android build 42 (device-test build)

Local art-review rebuild prepared September 27, 2026, retaining version/build 1.0.4/42 for direct device testing:

- Brighter, consistent avatars with extra jump poses and clearer net-landing expressions.
- Refreshed collectibles, boosts, birds and shield artwork.
- Matching upgrade icons and achievement medals, with more readable badge cards.
- Compact badge cards fit the full collection on typical phone screens, with scrolling available on smaller displays.
- Clean character-selection outlines and extra shoe clearance, fixing the heavy shadow and clipped-foot appearance.
- Updated Sikhi terminology, creator's note and optional learning link in Help.

Prepared September 26, 2026. Debug APK for local device testing; not uploaded to Google Play. No new iOS build.

- Smoother touch controls when repositioning your thumb.
- Persistent stuck banners in Challenge and Hard; use Pause to restart or leave instead of an automatic stuck timeout.
- Roomier buttons, dedicated Records & Stats, and a refreshed About screen.
- Updated privacy information and contact details.

## 1.0.3 — itch.io web / Android build 41

Prepared September 22, 2026. The web package `seva-jump-1.0.3-itch.zip` was published on itch.io on September 22, 2026 (September 23 UTC), with the [full release devlog](https://khalsagamestudio.itch.io/seva-jump/devlog/1673901/seva-jump-103-is-out-full-release). Android build 41, `SevaJump-1.0.3-build41-play.aab`, is prepared for Google Play testing and has not been uploaded or published. No iOS build.

### Player-facing itch.io launch notes

**Seva Jump 1.0.3 — full launch**

Choose your young Sikh jumper and climb through a bright, gurdwara-inspired world. Play Endless, Arcade, Challenge or Hard Mode, collect parshad, earn badges and unlock upgrades.

Since the early browser release:

- Added Helping Hand and guided Nishan Sahib flight, plus expanded music settings.
- Improved bird collisions so head and body contact register more consistently.
- Tightened platform-edge landings so jumps feel better supported by the visible platforms.
- Fixed birds getting stuck and flickering at the screen edges.
- Lowered achievement banners for clearer viewing.

Play with touch, mouse, keyboard or a standard gamepad. Seva Jump remains free, with no ads, purchases or accounts. Progress is saved in this browser on this device; clearing site data may erase it.

Thank you for playing! Feedback and bug reports are welcome in the itch.io comments.

### Google Play update notes

- Back now returns through menus and goes to your launcher from Home.
- Improved bird collisions and platform-edge landings.
- Fixed birds getting stuck at screen edges.
- Improved tablet layouts and kept phone gameplay full-width.
- Lowered achievement banners for clearer viewing.

## 1.0.2 — Android build 40

Prepared September 22, 2026.

Play Store update notes:

- Fixed birds getting stuck and flickering at the edge of the screen.
- Improved Android tablet layouts so the game and controls stay visible.
- Restored full-width gameplay on Android phones.
- Moved achievement banners lower for clearer viewing.

This release keeps progress on your device and remains free of ads, purchases and accounts.

Release status and validation evidence are tracked in [RELEASE_PROGRESS.md](RELEASE_PROGRESS.md).
