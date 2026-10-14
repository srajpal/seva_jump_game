# Current Watch prototype — 0.7.0 / build 7

Prepared October 13, 2026 from owner feedback that drag catch-up felt wrong and the route needed variety.

- Touch drag now sets both character position and steering destination immediately, within the same 12–188 horizontal bounds. It requests an immediate redraw. Crown retains paced steering; paused dragging remains ignored. This removes the intentional chase behind a finger, though simulator event/render latency still cannot be eliminated or certified by model checks.
- First five platforms stay wide/solid. Later platforms cycle through three crumbling wood, one narrow grass and one wide grass per five platforms, using existing copied artwork. Spacing is unchanged from 0.5. Narrow solid width is 42, wide solid 68; wood remains 42 with immediate collision disablement and fade on landing.
- Parshad appears on one in three non-start platforms. Every first landing is still recorded for route progress, but only an occupied platform awards parshad; repeated landings cannot award it twice. Renderer and collision award use the same presence rule.
- Pure Swift checks passed: direct drag/bounds/paused input, mixed generation, occupied/empty/repeated parshad landings, fixed-step timing and all prior hazard/persistence checks. All 100 scripted 90-second routes passed with normal birds, and the separate spacing-only pass also passed. Native UI checks on 46mm watchOS 26.2 passed both tests, none failed/skipped (`build/Watch07Variety.xcresult`): Crown movement, drag gesture, pause/resume, music playback/mute/loop preview, saved settings and high-score retention after reopening. The 42mm simulator has not been retested for 0.7. Current app: `build/Version07/Build/Products/Debug-watchsimulator/Seva Watch Lab.app`; reopened for the owner. Direct-touch feel still needs hands-on confirmation. No new modes, assets, network services or release/store actions.
- All 246 protected original files retain their hashes. iPhone/iPad source and signed release remain unchanged.

## Extended verification — October 14, 2026

- Added 25 ten-minute direct-drag model routes with 0.2-second reaction delays, normal birds and unchanged production rules. All survived without rescues, minimum score 12580. Verified exact occupied-platform awards, more empty than occupied landings, both solid and wood landings, and saved best after pause. These are simulations, not ten minutes of human/native UI input.
- Repeated native controls/music/high-score checks on both 42mm and 46mm. Both tests passed on each size (`build/Watch07LongBoth.xcresult`); no app gameplay code changed in this testing pass.
- Separate 90-second native audio preview test passed on 46mm (`build/Watch07Music90.xcresult`, one test, no skips/failures): playback remained active at 30/60/90 seconds, muting stopped it and the original Music preference was restored. This tests foreground AVAudioPlayer looping, not audio quality or continuous gameplay survival.
- All 246 protected original files and the signed iOS IPA retain their hashes. No iPhone/iPad or App Store changes.

---

# Historical Watch prototype — 0.6.0 / build 6

Updated October 13, 2026. Owner reports intermittent lag/speed changes while dragging in Simulator.

## Timing investigation

Confirmed code issue: 0.5 advanced exactly one physics step per Timer callback, regardless of elapsed time. Missing callbacks slowed the simulation, which resumed ordinary speed once delivery recovered. This provides a plausible contributor to the report; the owner's specific intermittent drag lag has not been reproduced under measured native input and cannot yet be attributed entirely to this issue.

The View now uses a monotonic-clock fixed-step accumulator at the existing 30 Hz. Ordinary jitter preserves elapsed gameplay time. Recovery is capped at three steps (0.1 seconds) per callback; large stalls discard excess time to avoid a long burst through multiple jumps. Pause/start/resume reset timing. Each substep processes its own sound/rescue/finish events. Physics constants and 0.5 spacing remain unchanged. Drag still sets a destination, approached at 180 world units per second; following behind a rapidly moved finger is expected behavior. Crown and drag share the same steering destination; no additional input defect was confirmed.

Pure Swift checks passed: regular and jittery 30-second callback sequences both produce 900 steps; long stalls cap recovery; pause reset discards elapsed pause time. All existing route, 100-seed 90-second runs (with and without normal birds), crumble, rescue and saved-score checks passed.

