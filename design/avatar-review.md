# Avatar continuity and animation review

September 27, 2026. Implemented locally: corrected five-pose sheets, home previews, push-off and apex transitions. Not published.

## Creator request

Improve both avatars while preserving their established identity. Address the girl's missing kara, visible hair in the net pose, and changing pagg. Consider one or two extra animation frames. These are character continuity choices, not a claim about how all Sikh girls should dress. Continue the no-Guru-depictions boundary in `../SIKHI_TEXT_REVIEW.md`.

## Findings and recommended art direction

Use each existing jumping character as the design reference, with the girl's requested corrections applied first. Preserve faces, proportions, green outfits, pink/blue colour identities, sneakers, and pixel-art treatment.

| Character | Finding | Recommended correction |
| --- | --- | --- |
| Girl | No distinct steel kara in the current poses; gold sleeve trim is not a substitute. | Add a readable silver/steel kara consistently on the same wrist in source poses. Check readability at gameplay size. |
| Girl | Loose strands also appear in the jumping artwork. The net pose exposes considerably more hair. | Tuck hair under the pagg consistently across all poses, following the owner's requested character design. |
| Girl | Net pose replaces the layered pink pagg with a bun-shaped wrap and gold band. | Keep the jumping pose's layered pink pagg shape and folds across poses. |
| Girl | Net pose adds a pink scarf and extra gold motifs. | Remove the newly appearing scarf and motifs; preserve the jumping costume's simple gold edging. |
| Boy | Net costume has extra gold edging; shoes and small turban/undercap details vary. | Match the jumping reference's outfit, shoes, turban and undercap across poses; retain the kara. |
| Both | Net artwork has different proportions/framing from airborne artwork. | Match head and body proportions while allowing the seated silhouette to widen naturally. Check the in-game net rendering, not just full-size source art. |

## Animation recommendation

Add two poses per avatar after the existing three poses agree:

1. **Push-off:** brief bent-knee/compressed pose at a platform bounce, transitioning into the existing rising pose. Keep bounce timing and collisions unchanged; this is a visual transition only.
2. **Apex:** relaxed arms and legs as vertical speed approaches zero, bridging rising and descending artwork.

The current renderer switches to the falling sprite when vertical velocity exceeds 30, or during an ending. Select additional poses from movement phase and elapsed time since a bounce, rather than endlessly cycling poses. Keep the present fall and seated net poses; an additional net-impact frame is lower priority because jump transitions are seen much more often.

Use matched canvas sizes, consistent pixel density, transparent backgrounds, and stable body/foot anchors to prevent jitter. Do not stretch a new pose to compensate for mismatched proportions. Existing horizontal mirroring also mirrors the kara's apparent side; keep source poses internally consistent. Preserve reduced-motion behaviour with fewer pose changes and no added bobbing.

## Implementation and acceptance

- Prepare corrected reference artwork and pose candidates under `design/` before replacing shipped assets; retain originals for comparison.
- Compare all poses side by side and at the actual airborne draw size (68 × 102) and seated draw size (148 × 148).
- Check kara visibility, covered hair, pagg continuity, face, costume, shoes, alpha edges, and foot alignment on light and dark backgrounds.
- Integrate only the consistent set. Update the asset manifest and generated web bundle as needed; verify home character previews as well as gameplay.
- Verify both avatars rising, at apex, descending, landing on platforms, and landing in the net, including facing both ways and reduced motion. Gameplay physics and hitboxes should remain unchanged.

## Implemented direction and validation

The owner approved distinct pagg styles and brighter clothing, with consistency taking priority. Girl: layered magenta pagg, turquoise kurta with gold edging, magenta trousers and sneakers. Boy: angular blue pagg with white undercap, saffron-orange kurta, blue trousers and sneakers. All poses retain a steel kara and covered hair. This is the selected character design, not a rule about national or religious clothing.

Two transparent five-pose sheets replace six separately drawn assets. Original assets moved to `avatar-originals/`; they no longer ship. The home selector derives its preview from the same jumping pose. Runtime source rectangles allow for artwork crossing nominal sheet cell edges. A shared scale avoids stretching between poses. Push-off lasts 75 ms of active simulation; apex appears near zero vertical velocity. Reduced Motion retains the simpler rise/descent switch. Physics and collision bounds are unchanged.

See [visual pose preview](avatar-preview.html) and [generation prompts](avatar-prompts.md). Generated with the built-in image tool. Runtime pose-selection tests cover both characters and Reduced Motion. Runtime/gameplay, service-worker, packaging, and browser layout checks passed; web assets synchronized. Native device appearance has not been rechecked and no release was published.


## Owner follow-up: mirrored poses and net expressions

### Phone shadow and shoe clearance

Direct Pixel 6 capture and web reproduction exposed stacked CSS drop shadows around the selected character. Removed the Home scene/selected-character shadows and selected enlargement; selection still uses full colour versus muted unselected art. Extended the jump source/SVG clip to height 545 (from 526) for shoe clearance. Updated the pose preview accordingly. Keep this padding and avoid reintroducing silhouette shadows that resemble doubled outlines or cropped feet. Verified the corrected phone capture after rebuilding and reinstalling with app data preserved.

### Kurta continuity correction

The owner noticed the kurta opening apparently changing sides. Source art confirmed inconsistent side-seam emphasis between descent and apex, independently of runtime mirroring. Both sheets were corrected to use bilateral matching side slits, a continuous front panel and consistent gold edging. In seated/crouched poses the far seam may be occluded; it must not become a front slit or move to the opposite hip. Keep this construction in future artwork. Prior sheets are preserved as `avatar-originals/player-*-before-kurta-fix.png`. Boy mirroring and frustrated net expressions are retained.

The boy is now horizontally mirrored relative to the girl in every rendered pose, including the home selector and net landing. Gameplay movement-facing still applies on top of that base mirror; controls and physics are unchanged. Both seated expressions now show mild confusion/frustration with closed, downturned mouths instead of smiles. Character identity, clothing, pagg styles, covered hair and karas are retained. The smiling sheets are preserved under `avatar-originals/`.
