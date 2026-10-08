# Seva Jump release progress

## October 8, 2026 — repository checkpoint validation

- Before committing the accumulated 1.0.10 changes, reran syntax checks for changed JavaScript, all six gameplay/rule suites including 2,170,000 generated landings, runtime/gameplay-runtime/service-worker checks, and 32-file package/version checks. All passed.
- Edge browser journeys passed across desktop, embedded, small-phone, phone, tablet and landscape layouts, including pre-run upgrades, menu placement, storage failures, iframe focus loss and first-visit offline play. All nine simulated Android layout cases and iOS styling exclusion passed.
- Rebuilt Android 1.0.10 / build 48 debug APK with Java 21 and synchronized web assets. Current local APK SHA-256: `84c8512be1c2c2b252073f79711e0eb0c38c3f1fea22cb921a16f03036584dd3`. This rebuild supersedes the earlier local debug artifact hash; no device installation, signed Play bundle upload, screenshot upload or store rollout was performed.
- Updated the README release summary and excluded the local `.codex-remote-attachments/` archive from Git. No signing files, generated bundles, source recordings or local QA captures are included in the checkpoint. Physical-device and iOS verification remain as previously recorded.

## October 8, 2026 — Google Play production-access application submitted

- Verified the live SevaJump Play Console dashboard: closed release published, at least 12 testers opted in, and at least 14 days of closed testing are all marked complete. **Apply for production** is enabled; production remains inactive.
- Verified 1.0.3 / Android build 41 is available at full rollout on Closed testing - Alpha, App Hive, Fiverr, and 12 Testers Live, plus Internal testing. The later 1.0.10 / build 48 candidate remains local; its changes have not been delivered through these Play tracks.
- Submitted the production-access questionnaire and verified the dashboard confirmation: **We have your application for production access**, applied October 8 at 11:18 AM (America/New_York). Google is reviewing the application and will email the account owner; the console says this usually takes seven days or less, occasionally longer.
- Owner confirmed recruitment was neither difficult nor easy, testers played daily when possible, and email feedback covered gameplay and controls. The supplied day-14 email reported smooth design/performance and a polished experience with no major issues. Answers describe that evidence without claiming every feature was tested by every tester. Recruitment sources were App Hive, 12 Testers Live, and Fiverr; first-year installs selected **I don't know** because no forecast was provided.
- Readiness answers cite the completed closed test, emailed feedback, and recorded automated gameplay, save/offline and phone/tablet layout checks. Changes answer distinguishes touch-dragging, menu-spacing and gameplay-pacing refinements in the newer local candidate from the 1.0.3 build delivered to closed testers. The pre-launch overview currently shows no generated report; no pre-launch pass was claimed.
- **Production access is pending review; no production release published.** Historical outstanding device and artifact checks remain open. Validate the final signed, Play-delivered production candidate before rollout.

## September 30, 2026 — 1.0.10 browser release published

- Published the curated 1.0.10 browser ZIP for play and the matching offline download at https://khalsagamestudio.itch.io/seva-jump . Both ZIPs contain the same 32-file build. SHA-256: `fefa9b7395177a14daa1ef791a20ad761929b88b6b7157390946478b5669e33b` (29,633,844 bytes each). The previous 1.0.3 uploads are hidden, not deleted.
- Replaced the itch.io cover and gallery with five current screenshots. Removed four older gallery images with owner approval; reserve copies remain under ignored `release-media/reserve-previous/`.
- Published the major-update devlog with release notes, both ZIPs and five current screenshots: https://khalsagamestudio.itch.io/seva-jump/devlog/1683903/seva-jump-1010-is-live . Published a studio Instagram gameplay-image update: https://www.instagram.com/khalsagamestudio/p/Dd6n9uUnFSG/ . Published a studio Facebook post with the current gameplay image on September 30; verified on https://www.facebook.com/people/Khalsa-Game-Studio/100083108727695/ . Direct Facebook post permalink remains to be captured.
- `npm run itch:build` and `npm run test:package` passed. Extracted the exact ZIP and ran `npm run test:browser` against it using Chromium/Edge: desktop, embedded, phone/tablet layouts, landscape, storage failures, iframe focus and first-visit offline passed. The public itch.io player loaded version 1.0.10 and Arcade gameplay started. Hosted offline, real mobile browsers and full manual mode coverage remain unverified.
- Android build 48 remains local and is not a Play Store release. iOS build 44 is metadata only. No native store publication is claimed.

## September 30, 2026 — 1.0.10 / Android build 48 prepared