Native regression checks passed on the 46mm watchOS 26.2 simulator: two tests, zero failures/skips (`build/Watch06Timing.xcresult`). They exercised Crown movement, touch drag, pause/resume, gameplay music/mute, preview beyond two loops, preference persistence and saved high-score retention after restart. Current app is `build/Version06/Build/Products/Debug-watchsimulator/Seva Watch Lab.app`; reopened on Home for the owner. The 42mm device has not been retested for this timing-only revision. Longer owner-controlled drag play remains necessary; automated survival is not hands-on evidence. Physical Watch input/audio/performance remain unverified.

Changes confined to `prototypes/watch/`. iPhone/iPad source, signed build and App Store settings untouched.

---

# Historical Watch prototype — 0.5.0 / build 5

Updated October 13, 2026. Local simulator experiment; changes confined to `prototypes/watch/`.

## Spacing findings and correction

The prior hard jump (44-unit gap, 72-unit lateral shift) passed with immediate steering but failed from the far landing edge with a 0.2-second reaction delay. This matched the owner's report of runs ending too quickly. The five-platform solid intro remains unchanged. The next seven platforms now use 40-unit gaps/28–40 side shifts; later platforms use 42-unit gaps/36–52 side shifts. Small breakable widths, jump speed, horizontal speed, birds and one rescue remain unchanged.

Pure Swift checks passed for every hard offset in both directions from the far landing edge, with a 0.2-second delay. **100 generated 90-second routes** passed without fall rescues, minimum score 1870, with birds excluded to isolate spacing. A second pass of the same 100 routes with normal bird hazards enabled also reached 90 seconds in every case, using no rescues. These are scripted model runs, not human play or native simulator steering certification. Existing crumble, hazard/collision/rescue, pause and persistence checks passed.

## Native simulator evidence

The attempted 90-second live XCTest drag run (`build/Watch05Long.xcresult`) **failed after roughly 11 seconds of gameplay**. Native gesture/snapshot handling took up to two seconds per input, much longer than the approximately half-second jump cycle. The test cannot establish sustained human playability; this failure is retained rather than described as a successful long simulator run. No autoplay, launch-argument assist or QA control hooks were added to the shipped application.

The separate `build/Watch05Verified.xcresult` passed both native checks on 46mm: actual gameplay reported AVAudioPlayer music playing; Pause stopped it; disabling Music kept it off after Resume; high score 323 survived termination/relaunch; Music preference persisted. The pre-existing larger score was retained, so the native test establishes retention/save consistency rather than a new-record claim. Separate model checks establish best-score updates.

**Final native tests passed on both 42mm and 46mm**: two tests per device, four runs total, no failures or skips (`build/Watch05FinalBoth.xcresult`). Music preview still reported AVAudioPlayer playing after 17 seconds (more than two eight-second loops). Tests also verified real gameplay music, stopped playback on Pause, mute on Resume, preference persistence, saved high-score retention after process restart, Crown mapping, drag, menus and frozen pause state. Captures: `build/watch-*-05-{42mm,46mm}.png`. Current app: `build/Version05/Build/Products/Debug-watchsimulator/Seva Watch Lab.app`. The 46mm simulator is reopened on Home for owner testing. Physical sound quality, haptics, battery use and human difficulty remain unverified. The UI now exposes current/next-platform positions and actual playback status through accessibility values. It does not claim full VoiceOver gameplay support.

## Isolation

All 246 protected original files retain their pre-Watch hashes. iPhone/iPad source, release files, signed IPA and App Store settings remain untouched. IPA SHA-256 remains `5984b7b14359c68685c69377d0f8a0e238a25fca48308103bea1202c4c15ae45`. No signing/upload/portal/store actions.

---

# Historical Watch prototype — 0.4.0 / build 4

Updated October 13, 2026. Local simulator candidate; iPhone/iPad source, signed IPA and App Store settings remain unchanged.

