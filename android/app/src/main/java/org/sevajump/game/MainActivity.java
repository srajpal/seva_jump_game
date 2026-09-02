package org.sevajump.game;

import android.graphics.Color;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private WebView gameWebView;
    private boolean immersiveRequested;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);

        gameWebView = getBridge().getWebView();
        gameWebView.addJavascriptInterface(new GameWindowBridge(), "SevaJumpAndroid");
        ViewCompat.setOnApplyWindowInsetsListener(gameWebView, (view, windowInsets) -> {
            Insets safeInsets = windowInsets.getInsets(
                WindowInsetsCompat.Type.systemBars()
                    | WindowInsetsCompat.Type.displayCutout()
                    | WindowInsetsCompat.Type.systemGestures()
            );
            publishInsets(safeInsets);
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
        String script = "document.documentElement.style.setProperty('--android-safe-top','" + top + "px');"
            + "document.documentElement.style.setProperty('--android-safe-right','" + right + "px');"
            + "document.documentElement.style.setProperty('--android-safe-bottom','" + bottom + "px');"
            + "document.documentElement.style.setProperty('--android-safe-left','" + left + "px');";
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
            immersiveRequested = active;
            runOnUiThread(() -> {
                if (active) hideSystemBars();
                else showSystemBars();
            });
        }
    }
}
