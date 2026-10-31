# Seva Jump localization reviewer pack

Prepared October 17, 2026 for the local **1.0.13 / Android build 51 / iOS build 47 metadata** candidate. Current status (October 31): **all 343 Punjabi and Hindi game entries accepted by owner; Hindi approved for now**. This pack does not approve or change the separately submitted 1.0.12/build50 tablet update. No translation service was purchased.

## October 31 owner approval for the release

The owner approved both added Punjabi strings (`ui.tutorial.keyboard`, `ui.write.review`) and stated that Hindi is approved for now. All 343 current game entries in each language, including the current in-game Sikh terminology, are recorded as `accepted by owner`. Hindi acceptance is provisional owner approval for this candidate, not independent fluent-language certification. Future wording changes require a relevant recheck. Translated Play listing drafts are outside this game-catalog approval. Native/device checks and publication remain separate.

Approved current catalog SHA-256 values:

- `locales/ui-hi.js`: `ed9046969e85adbdc81fe1d79f14eeeea6d6e81c44ddccfdc7b555d96a9555c7`
- `locales/runtime-hi.js`: `ff7ad32b6e9c44fbea9aff997800d9b7a48ff017c21a33e79256abc81dc6ad0a`
- `locales/ui-pa-Guru.js`: `d54cd0fb0f82faef947407d468c375dd3b868cbc0c0c57a0889f960f3e5a9fe2`
- `locales/runtime-pa-Guru.js`: `d2138c4a455d3a7942314a1f28f89f1f561030325d96e8dad82a146600febc05`

## October 26 new guide and store review strings (historical)

Added `ui.tutorial.keyboard` and `ui.write.review` in English, Hindi and Punjabi. These two new Punjabi entries are pending review; the previously accepted 341 entries and their wording remain unchanged. The historical hashes below identify the approved catalog before these additions, not the expanded catalog. The current inventory is 343 entries and 2,163 English source words. Hindi remains pending throughout. Store review links are shown only in installed Android/iOS apps, so review their text in native presentation as well as browser QA fixtures.

## October 26 Punjabi approval

The owner confirmed “Punjabi is approved” on October 26, 2026, accepting the current complete Punjabi/Gurmukhi catalog, including the 35 revised entries, grammar cleanup and retained meaning of “follower of Sikhi.” All 341 Punjabi inventory entries are `accepted by owner`. This records the owner’s approval, not an independent certification or a completed native-device/layout audit. Hindi remains pending; no Hindi wording changed. Future Punjabi wording changes require relevant reapproval.

Approved catalog SHA-256 values:

- `locales/ui-pa-Guru.js`: `a25d2d9f4f444f3d87fe97f165c3a7706acbb070a3a3c5733260acd70981d489`
- `locales/runtime-pa-Guru.js`: `d2138c4a455d3a7942314a1f28f89f1f561030325d96e8dad82a146600febc05`

## October 22 Punjabi corrections and second review (historical)

Applied 35 Punjabi entries from the returned Word review, with owner-authorized grammar cleanup, removal of a duplicated word, consistent finish-banner wording, and retention of ਪੈਰੋਕਾਰ for the creator’s “follower of Sikhi.” The returned document left coverage blank, so unchanged text is not treated as verified. Hindi remains pending with no catalog edits. Revised Punjabi entries are `corrected / needs recheck`; neither language is approved for publication.

`docs/punjabi-review-changes.json` records the original and revised wording, English context, catalog IDs, and revised-word highlight ranges. `node scripts/build-punjabi-review.mjs` creates a separate browser review ZIP and extracted folder under ignored `dist/`. The review game starts in Punjabi, marks revised words yellow, and links to a complete 35-entry before/after page at `review.html`. The page is the complete review record, including changes to accessible labels and rare runtime messages; in-game marks apply to matching complete DOM/canvas strings, so wrapped, interpolated, or attribute-only text should be reviewed there. Deleted words are visible in the previous-draft line. Instrumentation is generated only in this review payload and is excluded from normal web/native release synchronization.

The Android review variant uses package `org.sevajump.game.punjabireview` and label “SevaJump Punjabi Review,” allowing it to coexist with the public game. It is a debug review build of the existing 1.0.13/build51 candidate, not a store release. No upload or publication is implied.

## Review materials and scope

The extracted inventory is **341 entries: 207 UI and 134 runtime entries; 2,150 English source words**. Words are whitespace-delimited tokens, including placeholders; catalog IDs are deduplicated. Store-copy drafts are counted separately. `docs/localization-inventory.json` is the per-entry review worksheet, with English/Hindi/Gurmukhi side by side, source references, placeholders and pending review fields. Regenerate it with `node scripts/localization-inventory.cjs` after catalog changes and retain review decisions when reconciling regenerated output.

