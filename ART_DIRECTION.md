# Seva Jump art direction

September 27, 2026. Local art refresh; not a published release. The approved avatar sheets are the foreground style reference. Cultural/creative boundaries remain in `SIKHI_TEXT_REVIEW.md`; pose and clothing continuity decisions remain in `design/avatar-review.md`.

## Shared visual treatment

Menu alignment (1.0.7): center the entire content group vertically inside safe-area padding across every overlay. Use CSS safe centering so overflowing screens start at the top and remain scrollable; do not force centering that hides the heading. Keep this consistent across Home, menus, dialogs and result screens.

September 27 branding follow-up (1.0.6): clean illustrated bowl/bird/platform icon replaces the blockier original. The matching gold-and-turquoise title logo is used on Home and the local promotional cover. Android adaptive icons use a separate, more generously padded master. Platform exports are reproducible with `scripts/export-branding.ps1`; masters and prior icon are retained in `design/branding/`. These decisions supersede the earlier decision to retain the icon below.

Khanda animation: 24 cached render frames derived from the same approved token master project a Y-axis coin spin with a visible gold edge. The creator clarified Y axis (Mario-style), superseding the briefly proposed Z-axis rotation. No horizontal drift, emblem redrawing, collision changes or new religious motifs. Reduced Motion selects the face-on frame. Original token glow remains.

- Bright, warm colours, crisp dark outlines, readable silhouettes and simple shaded colour groups. Preserve the illustrated pixel-art character without noisy texture or blurred source images.
- Keep the girl and boy's distinct pagg designs, palettes, bilateral kurta side slits, covered hair and steel karas. Preserve the mirrored boy presentation and mildly frustrated net expressions.
- Foreground objects should be readable at their actual gameplay size. Use high-quality downsampling for the high-resolution source artwork, including cached collectible glows; nearest-neighbour reduction caused thin lines to break up.
- Keep the backgrounds quieter and softer than foreground objects. Uniform detail density is not required across distant scenery and interactive objects.
- Use true alpha for isolated sprites. Preserve animation cell order and body alignment, meaningful item silhouettes, and existing gameplay/collision dimensions. Effects should support recognition without obscuring the item.
- Allegorical kara/Nishan boosts and Khanda tokens are intentional. Preserve the Khanda's recognizable component arrangement. Do not depict or personify Sikh Gurus.

## Asset review and disposition

September 27 follow-up: the creator selected the cleaner gold-rimmed Khanda alternative for 1.0.5. Runtime asset path remains unchanged. Removed cyan outer ring and diamond ornaments; enlarged the silver emblem with smoother outlines. See `design/khanda-token-clean-gold-v4.md` for prompt and preserved previous artwork.

All 21 runtime PNGs were compared with the approved avatars.

| Group | Decision and reason |
| --- | --- |
| Parshad bowl and Khanda token | Replaced very small 108×76 and 76×76 source images with crisp higher-resolution artwork. Retained their existing designs and colours; this pass does not resolve the separately recorded parshad food-form question. |
| Kara and Nishan boosts | Simplified highlights and surrounding effects while retaining the same items and gameplay identity. |
| Dhal and falcon | Cleaner shading and outlines, with the shield layout and falcon's rescue pose retained. |
| Pigeon, sparrow and swift | Cleaner colour groups and outlines. Three equally spaced cells remain wing-up, half-flap, wing-down, facing right in the source sheets. Runtime facing and Reduced Motion behaviour are unchanged. |
| Girl and boy sheets | Retained as the approved style references. |
| Four platform types | Retained: clear, consistent outlines and distinct material/mechanic cues already fit the foreground. Shared downsampling improves their presentation too. |
| Safety net and finish banner | Retained: matching gold/blue construction and clear silhouettes already suit the rest of the game. |
| Three gurdwara-inspired backgrounds | Retained: deliberately less prominent environmental detail supports foreground readability. |
| App icon | Retained: existing bowl/bird/platform composition remains recognizable and coherent at icon size. Native launcher exports were not regenerated. |

## Review, provenance and validation

### Upgrade and badge follow-up

Badge layout follow-up: compact two-column cards place 36px medals beside the text, with wider content area and reduced padding. All ten badges and Back fit at 390×844 and 768×1024 in browser checks. At 320×568, scrolling remains available to preserve readable text. The previous centered, 124px-tall card layout is superseded. No badge criteria or artwork changed.

Added two runtime PNGs (23 total): a ten-medal sheet and a Power Jump icon. Medals share gold rims, blue ribbons and consistent lighting, with distinct motifs tied to the existing achievements. Reuse the same medal cell in the badge list and toast. Keep locked-badge text fully readable; mute only the artwork. The upgrade screen reuses the refreshed falcon/shield and shares Power Jump artwork with both HUDs. See [prompts and validation](design/upgrade-badge-prompts.md). Existing costs, unlock rules and save identifiers are unchanged.

- [Interactive before/after review](design/asset-style-review.html) includes all assets, actual-size foreground samples, animated bird samples and a dark-background toggle.
- [Exact generation prompts and runtime paths](design/asset-style-prompts.md). Built-in image generation was used. Nine original foreground assets are preserved under `design/asset-style-originals/`, outside shipped bundles.
- Historical imagery review links point to preserved originals where relevant, rather than silently showing the new art as historical evidence.
- Checked rendered transparency, three-frame bird layouts, phone gameplay and desktop/mobile browser journeys. Runtime, gameplay-runtime, service-worker and packaging checks passed. Web bundle synchronized.
- No physics, collision bounds, spawn logic or progression changed. Native device appearance and native release builds have not been revalidated in this art pass. No store page, published build or promotional screenshot was replaced.
