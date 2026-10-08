# Upgrade and badge artwork prompts

Built-in image_gen, September 27, 2026. Saved runtime assets: `assets/badge-medals-v1.png` and `assets/power-jump-upgrade-v1.png`.

## Medal sheet

Production transparent game BADGE SPRITE SHEET for Seva Jump. EXACT 5 columns x 2 rows of equal SQUARE cells on a 2000x800 landscape canvas. TEN separate badges, centered one per cell, each fits inside centered 85% of its cell with clear transparent gutters. Same identical circular GOLD MEDAL rim, crisp dark brown outlines, short two-tail ribbon beneath, bright simple cel-shaded pixel-illustration aesthetic matching reference avatar. NO TEXT OR NUMBERS anywhere. Top row left to right: 1 orange medal with single white four-point leap spark; 2 cyan medal with white fluffy cloud; 3 green medal with white infinity symbol; 4 deep blue medal with large gold five-point star; 5 magenta medal with two tiny plain orange/blue finish pennants. Bottom row: 6 orange medal with golden bowl encircled by small laurel wreath; 7 teal medal with single golden parshad bowl; 8 blue medal with SILVER KHANDA emblem exactly matching image 2; 9 indigo medal with small gold-rim dark shield; 10 coral medal with yellow lightning bolt. Consistent scale, outline thickness, medal shape, lighting top-left, ribbon shape across all TEN. Distinct readable simple motifs at 44px. Reference 1 avatar STYLE only, no people. Reference 2 Khanda motif reference only. Real transparent alpha background, no glow haze, shadows, labels, grid or extra objects. No Guru imagery.

## Power Jump

Single Power Jump upgrade icon for Seva Jump, transparent square canvas. A bold GOLD UPWARD ARROW rising from a small purple coiled spring, two tiny cyan motion marks. Match the reference avatar's cheerful crisp illustrated pixel-art style, fine dark outline, clean three-tone shading, bright gold/cyan/purple palette matching game. Simple readable silhouette at 28 to 48 pixels. Center design in 80% of square with clear transparent margin. No words, numbers, medal, scenery, feet, characters, religious figures or glow haze. True transparent alpha background.

## Integration and validation

Medal cells map to the existing ten badge IDs, in existing display order. CSS selects the same cell for cards and earned-badge notifications. Existing titles, conditions, prices and save keys remain unchanged. Locked art is grayscale while text remains at full opacity. Power Jump art is shared by upgrades and desktop/mobile HUDs. Falcon and shield reuse the preceding refreshed assets.

Runtime, gameplay-runtime, service-worker, package, and six-layout browser checks passed. Additional isolated browser checks at 320×568, 390×844 and 768×1024 verified ten distinct medal positions, seven locked/three earned sample states, an upgrade purchase, no badge horizontal overflow, and reachable Back buttons. Screenshots are under `screenshots/*-upgrades-art.png` and `screenshots/*-badges-art.png`. Web assets synchronized; no native device validation or publication performed.
