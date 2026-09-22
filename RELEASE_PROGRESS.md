# Seva Jump release progress

## Separate Android phone/tablet spacing - September 22, 2026

- Owner preferred the original full-width phone scene while retaining the corrected tablet border. Removed the reserved 48-pixel footer only below 600 CSS pixels; the phone mode label floats at the bottom. Tablet spacing, canvas proportions, safe areas and focus-scroll protection remain unchanged. Unusually short phones still fit to height to prevent cropping.
- Added a failing-before/passing-after phone width regression, Pixel-sized camera-cutout coverage and a short handset case. All nine Android browser layout cases and iOS exclusion passed, along with syntax/package checks. Updated web assets were synced and the separately named Android test APK built successfully with Java 21.
- Updated **SevaJump Test** on the physical Pixel 6. Refreshed only its service-worker caches and verified local progress survived. Actual 411 × 914 viewport: canvas left 0, right 411.43, top 135, bottom 866.43; frame scroll 0. Full-width scene, visible HUD/Pause and pause/resume passed, and the native screenshot `screenshots/phone-layout/pixel-gameplay.png` was visually inspected. Left the app on Home. The original app remains separate. Tablet behavior was regression-tested in the browser; this revised APK was not reinstalled on the disconnected tablet.
- APK: `dist/SevaJump-Test-1.0.1-phone-tablet.apk`, SHA-256 `d4fbfc1b31d9f99ce7a28e6a550fed307c5d994835ebe1b5322d43b4b83e5c52`. No iOS change or store publication.

## Physical Android tablet test installation - September 22, 2026

- After the owner confirmed the tablet looked better, the identical APK (hash below) was also successfully installed and launched on the connected Pixel 6 as **SevaJump Test** for phone regression testing. The original game is separate; phone gameplay validation is left to the owner.
- Owner authorized building and installing the fixes on the connected K70 PRO. USB debugging is authorized; the tablet reports 800 × 1280 physical pixels at density 213, with a 601 × 961 WebView viewport, confirming the compact-tablet layout path.
- Android debug build passed with Java 21. Updating the existing `org.sevajump.game` was rejected by Android because its signing certificate differs. Preserved that installation and its data; built and successfully installed a separately named **SevaJump Test**, package `org.sevajump.game.tablettest`, version `1.0.1-tablet-test` / code 39. The package suffix and label were applied through an ignored local Gradle init script and resource overlay, leaving production app metadata unchanged.
- Test APK: `dist/SevaJump-Test-1.0.1-tablet.apk`, SHA-256 `13542207829d140ee5007541a3938aa61491c3a41ca3e283e670c624a08d28ec`. This separate app starts with its own progress. Both the bird fix and Android fitting rules are packaged; no store upload or iOS build occurred.
- After the owner unlocked the tablet, physical-device checks passed: Android presentation loaded, frame scroll stayed at zero, the entire playfield/score/Pause remained visible, pause/resume worked, and About/Upgrades headings remained on-screen after gameplay. No JavaScript errors were observed. Native gameplay and Upgrades screenshots were visually reviewed under `screenshots/tablet-install/`; the test app was left on Home. WebView screenshot capture stalled once, so final visual verification used native device captures. Extended play and bird behavior on the physical tablet remain for the owner's testing.

## Android tablet clipping fix - September 22, 2026

