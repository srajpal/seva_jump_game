# Review follow-ups

Deferred improvements from merged PR reviews. These are open investigation or
implementation tasks, not completed fixes or additional scope for the current
issue. Preserve the source link and record the resolving PR when closing an item.
When continuing work after a review, read new PR comments and append actionable
follow-ups here rather than relying on task history.

## PR #9 — generator checks

Source: [review comment](https://github.com/srajpal/seva_jump_game/pull/9#issuecomment-5745429146).

- [x] Implemented with issue #5: cover collectible, token, boost, and Arcade-bird odds with
  seeded frequency contracts. The review's `.16` to `.30` token-share mutation
  was not caught by the platform-type boundary probes. Exercise eligible modes
  and score bands: Endless stays at level 1, so it cannot test level-3/4 boosts;
  Challenge intentionally has no boosts after PR #10.
- [x] Implemented with issue #5: derive config-dependent platform threshold expectations from shared rules
  while retaining independent checks for the literals being guarded. Intentional
  config tuning should not require manually recomputing `.31/.38/.48/.56`.
- [ ] Avoid duplicate CI runs for PR branches: consider pushes to `main` plus
  `pull_request`, while keeping the main-branch acceptance check.
- [ ] Support an optional local `SEED` override, retaining deterministic CI seeds
  and printing the effective seed for reproducible failures.

## PR #10 — Challenge missed-bowl feedback

Source: [review comment](https://github.com/srajpal/seva_jump_game/pull/10#issuecomment-5745538128).

- [ ] Reproduce a lag-frame pickup of a previously missed bowl followed by Falcon
  rescue. `MISSED` can then remain visible despite a winnable run. Track which
  bowls were missed so recovering one does not clear other genuine misses, and
  test a 40 ms falling frame plus rescue. Document the net offset (52 px), bowl
  pickup range (86 px), and warning margin (60 px) before changing that margin.
- [ ] Scope mobile warning drawing and the desktop y=180 position to the missed-
  bowl message itself. The current flag also changes rendering of later Falcon
  and bird messages. Consider an explicit message kind and test subsequent
  messages after the warning expires.
- [ ] Put browser checks in CI when a deliberate browser/runtime setup is chosen.
  The reviewer could reproduce the Node checks but could not independently run
  the optional browser suite. Keep reported local browser evidence distinct from
  CI evidence.

## PR #11 — rendering and effects

Source: [review comment](https://github.com/srajpal/seva_jump_game/pull/11#issuecomment-5745706216).

- [ ] If repeated noise effects sound too repetitive in playtesting, cache two
  or three pre-rolled buffers per duration and rotate them. This is optional;
  first establish whether the repetition is audible on target devices.

## Verification still needed

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
