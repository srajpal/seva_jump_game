# SevaJump release checklist

Use this checklist for every release candidate. Do not create or commit an upload keystore, passwords, or `keystore.properties`.

Current Android production release: **1.0.12 / build 50**, published October 23, 2026. Internal testing **1.0.13 / build 51** was published October 31 and the same build submitted for production review that day at approximately 4:24 PM America/New_York; quick checks/review are pending and managed publishing remains on. Public browser **1.0.11** was published October 10. iOS **1.0.11** is released on the App Store according to the owner October 31; exact publication date/released build number are unverified. Build 45 was previously uploaded/processed October 12. Existing checkmarks record historical work unless newer evidence is explicitly dated. Rerun applicable checks after any source change and against the exact artifact proposed for upload. [ITCH_RELEASE_AUDIT.md](ITCH_RELEASE_AUDIT.md) preserves the original 0.13.1 findings; current status is in [RELEASE_PROGRESS.md](RELEASE_PROGRESS.md).

Published tablet release: **1.0.12 / Android build 50 / iOS build 46 metadata**, prepared October 17 for the tall-tablet layout correction and replacement tablet galleries; Google Play production publication confirmed October 23 at full rollout. Automated suites, 15 Android layout cases, phone/tablet Android 15 emulator checks, signed bundle verification and Android lint pass. No new physical-device or Play-delivered update pass is claimed. Validation and publication evidence are tracked separately in `RELEASE_PROGRESS.md`.

Production access was granted and verified in the live Console October 10, 2026. The owner authorized preparation, Internal testing, refreshed screenshots, production submission and publication following approval. Version 1.0.11 includes the merged review and viewport fixes; validate the exact signed candidate before rollout.

Local implementation candidate: **1.0.13 / Android build 51 / iOS build 47 metadata**, initially prepared October 17 for Hindi and Punjabi/Gurmukhi localization; signed Android upload bundle prepared and locally validated October 31. All 343 Punjabi and Hindi game entries are owner-approved October 31 (Hindi approved for now); the remaining release checks are still required before publication; its validation is separate from the published tablet release. See the localization gates below and `docs/localization-review.md`.

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
- [ ] Complete host-specific offline, physical mobile and outbound-link checks on the published itch.io 1.0.11 build. October 10: exact ZIP tested first on a private itch draft; all four modes started and paused, Settings preserved pause, Help/badges opened, fullscreen entered, and reload worked. Published-version launch was checked separately. This does not certify natural full-mode completion or hosted offline behavior.
- [x] Record the 1.0.11 ZIP checksum, retain older ZIPs for rollback, and publish with owner authorization. Refresh five screenshots, gameplay/features copy, controls, and download instructions; verify the saved public page. Upload and release status are recorded in `RELEASE_PROGRESS.md`.

Google Play and iOS signing/store-console tasks below do not block a browser-only itch release.

## Release blockers

For the **1.0.13 / Android 51 / iOS 47 metadata localization candidate**, historical checkmarks below do not establish translated-release readiness. Build 50's published tablet update remains separate.

- [x] Owner approved the original 341 Punjabi/Gurmukhi entries October 26, 2026; baseline checksums are in `docs/localization-review.md`.
- [x] Owner approved both added Punjabi guide/review-link strings October 31, 2026; all 343 Punjabi game entries are accepted.
- [x] Owner approved all 343 Hindi game entries for now October 31, including the current game terminology. This records owner acceptance, not independent fluent-language certification.
- [x] Record current game terminology acceptance in `docs/localization-review.md`; retain the agreed fictional premise and welcome to all players.
- [x] October 31: actual Android HTTPS fallback handoff passed on the API35 QA emulator without a Play Store handler.
- [ ] Validate the Play Store app handoff on a physical Android device; iOS handoff belongs to the separate iOS update.
- [ ] Separately review translated Play listing drafts before using them. The binary can be prepared with the existing English listing and English update notes.
- [x] Verify catalog/placeholder parity, exact extraction counts, English-residue exceptions, device detection (including `pa-Arab` and `pa-PK` exclusion), switching, persistence, old saves, denied storage, and paused-run retention. October 31: localization unit/runtime and exact-artifact Edge checks pass; 343 entries / 2,163 English source words.
- [ ] Test all modes, warnings, tutorials, badges, Help/Privacy, keyboard/controller/Android Back and accessibility labels in all three languages.
- [x] Verify offline fonts/catalogs, direct-file opening, phone/tablet clipping and wrapping, and the tall-tablet gap regression against the final payload. October 31: exact ZIP Edge localization/offline checks, 26 Home-fit cases in each language, and 15 Android layout regressions pass; physical-device validation remains separate from owner wording approval.
- [x] October 31: Android15 QA emulator phone/tablet localization, debug in-place update/save retention, Back/system bars, cold airplane-mode launch and HTTPS review fallback pass.
- [x] October 31: build/sign the production 1.0.13/build51 AAB and release APK, verify upload certificate, version metadata and all 49 packaged web/Capacitor files; Android release lint reports 0 errors. Artifact hashes are in `RELEASE_PROGRESS.md`.
- [x] Upload and publish the exact signed AAB to Play Internal testing. October 31 at 4:02 PM America/New_York: Console confirms 51 (1.0.13) available to internal testers; checksum and proof are in `RELEASE_PROGRESS.md`.
- [x] October 31: owner authorized production review submission; promoted existing build51 with English notes and submitted exactly one Production change. Quick checks/review are pending; managed publishing remains on.
- [ ] Receive Google approval and complete the separate managed-publication step.
- [ ] Validate the Play-delivered physical phone/tablet update and review its pre-launch report before production rollout.
- [ ] Complete physical accessibility/screen-reader review and sustained natural playthroughs.
- [ ] For the separate iOS update, rebuild/validate 1.0.13/build47 in Xcode and on iPhone/iPad. This preparation made no iOS build.

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
- [x] Publish the privacy policy at `https://srajpal.github.io/seva_jump_game/privacy.html` (public page and matching support contact reverified October 10, 2026 after the hosted navigation fix deployed).
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
- [x] Submit first production release 49 and refreshed listing (October 10, 2026), with managed publishing enabled. Approval verified and all seven changes published October 17 with owner authorization. The separate post-launch short-description update is queued for review; it does not change the published release status.
- [x] Deploy and reverify the hosted privacy-page navigation fix found October 10. PR #50 merged and GitHub Pages deployed successfully. The same returning browser opens the Privacy page after worker activation and returns to v1.0.11; no site data was cleared.

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

