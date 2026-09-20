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
- [ ] Consider cross-checking Android `versionCode` and iOS `CFBundleVersion`,
  since README currently describes one shared native build number.

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

- [ ] Investigate the intermittent Android reload error `Cannot read properties
  of null (reading 'style')` observed during issue #6's tablet smoke run.
  `MainActivity.publishInsets()` injects `document.documentElement.style` without
  a document-readiness guard; this wrapper code is unchanged by issue #6. A
  subsequent phone/tablet WebView smoke run passed. Retest inset publication at
  startup/reload and preserve safe areas before fixing the lifecycle race. Track
  with [issue #1's Android verification](https://github.com/srajpal/seva_jump_game/issues/1),
  as requested in the PR #14 review; consider guarding document readiness or
  deferring publication until the page finishes loading.
- [ ] Repeat native visual QA on stable devices: issue #6's headless emulators
  passed WebView flows but device captures included a black phone surface and a
  tablet System UI timeout. Canvas exports contained gameplay, but those captures
  cannot establish complete device-level visual correctness.

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