- At the owner's request, incremented the tested candidate to 1.0.10 / Android build 48. Aligned HTML, package/lockfile, service worker, Android and iOS marketing metadata; iOS build 44 metadata only, no Xcode build. Updated cumulative release notes and current checklist.
- Includes all prior gameplay changes: pre-run upgrade choices, one activation per consumable per run, earlier isolated Arcade birds and the two-visible-bird limit. No additional gameplay changes in this version bump.
- Syntax, full rules/routes/2,170,000-landing soak, runtime/gameplay-runtime, service-worker and 32-file package checks passed. Java 21 Android debug build succeeded with web/native sync.
- APK: `android/app/build/outputs/apk/debug/app-debug.apk`. SHA-256: `c4bbf848a27921136c9e6bc4c6a9b83b15ae283c5fe7dcad9afdc483966b17e4`.
- Prepared only: not installed on either device or published. Last confirmed phone and tablet installations remain the September 29 1.0.9 / build 47 gameplay rebuild.

## September 29, 2026 — latest 1.0.9 / 47 rebuild installed on K70 PRO

- Installed the same gameplay rebuild as Pixel 6 on K70 PRO (`M90YCU16K2651116`) with `adb install -r`, preserving app data. Package manager verified 1.0.9 / build 47. Opened and reopened for offline-cache activation.
- Verified APK SHA-256: `e5cb4d94ea199862b5caf7ed04ad324745b4d81b59fe57def323e7bf77ff8da8`. Both devices now have the latest bird-spacing, introductory birds, upgrade switches and one-per-run consumable changes. No rebuild or publication; physical gameplay review remains with the owner.

## September 29, 2026 — 1.0.9 / 47 gameplay rebuild installed on Pixel 6

- Built and installed the pending one-per-run consumable limits and Arcade bird introduction/spacing changes at the owner's request. Retained version 1.0.9 / build 47 per the explicit version hold; advanced offline-cache revision to art6.
- Java 21 Android build, service-worker and package checks passed. Gameplay and soak validations are recorded below. Installed with `adb install -r`, preserving data, and reopened for cache activation. Package manager confirmed 1.0.9 / 47.
- APK SHA-256: `e5cb4d94ea199862b5caf7ed04ad324745b4d81b59fe57def323e7bf77ff8da8`. Supersedes the previous APK at the same local path. Pixel 6 now includes both previously pending changes; tablet is unchanged. No store publication.

## September 29, 2026 — boy Arcade finish recording prepared

- Moved the owner's 29-second Pixel 6 recording to ignored `release-media/source/arcade-boy-finish-pixel6-2026-09-29-original.mp4` (1080 × 2400, 57,957,493 bytes). The source begins with active boy-character Arcade play and includes the finish banner, celebration, and `Arcade complete!` result. No blank lead-in was observed in sampled frames.
- Encoded and verified `release-media/arcade-boy-finish-pixel6-2026-09-29-share.mp4`: 29 seconds, 720 × 1600, 4,196,121 bytes, SHA-256 `91C714D6045FB124CCE4BCB697D34B7612117A91A494BF623673DD64C8E5BE5D`.
- Prepared a finish-focused `release-media/arcade-boy-finish-pixel6-2026-09-29-short.mp4`: about 17 seconds, 720 × 1600, 2,204,783 bytes, SHA-256 `ABDFC75352F63B408205283D8051598CF859C03E553E893E26854F53CAB3C5BC`. Verified the first frame shows active play and a late frame shows the completed-result screen. Both copies retain audio tracks. No video was uploaded or published.
- A preliminary VLC transcode dropped part of the sequence despite reporting a 29-second container duration. It was replaced with the verified FFmpeg encode above; the preliminary copy must not be used. The local FFmpeg binary is kept only in ignored `release-media/tools/`.


## September 29, 2026 — pending Arcade bird pacing

- Reproduced unrestricted clustering with five birds in an 856px visible-height band (seed 123). Arcade now spaces bird centers so at most two can be visible, accounting for the 56px sprite height and partial birds at screen edges.
- Per creator follow-up, start occasional single birds at score 200 (8% chance per eligible row), with full 18% eligible-row chance and a two-bird limit from score 500. Introduction spacing exceeds a full visible-height band. Other modes retain their rules.
- Shared rule and actual-generator checks cover score boundaries, introductory spacing and the two-bird cap on both canvas widths. Full rules/routes/2,170,000-landing soak, runtime and package checks passed. Soak frequency measures spacing-eligible rows. Web bundle synchronized.
- Version remains 1.0.9 / Android build 47 as requested. No native rebuild, install or publication; this and the consumable limit remain pending.

## September 29, 2026 — pending one-per-run consumable limit

