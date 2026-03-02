#!/bin/bash
# Quick APK Installation & Test Guide for eT Chat

set -e

echo "=========================================="
echo "eT Chat APK Installation Guide"
echo "=========================================="

APK_PATH="/workspaces/etchat/android/app/build/outputs/apk/debug/app-debug.apk"

# Check if APK exists
if [ ! -f "$APK_PATH" ]; then
    echo "❌ APK not found at $APK_PATH"
    echo "Build the APK first with: npm run build && npx cap sync android && cd android && ./gradlew assembleDebug"
    exit 1
fi

APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
echo "✅ APK Found: $APK_PATH"
echo "📦 Size: $APK_SIZE"
echo ""

# Check for ADB
if ! command -v adb &> /dev/null; then
    echo "⚠️  ADB not found in PATH"
    echo "Install Android SDK or add it to PATH:"
    echo "   export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
    exit 1
fi

echo "=========================================="
echo "Connected Android Devices"
echo "=========================================="
if adb devices | grep -q "device$"; then
    adb devices
    echo ""
    echo "=========================================="
    echo "Installing APK..."
    echo "=========================================="
    adb install -r "$APK_PATH"
    
    echo ""
    echo "=========================================="
    echo "Verifying Installation"
    echo "=========================================="
    if adb shell pm list packages | grep -q "com.etchat.app"; then
        echo "✅ App installed successfully!"
        echo ""
        echo "=========================================="
        echo "Launch Commands"
        echo "=========================================="
        echo "• adb shell am start -n com.etchat.app/.MainActivity"
        echo "• View logs: adb logcat | grep 'eT\\|Capacitor'"
        echo "• Uninstall: adb uninstall com.etchat.app"
    else
        echo "❌ Installation verification failed"
        exit 1
    fi
else
    echo "❌ No Android devices connected!"
    echo ""
    echo "Steps:"
    echo "1. Connect your Android device via USB"
    echo "2. Enable USB Debugging (Settings > Developer Options)"
    echo "3. Run this script again"
    echo ""
    echo "Or install manually:"
    echo "   1. Copy app-debug.apk to your phone"
    echo "   2. Enable 'Unknown Sources' in Settings > Security"
    echo "   3. Tap the APK file to install"
fi

echo ""
echo "=========================================="
echo "Next Steps"
echo "=========================================="
echo "1. Open eT Chat app on your device"
echo "2. Grant permissions (Camera, Microphone, etc.)"
echo "3. Sign in with access code"
echo "4. Test calling and messaging features"
echo "5. Check notifications"
echo ""
echo "📱 App ID: com.etchat.app"
echo "📦 Version: 1.0"
echo "🎯 Target: Android 12-14"
echo "=========================================="