- Added an original 8-second mono PCM music loop, generated by `Tools/make-sounds.py`, played locally with AVAudioPlayer's infinite loop setting. Separate saved Music preference; sound-effect muting does not stop the music. Pause/backgrounding/game over stop music; Resume starts it only when enabled. Audio controls are reachable from Pause without abandoning a run; closing previews stops playback.
- Hard-stage gaps increase from 36 to **44** world units; lateral shifts increase from at most 24 to **48–72**. Intro remains five solid platforms, using 38-unit gaps and shifts no larger than 20. The existing jump velocity and horizontal speed are retained; no hidden assist or widened breakable collisions.
- Physics checks passed for every hard-stage offset in both directions, starting at the far edge of the prior landing surface, using the real discrete integration and landing rules. Sustained route/collection checks use the next landing as the steering target. Existing crumble, pause, birds/rescue, high-score and unlimited-run tests also passed.
- `build/Watch04Final.xcresult` confirms the native UI test ran on **42mm and 46mm**, both passed, none skipped. Tests covered Crown/drag/pause/home/reopen, separate Music and Sound persistence, explicit music preview reporting playback started, and effect preview. Pause overlay visually checked on the small display. Current screenshots use `build/watch-*-04-{42mm,46mm}.png`; current app uses `build/Version04/Build/Products/Debug-watchsimulator/Seva Watch Lab.app`.
- Loop duration/PCM format verified. Physical speaker quality, haptic feel, long-run battery use and human difficulty remain unverified. Music playback API success is not an audible-quality certification.
- 246 protected original files retain their hashes; the iOS IPA still hashes to `5984b7b14359c68685c69377d0f8a0e238a25fca48308103bea1202c4c15ae45`. No store/network/registration actions. The dedicated 46mm Watch simulator is reopened for owner testing after multi-device QA.

---

# Historical Watch prototype — 0.3.0 / build 3

Updated October 13, 2026, from the owner's simulator feedback.

- Endless-only; Arcade/150-point completion removed. Local high score remains, including save on pause/exit, and the result indicates a new record.
- First five platforms are solid/wide (68 world units); later platforms are breakable wood (42 units). Collision support ends immediately on landing, followed by a 0.45-second fall/fade. Route deltas reduced to at most 24 units; gaps remain 36 units. Rescue chooses an unbroken platform.
- Added four original short WAV effects using AVAudioPlayer and WatchKit haptic requests. Sound/haptic controls use isolated prototype AppStorage; sample explicitly previews sound. No background audio, recording, streaming or permissions added.
- Pure Swift engine checks passed, including break transition/width, immediate collision exclusion, pause/fade cleanup, no score cap, route reachability, bird spawning/protection, one rescue and saved high score.
- Native UI suite ran on both 42mm/46mm watchOS 26.2 simulators: **one test on each, both passed, no skipped tests**. Controls and restart passed; old Arcade button absent; AVAudioPlayer sample reported started; toggled sound preference survived termination/relaunch and was restored. Result: ignored `build/Watch03Both.xcresult`, current app: `build/Version03/Build/Products/Debug-watchsimulator/Seva Watch Lab.app`. Evidence: `build/watch-home-03-{42mm,46mm}.png`, `watch-crown-gameplay-03-{42mm,46mm}.png`, `watch-paused-03-{42mm,46mm}.png`, `watch-sound-settings-03-{42mm,46mm}.png`. Small sound/settings view visually checked.
- Simulator playback success does not prove physical speaker routing/quality or haptic feel. Human balance, battery/performance and independent lock/background tests remain unverified. Native UI control tests pause during the simulator's long Crown gesture before verifying resumed movement.
- iPhone/iPad isolation is retained: 246 protected original files and existing signed IPA SHA-256 unchanged. No Apple account/store actions or uploads. Dedicated 46mm simulator reopened with the updated app after checks.

---

# Historical Watch prototype — 0.2.0 / build 2

Updated October 13, 2026. Still simulator-only and separate from the iPhone/iPad release.

- Added **Arcade: 150 points**, while retaining Endless. Arcade ends with a completion result and can be replayed; both modes share only this prototype's local best score.
- Added occasional animated pigeon obstacles, beginning after 35 points and at least seven seconds of active play. Only one bird is present at a time. Birds move horizontally and clear when outside the route/view.
- Added one automatic rescue per run for a fall or bird hit. It places the jumper on a nearby safe platform, clears birds, matches the Crown position to the rescue location, and shows a yellow protection halo. Bird-hit immunity lasts 2.5 seconds; another fall still ends the run once the rescue is used. New runs reset the rescue. No shops or purchases.
- Pure Swift tests passed: reachability, seeded route, input bounds, pause/resume, local best persistence, 149/150 Arcade boundary, full physics-driven Arcade completion, actual bird spawning, single-bird bound, first rescue, immediate collision protection and subsequent unprotected loss.
- Final native UI checks passed on **42mm and 46mm** Series 11 simulators with watchOS 26.2: both mode buttons/entry, Crown-to-movement mapping, drag action, pause/resume, home and reopen. Result: ignored `build/Watch02Verified.xcresult`. Captures: `build/watch-home-02-{42mm,46mm}.png` and `watch-arcade-02-{42mm,46mm}.png`, plus Crown/pause captures. Reviewed the small home screen for clock clearance, legibility and reachable mode buttons.
- Isolation reverified: all **246 protected original files** retain their pre-prototype hashes, and the signed iOS IPA retains SHA-256 `5984b7b14359c68685c69377d0f8a0e238a25fca48308103bea1202c4c15ae45`. Only `prototypes/watch/` changed. No App Store Connect actions, signing, upload or listing changes.
- Updated app launched again in the dedicated 46mm simulator and Simulator reopened for the owner. No physical battery/Crown-feel tests, independent Watch lock/app-switch test, audio/haptics or human completion claim. Bird/rescue/win behavior is covered by engine checks; the native UI suite verifies entry/controls rather than a complete human-controlled run.