- Added a per-run shield-used flag to match the existing Falcon Save limit. Inventory is deducted only on activation; remaining shields cannot activate again in the same run. Restart resets availability. Four-second shield protection and collected boosts remain unchanged.
- Both HUDs now show one available consumable, Off or Used instead of suggesting the full inventory is available this run. Disabled/used shield artwork is hidden once its protection animation ends. Added a concise pre-run note and README/release-note documentation.
- Syntax, runtime/gameplay-runtime, full gameplay/soak and package checks passed. Regression covers two owned shields, first activation, free protection during the active window, a later unprotected hit preserving the second item, and availability next run. Web bundle synchronized; no native rebuild, installation, version bump or publication. Pixel 6 remains on the preceding 1.0.9 / 47 APK.

## September 29, 2026 — gameplay clips trimmed after owner review

- Owner found the first 7–8 seconds of the initial compressed copies blank or still. Replaced both shareable files with trims beginning about eight seconds into the untouched original. The original remains in ignored `release-media/source/` for future recuts; the untrimmed compressed copies should not be used.
- Updated long copy: `release-media/gameplay-pixel6-2026-09-29-share.mp4`, 62 seconds, 720 × 1600, 19,149,104 bytes, SHA-256 `78DD1390CF93B83837E2F2CD90C37F1CF8A207BD10AF6A8348437C90C0B35067`.
- Updated short copy: `release-media/gameplay-pixel6-2026-09-29-short.mp4`, 18 seconds, 720 × 1600, 6,007,963 bytes, SHA-256 `096D7DD61D8126E13C1D56BA9E157928824ABE4497801408E6BBC6E5058506B7`.
- Both MP4s contain video and audio tracks. First-frame visual review shows the player mid-run, and sampled frames from the opening seconds differ substantially, confirming visible motion. Neither clip is published. The original capture and the earlier encoding metrics below are retained as historical notes; these replacement hashes are authoritative.


## September 29, 2026 — 1.0.9 / Android build 47 installed on Pixel 6

- At the owner's request, installed the verified prepared APK on Pixel 6 (`1B291FDF6002DD`) using `adb install -r`, preserving app data. Package manager confirmed versionName 1.0.9 and versionCode 47. Opened and reopened the app for offline-cache activation.
- APK SHA-256 matches the prepared artifact: `f2fa595abc85453d85b004b9411251672a6aa8baf3640095498aae59903a6266`. Includes pre-run upgrade switches and Badges subtitle removal. No rebuild or publication. Tablet remains on 1.0.7 / build 45; phone user testing is pending.

## September 29, 2026 — gameplay recording preserved

- Moved the owner's Pixel 6 gameplay recording from Downloads to ignored `release-media/source/gameplay-pixel6-2026-09-29-original.mp4` (69 seconds, 1080 × 2400, 155,408,804 bytes). The original stays local to avoid adding a 155 MB binary to Git.
- Made a 720 × 1600 H.264/AAC sharing copy at `release-media/gameplay-pixel6-2026-09-29-share.mp4` (69 seconds, 21,806,271 bytes; SHA-256 `B5008EE27E2653F2D41A5F7F05CC61C917B13EC8CC108160EEFFF5C584ABF1B3`) and a 19-second clip at `release-media/gameplay-pixel6-2026-09-29-short.mp4` (6,578,959 bytes; SHA-256 `1E2A147944753BB69FDE24F23E6AF322DD6105C298A8458243EA3A6D0CD16299`). Sampled frames show gameplay without phone notifications. No video has been uploaded or published.
- The recording shows the newer local art. Keep any public promotion aligned with the version visitors can play; itch.io still serves 1.0.3.


## September 29, 2026 — 1.0.9 / Android build 47 prepared

- Added an owned-upgrades-only pre-run panel for mode selection and restart. Falcon Save, Dhal Shield and Power Jump choices persist locally; defaults preserve prior enabled behavior. Cancel/Back/Escape returns Home without consuming items. No inventory skips the panel. First-run tutorial still follows confirmation.
- Disabled consumables are unavailable to collision/fall handling; disabled Power Jump uses level zero for initial jumps, landings, rescue relaunch, reachability and collected Kara boosts. Purchased levels/inventory remain intact. Both HUDs show Off; disabled shield art is hidden. Collected Kara/Nishan boosts still function.
- Includes removal of the Badges subtitle. Version metadata aligned to 1.0.9 / Android 47 / iOS 43; no iOS build. Updated README and cumulative release notes.
- Syntax, full rules/2,170,000-landing soak, runtime/gameplay-runtime, six-layout browser journeys and package checks passed. New tests cover all modes, preservation, reenabling, persisted choices, owned-only rows, bypass and cancel. Reviewed phone/tablet browser screenshots of the new panel.
- Android debug build succeeded. APK: `android/app/build/outputs/apk/debug/app-debug.apk`; SHA-256 `f2fa595abc85453d85b004b9411251672a6aa8baf3640095498aae59903a6266`. Not installed or published. Last confirmed installs remain Pixel 6 1.0.8 / 46 and K70 PRO 1.0.7 / 45. Physical-device validation pending.

