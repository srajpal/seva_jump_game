# Seva Jump localization reviewer pack

Prepared October 17, 2026 for the local **1.0.13 / Android build 51 / iOS build 47 metadata** candidate. Status: **draft translations; not approved for publication**. This pack does not approve or change the separately submitted 1.0.12/build50 tablet update. No translation service was purchased.

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

The English meaning and creative direction come from `SIKHI_TEXT_REVIEW.md`. The proposed script spellings below are drafting guidance, **not an owner-approved glossary**. Compare with the actual catalog text and settle one spelling per language before publication. The current English short spelling remains “parshad”; script spelling is a language decision, not a mechanical transliteration requirement.

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
| Fluent Hindi review | Pending | Reviewed revision, date, findings and approval; child-friendly Hindi and Devanagari shaping checked in context. |
| Fluent Punjabi/Gurmukhi review | Pending | Reviewed revision, date, findings and approval; Gurmukhi orthography and natural phrasing checked in context. |
| Owner Sikh terminology review | Pending | Agreed spellings/wording, factual corrections, intentional allegories and unresolved decisions recorded separately. |
| Technical automated checks | See `RELEASE_PROGRESS.md` | Exact suite results after final edits, including parity and package coverage. |
| Physical Android phone/tablet | Pending | Actual device/update/offline/accessibility results; desktop emulation is not physical-device certification. |
| iPhone/iPad / Xcode | Pending | Build plus device layout/offline/save checks; metadata/resource inspection alone is not a native pass. |
| Publication | Blocked on required review | Final approved artifact, store draft and explicit release action; no upload/publication performed by this implementation. |