- Reviewed all eight supplied tablet screenshots. Reproduced missing score/Pause controls and displaced menu headings in Edge with the Android bridge simulated at a 600 × 960 CSS viewport: the oversized 450 × 800 canvas caused focus to scroll the outer frame by 74 pixels, moving the entire HUD above the viewport. The user's physical device density was not measured.
- Scoped the fix to Android: fit either canvas size between the HUD and a reserved bottom navigation area without stretching; prevent outer-frame scrolling while preserving menu scrolling; respect menu safe areas; place achievement banners below the Android HUD. Small tablets can retain their existing 450-wide gameplay rules. No iOS presentation or gameplay tuning changed.
- Android layout regressions pass at 600 × 960 (touch and mouse), 800 × 1280 (touch and mouse), 960 × 1280, 700 × 850 and 393 × 808. They cover gameplay focus, pause/resume, Back confirmation, About/Upgrades/Badges/Stats/Settings and exclusion of Android styles from iOS. Phone/tablet gameplay and menu captures were visually inspected under `screenshots/android-layout/`. Runtime, service-worker, syntax and package checks passed; web source was synced to generated `www/`.
- Native smoke coverage now checks outer-frame scroll and complete playfield/HUD visibility. It has not been run for this fix: the owner's prior no-device-build instruction remains in effect. No new APK, device install, iOS build or publication was performed. Actual tablet WebView confirmation remains pending; the existing itch ZIP predates this Android layout change.
- The standard six-viewport browser suite also passed, including storage failures, iframe focus and first-visit offline play.

## Web-only bird and badge fixes - September 22, 2026

- Reproduced a bird stuck flickering at the screen edge when a 40 ms frame overshoots the boundary and subsequent 120 Hz frames repeatedly reverse its velocity. Edge handling now keeps an overshot bird flying inward. Regression coverage exercises both edges at 450 and 640 canvas widths, plus the pigeon in the browser suite.
- Lowered the achievement toast from 72 to 96 CSS pixels and included the top safe-area inset. Reviewed the phone-sized web capture under `screenshots/release-1.0.1/chromium/phone-badge-position.png`.
- JavaScript syntax, full gameplay/soak, runtime, service-worker, package, and all six Edge browser viewport checks passed, including storage denial, iframe focus and first-visit offline play. Created the local web test ZIP `dist/seva-jump-1.0.1-itch.zip` (SHA-256 `b583745d21e6a84f1554e4f834efe788a143fc35e12a0bc7abe140702a9998e9`). Browser tests used the source tree; extracted-ZIP/draft-host release validation remains pending.
- No native sync, Android/iOS build, device installation, or publication was performed, per the owner's web-only testing request. Physical-device confirmation remains pending.

## Google Play app record - September 21, 2026

- The replacement personal developer account is approved and Play Console reports no policy issues.
- Created the unpublished **SevaJump** game record with package name `org.sevajump.game`, default language English (United States), and free pricing. Play Console app ID: `4973543107979121743`.
- Accepted the required Developer Program Policies, Play App Signing, and US export-law declarations during app creation. Google Play automatic protection remains enabled at its default setting.
- No Android App Bundle, store listing, test release, or production submission has been uploaded or published.
- Play Console requires a closed-testing release with at least 12 testers continuously opted in for at least 14 days before production access can be requested. Complete game-information, store-listing, artifact-signing, and release checks before starting that test.

## Issue #1 Android migration - September 19, 2026

