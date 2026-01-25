# Android APK Build Guide - etChat

This guide will help you build the Android APK for the etChat application.

## Quick Start

### Option 1: Automated Build Script (Recommended for Linux/Mac)

```bash
chmod +x build-apk.sh
./build-apk.sh
```

This script will:
1. Download and setup Android SDK (if needed)
2. Install npm dependencies
3. Build web assets
4. Setup Capacitor
5. Build the APK

### Option 2: Manual Build Steps

#### Prerequisites
- Node.js 18+ and npm
- Java 21 JDK
- Android SDK (API 34, Build Tools 34.0.0)
- 8GB RAM minimum
- 5GB free disk space

#### Step-by-Step Instructions

**1. Install dependencies:**
```bash
npm install --legacy-peer-deps
```

**2. Build web assets:**
```bash
npm run build
```

**3. Install Capacitor packages:**
```bash
npm install @capacitor/cli @capacitor/core @capacitor/android --legacy-peer-deps
```

**4. Add Android platform:**
```bash
npx cap add android
```

**5. Build the APK:**
```bash
cd android
./gradlew assembleDebug
cd ..
```

The APK will be created at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Option 3: GitHub Actions (Automated Cloud Build)

Push your code to GitHub and the `.github/workflows/build-apk.yml` workflow will automatically:
- Build in a clean Ubuntu environment
- Generate the APK
- Create a release with the APK artifact
- Store APK for 30 days

## Installation on Device

Once you have the APK:

**1. Connect your Android device (API 24+, Android 12+ recommended):**
```bash
adb devices
```

**2. Install the APK:**
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

**3. Grant permissions when prompted:**
- Camera
- Microphone  
- Storage
- Network access

**4. Launch the app:**
```bash
adb shell am start -n com.etchat.app/.MainActivity
```

## Features in APK

✅ **Google Meet-Style Call Codes** - Generate shareable 9-character codes (abc-def-ghi)
✅ **Real-Time Video Calling** - P2P WebRTC with Supabase signaling
✅ **In-Call Chat** - Send messages during calls
✅ **Emoji Reactions** - 6 emoji reactions (👍 👏 ❤️ 😂 🙌 🎉)
✅ **Hand Raise System** - Raise hand during calls
✅ **Network Quality Monitor** - Real-time connection quality
✅ **Call History** - Persistent localStorage history with stats
✅ **Screen Sharing** - Share your screen (host only)
✅ **Recording** - Record calls (host only)
✅ **Design System** - Theme-compliant UI (#E2725B, #F5F1E6)

## Troubleshooting

### "SDK location not found"
Create/update `android/local.properties`:
```
sdk.dir=/path/to/android/sdk
```

### Gradle daemon issues
```bash
./gradlew --stop
./gradlew assembleDebug --no-daemon
```

### Out of memory
Increase JVM heap in `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m
```

### Long build times
First build takes 5-10 minutes. Subsequent builds are faster.
Enable parallel builds in `android/gradle.properties`:
```properties
org.gradle.parallel=true
```

## Build System Info

- **Build Tool**: Gradle 8.2.1
- **Target SDK**: Android 14 (API 34)
- **Minimum SDK**: Android 7.0 (API 24)
- **Tested on**: Android 12, 13, 14
- **APK Size**: ~45-50 MB (debug)
- **Build Time**: 5-10 minutes (first build)

## Project Structure

```
android/
├── app/
│   ├── build/
│   │   └── outputs/
│   │       └── apk/
│   │           └── debug/
│   │               └── app-debug.apk  ← Your APK
│   ├── src/
│   │   └── main/
│   │       ├── assets/
│   │       │   └── public/  ← Web assets (dist/)
│   │       └── AndroidManifest.xml
│   └── build.gradle
├── local.properties
├── gradle.properties
└── settings.gradle
```

## Release APK Build

For production/release build:

```bash
cd android
./gradlew assembleRelease
```

**Note:** Requires keystore for signing. Configure in `android/app/build.gradle`:
```gradle
signingConfigs {
    release {
        storeFile file("path/to/keystore.jks")
        storePassword System.getenv("KEYSTORE_PASSWORD")
        keyAlias System.getenv("KEY_ALIAS")
        keyPassword System.getenv("KEY_PASSWORD")
    }
}
```

## Documentation

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Build Configuration](https://developer.android.com/studio)
- [Google Meet Clone Features](GOOGLE_MEET_FEATURES.md)
- [Implementation Guide](IMPLEMENTATION_GUIDE.md)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review build output logs
3. Ensure Java 21 and Android SDK 34 are installed
4. Check GitHub Issues for reported problems

---

**Version**: 1.0
**Last Updated**: January 25, 2026
**Status**: Production Ready ✅