Review `locales/ui-{en,hi,pa-Guru}.js` and `locales/runtime-{en,hi,pa-Guru}.js` side by side. The English files are the source text; matching keys identify the same text in Hindi and Punjabi. UI catalogs cover the document and privacy surfaces. Runtime catalogs cover changing labels, scores, badges, tutorial steps, settings explanations, result messages and canvas notices. `docs/localization-play-drafts.md` contains unpublished store copy. Recheck final extraction counts after catalog edits rather than relying on the initial estimate.

Open the game locally or over HTTP. Use the Home or Settings language selector; choose हिन्दी or ਪੰਜਾਬੀ (ਗੁਰਮੁਖੀ). Read the same screen in English to establish context, then review the translated screen with actual values. A language switch should preserve saved progress and keep an existing paused run paused. The separate `privacy.html` page must be reviewed too, including navigation and document language.

All three languages retain the **Seva Jump** brand/logo, familiar **0–9** digits and literal technical identifiers. Do not translate URLs, email addresses, package IDs, file names, keyboard/controller key symbols or placeholder names. Native language names in the selector intentionally remain recognizable across languages. Punjabi means **Gurmukhi** here; Shahmukhi is outside this candidate. Device `pa-Arab` and `pa-PK` must not silently select Gurmukhi. Unsupported device languages fall back to English.

## Contextual review route

| Surface | How to reach it | Review focus |
| --- | --- | --- |
| Home and character selection | Start/reload; choose both characters; select each language | Brand, tagline, four modes, language choice, character labels, buttons and accessible names. Text must fit the smallest supported phone. |
| First-run guide | Use a disposable QA profile and start a mode | Clear age-appropriate instructions, touch/mouse/keys/controller wording; every step, next/back/skip/start label and announcement. |
| Pre-run choices | Own an upgrade in a disposable QA profile, then start any mode | Equipped/unowned/used states, permanent levels versus one-use inventory, cost and count placeholders, confirmation and cancellation. |
| All four modes | Start Endless, Arcade, Challenge and Hard; pause each | Localized mode label, HUD, controls, score/bowl counters and canvas text. Keep 1,000-point Arcade and 50-bowl Challenge goals accurate. |
| Warnings | Challenge miss; blocked ascent in Challenge/Hard; storage denied in browser QA | Missed bowl and stuck advice must remain distinct. Translate the current condition and available action, including Pause/restart. No change to gameplay logic. |
| Boosts and failures | Collect Kara/Nishan boosts; use shield/Falcon; fall or hit a bird | Real religious definitions versus fictional game effects; reason/action clarity; counters and one-use effects. |
| Results and badges | Win/lose/leave; view collection with unlocked and locked badges | Every achievement title/description, best/new record and progress message, plural/count grammar and long badge wrapping. |
| Settings during pause | Pause → Settings → change language → Back/Resume | Switch must not reset/resume the run. Review sound/music themes, preview, reduced motion, Helping Hand, reset confirmation and audio/storage notices. |
| Records, Upgrades, Help | Open every main menu; scroll through all content | Labels, statistics, purchases and limits, glossary, creator note, optional learning link, clear wording for children ages 8–15. |
| Both privacy surfaces | About → Privacy; open standalone `privacy.html` | Equal meaning for local storage, no collection/sharing/ads/accounts, backups/reset/uninstall, optional external links and contact details. |
| Input and accessibility | Tab/Shift+Tab including selects; controller; Android Back; screen reader | Visible labels match announced labels; focused selects remain usable; no focus escape; correct document language and sensible reading order. |
| Offline and layouts | After first HTTP visit go offline; also open extracted files directly | Both scripts shape with bundled fonts, including canvas. Check phone/tablet, portrait, long text and large text; no cut vowel marks, hidden buttons, stretched canvas or renewed tablet gap. |

Do not use fake records or fabricated victories in release screenshots. QA-only fixtures may help expose otherwise rare strings; label those captures as review evidence and keep them out of store galleries. Keep screenshots under ignored `screenshots/` unless a curated release asset is explicitly requested.

## Sikh terminology glossary for owner review

The English meaning and creative direction come from `SIKHI_TEXT_REVIEW.md`. Punjabi catalog wording was accepted by the owner October 26 and the remaining strings October 31; Hindi game wording and terminology were accepted for now October 31. This table remains contextual guidance; the actual catalogs and October 31 hashes identify the approved game text. Compare with the actual catalog text and settle one spelling per language before publication. The current English short spelling remains “parshad”; script spelling is a language decision, not a mechanical transliteration requirement.

