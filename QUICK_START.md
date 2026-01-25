# Quick Start Guide - eT Chat Android APK

## 🚀 Get Started in 5 Minutes

### Prerequisites
- ✅ Node.js 18+ installed
- ✅ Android SDK installed (API 24+)
- ✅ JDK 11+ installed
- ✅ Android device or emulator

### Step 1: Clone & Install (2 min)
```bash
cd /workspaces/etchat
npm install
```

### Step 2: Initialize Android (1 min)
```bash
npm run cap:add:android
```

### Step 3: Build APK (2 min)
```bash
npm run apk:debug
```

### Step 4: Install & Run
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.etchat.app/.MainActivity
```

**Done! 🎉**

---

## 📁 Important Files

### Configuration
- `capacitor.config.ts` - Android app settings
- `package.json` - Dependencies and build scripts
- `android/app/build.gradle` - Android build config
- `android/app/src/main/AndroidManifest.xml` - Permissions and manifest

### New Components
- `src/components/calling/EnhancedVideoCallScreen.tsx` - Enhanced video UI
- `src/components/calling/GroupVideoCallEnhanced.tsx` - Group calling
- `src/hooks/useCallQuality.ts` - Network quality monitoring

### Documentation
- `ANDROID_BUILD_GUIDE.md` - Complete build instructions
- `IMPLEMENTATION_GUIDE.md` - Feature implementation details
- `DEVELOPMENT_ROADMAP.md` - Project roadmap and phases
- `Makefile` - Development shortcuts

---

## 🛠️ Common Commands

### Using npm
```bash
npm run dev                # Start dev server (http://localhost:8080)
npm run build             # Build web assets
npm run cap:sync          # Sync web to Android
npm run apk:debug         # Build debug APK
npm run apk:release       # Build release APK
npm run cap:open:android  # Open in Android Studio
```

### Using Makefile (Recommended)
```bash
make help                 # Show all commands
make install              # Install dependencies
make dev                  # Start dev server
make apk-debug            # Build and install APK
make apk-install          # Just install APK
make adb-logs             # View device logs
make adb-open             # Open Android Studio
```

### Using adb
```bash
adb devices               # List connected devices
adb install -r app.apk   # Install APK with replace
adb logcat               # View all logs
adb logcat | grep eT     # Filter for app logs
adb shell am start -n com.etchat.app/.MainActivity  # Launch app
```

---

## 🎯 Development Workflow

### Fast Iteration Loop
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Watch and sync
while true; do
  npm run build
  npm run cap:sync
  adb install -r android/app/build/outputs/apk/debug/app-debug.apk
  sleep 10
done
```

### Or Use Makefile
```bash
make watch    # Auto-syncs on file changes
```

---

## 🐛 Troubleshooting

### APK Won't Install
```bash
# Check device connectivity
adb devices

# Uninstall first
adb uninstall com.etchat.app

# Then install
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### Build Fails
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew build

# Or use
make clean
make apk-debug
```

### No Permissions
```bash
# Grant permissions
adb shell pm grant com.etchat.app android.permission.CAMERA
adb shell pm grant com.etchat.app android.permission.RECORD_AUDIO
```

### Black Screen
```bash
# Check logs
adb logcat | grep -E "eT|error"

# Ensure web build is complete
npm run build
npm run cap:sync
```

---

## 📱 Testing Checklist

- [ ] App launches without crashing
- [ ] Can make audio calls
- [ ] Can make video calls
- [ ] Mute/unmute works
- [ ] Video on/off works
- [ ] Call duration displays correctly
- [ ] Can end calls
- [ ] Network quality shows correctly
- [ ] Controls hide on long video calls
- [ ] Touch all buttons without crashes

---

## 🎨 Custom Design Preservation

Your existing design system is preserved:
- **Color Scheme**: Warm orange (#E2725B) primary, off-white (#F5F1E6) background
- **Typography**: Inter display, Source Serif 4 body, Caveat handwritten
- **Components**: shadcn/ui with Tailwind CSS
- **Themes**: Light/dark mode support ready for Phase 3

---

## 📚 Next Steps

### Phase 1 (Current) ✅
- [x] Android APK setup
- [x] Enhanced video calling
- [x] Call quality monitoring
- [x] Documentation

### Phase 2 (Next) 🚀
- [ ] Group calling (2-50 participants)
- [ ] Advanced audio features
- [ ] Call recording

### Phase 3 (Future) 🎨
- [ ] Theme customization
- [ ] Mobile optimization
- [ ] Accessibility improvements

### Phase 4 (Advanced) 🔮
- [ ] Virtual backgrounds
- [ ] Advanced filters
- [ ] In-call chat

---

## 💡 Tips & Tricks

### Faster Builds
```bash
# Skip tests and checks
cd android
./gradlew assembleDebug --no-daemon

# Use local emulator (faster than cloud)
emulator -avd Default
```

### Debug Calling Issues
```bash
# View WebRTC logs
adb logcat | grep WebRTC

# Check network connectivity
adb shell ping 8.8.8.8

# Monitor battery usage
adb shell dumpsys battery
```

### Performance Monitoring
```bash
# Check memory usage
adb shell dumpsys meminfo com.etchat.app

# View CPU usage
adb shell top -n 1 | grep etchat

# Monitor network
adb shell dumpsys connectivity
```

---

## 📞 Support & Resources

### Documentation
- [Full Android Build Guide](ANDROID_BUILD_GUIDE.md)
- [Implementation Details](IMPLEMENTATION_GUIDE.md)
- [Project Roadmap](DEVELOPMENT_ROADMAP.md)

### External Resources
- [Capacitor Documentation](https://capacitorjs.com/)
- [WebRTC Examples](https://github.com/webrtc/samples)
- [Android Developer Docs](https://developer.android.com/)

### Getting Help
- Check device logs: `make adb-logs`
- Review console in dev server
- Check GitHub issues
- Ask in community channels

---

## 🎬 Starting Your First Video Call

1. **Get two devices ready** (phones, tablets, or emulators)
2. **Both install the APK**
3. **Create/login to accounts** on both devices
4. **Find each other** in contacts
5. **Tap to start video call** 📞
6. **Test controls** during call
7. **End call** and check quality metrics

---

**Version**: 1.0.0
**Last Updated**: January 25, 2026
**Status**: Ready for Use

Questions? Check the documentation files or review the code comments in component files.