For iOS, use a submission-compatible Xcode and SDK (from April 28, 2026: Xcode 26+ / iOS 26+ SDK). Xcode 26.3 supports macOS 15.6+, including this Mac's 15.8.1. See [Apple's requirement](https://developer.apple.com/news/upcoming-requirements/?id=04282026a) and [system requirements](https://developer.apple.com/xcode/system-requirements). Open `ios/SevaJump.xcodeproj`, sign into the owner's account and use automatic signing for team `LSES4VT2GU` / `org.sevajump.game`. Build the **Seva Jump** scheme on iPhone and iPad, then archive for App Store Connect. A successful unsigned simulator build does not validate signing, the upload SDK or physical-device behavior.

### iOS first submission gates (October 12, 2026)

- [x] Active membership, registered identifier and App Store Connect record.
- [x] Version 1.0.11 copy, URLs, four iPhone and four iPad screenshots saved.
- [x] Games/Casual, Data Not Collected, content rights and authorized private review contact saved.
- [x] Free pricing, 173 launch regions excluding China mainland/Vietnam, EU non-trader and manual release saved.
- [x] Configure project team and `ITSAppUsesNonExemptEncryption=false`; validate plist/project syntax.
- [x] Required Node suites and unsigned Xcode 16.2 simulator Release compilation/package check passed October 12.
- [x] Install Apple-signed Xcode 26.3 alongside the old Xcode at `/Applications/Xcode-26.3.app`.
- [x] Owner completes Xcode 26.3 first launch/account sign-in; export and locally validate App Store-signed 1.0.11 / build 45 IPA with the iOS 26.2 SDK. Source archive is unsigned; distribution export is signed.
- [x] Production-source Release iPhone 16 / iPad Pro 13-inch checks passed October 12 with iOS 26.2 SDK / iOS 26.3.1 runtime: modes, touch, pause/resume, backgrounding, reset, audio controls and save persistence.
- [ ] Validate exact candidate on physical iPhone and iPad, including cold offline launch and retained saves. Owner has neither device available; retain as unverified.
- [ ] Resolve age-rating guidance or explicitly retain the saved conservative 13+ rating for submission.
- [x] Upload/processing completed and build 45 selected for version 1.0.11; owner-only internal TestFlight enabled October 12. Final App Review validation remains separate.
- [ ] Obtain owner direction for the final review submission; retain manual release for publication.

For the store, use Android Studio's **Build > Generate Signed Bundle / APK > Android App Bundle** flow. Increment both `versionCode` and the visible version before every upload.

## Public launch record

October 23, 2026: published all four approved Google Play changes: full production rollout of 1.0.12 / build 50, revised English short description, and both tablet screenshot galleries. Console confirms today's publication and an empty approved-change queue; managed publishing remains enabled. The retained AAB checksum matches the October 17 submission. Store propagation and fresh Play-delivered update checks remain unverified. The 1.0.13 localization candidate remains unpublished pending language review. See `RELEASE_PROGRESS.md` for proof and validation limits.

October 17, 2026: published the seven approved Google Play changes, including full production rollout of 1.0.11 / build 49, with explicit owner authorization. Console confirmed publication; the store page loads with current release notes and disclosures. Policy status reports no issues. No pre-launch report is available, and outstanding physical-device checks above remain unverified. Publication does not mark those checks passed. See `RELEASE_PROGRESS.md` for evidence and the separate post-launch copy update.

September 11, 2026: owner authorized publication of 0.13.2 as a free public browser game with In development status. Public visibility was saved and verified after reload. Pending device, hosted offline, and outbound-link checks above remain follow-up work; publication does not mark them passed. See RELEASE_PROGRESS.md for payload checksum and rollback instructions.
