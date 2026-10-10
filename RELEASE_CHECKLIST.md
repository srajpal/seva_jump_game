# SevaJump release checklist

Use this checklist for every release candidate. Do not create or commit an upload keystore, passwords, or `keystore.properties`.

Current candidate: **1.0.11, Android build 49 / iOS build 45 metadata** (October 10, 2026). The public browser edition remains 1.0.10. No iOS build or production publication is claimed. Existing checkmarks record historical work unless newer evidence is explicitly dated. Rerun applicable checks after any source change and against the exact artifact proposed for upload. [ITCH_RELEASE_AUDIT.md](ITCH_RELEASE_AUDIT.md) preserves the original 0.13.1 findings; current status is in [RELEASE_PROGRESS.md](RELEASE_PROGRESS.md).

Production access was granted and verified in the live Console October 10, 2026. The owner authorized preparation, Internal testing, refreshed screenshots, production submission and publication following approval. Version 1.0.11 includes the merged review and viewport fixes; validate the exact signed candidate before rollout.

## itch.io browser release

- [x] Resolve the original audit's menu/Escape, storage failure, viewport fitting, letterboxed steering, focus/input-loss, small-screen, reset and outbound-link findings; verify them locally.
- [x] Resolve the original first-visit cache URL mismatch and directory-request precache failure; Firefox passed the browser suite including actual offline play.
- [x] Finish the storage-recovery follow-up and rerun its targeted checks.
- [x] Rebuild the curated ZIP after the final source change. Keep `index.html` at root with required relative, case-correct paths; exclude unused artwork, tooling, native projects and private files.
- [x] Extract and test the final ZIP. Chromium and Firefox passed including offline. WebKit core passed; offline remains unverified.
- [ ] Test each mode/character, victories/losses, upgrades, badges, settings/reset and saved progress in real browser play; rule simulations alone are insufficient.
- [ ] Verify desktop short-window, keyboard/mouse, iframe focus, fullscreen and zoom behavior; test real Android Chrome and iPhone/iPad Safari before claiming mobile support.
- [ ] Check keyboard focus/menus, text readability, reduced motion, slow loading and sustained performance on a lower-end device.
- [x] Record artwork/code provenance and Sikh content approval. `CONTENT_REVIEW.md` records the Sikh creator's approval and confirmation that no outside assets were used; an outside review is optional.
- [x] Prepare and review itch-specific copy, controls/save notes, support route, tags, cover, and screenshots. Hosted offline support and physical mobile claims remain unverified.
- [ ] Complete host-specific offline and outbound-link checks on the published itch.io 1.0.10 build. Hosted launch and Arcade start passed September 30, 2026. Full hosted offline, mobile and mode checks remain open. A private/restricted preview was not used for this update.
- [x] Record the 1.0.10 ZIP checksum, retain older ZIPs for rollback, and publish with owner authorization. Upload and release status are recorded in `RELEASE_PROGRESS.md`.

Google Play and iOS signing/store-console tasks below do not block a browser-only itch release.

## Release blockers

- [x] Endless, Arcade, Challenge, and Hard Mode routes pass automated reachability checks.
- [x] Challenge contains exactly 50 reachable bowls and celebrates only after all 50 are collected.
- [x] First-run guide, settings, reset confirmation, statistics, badges, upgrades, music, and sound effects are implemented.
- [ ] Complete physical Android device coverage. Java 21 builds and Android 15/16 phone/tablet emulator smoke checks passed September 19, 2026; physical-device performance and full playthroughs remain.
- [ ] Test the iOS portrait layout, touch controls, offline launch, outbound studio link, and saved progress on an iPhone and iPad.
- [x] The app has no ads, purchases, accounts, analytics, or gameplay network dependency.
- [x] Progress can be erased from Settings, Android cloud backup is disabled, and cleartext network traffic is disabled.
- [x] Complete creator review of terminology, imagery, gameplay context, and asset provenance as recorded in `CONTENT_REVIEW.md`.
- [x] Test the release candidate on a phone-sized Android device.

## Regression pass

- [ ] Start each mode with both characters and verify the chosen character persists after restart.
- [ ] Complete Arcade and Challenge; verify banner timing, fireworks, sound, results, best score, and statistics.
- [ ] Lose by falling and by bird; verify net pose, transition, death reason, Dhal Shield, and Falcon Save.
- [ ] Pause, resume, restart, return home, and use Android Back from every screen.
- [ ] Toggle music, sound, and reduced motion; restart the app and verify each preference persists.
- [ ] Buy every upgrade, earn a badge, reset all progress, and verify the confirmation and cleared state.
- [ ] Test once with airplane mode enabled.

## Google Play preparation

