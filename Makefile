.PHONY: help install build-web cap-init cap-sync apk-debug apk-release apk-install dev clean

help:
	@echo "eT Chat - Android Development Commands"
	@echo ""
	@echo "Setup & Installation:"
	@echo "  make install        - Install dependencies"
	@echo "  make cap-init       - Initialize Capacitor for Android (first time only)"
	@echo ""
	@echo "Development:"
	@echo "  make dev            - Start dev server (hot reload)"
	@echo "  make build-web      - Build web assets for production"
	@echo "  make cap-sync       - Sync web assets to Android"
	@echo ""
	@echo "Android APK:"
	@echo "  make apk-debug      - Build debug APK"
	@echo "  make apk-release    - Build release APK (requires keystore)"
	@echo "  make apk-install    - Install debug APK on connected device"
	@echo ""
	@echo "Testing & Debugging:"
	@echo "  make adb-logs       - Show app logs from device"
	@echo "  make adb-open       - Open Android project in Android Studio"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean          - Remove build artifacts"
	@echo "  make clean-deps     - Remove node_modules and lock files"

install:
	@echo "Installing dependencies..."
	npm install
	@echo "✓ Dependencies installed"

cap-init:
	@echo "Initializing Capacitor for Android..."
	npm install @capacitor/cli @capacitor/core @capacitor/android
	npx cap add android
	@echo "✓ Capacitor initialized. Set up ANDROID_HOME environment variable."

dev:
	@echo "Starting development server..."
	npm run dev

build-web:
	@echo "Building web assets..."
	npm run build
	@echo "✓ Web build complete"

cap-sync: build-web
	@echo "Syncing to Android..."
	npx cap sync android
	@echo "✓ Sync complete"

apk-debug: cap-sync
	@echo "Building debug APK..."
	cd android && ./gradlew assembleDebug
	@echo "✓ Debug APK built: android/app/build/outputs/apk/debug/app-debug.apk"

apk-release: cap-sync
	@echo "Building release APK..."
	cd android && ./gradlew assembleRelease
	@echo "✓ Release APK built: android/app/build/outputs/apk/release/app-release.apk"
	@echo "Note: Ensure keystore is configured in android/app/build.gradle"

apk-install: apk-debug
	@echo "Installing APK on device..."
	adb install -r android/app/build/outputs/apk/debug/app-debug.apk
	@echo "✓ APK installed"
	@echo "Launching app..."
	adb shell am start -n com.etchat.app/.MainActivity

adb-logs:
	@echo "Displaying app logs (press Ctrl+C to stop)..."
	adb logcat | grep -E "(eT|error|ERROR|WebRTC|RTCPeerConnection)"

adb-open:
	@echo "Opening Android project in Android Studio..."
	npx cap open android

clean:
	@echo "Cleaning build artifacts..."
	rm -rf dist
	cd android && ./gradlew clean
	@echo "✓ Clean complete"

clean-deps:
	@echo "Removing node_modules and lock files..."
	rm -rf node_modules
	rm -f package-lock.json
	rm -f bun.lockb
	@echo "✓ Dependencies removed"
	@echo "Run 'make install' to reinstall"

# Advanced commands
setup-release:
	@echo "Setting up release build configuration..."
	@echo "Follow these steps:"
	@echo "1. Generate keystore: keytool -genkey -v -keystore ~/etchat.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias etchat-key"
	@echo "2. Update android/app/build.gradle with keystore path"
	@echo "3. Set environment variables:"
	@echo "   export KEYSTORE_PASSWORD='your_password'"
	@echo "   export KEY_ALIAS='etchat-key'"
	@echo "   export KEY_PASSWORD='your_password'"
	@echo "4. Run: make apk-release"

profile-apk:
	@echo "Profiling APK size..."
	@ls -lh android/app/build/outputs/apk/debug/app-debug.apk
	@echo "APK contents:"
	@unzip -l android/app/build/outputs/apk/debug/app-debug.apk | tail -10

test-device:
	@echo "Checking connected devices..."
	adb devices -l
	@echo ""
	@echo "To test on device:"
	@echo "  make apk-install   - Install debug APK"
	@echo "  make adb-logs      - View logs"

test-emulator:
	@echo "Starting Android emulator..."
	emulator -avd Default
	@echo "Wait for emulator to start, then run: make apk-install"

# CI/CD helper
ci-build: install build-web cap-sync apk-debug
	@echo "✓ CI build complete"

# Development workflow helpers
watch:
	@echo "Watching for changes and syncing to Android..."
	@while true; do \
		make cap-sync; \
		echo "Waiting for changes..."; \
		sleep 5; \
	done

fast-sync: build-web
	@echo "Quick sync without full Gradle build..."
	npx cap sync android
	adb install -r android/app/build/outputs/apk/debug/app-debug.apk

debug-chrome:
	@echo "Debugging via Chrome DevTools..."
	@echo "Open: chrome://inspect"
	@echo "Then select the eT Chat app to debug"
