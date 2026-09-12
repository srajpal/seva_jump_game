# Seva Jump creator content review

Date: September 11, 2026  
Scope: the current story and terminology, 25 shipped PNG images, and code-generated sound and music.

## Creator decision

The project owner states that the artwork and music were created with ChatGPT from the owner's own inspirations, with “nothing from outside.” No outside asset packs, recordings, compositions, or visual references were used. This statement, together with the Git history below, is the project's provenance record for this release.

The owner is Sikh and reviewed the specific questions raised about birds stealing/scattering parshad, collecting parshad for score, spending Khanda tokens, and using kara and Nishan Sahib imagery as boosts. The owner chose to **keep the current concept** and is comfortable with its portrayal. This records the Sikh creator's content approval; an additional outside cultural review is optional and is not a release requirement.

This record does not claim endorsement by the Sikh Coalition, SikhRI, SGPC, OpenAI, or any other outside organization. The linked sources below are used only to check concise definitions.

## Terminology and visual review

| Term or element | Review result |
| --- | --- |
| **Seva** | “Selfless service and helping others” is clear and age-appropriate. |
| **Parshad** | “A blessed sweet food shared with the congregation” is broadly accurate. “A blessed sweet offering shared with the congregation” would add devotional context, but no wording change is required by this review. |
| **Gurdwara** | “A Sikh place of worship and community gathering” is accurate. “Gurdwara-inspired” remains a suitable description for the fictional backgrounds. |
| **Kara** | Correctly identified as a steel bracelet and Sikh article of faith. The creator approves its current boost role. |
| **Nishan Sahib** | Correctly identified as the Sikh flag seen outside gurdwaras. The creator approves the current “Nishan boost” role and flag imagery. |
| **Khanda** | Correctly identified as a widely recognized Sikh emblem. The creator approves its current token and upgrade-currency role. |
| **Dhal** | Correctly described as a shield; the game makes no sacred claim about it. |
| **Falcon Save** | The creator approves the current rescue mechanic and imagery. The game does not claim an outside religious interpretation for it. |
| **Player characters** | The boy and girl are positively presented as young Sikh jumpers with covered hair; the boy also has a visible kara. The creator approves the clothing, head coverings, and poses. |
| **Backgrounds** | The gurdwara-like buildings and Nishan Sahib remain distant scenery rather than platforms, hazards, or destructible objects. No Guru Granth Sahib, Guru figure, prayer text, or interior worship scene appears in the shipped images. |

Reference points: [Sikh Coalition: Gurdwara](https://www.sikhcoalition.org/about-sikhs/gurdwara/), [Sikh Coalition: Identity and kara](https://www.sikhcoalition.org/about-sikhs/identity/), [Sikh Coalition glossary including parshad](https://www.sikhcoalition.org/wp-content/uploads/2016/11/Teacher-Appreciation-Day-Gurdwara-Toolkit.pdf), [SikhRI: Khanda](https://sikhri.org/resources/ik-oankar-khanda-brochure), and [SGPC Sikh Rehat Maryada: Nishan Sahib](https://old.sgpc.net/rehat_maryada/section_three_chap_four.htm).

## Shipped image inventory

`scripts/web-files.mjs` lists exactly 25 PNG images. The owner reports that all were made with ChatGPT from the owner's inspirations and no outside material.

| Group | Shipped files | Git record |
| --- | --- | --- |
| App icon | `app-icon-bird-v1.png` | Added in `273d3ce`. |
| Backgrounds | `gurdwara-courtyard-pixel-v1.png`, `gurdwara-sunset-pixel-v1.png`, `gurdwara-dawn-pixel-v1.png` | Courtyard added in `0231a2f`; sunset and dawn in `114a6c6`. |
| Player art | `player-girl-pixel-v1.png`, `player-girl-fall-pixel-v1.png`, `player-girl-net-pixel-v2.png`, `player-boy-pixel-v1.png`, `player-boy-fall-pixel-v3.png`, `player-boy-net-pixel-v4.png` | Base/fall art added in `0231a2f`; girl net v2 in `3ccaf66`; boy net v4 in `114a6c6`. |
| Platforms | `platform-grass-pixel-v1.png`, `platform-spring-pixel-v1.png`, `platform-moving-pixel-v1.png`, `platform-break-wood-pixel-v1.png` | Added in `0231a2f`. |
| Collectibles | `parshad-bowl-pixel-v3.png`, `khanda-token-pixel-v3.png` | Current versions added in `8465b10`; predecessors in `0231a2f` and `e7ae76d`. |
| Birds | `bird-pigeon-flap-pixel-v1.png`, `bird-sparrow-flap-pixel-v1.png`, `bird-swift-flap-pixel-v1.png` | Added in `114a6c6`. |
| Powers/upgrades | `powerup-kara-pixel-v1.png`, `powerup-nishan-pixel-v1.png`, `dhal-shield-pixel-v1.png`, `falcon-save-pixel-v1.png` | Kara, Nishan, and dhal added in `0231a2f`; falcon in `114a6c6`. |
| Finish/safety | `catch-net-hover-pixel-v1.png`, `finish-banner-hover-pixel-v1.png` | Added in `0231a2f`. |

## Code and audio record

- The game code, rules, configuration, and tests began in commit `0231a2f` and were developed under the same repository identity. The owner reports no outside code source for the reviewed work.
- There are no shipped audio files. `game.js` creates sound effects at runtime with Web Audio oscillators and generated noise.
- `game.js` also creates the music from short note-frequency and bass arrays. Audio entered the Git history in `ee145ec`; the owner states that the music was made with ChatGPT from the owner's inspirations and used nothing from outside.

## Release record

- Creation/source: **owner-directed ChatGPT creation; no outside sources reported**.
- Sikh content review: **approved by the Sikh project owner on September 11, 2026**.
- Creative decision: **retain the current parshad story, Khanda tokens, kara boost, Nishan boost, characters, and gurdwara-inspired imagery**.
- Outside organizational endorsement: **none claimed**.

Retain the relevant ChatGPT conversations or exports with private project records when available, and update this review if shipped artwork, music, terminology, or the central concept changes.