- [x] Confirm the permanent application ID: `org.sevajump.game` (signed build 49 and live Console, October 10, 2026).
- [x] Create the replacement personal developer account and SevaJump app. The operational account and `org.sevajump.game` closed-test app were verified in Play Console October 8, 2026; the former studio account's September 18 closure is historical.
- [x] Migrated compile/target SDK to API 36 with Capacitor 8, AGP 8.13.0 and Gradle 8.14.3; Android 16 phone/tablet emulator checks passed September 19, 2026.
- [x] Verify target-API compliance and signed-AAB acceptance in the replacement Play account. Live Console verification October 9, 2026 confirms active 1.0.3 / build 41 targets SDK 36, supports API 24+, is available to internal/closed testers, and Policy status reports no issues. This completes issue #1's original migration/upload gate; the next production candidate still needs its own artifact/update validation. Published requirements: https://support.google.com/googleplay/android-developer/answer/11926878.
- [ ] Create and securely back up a separate upload key; never store it in this repository.
- [x] Build and verify 1.0.11 / build 49 with the existing upload key (October 10, 2026); matching certificate, signed AAB and all 34 packaged web files verified. Signing reads ignored `android/keystore.properties`; never use `-PallowUnsignedRelease` for uploads.
- [x] Verify Play App Signing and the signed Android App Bundle (`.aab`). Play accepted build 49 and its generated APK uses the existing Play signing identity; hashes are in `RELEASE_PROGRESS.md`.
- [ ] Decide cross-store signing before distribution: use a consistent application ID and compatible signing identity for updates. An upload key is not the Play app signing key. See `ANDROID_DISTRIBUTION.md`.
- [x] Publish the privacy policy at `https://srajpal.github.io/seva_jump_game/privacy.html` (public page verified September 18, 2026; final contact/declaration review remains).
- [x] Verify saved Data safety declaration: no data collected or shared, and Play Families commitment (live Console October 10, 2026). No added analytics/ads SDKs in build 49.
- [x] Verify completed audience, rating, ads, access and government declarations (October 10, 2026): age groups 6-8, 9-12, 13-15, 16-17; ESRB Everyone / PEGI 3; no ads, no special access, not a government app. No declarations need attention. Existing audience selections were retained.
- [x] Capture four current portrait phone screenshots: home, active play, upgrades, and Arcade completion; also four tablet images. Saved the Play gallery change October 10, 2026, pending review.
- [x] Verify existing 512 × 512 Play icon and 1024 × 500 feature graphic in the October 10 listing; retained with their recorded AI-artwork labels.
- [x] Publish 1.0.3 / build 41 to Internal testing and closed testing. October 8 Console verification showed full rollout and tester availability on Alpha, App Hive, Fiverr and 12 Testers Live. Historical submission details are preserved in `RELEASE_PROGRESS.md`.
- [ ] Review build 49's pre-launch report before public production rollout. No generated report was visible October 10; do not claim a pre-launch pass. Internal testing is live; the owner reports successful Play-delivered update/save/reopen/offline checks on another device.
- [ ] On a physical phone and tablet, update the existing Play installation without clearing app data. Check the visible version and retained saves on first launch, then close/reopen twice and test airplane-mode play. The outgoing native worker can serve the previous release once; subsequent launches must use the packaged candidate. Test instructions are in `TESTING.md`.
- [x] Complete the personal-account closed test with at least 12 continuously opted-in testers for 14 days, then apply for production access. Play Console confirmed all eligibility tasks complete and the application was submitted October 8, 2026 at 11:18 AM America/New_York. See https://support.google.com/googleplay/android-developer/answer/14151465.
- [x] Receive production-access approval. Live Console verified October 10, 2026; production remains inactive until a release is approved and published.
- [ ] Validate the final signed, Play-delivered candidate before production rollout. See `RELEASE_PROGRESS.md` for current artifact and review status.
- [x] Submit first production release 49 and refreshed listing to Google's review queue (October 10, 2026), with managed publishing enabled. Quick checks, approval and public publication remain pending; confirm all remaining launch checks before publishing approved changes.
- [ ] Deploy and reverify the hosted privacy-page navigation fix found October 10. The old worker rendered the game for policy navigations; public policy access must work for returning visitors before production publication.

## Build verification

```powershell
node --check game.js
node --check sw.js
node --check scripts\build-itch.mjs
node --check scripts\capture-release-media.cjs
node --check tests\browser-checks.cjs
node tests\rule-checks.js
node tests\full-run-checks.js
node tests\endless-bird-checks.js
node tests\hard-mode-checks.js
node tests\power-jump-checks.js
node tests\soak-test.js
npm run test:runtime
npm run itch:build
npm run test:package
npm run android:debug
```

Use `npm run test:browser` for browser coverage. Run it in Firefox, Chromium, and WebKit where available, and set `TEST_WEB_ROOT` to a fresh extraction of the final ZIP for artifact testing. Engine emulation is not a physical-device test; record skipped or engine-internal failures as unverified.

For iOS, open `ios/SevaJump.xcodeproj`, select a signing team, then build the
**Seva Jump** scheme on an iOS 15+ device or simulator. Archive from Xcode for
TestFlight or App Store submission.

For the store, use Android Studio's **Build > Generate Signed Bundle / APK > Android App Bundle** flow. Increment both `versionCode` and the visible version before every upload.

## Public launch record

September 11, 2026: owner authorized publication of 0.13.2 as a free public browser game with In development status. Public visibility was saved and verified after reload. Pending device, hosted offline, and outbound-link checks above remain follow-up work; publication does not mark them passed. See RELEASE_PROGRESS.md for payload checksum and rollback instructions.
