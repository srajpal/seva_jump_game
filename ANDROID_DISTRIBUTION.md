# Android distribution assessment

September 19, 2026. Planning research for Seva Jump 1.0.0, not confirmation of eligibility or an instruction to submit to additional stores.

## Recommendation

Prioritize Google Play, then a signed APK on the existing itch.io page or GitHub Releases. Consider Uptodown as the first additional catalog. Defer other stores until there is player demand or a clear mission benefit. Each store adds listings, review, release synchronization and support work; no evidence here establishes expected download volume.

| Channel | What publishing requires | Worth it for this game? |
| --- | --- | --- |
| Direct APK on itch.io / GitHub Releases | A release-signed APK, version/build, checksum, installation/update instructions and retained signing identity. Obtainium can track releases from supported sources such as GitHub. | Yes after signing and QA: reuses existing channels, makes Android access possible outside Play. Sideloading adds user friction and provides less store discovery. |
| F-Droid main repository | FLOSS code license, redistributable licensed artwork, dependency audit, documented source build and inclusion request/build metadata. Maintainers build and review the app. | Strong fit for the offline/no-tracking model, but currently blocked by the repository's all-rights-reserved policy. Pursue if the owner wants open-source distribution, not merely another download listing. |
| Uptodown | Free developer registration, app metadata and assets, privacy/support information, APK upload and review. | Reasonable first extra store. A small incremental publishing task once the signed APK and listing exist. Check update settings: editors can also obtain updates from official sources unless disabled. |
| Samsung Galaxy Store | Samsung account, Seller Portal registration, commercial seller approval even for free apps, binary/listing submission and Samsung-device QA. | Optional later. Seller verification adds work; confirm current private-seller eligibility and requested documents before committing. |
| Amazon Appstore | Developer submission and testing on supported Fire tablets; tablet-quality release assets. | Consider only for Fire tablet users. Amazon ended general non-Amazon Android distribution August 20, 2025. Fire TV would need different controls/layout, so it is outside this portrait touch game's present scope. |
| Huawei AppGallery | Huawei developer registration/verification, AppGallery Connect listing, supported package upload and review; test on the actual target device/OS. | Defer unless players request it. The lack of Google gameplay services is promising, but does not establish device compatibility or regional eligibility. |

## F-Droid work before submission

1. Ask the owner to choose a code license deliberately. Do not change the current license automatically. Public source availability is not an open-source license.
2. Document separate artwork redistribution terms and retain `CONTENT_REVIEW.md` provenance. F-Droid's policy treats non-functional assets separately; do not assume every asset must use the code license, or that all-rights-reserved assets qualify.
3. Audit all npm/Gradle dependencies and remove any unnecessary proprietary build dependency. Verify a clean Linux command-line build from a tagged revision, including Capacitor web sync. No published binary should rely on uncommitted local files.
4. Prepare app description, screenshots and F-Droid build metadata; submit an inclusion request or merge request following the current guide. Explain packaged offline gameplay and native Back/inset integration for review of the wrapper.
5. Resolve signing/update compatibility. F-Droid's own signing path may differ from Play; investigate reproducible upstream-signature builds if shared signing is required. Do not promise seamless cross-store updates before testing them.

A separate self-hosted F-Droid-compatible repository is possible, but adds hosting and update maintenance and does not mean inclusion in the main catalog. It is not the preferred first alternative.

## Signing decision before release

Keep the application ID and compatible app-signing identity consistent wherever cross-store updates are intended. The Play upload key and the key on installed Play APKs are different roles; signing a direct APK with the upload key alone does not make it compatible with Play installs.

Google documents two approaches: distribute a signed universal APK downloaded from Play Console, or supply your own app-signing key to Play and retain it securely for other stores. Choose and verify the approach before distributing a production APK. Keep keys/passwords outside the repository, and maintain monotonically increasing version codes across channels. Test installation and update behavior, local-save preservation and offline launch on the exact distributed APK. F-Droid requires separate consideration of its build/signing workflow.

For 1.0.0, retain the published 0.13.2 browser archive. Do not treat the new version number or a debug APK as a completed store release. API 36 migration, native QA, release signing and Play account/testing requirements remain tracked in `RELEASE_PROGRESS.md`.

## Sources

- [F-Droid inclusion policy](https://f-droid.org/en/docs/Inclusion_Policy/)
- [F-Droid submission guide](https://f-droid.org/docs/Submitting_to_F-Droid_Quick_Start_Guide/)
- [F-Droid developer FAQ](https://f-droid.org/docs/FAQ_-_App_Developers/)
- [Uptodown publishing guide](https://support.uptodown.com/hc/en-us/articles/360053260491-How-to-publish-an-app-on-Uptodown)
- [Uptodown registration overview](https://support.uptodown.com/hc/en-us/articles/4424141383181-Basic-guide-to-register-and-publish-apps-on-Uptodown)
- [Samsung seller preparation](https://developer.samsung.com/galaxy-store/prepare.html)
- [Amazon Android-store shutdown clarification](https://community.amazondeveloper.com/t/whats-changed-as-of-aug-20-amazon-appstore-for-android-shutdown/16282/2)
- [Huawei AppGallery](https://developer.huawei.com/consumer/en/appgallery)
- [Obtainium project and supported sources](https://github.com/ImranR98/Obtainium)
- [Google Play signing and alternative distribution](https://support.google.com/googleplay/android-developer/answer/9842756)