- Owner authorized the required Capacitor 8 installs and continuing local work while the replacement Play developer account was unverified. The September 21 Play Console status above supersedes that account-status blocker. No upload occurred during this migration work.
- Migrated core/android/CLI to 8.5.2 and App to 8.1.1, compile/target SDK to 36, minimum SDK to 24, AGP to 8.13.0, Gradle wrapper to 8.14.3 and AndroidX versions per the [Capacitor migration guide](https://capacitorjs.com/docs/updating/8-0). Android now requires Android 7.0+. CLI builds use Java 21; this machine's older Android Studio IDE was not upgraded or used for validation.
- Android versionCode is 39. Candidate marketing/web/cache versions advance to 1.0.1 so existing native installs receive the inset-aware phone HUD stylesheet instead of retaining the 1.0.0 service-worker cache. Matching iOS marketing metadata is aligned; its native build remains 38 until an iOS release. This is local migration validation, not an upload. Follow the version-increment/signing checklist before an upload.
- MainActivity retains safe-area/immersive ownership, disables Capacitor's duplicate inset handler, removes deprecated bar-color calls, guards early document injection and republishes insets after reload. The manifest declares the game category for the [Android 16 large-screen orientation exemption](https://developer.android.com/about/versions/16/behavior-changes-16#adaptive-layouts); predictive Back uses Capacitor App's AndroidX dispatcher without opting out.
- Required syntax, gameplay, runtime and package checks passed (2.1 million generated landings). `npm run android:debug` and `gradlew.bat bundleRelease` passed with Java 21. APK metadata reports minimum SDK 24, target/compile SDK 36 and versionCode 39. The release AAB is unsigned and has not been accepted by Play Console.
- Dependency audit reports three moderate entries from the CLI-only `xcode -> uuid` chain. Follow-up is recorded in `REVIEW_FOLLOWUPS.md`; no forced dependency overrides were applied.
- Android 15 and 16 phone (393 x 808, 450 x 800 canvas) and tablet (800 x 1280, 640 x 800 canvas) checks pass: five reloads without page errors, safe-area publication, undistorted canvas, non-overlapping HUD/Pause, menu/gameplay bar states, pause/settings/resume and actual native Back. Menu edge-swipe Back passed on both OS versions; Android 15 tablet used three-button navigation. A separate Android 16 Home Back exit also passed. The phone upgrade from 1.0.0 to 1.0.1 was tested without clearing data. Device-level home/gameplay captures were visually reviewed; reports/captures are under ignored `screenshots/release-1.0.1/native/`. All six browser viewport suites, storage failure, iframe focus and first-visit offline checks also passed.
- First Android 16 boot produced System UI/Google-service ANRs; later settled runs produced usable device captures. These emulator checks do not certify physical-device performance. Initial native test attempts also exposed a detached WebView selection and an undersized screenshot buffer; both harness problems are corrected.

## 1.0.0 candidate - September 19, 2026

- Owner requested promotion to 1.0.0 for the first Google Play release. Web display/query strings, service-worker cache, npm metadata and lockfile, Android versionName, and iOS marketing/Info.plist versions are aligned at 1.0.0. Android versionCode and iOS bundle build are 38. This does not publish an update or certify store readiness.
- All six gameplay/rule suites, all three runtime/service-worker suites, JavaScript syntax checks for game.js and sw.js, and package checks passed. Updated version-specific service-worker expectations and browser/native evidence output paths for this candidate.
- Capacitor sync and Android debug build passed with Android Studio's bundled Java after retrying outside the restricted sandbox. Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`. No signed release AAB, new device run, or iOS build was completed in this version-only pass.
- Historical 0.13.2 artifacts, checksums and launch records below remain unchanged. The API 36 migration, signing, native QA and store submissions remain open.
- Alternative Android distribution assessment and proposed priorities are in `ANDROID_DISTRIBUTION.md`. No license change or additional store registration is authorized by this research.

## Issue #6 validation - September 19, 2026

- PR #14 review correction: mid-gap bird spawning was reverted after the review's fairness regression report. The original 90 px offset and random sampling order are restored; next-platform clearance is deferred to issue #13/E4 for measured evaluation. The remaining issue #6 work stays in the PR.
- Validated after merging PR #12: the required syntax/test/runtime/package command passed, including 2.1 million generated landings. Optional browser checks passed at all six sizes, including desktop fullscreen, keyboard input, canvas fallback, storage failures, iframe focus and offline play.
- Capacitor sync and Android debug build passed using existing dependencies. Native WebView smoke flows passed on the phone (393 × 808 viewport, 450 × 800 canvas) and portrait tablet (800 × 1280 viewport, 640 × 800 canvas), covering menus, pause/settings/resume and Android Back handling.
- Native visual QA is not complete. The headless emulators showed graphics failures, black captures and a tablet System UI timeout. One tablet reload also captured a null-document error consistent with the unchanged Android inset injection; later smoke runs passed. Findings are recorded in `REVIEW_FOLLOWUPS.md`. No physical-device or iOS build validation was performed. CSP remains explicitly deferred pending Capacitor/iOS compatibility checks.

## Google Play preparation - September 18, 2026

Status: **not ready for Google Play submission**. The published browser baseline remains 0.13.2 (Android versionCode 37), commit `1b8af0b`.

- Checked the signed-in Khalsa Game Studio developer account in Play Console. Policy status says **Account closed**, dated September 12, 2024, because the account was not being used. The console explicitly directs the owner to create a new developer account to publish. This is an inactivity closure; do not describe it as a policy-violation ban. No replacement account or app has been created, and no Android release has been uploaded.
- Owner selected a **personal** developer account. The official signup URL redirects the currently signed-in studio Google account back to its closed account's policy page; replacement Google account selection is pending. No registration fee has been paid or agreement accepted. A new personal account requires at least 12 testers continuously opted into a closed test for 14 days before applying for production access. See [account requirements](https://support.google.com/googleplay/android-developer/answer/13628312), [testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465), and the researched recruitment plan in `PLAY_TESTING_PLAN.md`.
- Android currently compiles and targets API 35. Google's [current submission requirement](https://support.google.com/googleplay/android-developer/answer/11926878) is API 36 for new mobile apps from August 31, 2026. Upgrade the Android toolchain/target and verify Android 16 behavior, especially portrait/tablet layout and Back handling, before preparing the upload candidate. This migration has not been performed.
- Re-ran JavaScript syntax checks for game.js and sw.js, all six rule/procedural suites, all three runtime/service-worker suites, and package checks successfully. The soak test covered 3.5 million generated landings. This is baseline source/package evidence, not signed Android artifact validation.
- Verified the public [privacy policy](https://srajpal.github.io/seva_jump_game/privacy.html) loads in the browser. Final store contact details and declarations still need review.
- Existing release-media files are browser/itch assets. Google Play icon, feature graphic, native phone screenshots, and final tablet coverage remain open. No new signed AAB was produced; release signing is not configured in app/build.gradle.

Next sequence: establish the replacement account and complete verification; migrate and test the Android target; align the next candidate's versions; finish native device QA and Play assets/declarations; securely configure an upload key outside the repository; build and validate the signed AAB; upload to internal testing, then satisfy the account's closed-testing/production requirements. Preserve the published itch build and its historical evidence below.

Candidate: **0.13.2**, September 11, 2026. This is the current record; `ITCH_RELEASE_AUDIT.md` preserves the original 0.13.1 findings.

## Completed

- Fixed and verified all original F1-F11 findings: menus, Escape, saves, reset, viewport fitting, touch coordinates, focus and input loss, offline caching, scoped cache cleanup, studio links, and dialog semantics.
- Independent review found and verified additional fixes: fast-fall platform collisions, menus opening scrolled down, optional audio API failure, and saving recovering after a successful reset.
- Reviewed player-facing text and store copy for plain language. Updated README, AGENTS, architecture, testing, listing, privacy, and release instructions against the implementation.
- Recorded the creator’s artwork origin statement and Sikh content approval in `CONTENT_REVIEW.md`. No additional cultural approval is required for this chosen concept.
- All six gameplay/rule suites, runtime checks, actual-update gameplay checks, service worker checks, and package checks passed after the final source change. The soak suite covered 3.5 million generated landings; these simulations do not replace human playtesting.
- Coordinator reran the independent packaged journey tests successfully: UI purchases, settings, badges, both characters, all modes, saved records, and controlled win/loss results. Full natural victory playthroughs remain separate.
- Final extracted ZIP passed Chromium and Firefox browser suites: six viewport sizes, menus and focus, pointer mapping, interrupted input, denied storage, cross-origin iframe focus loss, and first-visit offline play with directory requests denied.
- Dependency audit: zero known vulnerabilities across 93 dependencies. This is evidence from the current audit, not a guarantee against every security defect.
- Curated package contains 33 runtime files. Package checks verify dependencies, case-sensitive paths, ZIP integrity, and repeatable output within the same Node/zlib runtime.
- Final cover and four screenshots regenerated and visually reviewed. About now opens at the top.
- Web/package/native marketing versions aligned at 0.13.2; native build number 37. Final Android debug build passed with Java 21. Earlier Android phone smoke test passed.

## Candidate artifact

`dist/seva-jump-0.13.2-itch.zip` — 25,835,896 bytes.

SHA-256: `a13f9a6a02914690b0f3228bb370e68ec1e73d2597af4b439d53348929c3c98e`

The adjacent `.manifest.json` records every payload hash; `.sha256` records the archive hash. `release-media/` contains the reviewed cover and screenshots. `ITCH_LISTING.md` contains the proposed page copy and settings. The archive was extracted into ignored `dist/final-verification` for browser testing.

## Remaining checks

- Final WebKit core checks passed, including storage and iframe focus. WebKit offline reload previously failed inside the Windows browser engine and remains unverified. Android tablet installation succeeded, but the emulator repeatedly stopped before the smoke test could connect; final native tablet validation remains blocked by the test environment.
- Physical Android Chrome and iPhone/iPad Safari, low-end sustained performance, and complete natural human victory runs remain unverified. Native iOS needs a Mac/Xcode; native store signing is separate from this browser release.
- The unpublished draft is created at https://khalsagamestudio.itch.io/seva-jump (project 4999359; owner sign-in required). The creator completed sign-in. ZIP and all five images uploaded successfully. Draft visibility and In development status were verified after saving; payments and mobile-friendly claims are disabled. AI disclosures include graphics, sounds, text, and code. Nothing is published.
- Hosted embedding, initial guide, live gameplay, fullscreen entry, pause/settings behavior, and reduced-motion persistence after page reload passed. The studio-link click did not expose a new tab in the in-app browser, so hosted outbound navigation remains unverified. Hosted offline operation and physical mobile support remain unverified. The host logged an unsupported orientation-lock error during fullscreen; fullscreen still opened. The listing does not promise hosted offline support. An optional separate downloadable ZIP has not been attached yet.
- Keep this candidate and its checksums for rollback. No previous published itch.io package exists in this task. Publication requires a separate decision after hosted review.

## Evidence and scope

Browser reports and screenshots are under ignored `screenshots/release-0.13.2/`. Repeatable commands are in `TESTING.md`. Tests use controlled state only in test harnesses; no test hooks are shipped. The working tree is uncommitted; the itch.io project is an unpublished draft. Pre-existing unused artwork was preserved and excluded from the release ZIP.

The candidate is uploaded to an unpublished itch.io draft. It is not yet certified for public release on itch.io or on physical mobile devices.

## Public launch — September 11, 2026, 21:19 EDT

The owner explicitly requested publication. Seva Jump 0.13.2 is now public at https://khalsagamestudio.itch.io/seva-jump. The editor reported Saved, and Public remained selected after reloading. It remains free with no payments and labeled In development while outstanding device and host checks remain open. No new build was uploaded; the checksum above identifies the published payload. Mobile-friendly remains disabled and the listing does not promise hosted offline support.

This launch record supersedes earlier references to an unpublished draft. Outstanding checks are follow-up work, not completed certifications. The repository remains uncommitted. To withdraw this version, change visibility to Draft; retain the ZIP and manifest for recovery.

## Launch devlog

Published September 11, 2026: “Seva Jump is on itch.io — getting 0.13.2 ready to play”.
https://khalsagamestudio.itch.io/seva-jump/devlog/1660735/seva-jump-is-on-itchio-getting-0132-ready-to-play

The post covers release fixes, browser testing, the JavaScript/canvas build, local saves, Android debug/phone emulator progress, iOS setup awaiting build/device tests, and next playtesting priorities. No app-store dates are promised. Published content and the four existing screenshot attachments were verified on the post page.

The launch devlog was revised at the owner's request: title changed to 'Seva Jump 0.13.2 is now on itch.io', em dashes removed, and wording shortened. Android/iOS progress and testing limits remain accurate. Future public copy should avoid em dashes and canned promotional language.

## Source code

The source repository is public: https://github.com/srajpal/seva_jump_game. No project license has been selected, so describe this as source code available, not open source. Bug reports and suggestions are welcome through GitHub issues. The 0.13.2 release work is being committed for the published itch.io build; earlier uncommitted status notes above describe the state before this source publication.
