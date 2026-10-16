# Seva Jump App Store listing draft

Current status October 15, 2026: **1.0.11 (47) — Waiting for Review**, submitted at approximately 3:13 PM EDT after the owner confirmed every mode works on the physical iPhone and authorized submission. Manual release remains selected; no public App Store release. The owner reports updating the listing and age rating to **4+**, superseding the earlier conservative-rating hold. [Seva Jump's App Store Connect record](https://appstoreconnect.apple.com/apps/6822047487/distribution) has Apple ID `6822047487`, bundle ID `org.sevajump.game`, SKU `sevajump-ios`, iOS and English (U.S.). See [RELEASE_PROGRESS.md](RELEASE_PROGRESS.md) for artifact validation, submission evidence and historical preparation details.

## October 16 optimization — preserve the current review

Owner authorized metadata and screenshot improvements while keeping the existing build 47 review moving. No withdrawal, build change or new review submission is authorized by this optimization pass.

- Subtitle **Offline pixel platformer**: App Store Connect displayed **Saved** after saving this field alone; fresh-load verification is pending because the detail pages repeatedly return service errors.
- Action as the second game subcategory: attempted, rejected with “Primary Subcategory couldn’t be saved because another field is invalid”; reverted to the original empty second subcategory before saving the subtitle. Games/Casual remains the recorded configuration.
- The optimized promotional text, keywords and description below are **prepared, not saved**. Version detail pages repeatedly failed to load reliably. Do not treat this proposed copy as the submitted version's current text until a successful save is verified.
- Eight refreshed native screenshot panels (four phone / four iPad) and a matching header are **prepared locally, not uploaded**. Apple [locks screenshot edits while Waiting for Review](https://developer.apple.com/help/app-store-connect/reference/app-information/app-and-submission-statuses); [first-release assets must be submitted with the app](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-assets-from-asset-library). Preserve the current review and apply visuals in a later permitted update. The header remains a candidate pending Apple template/safe-area preview and upload validation.
- Package: ignored `dist/SevaJump-1.0.11-iOS47-store-optimization.zip`; editable layouts, native originals, metadata, hashes and previews under `screenshots/app-store-1.0.11-build47/`. Generator: `scripts/prepare-ios-store-artwork.cjs` (requires sharp). Screenshot order is Arcade gameplay, Challenge, Hard Mode, then the four-mode home screen. Captions describe actual features and sit outside uniformly scaled, unaltered native screens. No fake scores or state injection. Native game source/assets match archive 47. iPhone 17 Pro and iPad Pro 13-inch (M5), iOS 26.3 simulator runtime; 1206 × 2622 and 2064 × 2752 RGB output. Both final contact sheets and header visually inspected. No runtime source, icon, build number, or release artifact changed.

**Owner follow-up, October 16:** package ready for a post-review update; keep the active review moving. Curated files are backed up in `design/app-store/ios-1.0.11-build47/`. After approval, use Apple’s [standalone asset submission flow](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-assets-from-asset-library) where eligible; version-bound metadata or placements may require a later version update. Verify the subtitle save before applying remaining copy.

### Prepared optimized metadata (pending application)

Name: **Seva Jump** (unchanged). Subtitle: **Offline pixel platformer** (24 characters).

Promotional text (149 characters):

Jump through colorful skies in a Sikhi-inspired pixel adventure. Four modes, simple touch controls, and offline play—with no ads or in-app purchases.

Keywords (93 ASCII characters; avoids name/subtitle/category duplication):

`endless,arcade,sikh,sikhi,parshad,gurdwara,khalsa,climb,collect,retro,2d,high score,challenge`

Description:

Jump through colorful skies in a Sikhi-inspired pixel adventure. Play four modes with simple touch controls, collect parshad, and dodge birds. Enjoy offline play with no ads, in-app purchases, or accounts.

The birds have scattered the parshad! Choose one of two jumpers and help bring it back. Drag to steer as your character jumps automatically through Gurdwara-inspired scenery. Collect Khanda tokens, unlock helpful upgrades, earn badges, and beat your best runs.

FOUR WAYS TO PLAY

• Endless Run: Climb as high as you can.
• Arcade Mode: Reach 1,000 points and cross the finish.
• Challenge Mode: Recover all 50 parshad bowls before the finish.
• Hard Mode: Take on smaller, moving and breakable platforms with earlier bird encounters.

PLAY AT YOUR OWN PACE

Pause whenever you need a break. Adjust music and sound effects in Settings, replay the guide, and explore About & Help for controls and game items.

OFFLINE, WITH YOUR PROGRESS ON YOUR DEVICE

No ads, purchases, subscriptions, or accounts. Gameplay works without an internet connection. Progress, upgrades, badges, statistics, and preferences stay on your device. Reset all progress in Settings lets you start fresh. There is no cloud save.

INSPIRED BY SIKHI, MADE FOR EVERYONE

Seva means serving others with love and humility, without expecting a reward. Seva Jump is a make-believe adventure from Khalsa Game Studio, inspired by Sikhi and welcoming everyone. Fantasy items and scores describe game progress, not spiritual achievement, and do not replace Sikh teachings.

About & Help includes an optional link for learning more. External websites need an internet connection.

The historical submitted copy is retained below for comparison. After successful application, update the current-copy section and the saved/pending status above.

## App record

Historical October 12 live save: English copy, subtitle, review notes, URLs, and copyright are entered; version is 1.0.11, no sign-in required, manual release selected. Both four-image galleries are uploaded and accepted in the numbered order. Games/Casual is saved; Arcade is unavailable as a subcategory in the live form. Privacy is published as Data Not Collected; age rating is saved as 13+ pending Apple clarification. Content rights and the owner-authorized private review contact are saved. Free pricing, 173 launch regions and EU non-trader status are complete. Signed-build upload remains outstanding. No submission or publication.

| Field | Prepared value |
| --- | --- |
| Name | Seva Jump |
| Primary language | English (U.S.) |
| Platform | iOS, supporting iPhone and iPad |
| Bundle ID | org.sevajump.game (registered on team LSES4VT2GU) |
| SKU | sevajump-ios |
| Primary category | Games |
| Game subcategories | Casual (saved; Arcade is unavailable) |
| Price | Free |
| In-app purchases | None |
| Seller | Sunny Rajpal (active individual membership) |
| Copyright | 2026 Sunny Rajpal (saved) |

The studio brand remains Khalsa Game Studio in the description; do not substitute it for the individual account's legal seller name. Current source metadata is 1.0.11 / iOS build 47, with minimum iOS 15. Follow the release checklist and align release notes and version/build metadata before producing an upload artifact.

## Copy ready to paste

### Subtitle

Offline pixel jumping fun

### Promotional text

Climb through colorful skies in four jumping modes. Collect parshad, dodge birds, and unlock upgrades. Free to play offline, with no ads, purchases, or accounts.

### Keywords

platformer,arcade,casual,pixel,offline,climb,collect,birds,Sikh,Sikhi,parshad,gurdwara

### Description

The birds have scattered the parshad! Choose your jumper and climb through peaceful, Gurdwara-inspired skies to help bring it back.

Seva Jump is a cheerful jumping adventure from Khalsa Game Studio. Drag to steer through colorful pixel-art scenery, collect parshad bowls and Khanda tokens, avoid flying birds, and unlock helpful upgrades.

FOUR WAYS TO PLAY

Endless Run: Climb as high as you can.
Arcade Mode: Reach 1,000 points and break through the finish banner.
Challenge Mode: Recover all 50 parshad bowls before reaching the finish.
Hard Mode: Take on smaller moving and breakable platforms with earlier bird encounters.

PLAY AT YOUR OWN PACE

Choose between two jumpers, earn badges, and track your best runs. Pause whenever you need a break, and adjust music and sound effects in Settings.

FREE AND OFFLINE

No ads, in-app purchases, subscriptions, or accounts. Gameplay works without an internet connection. Your progress, preferences, upgrades, badges, and statistics stay locally on your device. You can erase them from Settings. There is no account or cloud save.

INSPIRED BY SIKHI, MADE FOR EVERYONE

Seva means serving others with love and humility, without expecting a reward. Seva Jump is one creator's make-believe adventure inspired by Sikhi, welcoming everyone to play and explore with curiosity. Its fantasy items and scores describe game progress, not spiritual achievement, and it does not replace Sikh teachings.

About & Help explains the controls, game items, and the difference between Sikh and Sikhi. An optional external link offers a starting point for learning more; external websites need an internet connection.

## URLs and contacts

- Privacy policy: https://srajpal.github.io/seva_jump_game/privacy.html
- Support URL: https://srajpal.github.io/seva_jump_game/privacy.html (the existing page includes a support email and support correspondence policy).
- Optional Marketing URL: https://www.khalsagamestudio.com/
- Public support email: khalsagamestudio.apps@gmail.com
- App Review contact: Sunny Rajpal; owner-supplied email and phone saved in Apple's private review fields October 12. Keep those private details out of public repository documentation.

Verified both public URLs in a normal browser October 12: the policy loads with the support email and no-data/local-save disclosures, and the marketing site loads with Seva Jump information. A dedicated support page can replace the Support URL later; the existing page already includes contact information in repository source. Apple requires a working [support URL with contact information](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information).

## App Review notes ready to paste

Seva Jump is a free, offline game. No login, demo account, ads, purchases, or subscription is required. The game and its artwork/audio are bundled inside the app; gameplay does not download web content.

To play, choose either character on the home screen, select Endless Run, and drag left or right to steer. The character jumps automatically. Dismiss the first-run guide if shown. Use the Pause button to pause and Resume to continue. Arcade Mode finishes at 1,000 points; Challenge Mode requires all 50 parshad bowls before the finish. Hard Mode introduces a more difficult platform route.

Settings contains music and sound controls and Reset all progress. Records, upgrades, badges, and preferences are local to this installation. About & Help contains the privacy information and optional links to the studio and an independent educational resource. These links open outside the game and are not required to play.

The fictional scenery is inspired by Sikh Gurdwaras. Sikh articles and emblems are used as intentional fantasy game items; scores are not presented as spiritual merit. The game welcomes everyone and does not depict or personify the Sikh Gurus.

## Privacy and rating preparation

EU DSA completed October 12: **non-trader**, based on the owner's clarified personal creative/community purpose without commercialization or paid-product promotion. Business shows DSA Active and completed regulatory requirements; Seva Jump App Information confirms non-trader for this app. This supersedes the earlier provisional trader choice/contact request. Reassess separately before distributing a future paid/commercial app.

Pricing/availability saved October 12: **Free ($0.00)** across storefronts, United States base region, **173 available / 2 not available**. China mainland and Vietnam are excluded because no required regional documents are held. Future-region automatic availability remains enabled. Public distribution, no pre-order, manual version release. Apple silicon Mac and Vision Pro distribution are disabled for the initial iPhone/iPad launch.

Content Rights saved October 12: **Yes, this app has the necessary rights to its third-party content**, based on the owner's explicit confirmation that all included code/artwork/audio/content is authorized in selected regions. Optional independent educational links open externally.

Export preparation: `ITSAppUsesNonExemptEncryption=false` is set in the iOS Info.plist. The dependency-free UIKit/WebKit wrapper packages local game files and implements no custom cryptography; optional external links use Apple OS services. This is a source-based determination under [Apple's export guidance](https://developer.apple.com/documentation/security/complying-with-encryption-export-regulations). Verify the same declaration and dependency composition in the signed archive before upload.

Apple Developer Support inquiry submitted October 12, 2026, case **102994481389**, under App Review → Other App Review questions. Requested classification and frequency guidance for Khanda emblem imagery and brief bird collisions/safe net landings. Email response pending; saved 13+ rating remains unchanged.

App Privacy answer **No, we do not collect data** was published in App Store Connect on October 12, 2026 after owner approval of the certification. The preview displays **Data Not Collected**. Local progress is not sent to the developer. Source policy and the iOS privacy manifest declare no tracking or collected data. Verify the final archive and its dependencies before submission. Optional external websites and support email operate under their own policies; gameplay sends no automatic diagnostics. Follow Apple's [App Privacy workflow](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy).

The saved October 12 questionnaire calculated **13+**, with regional exceptions, from frequent cartoon/fantasy violence and frequent weapons imagery answers. The latter includes swords in repeated Khanda emblems; no weapons are used in combat. Review this interpretation before submission because it exceeds the intended 8–15 audience. See RELEASE_PROGRESS.md for the full saved answers and regional results.

October 12 follow-up review: Apple's [current definitions](https://developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions/) include fantastical physical conflict or harm under cartoon/fantasy violence, and references or depictions of weapons (including swords) under guns/other weapons. The published reference supplies no explicit religious-emblem exception or numerical frequency threshold. The actual Khanda token is a Sikh emblem containing recognizable sword shapes, collected as currency and never wielded. Bird contact produces a one-second hit-stop, flashes/stars, and either protective effects or a safe seated net landing; there is no blood, injury depiction, combat, or death scene. Falls alone should not have been treated as evidence of frequent violence. Brief bird contact can reasonably be disclosed as mild cartoon conflict, but its potential recurrence prevents confidently equating mildness with the new questionnaire's Infrequent option. Neither Frequent answer is established as mandatory by a specific Apple ruling; both remain conservative interpretations. Do not silently substitute None or Infrequent to obtain a lower rating. Ask Apple Developer Support/App Review whether symbolic Khanda imagery belongs in the weapons field and how to classify brief recurring non-injurious collisions. The saved rating remains unchanged pending that clarification; artwork and gameplay are unchanged.

Complete Apple's age-rating questionnaire from the actual game; do not copy the Google Play rating or interpret the intended ages 8–15 as an Apple rating. No chat, user-generated content, advertising, gambling, purchases, or unrestricted in-app web browser is present in the reviewed source. Assess cartoon bird collisions, falling, and the shield effect against the questionnaire's actual violence definitions. Apple calculates the resulting rating. See [age-rating setup](https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating).

**Kids category remains an owner decision.** The intended audience includes ages 8–15. Apple's Kids category uses ages 5 and under, 6–8, or 9–11 and requires parental gates for external link-outs. The current studio and learning links open directly; Kids-category preparation would require a separate implementation and validation task. Do not select Made for Kids or claim Kids-category compliance from the game's no-data model alone. The proposed public copy avoids a specific age promise while preserving the established audience in project documentation. See [Apple's guidance for kids experiences](https://developer.apple.com/kids/).

Optional accessibility labels remain unclaimed; export compliance must be verified in the uploaded build. Content rights, EU status and selected regional availability are saved. Do not advertise full VoiceOver gameplay support based only on labelled menus or simulator accessibility checks.

## Screenshot preparation

Capture the final native iOS UI in portrait, with consistent character/art treatment. Use this sequence for both iPhone and iPad:

| Order | Capture | Optional caption |
| --- | --- | --- |
| 1 | Home with two characters and four modes | Choose your jumper |
| 2 | Active Arcade run with platforms, collectibles, and clear HUD | Climb through colorful skies |
| 3 | Challenge gameplay with bowl counter visible | Recover the scattered parshad |
| 4 | Upgrades or badges with representative local progress | Unlock upgrades and earn badges |
| 5 | Genuine Arcade completion or Hard Mode gameplay | Four ways to play |

Apple currently requires at least one screenshot for iPhone with Dynamic Island (medium display) and one for iPad 13-inch when iPad is supported. Use Apple's current [screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications) for accepted resolutions; iPad portrait options include 2064 × 2752 and 2048 × 2732. Images must have no alpha channel. Up to ten screenshots per device size are supported.

October 12 prepared gallery: four native captures each on iPhone 16 and iPad Pro 13-inch (M4), ordered home/Arcade/Challenge/upgrades, at `screenshots/app-store-1.0.11/{phone,pad}/`. Final opaque RGB PNG sizes are 1179 × 2556 and 2064 × 2752. The iPhone export required a one-pixel right-edge extension, with no UI scaling; the iPad is native resolution. Both contact sheets were visually reviewed. Checksums and provenance are included in `dist/SevaJump-1.0.11-iOS45-AppStore-screenshots.zip`. All eight screenshots were uploaded and accepted October 12; recapture if shipping UI/artwork changes. Exclude browser chrome, debug overlays, notification information, diagnostic instrumentation, and test currency. Preserve the no-Guru-depictions boundary in promotional artwork.

Existing App Store icon source: `ios/SevaJump/App/Assets.xcassets/AppIcon.appiconset/Icon-1024.png`. Validate the compiled icon and final screenshot set against the upload requirements. An app-preview video is optional and is not prepared here.

## Current submission status — October 15, 2026

- Signed and processed **1.0.11 (47)** is selected and submitted. Apple displays **Waiting for Review**; submission ID `2a6d343f-641c-4f61-9ab3-6d0b83b36650`. Manual release is retained for a separate public-launch action after approval.
- Owner confirmed the TestFlight build works in every mode on the physical iPhone. Native simulator and automated layout/rendering evidence is recorded in RELEASE_PROGRESS.md; physical iPad, cold offline launch and extended performance remain unverified.
- Owner reports the store listing now has a **4+** rating and explicitly authorized submission. This supersedes the historical October 12 13+ hold; no Apple Support ruling is claimed.
- Reset all progress remains a deliberate Settings feature with explanation and confirmation. No rebuild was needed for submission.
- Review Apple's response when available. Public publication remains separate from review approval.

Apple field limits: name and subtitle 30 characters; promotional text 170; description 4,000; keywords 100 bytes. References: [app information](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information/) and [version information](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information).

## TestFlight setup — October 12, 2026

The owner's existing App Store Connect account is the sole tester in **Owner Device Testing**, with build 1.0.11 (45) showing Testing. Automatic distribution is off. No additional user invitations or public testing link are prepared. Internal testing and external beta review are separate from App Store review.

**Beta description:** Seva Jump is a free, offline pixel jumping game with four modes, local progress, music and sound controls. No ads, purchases or sign-in.

**What to Test:** Check touch steering and readable portrait layouts on iPhone and iPad. Try Endless, Arcade, Challenge and Hard modes. Check Pause/Resume, a quick app switch and lock/unlock, music and sound, and saved progress after force-closing. With airplane mode and Wi-Fi off, launch the app again and play. Report the device model, OS, mode and steps for any clipping, crashes, sound issues or lost progress. Settings → Reset all progress intentionally clears the local save; test it only after other save checks.

Beta information and build-specific What to Test are saved. Feedback uses the public studio address already published in the privacy policy; private review contact remains only in Apple and ignored proof. Sign-in is not required. Internal access is configured; no external beta-review submission.

## TestFlight build 46 — October 15, 2026

Uploaded version 1.0.11 (46) with the iPhone clipping, tagline and menu-navigation fixes. Processing completed and the build was enabled for the existing **Owner Device Testing** internal group (one tester). Build-specific What to Test is saved. App Store version build selection is unchanged; see `RELEASE_PROGRESS.md` for evidence and status.

**What to Test:** iPhone layout and navigation fixes: check the full “A skyward seva adventure” tagline and logo, including on smaller iPhones. Start all four modes and check that the score, Pause button and full play area stay visible. Open every menu, scroll long pages to Back, and check Privacy returns to About. Replay or skip the guide from Settings; it should return there and keep an existing run paused. Check badge notifications do not cover dialog headings. Also check retained progress after updating, Pause/Resume, app switching and lock/unlock, music/sound, and a cold airplane-mode launch with Wi-Fi off. Report the device model, iOS version and steps for any clipping, unreachable controls or lost progress. Test Reset only after save-retention checks.

## TestFlight build 47 — October 15, 2026

Parshad visibility safeguard uploaded and processed October 15; What to Test saved and **1.0.11 (47)** verified **Testing** in the existing owner-only internal group. Evidence is tracked in `RELEASE_PROGRESS.md`. Retains build 46 layout/navigation fixes.

**What to Test:** Parshad visibility follow-up: look for visible golden parshad bowls before collecting them in all four modes, including after switching apps and locking/unlocking. Report any invisible pickups with device/iOS, mode and steps. Khanda tokens, kara/Nishan boosts and birds should remain visible. Also check retained progress, sound, Pause/Resume and the iPhone layout/menu fixes from build 46.