## September 29, 2026 — refreshed screenshot set prepared, itch.io update pending

- Captured the current local 1.0.8 cover and 13 portrait screens in `release-media/`; visually reviewed a contact sheet. The gallery candidates are gameplay, Home, Upgrades, Badges and About. `run-result.png` is a controlled result-screen capture, not a natural playthrough. Previous tracked cover and four gallery captures are reserved under `release-media/reserve-previous/`.
- Include the updated app icon in the media rollout. The local source is `assets/app-icon-bird-v1.png`, with Android launcher exports under `android/app/src/main/res/mipmap-*/` and iOS AppIcon exports under `ios/SevaJump/App/Assets.xcassets/AppIcon.appiconset/`. The branding update was prepared in 1.0.6 and remains in the newer local candidates; it has not been published to a native store. The itch.io cover is a separate promotional image, so verify its replacement independently of the app icon.
- The later 1.0.9 candidate adds a pre-run panel, so this 1.0.8 capture set is no longer a complete image of every current screen. Recapture that panel and review the full set before a 1.0.9 media upload.
- The public itch.io browser game still serves 1.0.3 and its four older gallery images. The older 0.13.2 launch devlog also contains four old inline screenshots. Do not replace public media with 1.0.8 images before a matching 1.0.8 browser upload and hosted test. The newer 1.0.3 devlog has no inline screenshots; Google Play is not published and Facebook release content remains a draft.
- Five fresh images were staged in the itch.io editor but not saved. Automatic approval review rejected saving a nine-image mixed old/new gallery and rejected navigating away because it would discard the staged edits. No public itch.io media change is verified. The editor tab remains staged for owner review; after the matching build is published, remove the old four, reorder the new five, save, and verify the public gallery. Replace the cover and update old devlog attachments only with matching-version context or a clear historical label.


## September 27, 2026 — 1.0.8 / Android build 46 installed on Pixel 6

- Packaged the pending 14-badge expansion, Boost Seeker rename, difficulty ordering and Gurdwara capitalization at the owner's request. Aligned web/Android version 1.0.8, Android build 46 and iOS build 42 metadata; no iOS build.
- Syntax, runtime/gameplay-runtime, service-worker and package checks passed; full gameplay/soak and six-layout browser coverage passed for the badge changes in the preceding work. Java 21 Android debug build succeeded.
- Installed with `adb install -r` on Pixel 6, preserving app data. Package manager verified 1.0.8 / 46; app opened and reopened for offline-cache refresh. APK SHA-256: `d4cf272d2bb779b5a958b7fdac6cd7cd59a9585dda31871e7babccd3c75d8dff`.
- Tablet remains on 1.0.7 / build 45. No store publication. This entry supersedes the pending status below.

## September 27, 2026 — pending badge expansion, not installed

- Added Perfect Arcade, Boost Master (25 cumulative Kara/Nishan boosts), Both Feet In (Arcade win with each character), and Comeback Kid (Arcade win after a Falcon Save). Renamed Power Seeker to Boost Seeker, retaining its stable save ID and five-boost criterion. Historical boost totals count; past character-specific wins cannot be inferred.
- Reordered 14 badges approximately easiest to hardest. Definitions, save compatibility and creator decisions are recorded in `BADGES.md`. Capitalized Gurdwara in Help, README and prepared store copy; recorded the durable preference in `SIKHI_TEXT_REVIEW.md`.
- Syntax, full rules/soak suite, targeted achievement/runtime tests, six-layout browser checks and package validation passed. Phone-sized capture confirms all 14 badges and Back fit at 390×844; smaller screens can scroll. Web bundle synchronized. Cache revision advanced to art5 for eventual packaging.
- No version/build bump, Android rebuild, device installation or publication performed for this batch. Both devices retain installed 1.0.7 / build 45 from the preceding entry, without these badge changes. Existing APK and checksum remain unchanged.

## September 27, 2026 — 1.0.7 installed on Pixel 6

- At the owner's request, installed the same verified 1.0.7 / Android build 45 APK on Pixel 6 (`1B291FDF6002DD`) using `adb install -r`, preserving app data. Package manager confirmed versionName 1.0.7 and versionCode 45. Opened the app and reopened it for offline-cache activation.
- APK SHA-256: `64d6e3f6513d1427e821a6cb59dd861f30e9a81798378b45612c34a53818423a`. Both phone and tablet now have this testing build. No rebuild or publication; owner testing continues.

## September 27, 2026 — 1.0.7 installed on K70 PRO tablet

