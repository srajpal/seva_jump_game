# Review follow-ups

Findings from PR reviews, including deferred work and linked resolutions.
Unchecked items are open investigation or implementation tasks. Preserve the
source link and record the resolving PR when closing an item.
When continuing work after a review, read new PR comments and append actionable
follow-ups here rather than relying on task history. GitHub issues are the source
of truth for scheduled work; this file is a linked review index. When resolving an
item, update its issue/PR evidence and this index together.

## PR #50 — production preparation and privacy-route check

Source: [release PR](https://github.com/srajpal/seva_jump_game/pull/50), October 10 production preparation. No review comments were present when checked.

- [x] Fix hosted privacy navigation, which incorrectly used the cached game document. A policy-identity regression failed before the fix and passes afterward; online/offline policy, unknown-document status and native worker bypass are covered. All 49 Edge browser checks, runtime/cache and package checks pass. The change follows the already uploaded Android artifact and leaves the native bypass intact.
- [ ] Verify the deployed public privacy route for returning browsers before publishing approved production changes. Local checks alone do not establish GitHub Pages deployment or removal of an older controlling worker.

## PR #9 — generator checks

Source: [review comment](https://github.com/srajpal/seva_jump_game/pull/9#issuecomment-5745429146).

- [x] Implemented in [PR #12](https://github.com/srajpal/seva_jump_game/pull/12): cover collectible, token, boost, and Arcade-bird odds with
  seeded frequency contracts. The review's `.16` to `.30` token-share mutation
  was not caught by the platform-type boundary probes. Exercise eligible modes
  and score bands: Endless stays at level 1, so it cannot test level-3/4 boosts;
  Challenge intentionally has no boosts after PR #10.
- [x] Implemented in [PR #12](https://github.com/srajpal/seva_jump_game/pull/12): derive config-dependent platform threshold expectations from shared rules
  while retaining independent checks for the literals being guarded. Intentional
  config tuning should not require manually recomputing `.31/.38/.48/.56`.
- [ ] Avoid duplicate CI runs for PR branches: consider pushes to `main` plus
  `pull_request`, while keeping the main-branch acceptance check.
- [ ] Support an optional local `SEED` override, retaining deterministic CI seeds
  and printing the effective seed for reproducible failures.

## PR #10 — Challenge missed-bowl feedback

Source: [review comment](https://github.com/srajpal/seva_jump_game/pull/10#issuecomment-5745538128).

- [x] Implemented in [PR #14](https://github.com/srajpal/seva_jump_game/pull/14):
  missed bowl identities survive culling, and a recovered bowl clears only its
  own miss. Regression tests cover a 40 ms falling pickup followed by Falcon,
  both alone and with another genuine miss. Config comments document the net
  offset (52 px), pickup reach (86 px), and unchanged warning margin (60 px).
- [x] Implemented in [PR #14](https://github.com/srajpal/seva_jump_game/pull/14):
  warning placement now checks the warning text itself. Later Falcon/bird
  messages stay off the mobile canvas and use desktop y=120. Tests cover both.
- [ ] Put browser checks in CI when a deliberate browser/runtime setup is chosen.
  The reviewer could reproduce the Node checks but could not independently run
  the optional browser suite. Keep reported local browser evidence distinct from
  CI evidence.

## PR #11 — rendering and audio

Source: [review comment](https://github.com/srajpal/seva_jump_game/pull/11#issuecomment-5745706216).

- [ ] If repeated break/hit noises become audibly repetitive, consider rotating
  two or three cached random buffers per duration. This is an optional listening
  follow-up; no evidence currently requires changing the cache.

## PR #12 — tuning and version contracts

Source: [review comment](https://github.com/srajpal/seva_jump_game/pull/12#issuecomment-5745862489).

- [x] [Issue #13 experiment E2](https://github.com/srajpal/seva_jump_game/issues/13)
  (branch `claude/exp-issue-13`, commit 2658f59 `E2: Endless boosts (#13)`) adds Endless
  boosts at the Arcade score bands; `tests/soak-test.js` now holds the Endless
  Kara/Nishan frequency contracts at those bands (and zero before them) in
  place of the zero-boost assertion.
- [x] [PR #15](https://github.com/srajpal/seva_jump_game/pull/15) makes README/checklist build numbers explicit per platform:
  Android build 39 and iOS build 38. Do not require equality for independent
  native release trains; the shared marketing-version checks remain in place.

## PR #14 — bird fairness and controls

Source: [review comment](https://github.com/srajpal/seva_jump_game/pull/14#issuecomment-5746746199).

- [x] Reverted mid-gap bird spawning in PR #14. Restored the 90 px offset through
  `config.birdSpawnOffset` and restored gap sampling after bird generation so
  seeded courses retain the baseline random sequence. The reviewer reported
  bird deaths per generated bird rising 111% in Arcade and 59% in Challenge with
  mid-gap spawning; these are reviewer measurements, not independently reproduced
  playtest results.
- [ ] Next-platform lane clearance was implemented and measured as issue #13
  E4b (commit 407afb0 on branch `exp/E4b`, not merged): birds placed one row
  late so their lane clears both adjacent landing lanes. Over four seeds (60
  runs per mode, birds counted by identity) deaths per 100 birds were flat
  (about 7.0 both ways) with Arcade-with-motion at +21%, so it delivered no
  fairness gain and stays out. Reopen only with a different placement idea.
- [ ] Explain that controller A is an Endless shortcut and only standard-mapped
  pads are supported; controller menu navigation is not implemented.
- [ ] Address controller-start audio activation: Chromium may leave audio
  suspended until a keyboard/pointer gesture. Consider a help hint or an audio
  resume attempt on the next real gesture, with browser coverage.
- [ ] Replace warning-text comparisons with an explicit message kind if message
  copy evolves; preserve the existing mobile/desktop placement regression tests.

## Issue #6 — deferred native compatibility decision

- [ ] CSP remains deferred by the user's explicit scope choice. Validate a
  proposed policy with Capacitor and the iOS user-script injection before adding
  it. Track the remaining item in [issue #6](https://github.com/srajpal/seva_jump_game/issues/6).

## Verification still needed

- [x] Implemented in [PR #15](https://github.com/srajpal/seva_jump_game/pull/15) for [issue #1](https://github.com/srajpal/seva_jump_game/issues/1):
  guard the document root in `MainActivity.publishInsets()` and republish retained
  insets after page load. Repeated Android 15/16 phone/tablet reloads pass with
  nonempty safe-area values and no page errors. The strengthened native smoke
  check also catches stale cached candidates and HUD/Pause overlap. See the
  current migration evidence in `RELEASE_PROGRESS.md`.
- [x] Repeated emulator visual QA in [PR #15](https://github.com/srajpal/seva_jump_game/pull/15): usable Android 15/16 phone
  and tablet device captures were reviewed, including gesture and three-button
  bars. Android 16 initially showed System UI/service ANRs during first boot;
  settled runs passed. Physical-device and sustained-performance checks remain
  separate release gates in `RELEASE_PROGRESS.md`.

- [ ] Review CI action/runtime maintenance separately from gameplay changes.
  [PR #11's passing CI run](https://github.com/srajpal/seva_jump_game/actions/runs/35472242185)
  warns that `actions/checkout@v4` and `actions/setup-node@v4` target deprecated
  Node 20 action runtimes and are being forced onto Node 24; the project's test
  runtime remains Node 22. The runner also announces an `ubuntu-latest` migration
  to Ubuntu 26 beginning October 19, 2026. Verify action upgrades and runner
  compatibility in the same pass as the duplicate-CI follow-up.

- [ ] Verify the Challenge changes on actual Android phone and tablet devices;
  no device was connected during PR #10. Browser viewport checks do not replace
  native testing. Track release readiness in `RELEASE_PROGRESS.md`.

## Issue #1 — Capacitor 8 migration

- [ ] Track the Capacitor CLI 8.5.2 development-only `xcode -> uuid` advisory [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq). The September 19 install reports three moderate dependency entries from this one chain. It is not packaged in the Android app. Recheck upstream releases; do not apply an untested major UUID override or downgrade the CLI as part of this Android migration.

## Issue #13 — E1 stall rescue review (branch `claude/exp-issue-13`)

Source: adversarial review of commit e4b6860 on [issue #13](https://github.com/srajpal/seva_jump_game/issues/13).

- [x] Fixed in `E1: address review round 1 (#13)`: the stranded check judged
  reach with the analytic apex, but the semi-implicit Euler integrator climbs
  `velocity * step / 2` less (about 6 px at 60 fps, 15 px at the 40 ms clamp),
  so Power Jump 3-5 double gaps of 162-192 px and spring gaps just under the
  spring apex were never rescued. `rules.jumpReach()` now judges reach at the
  loop clamp (`config.maxFrameSeconds`); rule and runtime regressions cover the
  band, and the Power Jump 5 autopilot shows 0 soft-locks.
- [x] Fixed in `E1b: rescue sideways-unreachable rows (#13)`: the stranded
  check now judges each intact platform above with the generator's own hop
  rule (`rules.canHop`: height within the integrator reach, landing edge within
  the pointer speed cap for the flight time, less one steering time constant),
  so a lone far-side survivor or runway step is rescued by the spring's longer
  flight, or by a midway helper step when even a spring cannot cross. Both
  seeds report 0 runs stalled >20 s in every mode.
- [ ] The autopilot's soft-lock classifier grades the intact platform at the
  player's height rather than `state.lastLanding`, so it under-counted the
  sideways case before E1b (at the E1 base, seed 777 Challenge: 3 runs stalled
  to the cap, only 1 flagged). Change it only together with a fresh baseline,
  since the experiment A/Bs compare against the current classifier.

## PRs #19 and #47 — 1.0.10 review fixes, October 8, 2026

Sources: [PR #19](https://github.com/srajpal/seva_jump_game/pull/19), [PR #47](https://github.com/srajpal/seva_jump_game/pull/47). Both descriptions and their review/inline-comment feeds were read; the comment feeds were empty at this check.

- [x] Merged fixes cover gamepad confirmation/cancellation of pre-run upgrades, Tab focus with hidden upgrade rows, fresh web precaching, autopilot pointer movement, Settings labels, native worker cleanup and release-signing validation. Syntax, runtime/service-worker, package, all 45 Edge browser checks and the Java 21 Android debug build passed locally on `900c3bf`; the configured release task graph also passed a dry run. This does not certify the signed production artifact or a physical-device update. Updated unreleased notes, architecture, test instructions and release records; see `RELEASE_PROGRESS.md` for the rebuilt APK hash and publication hold.
- [ ] Playtest bird difficulty with both characters before the next release. PR #19 reports fewer seeded autopilot finishes after the larger contact geometry, but its avoidance logic was tuned for the old geometry. Treat those figures as a playtesting prompt, not evidence requiring a hitbox change; keep the creator's intentional head/body collision coverage unless actual play supports a change.
- [ ] Verify the old-worker-to-new-build update on a physical Android phone and tablet, preserving saved progress. PR #47 explicitly notes that the first launch may still run the previous release while the worker unregisters; close/reopen and confirm the packaged version and retained saves on subsequent launches. The browser cleanup regression passes, but the actual Play-delivered upgrade remains unverified.
- [x] October 9 physical-tablet debug update: K70 PRO moved from 1.0.9 / 47 to 1.0.10 / 48 without clearing data. First launch showed the outgoing cached version; reopening displayed the packaged 1.0.10 with the fixed CSS, no remaining worker/controller, and an exactly preserved saved profile. This partially covers the item above; physical-phone and actual Play-upgrade checks remain open.

## Open bug triage — October 8, 2026

Reviewed all five open `bug`-labelled GitHub issues against `main` at `900c3bf`. Enhancements were excluded. No runtime code, GitHub labels, comments or issue states were changed in this triage.

- [x] **Implemented: [#40](https://github.com/srajpal/seva_jump_game/issues/40), missing viewport-height fallbacks.** Several shell/canvas declarations depended solely on `dvh`; Capacitor permits Android WebView 60 by default and this project does not override that minimum. The new regression failed before the fix: starting Arcade at 360 x 640 scrolled the page by 74 px, moving the HUD and Pause entirely above the viewport (Pause bounds -59 to -15 px). Added `vh` fallbacks for shell/body/fullscreen dimensions and canvas width, with the fullscreen custom-property override gated by `@supports`. All 13 Android layout cases and iOS presentation exclusion pass, including four cases discarding unsupported `dvh` declarations; all 48 browser checks pass, including legacy desktop fullscreen, touch-browser and iOS shell checks. Java 21 Android debug build and package checks pass. See `RELEASE_PROGRESS.md` for artifact/native verification and the October 9 physical-tablet debug installation. The issue remains open on GitHub; the fix is not a published store release.
- [ ] Verify #40 on an actual older WebView and iOS 15.0-15.3 before claiming old-engine device coverage. Removing unsupported declarations in a modern engine reproduces the missing-fallback failure but does not simulate every historical CSS difference or mobile browser-bar behavior.
- [ ] **Next, medium: [#39](https://github.com/srajpal/seva_jump_game/issues/39), narrow mobile-web HUD overlap.** Reproduced at 320 x 568: Pause overlaps the Power Jump chip by about 23 px horizontally. The ordinary native layout uses different rules; the existing native 320 px check passes. Fix for browser/itch players, but this alone does not block the Google Play candidate.
- [ ] **Scheduled, medium: [#41](https://github.com/srajpal/seva_jump_game/issues/41), in-app browser classification.** A `wv` user agent without a Capacitor/native bridge incorrectly receives `native-app android-app`. Compared with the normal browser at 390 x 844, both probes started gameplay with visible Pause controls and no HUD overlap or viewport clipping. Studio/fullscreen hiding also occurs in the normal touch-browser CSS, so those observations alone do not prove the issue's claimed impact. Remove the user-agent native inference with wrapper and hosted-browser regressions; no production-blocking failure was reproduced.
- [ ] **Deferred, low: [#42](https://github.com/srajpal/seva_jump_game/issues/42), fold/resize classification.** A simulated native resize from 390 x 844 to 800 x 1280 retained the phone class and 450 px canvas instead of selecting the tablet layout. Canvas and Pause remained in bounds. Re-evaluate classification safely in menus without changing active-run geometry.
- [x] **Verified complete October 9: [#1](https://github.com/srajpal/seva_jump_game/issues/1), SDK/Capacitor migration.** Merged source targets/compiles SDK 36 with Capacitor 8, AGP 8.13.0 and Gradle 8.14.3; Java 21 debug builds pass. Reviewed passing Android 15/16 phone/tablet migration reports. Live Play Console confirms active signed 1.0.3 / build 41 has target SDK 36 and minimum API 24, is available to internal/closed testers, and Policy status reports no issues. The retained AAB's checksum matches its release record. This satisfies the original issue's migration and Play-acceptance criteria; future production-artifact, physical playthrough and exact Play-upgrade checks remain separate release gates.

Local measurements and captures: ignored `screenshots/triage-2026-10-08/`. The five bug probes plus a normal-browser control ran in Edge with injected native signals where applicable. Closed issues #36, #37 and #38 were fixed by merged PR #47; the physical-device update verification above remains necessary. Triage applies to the local candidate, not a fresh test of the Play-delivered 1.0.3 / build 41.
