# Sikhi terminology and game-text review

Creator preference, September 27 follow-up: capitalize **Gurdwara** (including **Gurdwaras** and **Gurdwara-inspired**) in player-facing and promotional prose. Keep asset filenames and URLs unchanged. This is the creator's editorial style preference.

Review date: September 27, 2026. Scope: current local game text in `index.html` and `game.js`, accessibility labels, tutorial, badges, HUD/results, glossary, privacy text, and corresponding README and prepared store/itch copy. This is an editorial review, not a religious certification or a record of live-site publication. Existing unrelated work in the checkout was preserved.

## Creator direction — September 27, 2026

This section records the owner's subsequent decision and takes precedence over the earlier imagery recommendations below.

- **Positioning:** “Inspired by Sikhi.” A game for general audiences, with everyone welcome. Its purpose is enjoyable play and optional curiosity, not proselytizing, religious instruction by authority, or replacing Sikh teachings and understanding.
- **Creator's perspective:** The owner is a follower of Sikhi and sees this as one person's creative idea. The owner seeks a middle ground, accepts allegorical representations, and rejects letting every possible religious objection determine the game. Familiar imagery can invite players to ask what a kara is, what seva means, and learn more through Help.
- **Intentional fantasy:** Floating platforms, airborne bowls, birds, kara boosts, Nishan boosts, and Khanda tokens belong to the same make-believe world. Retain those uses. They are not assertions of real-world supernatural powers. Earlier recommendations to secularize these assets are not approved work or release blockers.
- **Firm boundary:** No imagery, iconization, or representation of the Sikh Gurus in game art or promotional assets. Apply this to portraits, avatars, silhouettes intended to depict a Guru, impersonations, and personified game characters. Respectful textual references in definitions remain appropriate. Do not infer permission to introduce Guru depictions from the acceptance of other allegory.
- **Feedback:** Correct factual mistakes (definitions, misleading factual claims, identifiable drawing errors). Assess unintended messages in context and against the creator's purpose, particularly clear confusion among intended players. Respect disagreement with the premise without automatically redesigning to satisfy it. Neither a single complaint nor a blanket dismissal of complaints replaces judgment.
- **Help tone:** Brief, friendly, and in the creator's voice. Explain that this is creative fantasy, welcomes factual corrections and feedback on misleading impressions, allows respectful disagreement, and does not supersede teachings. Avoid an inventory of controversies, defensive language, or judging critics' religious commitment.
- **Optional learning:** Offer a local gurdwara visit with questions about teachings and visitor customs, and a clearly labelled external educational link. Keep this optional and unrelated to scores, progression, or rewards. Suggest a parent/trusted adult for younger players. No embedded third-party media, automatic network calls, location lookup, signup requirement, or claim of endorsement.
- **Resource selected:** [Sikh Research Institute](https://sikhri.org/), whose current site offers articles, videos, podcasts, and questions about Sikhi. SikhNet was also inspected; SikhRI was selected as a focused starting point already used in this review. The no-Guru-imagery boundary governs our own assets; an external resource is not a promise that all its content follows our art choices. Recheck links and suitability before releases.

Outstanding optional art polish: the parshad bowl's round-piece appearance versus the specific karah-parshad definition. This observation and the optional finish-banner suggestion are not approved redraws or required religious corrections. In a subsequent avatar request, the owner explicitly asked to address the girl's missing kara, exposed hair and changing pagg, maintain consistency for both characters, and review possible extra animation frames. See [avatar continuity and animation review](design/avatar-review.md) for findings and the recommended approach; the approved brighter palettes and consistent five-pose avatar sheets are now implemented locally. See that review for validation and publication status.

Implemented locally: creator's note and optional SikhRI link in About & Help, plus contributor guidance and aligned local listing copy. Allegorical item imagery and mechanics remain unchanged. Avatar continuity and colour updates were subsequently implemented as recorded in the avatar review. No external publication occurred.

## Terminology guidance

Completion update: the supplied MHTML article was read on September 27, including its English argument, translated passages, conclusion, and references. The earlier full-article access gap is closed. This was an editorial comparison, not an independent verification of the author's historical claims or Gurmukhi translations. The current game definitions need no further change based on that comparison. External publication remains outstanding; the later creator direction above resolves the allegory question.

| Term | Use | Examples and cautions |
| --- | --- | --- |
| Sikh | A learner/disciple of the Guru; a person following Sikhi. Also an appropriate adjective. | Keep “Sikh girl,” “Sikh boy,” “Sikh community,” “Sikh culture,” “Sikh flag,” and “Sikh articles of faith.” Do not mechanically replace these with Sikhi. |
| Sikhi | The path, teachings, and lived practice of the Sikh Gurus. | Prefer “inspired by Sikhi” and “the values of Sikhi” when referring to the teachings. Do not call a person “a Sikhi.” |
| Sikhism | A widely used English name for the tradition; this project prefers Sikhi in its own explanatory copy. | Do not assert that everyone using Sikhism is wrong, or that one interpretation of its history is universal. Preserve source titles and historical quotations accurately. No Sikhism replacement was needed in the runtime text. |
| Seva | Service with love and humility, without expectation of reward. | Do not equate scores, purchases, badges, or game completion with spiritual achievement or better seva. |
| Parshad | In this game, karah parshad: a blessed sweet offering shared equally with everyone, Sikh or non-Sikh. | Keep the established short spelling “parshad” consistently. “Prashad” is also a transliteration, not inherently an error. It is not merely candy or a reward reserved for Sikhs. |
| Gurdwara | A Sikh place of worship, learning, and community gathering, open to everyone. | “Gurdwara-inspired setting” is appropriate for the fictional scenery. |
| Kara | A steel bracelet and Sikh article of faith. | The fictional boost is intentional allegory; keep the real-world definition accurate without asserting real supernatural powers. |
| Nishan Sahib | The Sikh flag. | Use the full name in religious explanation. The existing “Nishan boost” is a fictional game-item label, not a definition of the flag. |
| Khanda | A Sikh emblem. | Distinguish the emblem from the game's token economy; collecting tokens does not earn religious merit. |
| Dhal | A shield. | The one-hit effect describes the game upgrade, not a religious promise. |

Sikhi should not be reduced to generic kindness alone. The glossary connects its values to the Gurus and Guru Nanak Sahib. Keep the invitation to all players, equal character choices, and service without distinctions of background.

## Findings and local changes

| Finding | Resolution |
| --- | --- |
| Existing Sikh character/community/flag labels were grammatically appropriate. | Retained. No blanket Sikh-to-Sikhi replacement. |
| About screen did not explain Sikh versus Sikhi. | Added separate definitions and named Sikhi explicitly in the introduction and studio description. |
| Seva definition omitted the absence of expected reward. | Added love, humility, and no expected reward. |
| “Seva Champion” tied religious service to collecting 50 bowls. | Renamed to “Challenge Champion”; stable badge ID retained so saves still work. |
| Parshad and gurdwara definitions did not explain inclusion clearly. | Added equal sharing with Sikh and non-Sikh recipients and a gurdwara's welcome to everyone. |
| Home called birds thieves while About said they scattered the bowls. | Softened Home to scattered bowls and helping bring them back. This is an editorial tone choice, not a claim that a word is religiously prohibited. |
| Religious symbols and articles of faith appear as tokens/boosts. | Added an explicit fiction/game-progress explanation in About; retained existing artwork and mechanics. See the later creator direction above; the allegory is retained. |
| Prepared listings did not explain the distinction or separate scores from seva. | Updated local itch and Play listing copy. Live listings have not been updated or verified. |
| Play preparation text could imply earlier creator approval covered this revision. | Clarified that subsequent wording still needs review before release. |

Controls, neutral mode names, settings, technical warnings, privacy text, and ordinary score/result descriptions did not need a Sikhi terminology change. “Sikh terms” is not inherently wrong; the About heading now says “Learn about Sikhi” to make the teaching purpose clearer.

## Historical imagery review — superseded by creator direction above

September 27 imagery follow-up: reviewed all 26 runtime PNG assets listed in `scripts/web-files.mjs`, the existing `release-media/gameplay.png` capture, and rendering/collectible/boost code. See [the illustrated decision sheet](design/imagery-review.html). Recommendations, pending owner decision: replace kara and Nishan power-ups with secular boost imagery; prefer neutral token currency; correct the round-sweets appearance if keeping karah parshad and decide separately whether to retain the retrieval/scoring premise (including the bird carrying a bowl in the app icon). Optional: distinguish the torn finish pennants from religious flags and align the girl's seated costume/headwrap with her other poses. Characters, distant gurdwara scenery, upright background flag, plain dhal, falcon, birds, platforms, and safety net raised no clear objection in this review. These are editorial judgments, not a declaration of religious prohibition. No runtime image, mechanic, or label was changed; no new playthrough was claimed.

The earlier review raised concerns about sacred-item gameplay and proposed a further cultural review. The creator subsequently chose to retain the allegorical premise. That decision resolves the product-direction question; universal agreement or third-party religious certification is not a release requirement. Preserve this history without treating rejected recommendations as pending tasks.

## Full-article follow-up

Source: Prof. Devinder Singh Chahal, “Sikh, Sikhi & Sikhism,” Asia Samachar, November 20, 2023, explicitly labelled Opinion and reproduced from *NANAK and His Philosophy*. Read from the owner's attachment, `1-Sikh-Sikhi-Sikhism.mht`, under `.codex-remote-attachments/01a0e3ab-39f0-7783-a7d8-812d2b442e59/93577c76-1b24-4f27-bd31-158a36b1463e/`. The saved webpage was decoded as MIME/UTF-8 data without executing its scripts.

The article is more than a spelling or usage guide. Chahal distinguishes Guru Nanak's philosophy from later institutional religion. His account emphasizes investigating, understanding, and practising teachings, and argues against ritual without understanding. He also proposes a broad definition of Sikh that includes truth-seeking researchers, discusses a scriptural plural form rendered “Sikhi,” and advances interpretations of Guruship, scripture, and religious practice that differ from other interpretations he quotes.

Editorial decisions after reading:

- Retain the Sikh/person and Sikhi/path distinction in ordinary English game copy. The scriptural grammatical example is not a reason to call modern English players “Sikhis”; use “Sikhs” for the English plural.
- Keep learning **and living** in the Sikhi definition. This conveys practice rather than identity or symbols alone. The simple Sikh definition is introductory, not an exhaustive membership or legal definition.
- Do not teach the author's claim that the later Gurus transformed or departed from Guru Nanak's philosophy as settled fact. Keep respectful reference to the Sikh Gurus. Do not label all scientists or researchers Sikh irrespective of their own religious identity.
- Do not import the article's criticism of Guruship, scriptural authority, or particular observances into a children's jumping-game glossary. The article itself presents competing translations and historical positions; evaluating those is a different project.
- Retain the no-reward definition of seva and the distinction between game achievements and spiritual worth. These are consistent with the review's broader sources; the article does not itself provide a ruling on this game's collectibles or artwork.
- Retain the existing parshad, kara, Nishan Sahib, and gurdwara definitions. This article is not a comprehensive glossary for those items and does not replace the other sources cited below.

No additional runtime wording changes were necessary in this follow-up. One remaining local listing issue was corrected: `ITCH_LISTING.md` now describes the Sikh creator as directing the cultural setting, without implying that earlier approval certifies all current revisions. Previous historical approval records are preserved.

## External-site checklist

Apply the rules above to actual saved page text, metadata, images, captions, alt text, screenshots, trailers, and newly written announcements. A correct local draft does not prove a live page conforms.

| Surface | Source/check | September 27 status |
| --- | --- | --- |
| itch.io game page: https://khalsagamestudio.itch.io/seva-jump | Use ready-to-use copy in `ITCH_LISTING.md`; inspect short/full description and embedded game About. | Local draft revised. September 27 live inspection during the indexing investigation confirmed the description still says “help explaining Sikh terms” and asserts creator approval of cultural content; it lacks the new Sikh/Sikhi and fiction/seva explanation. Hosted upload remains 1.0.3; revised in-game text has not been published by this review. |
| itch.io studio profile: https://khalsagamestudio.itch.io/ | Keep “Sikh-led”; prefer Sikhi for teachings/path; clarify any claim connecting seva to rewards. | Unverified; no external edits made. |
| itch.io devlogs and downloadable ZIPs | Search for “Seva Champion,” reward-based definitions of seva, and outdated About screenshots. Preserve historical release records; identify old versions and add a correction where needed. | Unverified; old uploads are not changed by editing source. |
| Studio website: https://www.khalsagamestudio.com/ | Review landing page, game page, family information, downloadable/embedded game, and social-preview copy. | Unverified; no external edits made. |
| Google Play | Use `STORE_LISTING.md`; check short/full description, translations, screenshots, and packaged About. | Local draft revised; console copy unverified. |
| Apple listing/TestFlight copy, if used | Apply the same wording rules and inspect packaged About and screenshots. | Unverified. |
| Social posts and promotional assets | Use the same distinctions; do not imply that playing or winning measures seva or Sikh identity. | Unverified. |

Suggested reusable explanation: “A Sikh is a learner and disciple of the Guru who follows Sikhi. Sikhi is the path of learning and living by the teachings of the Sikh Gurus. Seva means serving others with love and humility, without expecting a reward.”

After each external update, record the URL, date, exact copy/source revision, screenshot or other saved-page evidence, and whether the embedded/downloadable game was also updated. No live site was changed in this review.

## Sources and limits

- [Asia Samachar: Sikh, Sikhi & Sikhism, November 20, 2023](https://asiasamachar.com/2023/11/20/sikh-sikhi-sikhism/): initial direct access was blocked. Full English article review subsequently completed from the owner's MHTML attachment; see the follow-up above. Chahal's interpretive position is attributed to him, not adopted as universal doctrine.
- [SikhRI: What does “Sikh” mean?](https://sikhri.org/videos/what-does-sikh-mean): learner/disciple in relation to the Guru.
- [SikhRI: Is the Sikh religion called Sikhi or Sikhism? Does it matter?](https://sikhri.org/videos/is-the-sikh-religion-called-sikhi-or-sikhism-does-it-matter): supports preference for the indigenous term Sikhi. The page's written explanation was reviewed; no claim to have watched the full video.
- [Sikh Coalition: Beliefs](https://www.sikhcoalition.org/about-sikhs/beliefs/): oneness, equality, love-inspired seva, and living the tradition. Supports the inclusive framing without reducing the tradition to game achievements.
- [SGPC: Karhah Prashad, Sikh Rehat Maryada](https://old.sgpc.net/sikhism/karhah-prasad.asp): indexed text specifies equal distribution to Sikh and non-Sikh recipients. Direct page retrieval failed; this finding relies on its indexed passage.
- [SikhRI: What does the Nishan Sahib represent?](https://sikhri.org/videos/what-does-the-nishan-sahib-represent-sikh-flag): identifies the Sikh flag and its relationship to the Khanda emblem.

## Validation

The attachment follow-up changed documentation only, so runtime tests were not repeated at that stage. After the subsequent creator-note and learning-link changes, runtime-browser checks and the complete Edge browser suite passed again (including six viewport sizes and offline play), and web:sync regenerated the payload. No physical-device or native-build verification is claimed. The checks below apply to the earlier game-text edits.

`node --check game.js`, `node tests/runtime-browser-checks.js`, and `node tests/gameplay-runtime-checks.js` passed after the text changes. `npm run web:sync` regenerated the native web payload. `npm run test:browser` passed using bundled Playwright and Edge, covering desktop, embedded, small-phone, phone, tablet, and landscape layouts and menu journeys, plus storage failures, iframe focus, and actual offline play. These are desktop-browser tests with mobile viewport/touch emulation, not physical mobile or native-device validation. The first browser attempt lacked a locally resolvable Playwright module; pointing `PLAYWRIGHT_MODULE` at the bundled installation resolved it. No release artifact, upload, or new native build is implied by the sync.