- At the owner's explicit request, installed the prepared 1.0.7 / Android build 45 APK on connected K70 PRO tablet (`M90YCU16K2651116`) with `adb install -r`, preserving app data. Package manager verified versionName 1.0.7 and versionCode 45. Opened and reopened the app for offline-cache activation.
- APK hash matches the prepared artifact below: `64d6e3f6513d1427e821a6cb59dd861f30e9a81798378b45612c34a53818423a`. No rebuild, store upload or publication. Tablet user testing remains in progress; installation alone does not establish full visual validation.
- The earlier hold still applies to publication and further version changes. Pixel 6 was not updated by this operation; last confirmed phone version is 1.0.6 / build 44.

## September 27, 2026 — 1.0.7 / Android build 45 prepared, installation pending

- Unified all 13 overlay screens with safe vertical centering inside their existing padding; overflowing content falls back to top alignment. Includes Home, Upgrades, Settings, Badges, Stats, Help, privacy, tutorial, pause, results and confirmation/info dialogs.
- Browser regression now measures the first/last content bounds of every overlay at six viewport sizes, confirming centered fitting content and reachable overflow headings. All browser journeys, runtime/gameplay-runtime, service-worker and 32-file package checks passed. Reviewed phone-sized Upgrades, Settings and Badges captures under `screenshots/release-1.0.3/chromium/` (legacy test output directory name).
- Version 1.0.7 / Android build 45 / iOS build 41 metadata aligned. Java 21 Android debug build succeeded. APK SHA-256: `64d6e3f6513d1427e821a6cb59dd861f30e9a81798378b45612c34a53818423a`.
- Pixel 6 was disconnected when installation was attempted (`device not found`); this build is NOT installed. Last confirmed installed version remains 1.0.6 / build 44. Physical phone/tablet validation of this layout is pending. No iOS build or store publication.

## September 27, 2026 — 1.0.6 / Android build 44 installed

- Added a 24-frame Y-axis Khanda coin turn (2.4-second full turn), derived once from the approved master with unchanged glow/size/collision bounds. Reduced Motion holds frame zero. Creator clarified Mario-style Y-axis spin, superseding Z-axis request; phone screenshot `screenshots/khanda-105-check.png` had confirmed the new gold-rimmed artwork was already visible in 1.0.5.
- Updated web and native launcher icons, Home title logo, and local promotional cover. Creator chose zoomed-in bird/bowl composition. Adaptive Android source includes mask padding; iOS RGB icon catalog exported but not built/tested in Xcode. Masters, old icon and prompts are in `design/branding/`.
- Aligned version 1.0.6 / Android build 44 / iOS build 40 metadata. Java 21 debug build succeeded and installed on Pixel 6 with `adb install -r`; app reopened for offline-cache refresh. No publication.
- Syntax, runtime/gameplay-runtime, service-worker, six-layout browser and 32-file packaging checks passed. Runtime regression checks verify changing cached token frames and Reduced Motion face-on selection. Full gameplay/soak suite passed for 1.0.5 immediately before these rendering-only changes. Native tablet and iOS visual checks remain outstanding.
- APK SHA-256: `e33d02fcddb8634058530cebb6865b444855b0736370f05564976059c760c5e5`. Local artifact: `android/app/build/outputs/apk/debug/app-debug.apk`. Supersedes previous local builds.

## September 27, 2026 — 1.0.5 / Android build 43 installed

- Adopted the new clean gold-rimmed Khanda token and retained the compact badge layout. Runtime token path is unchanged; previous design preserved outside shipped assets. Offline cache now uses version 1.0.5 with art4 revision.
- Aligned HTML, package/lockfile, service worker and Android versions to 1.0.5; Android build 43. iOS marketing/Info.plist version 1.0.5 and build 39 metadata only; no iOS build or device validation.
- Java 21 Android debug build succeeded; web assets synchronized. Installed on Pixel 6 with `adb install -r`, preserving progress, then reopened for cache refresh.
- Syntax, full rules/routes/2,170,000-landing soak suite, runtime/gameplay-runtime, service-worker and 31-file package checks passed. Six-layout browser checks passed for the compact badge layout immediately before the token/version update; final token gameplay appearance still needs owner review. Native tablet testing remains outstanding.
- APK: `android/app/build/outputs/apk/debug/app-debug.apk`. SHA-256: `aabbf3e1607fb010de6519b4f41b2b83022afdd94916d864071cfa62baace480`. Supersedes previous local artifacts. No store upload or publication.
- Updated cumulative release notes, current checklist metadata, art direction and token provenance. Older sections below are historical and do not describe the current artifact.

## September 27, 2026 — compact badges follow-up