| English | Hindi draft | Punjabi draft | Meaning and constraint |
| --- | --- | --- | --- |
| Sikh | सिख | ਸਿੱਖ | A learner/disciple of the Guru who follows Sikhi; also an adjective for people/community. Do not call a person “a Sikhi.” |
| Sikhi | सिखी | ਸਿੱਖੀ | Learning and living by the teachings of the Sikh Gurus. Do not reduce this to generic kindness or frame one interpretation as universal doctrine. |
| Seva | सेवा | ਸੇਵਾ | Serving with love and humility without expecting a reward. Scores/tokens/badges are game achievements, not spiritual merit. |
| Guru / Sikh Gurus | गुरु / सिख गुरु | ਗੁਰੂ / ਸਿੱਖ ਗੁਰੂ | Retain respectful references. No depiction or personification of the Gurus in game or promotional imagery. |
| Guru Nanak Sahib | गुरु नानक साहिब | ਗੁਰੂ ਨਾਨਕ ਸਾਹਿਬ | Keep the honorific and spelling consistent. |
| Parshad / karah parshad | परशाद / कड़ाह परशाद | ਪ੍ਰਸ਼ਾਦ / ਕੜਾਹ ਪ੍ਰਸ਼ਾਦ | Current draft spellings. Here, the blessed sweet offering shared equally with everyone, Sikh or non-Sikh. Owner must confirm preferred spellings (including whether Hindi प्रसाद / कड़ाह प्रसाद is preferable); not candy or a reward reserved for Sikhs. |
| Gurdwara | गुरुद्वारा | ਗੁਰਦੁਆਰਾ | A Sikh place of worship, learning and community gathering, open to everyone. The game's setting is inspired by it. |
| Kara | कड़ा | ਕੜਾ | Steel bracelet and Sikh article of faith. The boost is fictional allegory, not a claim of real supernatural power. |
| Nishan Sahib | निशान साहिब | ਨਿਸ਼ਾਨ ਸਾਹਿਬ | Sikh flag; use full name in explanatory text. A fictional flight effect is a game mechanic. |
| Khanda | खंडा | ਖੰਡਾ | Sikh emblem. Token collection is a game economy, not religious merit. |
| Dhal / shield | ढाल | ਢਾਲ | Ordinary shield term. One-hit protection describes a game item. |
| Falcon Save | बाज़ की मदद | ਬਾਜ਼ ਦੀ ਮਦਦ | Fictional one-use rescue. Verify natural, short UI wording and consistent reference to the bird, without a religious promise. |
| Helping Hand | सहायक हाथ | ਮਦਦਗਾਰ ਹੱਥ | Optional gameplay assistance. Check that the setting and its explanation make the assist behavior clear. |

The creator has chosen to retain allegorical Kara/Nishan boosts and Khanda tokens. Review factual errors, unintended messages and language quality while respecting that premise. Everyone is welcome; curiosity and optional learning are invited without proselytizing. Separate an owner terminology decision from a reviewer's recommendation or disagreement. Do not claim outside religious certification.

## How to record findings

For each issue capture: catalog key, locale, screen/state, current text, proposed text, explanation, screenshot path if useful, severity and resolution. Preserve placeholders exactly, including braces and names; changing word order around them is fine. Verify short and long values (0, 1, 2, 50, 1,000 and large lifetime totals), without changing technical identifiers. Read translated HTML markup as formatting: preserve links and emphasis semantics rather than introducing executable markup.

Use these status values: **open**, **corrected / needs recheck**, **accepted by owner**, **verified**, **deferred with reason**. Approval applies to a recorded source revision or artifact checksum; changes after approval require a relevant recheck. Do not store reviewer contact lists or private conversations here.

| Gate | Status | Required record |
| --- | --- | --- |
| Hindi game language approval | All 343 entries accepted by owner for now October 31 | Current catalog hashes above; provisional owner acceptance, not independent fluent-language certification. |
| Punjabi/Gurmukhi game language approval | All 343 entries accepted by owner October 31 | Current catalog hashes above; device and shaping validation remain separate. |
| Owner Sikh terminology review | Current game wording accepted in both languages | October 31 owner acceptance covers the game catalogs; separate translated store-copy review remains open. |
| Technical automated checks | See `RELEASE_PROGRESS.md` | Exact suite results after final edits, including parity and package coverage. |
| Physical Android phone/tablet | Pending | Actual device/update/offline/accessibility results; desktop emulation is not physical-device certification. |
| iPhone/iPad / Xcode | Pending | Build plus device layout/offline/save checks; metadata/resource inspection alone is not a native pass. |
| Publication | Blocked on required review | Final approved artifact, store draft and explicit release action; no upload/publication performed by this implementation. |
