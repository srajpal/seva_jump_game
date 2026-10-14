# Seva Jump — isolated Apple Watch prototype

Current experiment: **0.7.0 / build 7**, `org.sevajump.watchprototype`. Separate simulator-only SwiftUI Watch project; no companion iOS target. Nothing here is included in iPhone/iPad build 45 or the App Store listing. Signing is disabled; no upload or publication.

Owner direction, October 14, 2026: retain this as an experimental prototype. It is not ready for release; further Watch work is deferred while development focuses on the iPhone/iPad app.

## Play

Only **Endless**, with a saved local high score. Turn the Digital Crown or drag horizontally to steer. Jumping is automatic. Dragging follows your finger directly, clamped to the play area; Crown steering retains its capped movement speed. Physics uses fixed 30 Hz steps measured against monotonic elapsed time, compensating for ordinary timer jitter; long stalls cap recovery to three steps and Pause/Resume discards accumulated time. The first **five** platforms (including the start) are wide and solid; later platforms mix **wide grass, narrow grass and wooden breakable platforms** (three wood, one narrow grass and one wide grass per five-platform cycle). On landing a wooden platform immediately stops supporting the player, drops and fades over 0.45 seconds. The intro uses 38-unit vertical gaps and up to 20-unit side shifts. The first seven breakable platforms use 40-unit gaps and 28–40-unit side shifts; the later stage uses 42-unit gaps and 36–52-unit side shifts. This gradual ramp keeps deliberate steering while allowing a tested 0.2-second reaction delay.

Parshad appears on one in three platforms and is collected once on landing; empty platforms award none. Occasional single birds appear after 35 points and seven seconds of active play. One automatic rescue per run places the player over an unbroken nearby platform, clears birds and grants 2.5 seconds of bird protection. A second fall after using the rescue ends the run. Pause, Resume and Main screen are available. High scores save on pause/exit and run completion; a new record is shown in the result screen. No 150-point finish or Arcade mode remains.

**Sound & feel** controls separately saved sound/haptic preferences. A separate **Music** toggle controls an original quiet 8-second looping track during gameplay. It stops on Pause, game over, backgrounding and closing previews, and continues when resuming with Music on. Sound effects remain independently controlled. Sound & feel is available from Home and Pause, so changing music does not require abandoning a run. Short original bundled WAV effects cover landing, crumbling, rescue and finishing; no streaming. Preview music and Test sound explicitly preview audio even if the corresponding gameplay toggle is off. Pause/backgrounding and Done stop playback. Haptic requests use WatchKit's standard click/notification/success feedback. The simulator verifies playback API success, not real Watch speaker volume or haptic feel; try the test sound in Simulator and validate physical feedback later.

No purchases, shop, upgrade inventory, accounts, telemetry, network dependency, HealthKit or shared iPhone saves. Artwork is copied from seven existing game images without modifying originals. Audio is generated locally by `Tools/make-sounds.py`. Sikh-inspired scenery and the ordinary fictional child character remain respectful; no Gurus are depicted or personified.

## Build and try

Open `SevaWatchPrototype.xcodeproj` in Xcode 26.3, select **Seva Watch Prototype**, choose **Seva Watch Prototype 46mm** or **42mm**, then Run. Uses Apple's watchOS 26.2 SDK/runtime and [Watch-only app configuration](https://developer.apple.com/documentation/bundleresources/information-property-list/wkwatchonly). The 46mm simulator is reopened after validation.

```sh
DEVELOPER_DIR=/Applications/Xcode-26.3.app/Contents/Developer \
  xcodebuild -project SevaWatchPrototype.xcodeproj \
  -scheme 'Seva Watch Prototype' -configuration Debug \
  -sdk watchsimulator26.2 -destination 'generic/platform=watchOS Simulator' \
  -derivedDataPath build/DerivedData build
```

## Checks

```sh
swiftc Sources/WatchGame.swift Tests/EngineChecks.swift -o /tmp/seva-watch-checks
/tmp/seva-watch-checks
```

Checks cover deterministic reachable routes, intro-to-mixed transition, immediate break collision disablement, frozen crumble while paused, fade cleanup, unlimited score, bird/rescue protection, loss and high-score persistence. Native UI tests are a separate target covering Crown mapping, drag, pause/resume, home/reopen, absence of Arcade, music/sound preview playback success and separate saved music/sound preferences. Physics checks include every hard-stage lateral offset in both directions, using discrete simulation from the far landing edge. Extended direct-drag checks exercise 25 ten-minute routes with normal birds, exact occasional-parshad awards and both platform families. Long spacing checks exercise 100 generated 90-second routes with a 0.2-second reaction delay and birds excluded to isolate landing balance; bird hazards have separate checks. A long live simulator drag attempt ended early because XCTest inputs took up to two seconds; this does not establish long human-controlled survival. Build artifacts and screenshots stay in ignored `build/`. `VALIDATION.md` records evidence and limitations; `RELEASE_NOTES.md` records this prototype's local history.