- Replaced tall badge cards with compact medal-and-text rows in two wider columns. Browser verification confirms all ten badges and Back fit without scrolling at 390×844 and 768×1024; 320×568 retains accessible scrolling. Runtime, six-layout browser, service-worker and package checks passed. Native tablet appearance remains unverified.
- Android debug 1.0.4 / build 42 rebuilt and installed on Pixel 6 with `adb install -r`, preserving data. Offline cache revision advanced to `art3`. APK SHA-256: `7dfebbb9ed8ae6d4010b040ce893262b01dc40d37df85d5fd276a71a1641d3f8`. Supersedes previous local APK; not published.
- Alternative Khanda token remains a design preview under `design/`; not included in this build.

## September 27, 2026 — art-refresh rebuild installed on Pixel 6

- Subsequent phone-shadow fix: reproduced heavy selected-character shadows on Pixel 6 and web. Removed both stacked Home drop shadows and selection enlargement; expanded jump crop height from 526 to 545 to leave shoe clearance. Runtime and six-layout browser checks passed. Rebuilt and installed with `adb install -r`, then reopened and captured `screenshots/phone-shadow-fixed.png`. The first reinstall retained old styling in the same-version offline cache; added the `art2` cache revision, rebuilt/reinstalled and reopened. Final direct phone capture confirms clean outlines and complete shoes. Latest APK SHA-256: `0d1a2c8aeea8300ef0f3ea4b88c7628de3db3d676ac10b8542353648d5a9434d`; supersedes the art-refresh checksum below.

