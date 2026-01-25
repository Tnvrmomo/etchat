# eT Chat - Android APK Build & Development Guide

## Overview
This guide provides comprehensive instructions for building an Android APK from the eT Chat codebase and managing ongoing development with parallel phases for UI/UX improvements and calling features.

## Project Architecture

### Current Stack
- **Frontend**: React 18.3 + TypeScript + Vite
- **UI Framework**: shadcn/ui with Tailwind CSS
- **Backend**: Supabase (Firebase-like)
- **Real-time**: WebRTC for calling, Supabase Realtime for messaging
- **Mobile**: Capacitor for native Android/iOS wrapping
- **PWA**: Fully progressive web app with offline support

### Design System
- **Primary Color**: #E2725B (Warm Orange)
- **Background**: #F5F1E6 (Off-white)
- **Typography**: Inter (display), Source Serif 4 (body), Caveat (handwritten)
- **UI Components**: Radix UI primitives + shadcn customizations

## Prerequisites

### System Requirements
```bash
# Node.js and npm
node --version  # v18+ required
npm --version   # v9+ recommended

# Java Development Kit (JDK)
java -version   # JDK 11+ required

# Android SDK
# Install via Android Studio or command line:
# https://developer.android.com/studio

# Gradle
gradle --version  # v8.0+ recommended
```

### Environment Setup
```bash
# 1. Install required tools
npm install -g @capacitor/cli

# 2. Clone and navigate to project
cd /workspaces/etchat

# 3. Install dependencies
npm install

# 4. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

## Build Instructions

### Step 1: Web Build
```bash
# Development build
npm run build:dev

# Production build
npm run build
```

### Step 2: Add Android Platform (First Time Only)
```bash
npm run cap:add:android
```

This creates:
- `/android` - Android project with Gradle configuration
- Native Android files structure
- Capacitor configuration for Android

### Step 3: Sync and Build
```bash
# Full sync (builds web + syncs to Android)
npm run cap:sync

# Or sync and build APK directly
npm run apk:debug      # Debug APK
npm run apk:release    # Release APK (requires signing)

# Or use the build script
bash build.android.sh
```

## Generated APK Locations

After building, APK files are located at:
```
android/app/build/outputs/apk/
├── debug/
│   ├── app-debug.apk
│   └── ...
└── release/
    ├── app-release.apk
    └── ...
```

## Installing on Device/Emulator

### Using ADB (Android Debug Bridge)
```bash
# List connected devices
adb devices

# Install debug APK
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Install release APK
adb install -r android/app/build/outputs/apk/release/app-release.apk

# Launch app
adb shell am start -n com.etchat.app/.MainActivity

# View logs
adb logcat | grep -E "(eT chat|error|ERROR)"

# Uninstall
adb uninstall com.etchat.app
```

### Using Android Studio
1. Open Android Studio
2. Run `npm run cap:open:android` to open the Android project
3. Select device/emulator
4. Click "Run" or "Debug"

## Development Workflow

### Parallel Development Phases

#### Phase 1: Enhanced Video Calling (In Progress)
- [x] Improved video call UI with larger video tiles
- [x] Picture-in-picture local video
- [x] Network quality indicators
- [x] Auto-hide controls on video calls
- [ ] Audio level meters
- [ ] Call recording capabilities
- [ ] Improved microphone/speaker management

#### Phase 2: Group Calling Features
- [x] Multi-participant grid view (2x2, 3x3, focus)
- [x] Participant status indicators (muted/video off)
- [x] Remove participant functionality
- [ ] Call scheduling
- [ ] Participant permissions/roles
- [ ] Meeting recordings

#### Phase 3: UI/UX Refinements
- [ ] Theme customization (light/dark modes)
- [ ] Animation improvements
- [ ] Touch gesture support (mobile-optimized)
- [ ] Accessibility improvements
- [ ] Haptic feedback on interactions
- [ ] Custom ringtones

#### Phase 4: Advanced Features
- [ ] Screen sharing improvements
- [ ] Virtual backgrounds
- [ ] Beauty filters
- [ ] Call transcription
- [ ] Chat integration in calls

### Making Changes During Development

```bash
# 1. Make code changes in src/
vim src/components/calling/SomeComponent.tsx

# 2. Test in browser (hot reload)
npm run dev
# Visit http://localhost:8080

# 3. Build web assets
npm run build

# 4. Sync to Android
npm run cap:sync

# 5. Install on device
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# 6. Or open in Android Studio for debugging
npm run cap:open:android
```

### Hot Reload Development
For faster iteration, use the dev server with live reload:

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Keep APK synced
npm run cap:sync && adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

## Capacitor Configuration

### Android-Specific Settings
File: `capacitor.config.ts`

```typescript
plugins: {
  SplashScreen: {
    launchShowDuration: 0,
  },
  Permissions: {},  // Required for camera/microphone
}
```

### Gradle Configuration
File: `android/app/build.gradle`

Key settings:
- `applicationId = "com.etchat.app"`
- `targetSdkVersion = 34` (Android 14)
- `minSdkVersion = 24` (Android 7.0)

### Permissions
File: `android/app/src/main/AndroidManifest.xml`

Required for calling:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

## Release Build Setup

### Generate Signing Key
```bash
# Create keystore (one-time)
keytool -genkey -v -keystore ~/etchat.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias etchat-key

# Store the password securely
```

### Configure Gradle for Signing
File: `android/app/build.gradle`

```gradle
signingConfigs {
  release {
    storeFile file('/path/to/etchat.keystore')
    storePassword System.getenv('KEYSTORE_PASSWORD')
    keyAlias System.getenv('KEY_ALIAS')
    keyPassword System.getenv('KEY_PASSWORD')
  }
}

