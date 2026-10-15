import UIKit
@preconcurrency import WebKit

final class GameViewController: UIViewController, WKNavigationDelegate, WKUIDelegate {
    private let webView = WKWebView(frame: .zero, configuration: GameViewController.configuration)
    private var interrupted = false

    func pauseForAppInterruption() {
        interrupted = true
        webView.evaluateJavaScript("window.dispatchEvent(new Event('blur'));")
    }

    func completeAppInterruption() {
        guard interrupted else { return }
        interrupted = false
        // WebKit can defer script execution while suspended. Repeat on return
        // so a short app switch always reaches the game's existing pause path.
        webView.evaluateJavaScript("window.dispatchEvent(new Event('blur'));")
    }

    private static let configuration: WKWebViewConfiguration = {
        let configuration = WKWebViewConfiguration()
        configuration.defaultWebpagePreferences.allowsContentJavaScript = true
        configuration.userContentController.addUserScript(
            WKUserScript(
                source: """
                window.Capacitor = {
                  isNativePlatform: function () { return true; },
                  getPlatform: function () { return 'ios'; },
                  Plugins: {}
                };
                (function applyIOSPresentation() {
                  var root = document.documentElement;
                  if (!root) {
                    document.addEventListener('DOMContentLoaded', applyIOSPresentation, { once: true });
                    return;
                  }
                  root.classList.add('ios-native');
                  var style = document.createElement('style');
                  style.textContent = `
                    /* Fit the canvas below the HUD. An overflowing canvas can
                       scroll the frame when focused, carrying menus and HUD
                       above the screen even with native scrolling disabled. */
                    .ios-native { --ios-canvas-ratio: .5625; --ios-hud-height: 74px; }
                    .ios-native.native-app .game-frame {
                      overflow: hidden;
                      overflow: clip;
                      padding-bottom: var(--safe-bottom);
                    }
                    .ios-native.native-app canvas {
                      width: min(100%, calc((100vh - var(--ios-hud-height) - var(--safe-top) - var(--safe-bottom)) * var(--ios-canvas-ratio)));
                      width: min(100%, calc((100dvh - var(--ios-hud-height) - var(--safe-top) - var(--safe-bottom)) * var(--ios-canvas-ratio)));
                      height: auto;
                      max-height: 100%;
                      margin: 0 auto;
                      aspect-ratio: auto;
                      object-fit: contain;
                    }
                    @media (min-width: 700px) and (min-height: 700px) {
                      .ios-native { --ios-canvas-ratio: .8; }
                    }
                    @media (min-width: 700px) and (min-height: 900px) {
                      .ios-native { --ios-hud-height: 96px; }
                    }
                    .ios-native.native-app .overlay {
                      justify-content: flex-start;
                      padding-top: max(18px, calc(var(--safe-top) + 12px));
                      padding-bottom: max(22px, calc(var(--safe-bottom) + 12px));
                      padding-left: max(18px, var(--safe-left));
                      padding-right: max(18px, var(--safe-right));
                      scroll-padding-top: calc(var(--safe-top) + 12px);
                      scroll-padding-bottom: calc(var(--safe-bottom) + 12px);
                    }
                    @supports (justify-content: safe center) {
                      .ios-native.native-app .overlay { justify-content: safe center; }
                    }
                    .ios-native.native-app .overlay button,
                    .ios-native.native-app .overlay select,
                    .ios-native.native-app .pause-settings label {
                      min-height: 44px;
                    }
                    .ios-native.native-app .overlay button { min-width: 44px; }
                    .ios-native.native-app .overlay a {
                      display: inline-flex;
                      align-items: center;
                      min-height: 44px;
                      max-width: 100%;
                      overflow-wrap: anywhere;
                    }
                    .ios-native.native-app .info-button {
                      width: 44px;
                      height: 44px;
                      flex-shrink: 0;
                      font-size: .9rem;
                    }
                    /* Earned badges remain in Records; their toast must not
                       cover a dialog heading or its navigation. */
                    .ios-native #badge-toast[inert],
                    .ios-native #end-screen:not(.hidden) ~ #badge-toast { display: none; }
                    .ios-native .game-tools {
                      top: calc(var(--safe-top) + 8px);
                      right: calc(var(--safe-right) + 10px);
                    }
                    .ios-native #pause-button:not(.hidden) {
                      position: relative;
                      display: grid;
                      width: 44px;
                      height: 44px;
                      padding: 0;
                      place-items: center;
                      border: 1px solid rgba(36, 72, 63, .55);
                      background: rgba(255, 249, 238, .88);
                      box-shadow: 0 2px 0 rgba(82, 113, 101, .65), 0 3px 8px rgba(36, 49, 45, .18);
                      color: transparent;
                      font-size: 0;
                      -webkit-appearance: none;
                      appearance: none;
                      -webkit-backdrop-filter: blur(10px);
                      backdrop-filter: blur(10px);
                    }
                    .ios-native #pause-button::before,
                    .ios-native #pause-button::after {
                      position: absolute;
                      width: 4px;
                      height: 17px;
                      border-radius: 2px;
                      background: #24483f;
                      content: '';
                    }
                    .ios-native #pause-button::before { transform: translateX(-4px); }
                    .ios-native #pause-button::after { transform: translateX(4px); }
                    .ios-native #pause-button:active {
                      transform: translateY(1px);
                      box-shadow: 0 1px 0 rgba(82, 113, 101, .65), 0 2px 5px rgba(36, 49, 45, .16);
                    }
                    .ios-native .mobile-hud-mode {
                      bottom: max(8px, var(--safe-bottom));
                    }
                    @media (max-height: 720px) {
                      .ios-native .home-screen {
                        gap: 4px;
                        padding-top: max(8px, var(--safe-top));
                        padding-bottom: max(8px, var(--safe-bottom));
                      }
                      .ios-native .home-screen .eyebrow {
                        display: block;
                        margin: 0;
                        font-size: .68rem;
                      }
                      .ios-native .home-screen h1 {
                        font-size: 3rem;
                      }
                      .ios-native .home-content {
                        gap: 3px;
                      }
                      .ios-native .story-card {
                        padding-top: 6px;
                        padding-bottom: 6px;
                      }
                      .ios-native .home-scene {
                        height: 122px;
                        min-height: 122px;
                      }
                      .ios-native .home-scene .scene-character {
                        height: 116px !important;
                      }
                      .ios-native .scene-girl {
                        top: 3px;
                      }
                      .ios-native .scene-boy {
                        top: 5px;
                      }
                      .ios-native .scene-bowl {
                        width: 58px;
                        left: calc(50% - 29px);
                      }
                      .ios-native .mode-actions {
                        gap: 5px;
                      }
                      .ios-native .mode-actions button {
                        min-height: 50px;
                        padding-top: 5px;
                        padding-bottom: 5px;
                      }
                      .ios-native .mode-help {
                        margin: 1px 0;
                      }
                      .ios-native .home-utilities {
                        gap: 4px;
                        padding-top: 4px;
                      }
                      .ios-native .home-links {
                        gap: 5px;
                      }
                      .ios-native .home-screen .home-links .secondary {
                        min-height: 44px;
                      }
                      .ios-native .game-version {
                        margin-top: 1px;
                      }
                    }
                  `;
                  (document.head || root).appendChild(style);
                }());
                """,
                injectionTime: .atDocumentStart,
                forMainFrameOnly: true
            )
        )
        return configuration
    }()

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 0.737, green: 0.906, blue: 0.937, alpha: 1)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.isOpaque = false
        webView.backgroundColor = view.backgroundColor
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.isScrollEnabled = false
        webView.scrollView.bounces = false
        webView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(webView)
        NSLayoutConstraint.activate([
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            webView.topAnchor.constraint(equalTo: view.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])

        guard let indexURL = Bundle.main.url(forResource: "index", withExtension: "html") else {
            assertionFailure("The bundled Seva Jump web files are missing.")
            return
        }
        webView.loadFileURL(indexURL, allowingReadAccessTo: Bundle.main.bundleURL)
    }

    func webView(
        _ webView: WKWebView,
        decidePolicyFor navigationAction: WKNavigationAction,
        decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
    ) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.cancel)
            return
        }
        if url.isFileURL {
            decisionHandler(.allow)
        } else {
            UIApplication.shared.open(url)
            decisionHandler(.cancel)
        }
    }

    func webView(
        _ webView: WKWebView,
        createWebViewWith configuration: WKWebViewConfiguration,
        for navigationAction: WKNavigationAction,
        windowFeatures: WKWindowFeatures
    ) -> WKWebView? {
        if let url = navigationAction.request.url {
            UIApplication.shared.open(url)
        }
        return nil
    }
}