- Rebuilt local debug candidate 1.0.4 / build 42 with the avatar, foreground-art, upgrade/badge and Help updates. Retained this local testing version; no store upload.
- Java 21 `npm run android:debug` succeeded after retrying outside the restricted sandbox (Capacitor's environment lookup failed inside it). Web assets and Capacitor Android wrapper synchronized.
- `adb install -r` succeeded on the connected Pixel 6, preserving app data without uninstall/reset. Opened `org.sevajump.game/.MainActivity`; package manager confirmed versionName 1.0.4 and versionCode 42.
- APK: `android/app/build/outputs/apk/debug/app-debug.apk`; SHA-256 `e258a71f76658013c3ed984a1aa3bff079e80e8af46f8582a978868e75a07983`.
- This supersedes the September 26 APK at the same local artifact path. Physical gameplay/art review by the owner remains pending; no tablet installation, iOS build or publication performed.

## 1.0.4 / Android build 42 — local device candidate, September 26, 2026

- Version metadata and web cache updated to 1.0.4; Android build incremented to 42. iOS marketing version aligned; no new iOS build.
- Package/version checks and Java 21 Android debug build passed. Installed with data preserved on Pixel 6 (`1B291FDF6002DD`) and reopened. Android package manager confirmed `versionName=1.0.4`, `versionCode=42`.
- Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`; SHA-256 `50457a20f54dcf25c27a68a0ab2c8555c60fb3ee338945bba530f74750eb5e82`.
- Includes the testing-feedback changes and persistent friendly stuck banner below. Device play verification, tablet update, signed release artifact and Google Play upload remain pending. Not published.

## Unreleased testing-feedback changes — September 26, 2026

- Follow-up: Challenge and Hard now show a high-contrast persistent stranded banner with Pause guidance; the stuck timeout no longer ends those runs. Banner clears when reachability returns. Normal loss/completion rules are unchanged. Regression coverage includes persistence beyond the old timeout and desktop/native rendering after transient messages expire.

- Implemented relative touch dragging with per-contact anchoring and second-finger protection; added regression checks for recontact and focus loss.
- Fixed the native/mobile rendering path suppressing the stranded-run warning. Hard still intentionally has no Helping Hand assistance. Added a native warning-render regression check and visible mode scope in Settings.
- Increased pause/results button spacing; moved best scores to Records & Stats; standardized About cards, typography and spacing; corrected “Spend these on upgrades.”
- Reviewed privacy against local storage, dependencies, Android permissions, iOS privacy declarations and Google Play user-data guidance. Updated both `privacy.html` and the in-app policy to September 26, 2026 with developer identity, privacy contact, deletion/retention information and voluntary support-email handling. Hosted policy deployment remains pending.
- Passed syntax, full rule/generator/soak suite (2,170,000 generated landings), runtime/gameplay/service-worker checks, package checks, Edge browser journeys across six viewport sizes, simulated Android layouts across phone/tablet sizes, and final controlled-result/persistence journeys against the current source. Visually inspected phone About and Records captures. Android debug build succeeded with Android Studio's bundled Java after the default Java 17 build failed.
- Pending: hands-on touch feel and native phone/tablet verification; release version/build increment, release notes, signed candidate and internal testing before any closed-track update. These changes remain unpublished; version metadata still identifies the previous 1.0.3/build 41 baseline.
- Deferred: Arcade personal-best stopwatch, to be developed and tested separately.

## 1.0.3 / itch.io full-launch package and Android build 41 — September 22, 2026

- Owner requested a full web launch with release notes and a Google Play release build. The web package was published on itch.io on September 22, 2026 (September 23 UTC). Android build 41 was published to Internal testing September 22, 2026 at 10:25 PM, then submitted for full rollout to Closed testing - Alpha and Closed testing - App Hive. On September 23, a third track, Closed testing - Fiverr, was configured and submitted as described below. The fixes described immediately below are included in 1.0.3.
- Visible web/cache/npm versions and native marketing metadata are 1.0.3; Android versionCode is 41. iOS build remains 38 with no new iOS build. Cumulative history and separate player-facing itch/Play copy are in `RELEASE_NOTES.md`; upload-ready copies are `dist/SevaJump-1.0.3-itch-release-notes.md` and `dist/SevaJump-1.0.3-play-release-notes.txt` (282-character English Play notes).
- Web ZIP: `dist/seva-jump-1.0.3-itch.zip`, 25,847,152 bytes, SHA-256 `849fd370541d72df0987f2ed7710e3b335f4ff7dd4cb5b9d8ab2cebc1c5017bd`. Manifest and checksum sidecars included. Fresh extraction: `dist/verify-1.0.3/`. Retained the previously published 0.13.2 ZIP and earlier candidates for rollback.
- Signed Play AAB: `dist/SevaJump-1.0.3-build41-play.aab`, 29,501,619 bytes, SHA-256 `7e43d1e000b4277d68b4a4ecd64ace55f7e547483f8aa20ef10600b0f0d9f4e3`; checksum sidecar included. Built with Java 21 and the existing upload key. JAR signature verification passed; certificate SHA-256 matches the prior bundle (`EE:92:43:19:E8:41:FD:0C:C5:DC:B4:F9:94:02:67:0A:C8:87:CC:82:89:8A:0D:CF:D9:70:57:F9:D3:40:AB:BD`). Expected self-signed/no-timestamp warnings remain. Release manifest identifies `org.sevajump.game`, version 1.0.3/code 41, without a debug flag or test suffix. All 33 runtime payload hashes match between the web manifest, ZIP and signed AAB.
- Validation passed: JavaScript syntax; full rule/gameplay/soak suite (2,170,000 generated landings); runtime/service-worker; package/version checks; exact extracted ZIP in Edge and Firefox across six viewport sizes, fullscreen, iframe focus loss, denied storage and first-visit offline play; direct local-file launch/play/pause. Additional extracted-package journeys covered preferences, upgrades, badges, both characters, all modes, controlled win/loss results, stats and reload persistence. Controlled results do not certify natural full playthroughs. Phone Home capture was visually reviewed. Evidence is under `screenshots/release-1.0.3/`. WebKit/Safari was not tested in this pass.
- The exact 1.0.3 ZIP was uploaded to the public [itch.io page](https://khalsagamestudio.itch.io/seva-jump) on September 22, 2026. The hosted iframe displayed v1.0.3 and passed a smoke check for starting Endless, pausing, and opening Settings. The itch.io project status was changed to Released. The [1.0.3 release devlog](https://khalsagamestudio.itch.io/seva-jump/devlog/1673901/seva-jump-103-is-out-full-release) is public with the new ZIP attached. With explicit owner authorization, a separate `seva-jump-1.0.3-offline.zip` was uploaded as a downloadable file and the 0.13.2 download was hidden, not deleted. The offline ZIP is an exact copy of the browser ZIP: 25,847,152 bytes, SHA-256 `849fd370541d72df0987f2ed7710e3b335f4ff7dd4cb5b9d8ab2cebc1c5017bd`. The public page shows Run game and only the 1.0.3 offline ZIP in Download; the editor shows 0.13.2 hidden and the 1.0.3 browser ZIP still selected for play. The earlier 0.13.2 ZIP remains in `dist/` for rollback.
- On September 23, the existing public 1.0.3 devlog was updated to explain offline ZIP use and the hidden 0.13.2 download. The 1.0.3 offline ZIP was attached to the post alongside the browser-play ZIP. The saved public devlog was reopened and both the new paragraph and attachment were visible.
- On September 23, Closed testing - Fiverr was verified with the Fiverr email list selected exclusively (36 users), 176 named countries/regions plus Rest of World (177 total), track status resumed, and feedback routed to `khalsagamestudio.apps@gmail.com`. Build 41 (1.0.3) and its existing English release notes were submitted for full rollout. Play now shows all seven Fiverr-track changes under **Changes in review** while automated quick checks run; Play states that the changes will be sent for review automatically after successful checks. The only artifact warning is the expected missing deobfuscation file for an app that does not use R8/ProGuard.
- On September 23, a separate Closed testing - 12 Testers Live track was created so the existing Fiverr email-list access would not be replaced. It targets all 177 countries/regions, grants access through `12testerslive@googlegroups.com`, routes feedback to `khalsagamestudio.apps@gmail.com`, and uses build 41 (1.0.3) with the existing English release notes. Its seven changes were submitted and Play shows them under **Changes in review** while automated quick checks run.
- Native behavior evidence is the phone/tablet Android 16 emulator pass immediately below, before this metadata-only version increment. No physical device or exact Play-delivered 1.0.3 installation was tested. **Google Play status: available to Internal testers; Closed testing - Alpha and Closed testing - App Hive were previously submitted, and Closed testing - Fiverr is in Changes in review pending automated checks; not released to production.** Test the exact Play-delivered update, including save retention and offline launch. Hosted offline behavior, outbound links, natural full playthroughs, mobile browsers, WebKit/Safari, and lower-end performance remain open checks. No Git commit or push was performed in this publication pass.

## Android Back and collision fixes included in 1.0.3 — September 22, 2026

The following records work completed before the 1.0.3 publication above. Android store delivery is still pending.

- Reproduced failing regressions for About Back opening the exit prompt and birds missing head contact. Android Back now retraces internal menus, pauses/resumes gameplay, and backgrounds the app from Home, following Android navigation guidance. Tutorial Back steps backward or cancels without marking it complete.
- Replaced the bird's small square contact test with stable body geometry covering the player's head through feet and the bird's body. Platform landings now use a narrower foot contact area and the visible surface, interpolating player/platform positions at the vertical crossing so late sideways overlap cannot create an unsupported bounce. Reachability checks use the same surface geometry.
- Passed syntax, full gameplay/rule/soak (2,170,000 generated landings), runtime/service-worker, package, nine Android layout cases and six standard browser viewport suites. Native Android 16 gesture-Back smoke checks passed at phone (412 × 915) and tablet (800 × 1280) sizes, including menu navigation, pause/settings/resume, Home-to-launcher, reopening and saved-progress preservation. Reports/captures: `screenshots/release-1.0.2/native/unreleased-back-collision-*`. These are emulator checks; no physical phone/tablet was connected for this pass.
- Synced web assets and built the Android debug APK successfully with Java 21. These changes are tracked under Unreleased; version metadata remains 1.0.2/build 40 and the previously prepared Play AAB below has not been rebuilt or published. A future store candidate needs its own version increment and release validation.

## 1.0.2 / Android build 40 — September 22, 2026

- Prepared on `codex/release-1.0.2`, merging current `origin/main` (`1d9c0f3`) so the existing Play build's gameplay/settings changes are retained alongside the bird-edge, achievement-banner and Android layout fixes. Included the owner's pending promotion-document updates. Added player-facing notes in `RELEASE_NOTES.md`.
- Web/cache/npm and Android versions are 1.0.2; Android versionCode is 40. iOS marketing metadata is aligned for package consistency, while its native build stays 38; no iOS build or UI changes were made for this release.
- All gameplay/rule suites passed (2,170,000 generated landings), plus JavaScript syntax, runtime, service-worker, package, nine Android layout cases and all six standard Edge viewport suites with actual offline, denied storage and iframe focus coverage. Physical Pixel/K70 checks above cover the fixes before integration with newer main; a smoke test of the exact Play-delivered 1.0.2 package remains pending.
- Built the production `org.sevajump.game` release AAB with Java 21 and the existing upload-key configuration from the prior Play release worktree. No test package suffix or debug flag. JAR integrity verification passed; the signing certificate SHA-256 matches the previously signed 1.0.1 bundle (`EE:92:43:19:E8:41:FD:0C:C5:DC:B4:F9:94:02:67:0A:C8:87:CC:82:89:8A:0D:CF:D9:70:57:F9:D3:40:AB:BD`). Standard self-signed/no-timestamp verification warnings are expected for this upload key. All 33 packaged runtime source files match this checkout.
- Upload artifact: `dist/SevaJump-1.0.2-build40-play.aab`; SHA-256 `c3292cb6b5dc008df4d6f41b9963c5d6dca995e1dd0d6de4570fd1b6c77f87c4` (sidecar included). Signing secrets, native binaries, generated web copies, screenshots and nested worktrees are excluded from Git.
- Status: conditionally ready for Play testing, pending Console acceptance and exact Play-installed update/save/offline smoke checks. This task prepares the bundle; it does not upload, roll out, or publish a store release. The existing 1.0.1 release worktree retains prior Console/signing preparation records.

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
