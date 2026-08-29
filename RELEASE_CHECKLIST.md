# SevaJump release checklist

Use this checklist for every release candidate. Do not create or commit an upload keystore, passwords, or `keystore.properties`.

## Release blockers

- [x] Endless, Arcade, Challenge, and Hard Mode routes pass automated reachability checks.
- [x] Challenge contains exactly 50 reachable bowls and celebrates only after all 50 are collected.
- [x] First-run guide, settings, reset confirmation, statistics, badges, upgrades, music, and sound effects are implemented.
- [x] Android portrait layout, safe areas, system back behavior, launcher name, and direct-device play have been tested.
- [x] The app has no ads, purchases, accounts, analytics, or gameplay network dependency.
- [x] Progress can be erased from Settings, Android cloud backup is disabled, and cleartext network traffic is disabled.
- [ ] Complete a final Sikh community/content review of terminology, imagery, and gameplay context.
- [ ] Test the release candidate on at least one additional small or narrow Android phone.

## Regression pass

- [ ] Start each mode with both characters and verify the chosen character persists after restart.
- [ ] Complete Arcade and Challenge; verify banner timing, fireworks, sound, results, best score, and statistics.
- [ ] Lose by falling and by bird; verify net pose, transition, death reason, Dhal Shield, and Falcon Save.
- [ ] Pause, resume, restart, return home, and use Android Back from every screen.
- [ ] Toggle music, sound, reduced motion, and buttons; restart the app and verify each preference persists.
- [ ] Buy every upgrade, earn a badge, reset all progress, and verify the confirmation and cleared state.
- [ ] Test once with airplane mode enabled.

## Google Play preparation

- [ ] Confirm the permanent application ID: `org.sevajump.game`.
- [ ] Create the app in Play Console and complete developer verification.
- [ ] Create and securely back up a separate upload key; never store it in this repository.
- [ ] Enroll in Play App Signing and build a signed Android App Bundle (`.aab`).
- [ ] Publish the privacy policy at `https://srajpal.github.io/seva_jump_game/privacy.html`.
- [ ] Complete Data safety as no data collected or shared, after verifying every included SDK.
- [ ] Complete target audience, content rating, ads, app access, and government-app declarations accurately.
- [ ] Capture at least four portrait phone screenshots: home, active play, upgrades/badges, and a victory scene.
- [ ] Prepare a 512 × 512 Play icon and 1024 × 500 feature graphic.
- [ ] Upload to Internal testing first, then Closed testing; review the pre-launch report before production.

## Build verification

```powershell
node tests\rule-checks.js
node tests\full-run-checks.js
node tests\endless-bird-checks.js
node tests\hard-mode-checks.js
node tests\soak-test.js
npm run android:debug
```

For the store, use Android Studio's **Build > Generate Signed Bundle / APK > Android App Bundle** flow. Increment both `versionCode` and the visible version before every upload.