---

# Initial 0.1.0 validation — October 13, 2026

Candidate: **0.1.0 / 1**, `org.sevajump.watchprototype`, standalone Watch-only SwiftUI app. Local simulator experiment; no signing, portal registration, TestFlight upload or publication. iPhone/iPad build 45 and its App Store settings are untouched.

## Passed

- Xcode 26.3 (17C529), watchOS 26.2 SDK/runtime (23S303): compiled and installed on dedicated Apple Watch Series 11 **46mm and 42mm** simulators.
- Final native UI test passed on both sizes: home → Endless, actual simulated Digital Crown input and resulting movement, frozen paused position, Resume, touch-drag action, Main screen and termination/relaunch. The simulator's Crown gesture takes several seconds; the test pauses during that gesture, then verifies steering on resume so an ordinary loss does not race the assertion. This establishes input mapping, not physical Crown feel.
- Pure Swift engine checks: deterministic seeded routes, reachable vertical/horizontal spacing, input bounds, repeated landings and parshad counts, pause/resume, loss, best-score persistence and new-run retention.
- Actual simulator captures reviewed: logo/background now load through bundled CGImages; HUD below the system clock; readable score/parshad badges; no clipping of the home controls on either size. Native captures are in ignored `build/watch-home-{42mm,46mm}.png`, `watch-crown-gameplay-{42mm,46mm}.png`, and `watch-paused-{42mm,46mm}.png`.
- Isolation audit: **246 existing protected files** (iOS/Android source and project files, runtime artwork/web source and release documents) retain their pre-task hashes. All five copied resource files match their originals. The existing iOS IPA still hashes to `5984b7b14359c68685c69377d0f8a0e238a25fca48308103bea1202c4c15ae45`.

## Findings corrected during development

The first install rejected simultaneous WKWatchOnly and WKRunsIndependentlyOfCompanionApp; only WKWatchOnly is retained. A menu-to-game redraw issue was corrected by explicitly observing the render counter. Plain named PNG loading produced a black backdrop/missing logo on Watch; bundled CGImage loading corrected it. Screenshot review moved Pause below the system clock. The initial small-device test allowed a live random run to finish during the simulator's lengthy Crown gesture; final tests isolate that gesture while paused rather than suppressing a legitimate run end.

## Evidence and limits

Final native result: `build/WatchFinalBothSizes.xcresult`; app: `build/FinalDerivedData/Build/Products/Debug-watchsimulator/Seva Watch Lab.app`. UI test source is separate from the application target; no QA hooks ship in the prototype app. The Xcode post-run diagnostic collector warned about global CLI selection not finding simctl; the tests themselves passed and screenshots exported using the explicit Xcode path.

App scene-phase handling pauses interruptions, but lock/app-switch behavior has not been independently exercised in this Watch simulator pass. Physical-device battery, performance, Crown feel and wrist readability remain unverified. No audio/haptics are implemented. No claim of full VoiceOver gameplay support. No real-user completion study or release-ready balance claim.

Dedicated simulator IDs:

- 46mm: `FE12B68B-02E3-44BF-AE22-E55A46C97463`
- 42mm: `256A5B56-33A4-427F-A86B-B33BF1219411`

The 46mm app was launched again after tests and left on the home screen. Choose **Seva Watch Prototype 46mm** in Simulator, or Run the separate Xcode project's **Seva Watch Prototype** scheme on either device. Tap **Play Endless**, use the Crown or drag, then Pause/Resume. Saves belong to this prototype only.
