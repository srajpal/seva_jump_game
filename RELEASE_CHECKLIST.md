# SevaJump release checklist

Use this checklist for every release candidate. Do not create or commit an upload keystore, passwords, or `keystore.properties`.

Checkmarks record evidence for the current 0.13.2 work. Rerun applicable checks after any source change and against the exact artifact proposed for upload. [ITCH_RELEASE_AUDIT.md](ITCH_RELEASE_AUDIT.md) preserves the original 0.13.1 findings; current status is in [RELEASE_PROGRESS.md](RELEASE_PROGRESS.md).

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
- [ ] Create and test a private/restricted itch draft for host-specific storage, service worker, fullscreen and external-link behavior. Draft project 4999359 was created after owner sign-in. Hosted gameplay, fullscreen, and preference persistence passed; offline/outbound-link checks remain open. Nothing is published.
- [ ] Record candidate version/checksum and retain a previous working ZIP for rollback; approve publication separately.

Google Play and iOS signing/store-console tasks below do not block a browser-only itch release.

## Release blockers

- [x] Endless, Arcade, Challenge, and Hard Mode routes pass automated reachability checks.
- [x] Challenge contains exactly 50 reachable bowls and celebrates only after all 50 are collected.
- [x] First-run guide, settings, reset confirmation, statistics, badges, upgrades, music, and sound effects are implemented.
- [ ] Complete Android device coverage. The Java 21 debug build and phone smoke test passed; the final tablet check remains.
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

- [ ] Confirm the permanent application ID: `org.sevajump.game`.
- [ ] Create the app in Play Console and complete developer verification.
- [ ] Create and securely back up a separate upload key; never store it in this repository.
- [ ] Enroll in Play App Signing and build a signed Android App Bundle (`.aab`).
- [ ] Publish the privacy policy at `https://srajpal.github.io/seva_jump_game/privacy.html`.
- [ ] Complete Data safety as no data collected or shared, after verifying every included SDK.
- [ ] Complete target audience, content rating, ads, app access, and government-app declarations accurately.
- [ ] Capture at least four portrait phone screenshots: home, active play, upgrades/badges, and a victory scene.
- [ ] Prepare a 512 × 512 Play icon and 1024 × 500 feature graphic.
- [ ] Upload to Internal testing first, then Closed testing; review the pre-launch report before production.

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
