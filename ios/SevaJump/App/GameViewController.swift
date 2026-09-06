import UIKit
@preconcurrency import WebKit

final class GameViewController: UIViewController, WKNavigationDelegate, WKUIDelegate {
    private let webView = WKWebView(frame: .zero, configuration: GameViewController.configuration)

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
                    .ios-native .game-tools {
                      top: calc(var(--safe-top) + 8px);
                      right: calc(var(--safe-right) + 10px);
                    }
                    .ios-native .game-tool {
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
                    .ios-native .game-tool::before,
                    .ios-native .game-tool::after {
                      position: absolute;
                      width: 4px;
                      height: 17px;
                      border-radius: 2px;
                      background: #24483f;
                      content: '';
                    }
                    .ios-native .game-tool::before { transform: translateX(-4px); }
                    .ios-native .game-tool::after { transform: translateX(4px); }
                    .ios-native .game-tool:active {
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
                        display: none;
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
