Seva Jump App Store optimization — October 16, 2026
Version 1.0.11 / source build 47 / commit bff4c6a

READY FOR POST-REVIEW UPDATE. Screenshot/header replacements are NOT uploaded.
Owner confirmed October 16: preserve the current review and apply this package after review.
Subtitle save was acknowledged but fresh-load verification remains pending. All other proposed copy is unsaved.
Keep the current App Review submission moving; do not withdraw it for this package.

phone/: four portrait PNG panels at 1206 x 2622.
pad/: four portrait PNG panels at 2064 x 2752.
Order: Arcade gameplay, Challenge, Hard Mode, four-mode home menu.
Editable layout source: scripts/prepare-ios-store-artwork.cjs. Running it against this directory recreates the SVG files and PNG exports.
header-3840x1646.png: additional header candidate, pending Apple template/safe-area preview and upload validation.
metadata.json: optimized metadata; see APP_STORE_LISTING.md for actual saved/pending status.

Native production-source Release simulator captures: iPhone 17 Pro and iPad Pro 13-inch (M5), iOS 26.3 runtime. Xcode 26.3 / iOS 26.2 SDK. Game source/assets match the retained build 47 archive. Normal UI taps and presses only: no state injection, fake scores, or gameplay modifications. Original captures are preserved under raw/; compositions scale the full screen uniformly, with captions outside gameplay. Home screenshots show actual menus, including the iPad's smaller centered menu. No UI artwork was redrawn. Icon and shipped assets are unchanged.

Capture harness/results: ignored ios/build/Marketing47/. An initial iPad harness tap did not start gameplay; coordinate tapping at the observed button frame passed on retry. A premature phone home capture was discarded; the later fully loaded home capture was used. These are marketing captures, not a new release QA certification.

Reproduce the layouts with scripts/prepare-ios-store-artwork.cjs and the four named captures per device; sharp is required. Manifest records input/output SHA-256 hashes. PNGs are RGB without alpha. Visually reviewed both contact sheets and header. Refresh captures if the shipping UI changes before use.
