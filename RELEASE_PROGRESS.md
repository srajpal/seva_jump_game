# itch.io release progress

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
