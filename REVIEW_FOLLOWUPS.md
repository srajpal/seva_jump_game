# Review follow-ups

Findings from PR reviews, including deferred work and linked resolutions.
Unchecked items are open investigation or implementation tasks. Preserve the
source link and record the resolving PR when closing an item.
When continuing work after a review, read new PR comments and append actionable
follow-ups here rather than relying on task history. GitHub issues are the source
of truth for scheduled work; this file is a linked review index. When resolving an
item, update its issue/PR evidence and this index together.

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

- [ ] When [issue #13 experiment E2](https://github.com/srajpal/seva_jump_game/issues/13)
  adds Endless boosts, replace the current zero-boost assertion with frequency
  contracts at the new Endless score bands. The current assertion records today's
  behavior, not a permanent balance requirement.
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
- [ ] Revisit next-platform lane clearance with
  [issue #13 / E4](https://github.com/srajpal/seva_jump_game/issues/13). Consider
  generating a bird once both adjacent rows are known. Compare the same seeded
  autopilot before/after (60 runs per mode, 240 s cap), count generated birds
  directly rather than using the first-visible `birdsSeen` stat, and enforce
  E4's no-more-than-20% increase in deaths per bird plus its human playtest gate.
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
