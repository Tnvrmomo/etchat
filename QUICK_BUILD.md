# 🚀 Quick Start: Build Android APK

## TL;DR - Fastest Way to Get APK

### Step 1: GitHub Actions (Recommended - 0 Setup)
```bash
git add .
git commit -m "Build APK"
git push origin main
```
Then check GitHub Actions tab for your APK (10-15 min)

### Step 2: Manual Build (If you have Android SDK)
```bash
npm install --legacy-peer-deps
npm run build
npm install @capacitor/cli @capacitor/core @capacitor/android --legacy-peer-deps
npx cap add android
cd android && ./gradlew assembleDebug
```
APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 3: Install on Device
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

## ✨ What You Get

- 📞 Google Meet-style call codes
- 📹 Real-time video calling
- 💬 In-call chat with emojis
- ✋ Hand raise system
- 📊 Network quality monitoring
- 📱 Works on Android 12+

---

## 📚 More Info

- [Full Build Guide](ANDROID_APK_BUILD.md)
- [Project Status](CONVERSION_COMPLETE.md)
- [Features](GOOGLE_MEET_FEATURES.md)

---

**Status**: ✅ Production Ready
