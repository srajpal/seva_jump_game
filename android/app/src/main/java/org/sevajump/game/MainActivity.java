package org.sevajump.game;

import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;

public class MainActivity extends BridgeActivity {
    private WebView gameWebView;
    private boolean immersiveRequested;
    private Insets latestInsets = Insets.NONE;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        gameWebView = getBridge().getWebView();
        gameWebView.addJavascriptInterface(new GameWindowBridge(), "SevaJumpAndroid");
        getBridge().addWebViewListener(new WebViewListener() {
            @Override
            public void onPageLoaded(WebView view) {
                // A reload replaces the root element even when native insets do not change.
                publishInsets(latestInsets);
                ViewCompat.requestApplyInsets(view);
            }
        });
        ViewCompat.setOnApplyWindowInsetsListener(gameWebView, (view, windowInsets) -> {
            Insets safeInsets = windowInsets.getInsets(
                WindowInsetsCompat.Type.systemBars()
                    | WindowInsetsCompat.Type.displayCutout()
                    | WindowInsetsCompat.Type.systemGestures()
            );
            latestInsets = safeInsets;
            publishInsets(latestInsets);
            return windowInsets;
        });
        ViewCompat.requestApplyInsets(gameWebView);
        showSystemBars();
    }

    private void publishInsets(Insets insets) {
        float density = getResources().getDisplayMetrics().density;
        int top = Math.round(insets.top / density);
        int right = Math.round(insets.right / density);
        int bottom = Math.round(insets.bottom / density);
        int left = Math.round(insets.left / density);
        // Insets can arrive before the new document has a root. onPageLoaded republishes them.
        String script = "(() => { const root = document.documentElement; if (!root) return;"
            + "root.style.setProperty('--android-safe-top','" + top + "px');"
            + "root.style.setProperty('--android-safe-right','" + right + "px');"
            + "root.style.setProperty('--android-safe-bottom','" + bottom + "px');"
            + "root.style.setProperty('--android-safe-left','" + left + "px'); })();";
        gameWebView.post(() -> gameWebView.evaluateJavascript(script, null));
    }

    private WindowInsetsControllerCompat systemBarsController() {
        return WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
    }

    private void hideSystemBars() {
        WindowInsetsControllerCompat controller = systemBarsController();
        controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        controller.hide(WindowInsetsCompat.Type.systemBars());
    }

    private void showSystemBars() {
        systemBarsController().show(WindowInsetsCompat.Type.systemBars());
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus && immersiveRequested) hideSystemBars();
    }

    private final class GameWindowBridge {
        @JavascriptInterface
        public void setGameplayActive(boolean active) {
            runOnUiThread(() -> {
                immersiveRequested = active;
                if (active) hideSystemBars();
                else showSystemBars();
            });
        }
    }
}