buildTypes {
  release {
    signingConfig signingConfigs.release
    minifyEnabled true
    proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
  }
}
```

### Build Release APK
```bash
export KEYSTORE_PASSWORD="your_password"
export KEY_ALIAS="etchat-key"
export KEY_PASSWORD="your_password"

npm run apk:release
```

## Enhanced Calling Components

### New Components

#### EnhancedVideoCallScreen
Located: `src/components/calling/EnhancedVideoCallScreen.tsx`

Features:
- Full-screen video with PIP local video
- Automatic control hiding on connected calls
- Network quality indicators
- Enhanced mute/video/screen share controls
- Call duration timer
- Responsive design

Usage:
```tsx
<EnhancedVideoCallScreen
  callerName={name}
  callerAvatar={avatar}
  callState={callState}
  localStream={localStream}
  remoteStream={remoteStream}
  isMuted={isMuted}
  isVideoOff={isVideoOff}
  isScreenSharing={isScreenSharing}
  onToggleMute={toggleMute}
  onToggleVideo={toggleVideo}
  onToggleCamera={toggleCamera}
  onToggleScreenShare={toggleScreenShare}
  onEndCall={endCall}
  networkQuality="excellent"
  callType="video"
/>
```

#### GroupVideoCallEnhanced
Located: `src/components/calling/GroupVideoCallEnhanced.tsx`

Features:
- Multi-participant grid display
- Dynamic layout switching (2x2, 3x3, focus)
- Participant status indicators
- Integrated controls
- Screen share support

Usage:
```tsx
<GroupVideoCall
  groupName={groupName}
  participants={participants}
  localStream={localStream}
  isMuted={isMuted}
  isVideoOff={isVideoOff}
  isScreenSharing={isScreenSharing}
  onToggleMute={toggleMute}
  onToggleVideo={toggleVideo}
  onToggleScreenShare={toggleScreenShare}
  onEndCall={endCall}
  callDuration={duration}
/>
```

## WebRTC Implementation

### Current Capabilities
- Audio calls (voice)
- Video calls (1-to-1)
- Screen sharing
- Mute/unmute
- Video on/off
- Camera switching

### Key Files
- `src/utils/webrtc/RTCManager.ts` - Core WebRTC logic
- `src/hooks/useWebRTC.ts` - React hook wrapper
- `src/hooks/useRealtimeCalls.ts` - Realtime signaling

### Improving WebRTC

#### Audio Level Monitoring
```typescript
// In RTCManager
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
const source = audioContext.createMediaStreamAudioTraceSource(localStream);
source.connect(analyser);

// Monitor levels in real-time for UI feedback
```

#### Network Quality Detection
```typescript
// Monitor RTCPeerConnection stats
peerConnection.getStats().then(report => {
  report.forEach(stats => {
    if (stats.type === 'inbound-rtp') {
      const bitrate = (stats.bytesReceived * 8) / stats.timestamp;
      // Emit network quality based on bitrate
    }
  });
});
```

## Testing

### Unit Tests
```bash
# Add test dependencies
npm install -D vitest @testing-library/react

# Run tests
npm test
```

### Device Testing
```bash
# Real device
adb reverse tcp:8080 tcp:8080
# Then access http://localhost:8080 on device

# Emulator
# Emulator automatically forwards ports
```

### Performance Testing
```bash
# Lighthouse audit
npm run build
npm run preview
# Then run Chrome DevTools Lighthouse

# Monitor APK size
ls -lh android/app/build/outputs/apk/debug/app-debug.apk
```

## Troubleshooting

### Common Issues

#### Camera/Microphone Permissions
```bash
# Check permissions on device
adb shell pm list permission-groups

# Grant permissions
adb shell pm grant com.etchat.app android.permission.CAMERA
adb shell pm grant com.etchat.app android.permission.RECORD_AUDIO
```

#### Build Failures
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew build

# Update gradle
./gradlew wrapper --gradle-version=8.0
```

#### Blank Screen on Launch
1. Check logcat: `adb logcat | grep eT`
2. Ensure web assets built: `npm run build`
3. Verify Capacitor sync: `npm run cap:sync`

#### WebRTC Connection Issues
- Check browser console for errors
- Verify STUN/TURN servers in RTCManager
- Test with simple example: `https://webrtc.org/`

## Performance Optimization

### Bundle Size
```bash
# Analyze bundle
npm install -D rollup-plugin-visualizer
npm run build -- --mode analyze
```

### Runtime Performance
- Lazy load components: `React.lazy()`
- Memoize expensive components: `React.memo()`
- Use virtualization for lists

### Mobile-Specific
- Disable non-critical animations on low-end devices
- Optimize video codec selection
- Implement network-aware quality selection

## Resources

### Documentation
- [Capacitor](https://capacitorjs.com/docs)
- [WebRTC](https://webrtc.org/)
- [Supabase](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Communities
- [Capacitor Discord](https://discord.gg/capacitor)
- [WebRTC Community](https://discuss.webrtc.org/)
- [React Community](https://react.dev/community)

## Next Steps

1. ✅ Set up Capacitor for Android
2. ✅ Create enhanced video calling UI
3. ✅ Create group calling components
4. 🔄 Test on physical Android devices
5. 🔄 Implement audio level metering
6. 🔄 Add call quality metrics
7. 🔄 Optimize video codec selection
8. 🔄 Implement background calling
9. 🔄 Add call notifications
10. 🔄 Submit to Google Play Store

---

**Last Updated**: January 25, 2026
**Version**: 1.0.0
**Status**: Ready for Android Build
