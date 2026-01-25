# Android APK Build & Deployment Checklist

## Pre-Build Requirements ✓

### Environment Setup
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm 9+ installed (`npm --version`)
- [ ] Android SDK installed (API 24+)
- [ ] JDK 11+ installed (`java -version`)
- [ ] ANDROID_HOME environment variable set
- [ ] Gradle 8.0+ available (`gradle --version`)
- [ ] Git configured for version control

### Project Preparation
- [ ] Clone repository complete
- [ ] `npm install` completed successfully
- [ ] No dependency conflicts
- [ ] .env file configured with Supabase credentials
- [ ] All TypeScript errors resolved
- [ ] Code linting passes (`npm run lint`)

### Device/Emulator Ready
- [ ] Physical Android device OR emulator running
- [ ] Device connected via USB (physical) or running (emulator)
- [ ] USB debugging enabled (physical devices)
- [ ] Sufficient storage (100+ MB free)
- [ ] Android version 7.0+ (API 24+)
- [ ] Camera and microphone available (for testing)

---

## Capacitor Setup ✓

### First-Time Setup
- [ ] `npm run cap:add:android` executed successfully
- [ ] `/android` directory created with all files
- [ ] `android/gradlew` is executable
- [ ] No permission errors on gradle files
- [ ] Android manifest reviewed for accuracy
- [ ] App ID confirmed: `com.etchat.app`
- [ ] Minimum SDK set to 24
- [ ] Target SDK set to 34 or higher

### Configuration Review
- [ ] `capacitor.config.ts` configured correctly
- [ ] App name: "eT chat"
- [ ] Web directory: "dist"
- [ ] Permissions configured:
  - [ ] CAMERA
  - [ ] RECORD_AUDIO
  - [ ] INTERNET
  - [ ] ACCESS_NETWORK_STATE

---

## Code Review & Testing ✓

### Component Implementation
- [ ] `EnhancedVideoCallScreen.tsx` reviewed
- [ ] `GroupVideoCallEnhanced.tsx` reviewed
- [ ] `useCallQuality.ts` hook reviewed
- [ ] No TypeScript errors in new components
- [ ] All imports correctly resolved
- [ ] Styling preserved (colors, fonts, layout)

### Existing Code Preservation
- [ ] Original components untouched:
  - [ ] `VideoCallScreen.tsx`
  - [ ] `VoiceCallScreen.tsx`
  - [ ] `IncomingCallModal.tsx`
  - [ ] All hooks remain functional
- [ ] No breaking changes to API
- [ ] Backward compatibility maintained
- [ ] Existing tests still passing

### Web Build Testing
- [ ] `npm run build` completes without errors
- [ ] `dist/` directory created with all files
- [ ] No missing assets or images
- [ ] CSS and JavaScript properly bundled
- [ ] Source maps generated (optional)
- [ ] Build size acceptable (< 15 MB)

---

## APK Build Process ✓

### Initial Build
- [ ] Run `npm run apk:debug`
- [ ] Or use shortcut: `make apk-debug`
- [ ] Build completes without errors
- [ ] No Java compilation errors
- [ ] No Gradle resolution issues
- [ ] No missing dependencies
- [ ] APK file generated successfully
- [ ] APK size reasonable (15-50 MB)

### APK File Verification
- [ ] Debug APK located at:
  - `android/app/build/outputs/apk/debug/app-debug.apk`
- [ ] APK file size verified (not corrupted)
- [ ] APK signature valid
- [ ] Build timestamp current
- [ ] Backup copy created (optional)

---

## Installation & Deployment ✓

### Device Installation (Debug)
- [ ] Device/emulator connected: `adb devices`
- [ ] Install command successful:
  ```bash
  adb install -r android/app/build/outputs/apk/debug/app-debug.apk
  ```
- [ ] Installation completes (100%)
- [ ] No permission errors
- [ ] No version conflicts
- [ ] Previous version uninstalled (if needed)

### APK Launch
- [ ] App appears on device home screen
- [ ] App icon displays correctly
- [ ] App name "eT chat" shows correctly
- [ ] Click to launch app
- [ ] App startup < 3 seconds
- [ ] No crash on startup
- [ ] Welcome/login screen displays

### Initial App Testing
- [ ] App UI renders correctly
- [ ] All screens accessible
- [ ] Navigation works
- [ ] Login/signup functional
- [ ] No console errors in DevTools
- [ ] No crashes during navigation
- [ ] App responds to user input
- [ ] Permissions dialog appears when needed

---

## Calling Features Testing ✓

### Audio Call Testing
- [ ] Create/receive audio call
- [ ] Both parties can hear each other
- [ ] Mute button works
- [ ] Unmute button works
- [ ] Call duration displays correctly
- [ ] Call can be ended
- [ ] Call cleanup completes properly

### Video Call Testing
- [ ] Create/receive video call
- [ ] Local video displays
- [ ] Remote video displays
- [ ] Video quality acceptable
- [ ] Camera toggle works
- [ ] Camera switching works (front/back)
- [ ] Video off button works
- [ ] Video on button works
- [ ] Call duration displays
- [ ] Picture-in-picture local video shows
- [ ] Remote video full screen
- [ ] Can end video call

### Network Quality Testing
- [ ] Network quality indicator displays
- [ ] Shows "Excellent" on good network
- [ ] Shows degradation on poor network
- [ ] Quality updates in real-time
- [ ] Color coding correct (green/blue/yellow/red)
- [ ] Bitrate displays correctly
- [ ] Frame rate displays correctly
- [ ] Packet loss percentage shown
- [ ] RTT latency displayed

### Screen Share Testing (if implemented)
- [ ] Screen share button available (video calls)
- [ ] Screen share initiates
- [ ] Remote sees shared screen
- [ ] Screen share stops cleanly
- [ ] Video resumes after share stops

---

## Performance Verification ✓

### Startup Performance
- [ ] App startup: < 3 seconds
- [ ] Call initiation: < 5 seconds
- [ ] Video connection: < 3 seconds
- [ ] No lag during interactions
- [ ] Smooth animations
- [ ] No jank or stuttering

### Memory Usage
- [ ] Monitor memory during call
- [ ] RAM usage: < 200 MB typical
- [ ] No memory leaks over time
- [ ] Cleanup on call end
- [ ] App doesn't crash from memory

### CPU Usage
- [ ] CPU < 70% during calls
- [ ] Device doesn't overheat
- [ ] Battery drain acceptable
- [ ] No excessive background activity

### Network Usage
- [ ] Bitrate adapts to network
- [ ] Audio: ~50 Kbps
- [ ] Video: 500 Kbps - 2.5 Mbps
- [ ] Quality degrades gracefully

---

## UI/UX Validation ✓

### Design Preservation
- [ ] Warm orange color (#E2725B) used for primary elements
- [ ] Off-white background (#F5F1E6) maintained
- [ ] Font families correct:
  - [ ] Inter for display text
  - [ ] Source Serif 4 for body
  - [ ] Caveat for handwritten text
- [ ] Button sizes touch-friendly (44pt minimum)
- [ ] Text sizes readable (12pt minimum for body)

### Video Call Screen
- [ ] Full-screen video layout
- [ ] Remote video fills screen
- [ ] Local video in corner (PIP)
- [ ] Controls at bottom
- [ ] Status bar at top
- [ ] Network quality shows
- [ ] Call duration visible
- [ ] Controls auto-hide on idle (video calls)
- [ ] Tap to show/hide controls

### Group Call Screen (if implemented)
- [ ] Grid layout displays participants
- [ ] Layout switching works
- [ ] Participant names visible
- [ ] Avatar images show
- [ ] Mute/video indicators display
- [ ] Participant count shown
- [ ] Controls functional
- [ ] Smooth participant transitions

### Responsiveness
- [ ] Works on small phones (5")
- [ ] Works on large tablets (10"+)
- [ ] Landscape orientation supported
- [ ] No UI cutoff on notched devices
- [ ] Safe area respected
- [ ] Font scaling works

---

## Permissions & Security ✓

### Permission Handling
- [ ] Camera permission dialog appears
- [ ] Microphone permission dialog appears
- [ ] User can grant/deny permissions
- [ ] App works with permissions granted
- [ ] App gracefully handles denied permissions
- [ ] No crashes from missing permissions
- [ ] Permissions persist on device

### Security Verification
- [ ] HTTPS enforced for network calls
- [ ] WebRTC uses DTLS-SRTP encryption
- [ ] No sensitive data in logs
- [ ] No hardcoded credentials
- [ ] SSL certificate verification enabled
- [ ] Supabase connection secure
- [ ] SignalingServer trusted

---

## Documentation & Code Quality ✓

### Documentation
- [ ] `QUICK_START.md` created and readable
- [ ] `ANDROID_BUILD_GUIDE.md` comprehensive
- [ ] `IMPLEMENTATION_GUIDE.md` detailed
- [ ] `DEVELOPMENT_ROADMAP.md` complete
- [ ] `Makefile` working as intended
- [ ] Code comments present where needed
- [ ] README reflects Android build info

### Code Quality
- [ ] No console errors or warnings
- [ ] TypeScript strict mode passes
- [ ] ESLint passes (`npm run lint`)
- [ ] No dead code
- [ ] Components properly exported
- [ ] Props properly typed
- [ ] Error handling implemented
- [ ] No console.log in production code

### Version Control
- [ ] Changes committed to git
- [ ] Meaningful commit messages
- [ ] Branch strategy clear
- [ ] Merge conflicts resolved
- [ ] .gitignore properly configured
- [ ] android/build files ignored

---

## Edge Cases & Error Handling ✓

### Network Conditions
- [ ] Works on WiFi
- [ ] Works on 4G/5G
- [ ] Works on poor networks
- [ ] Handles network switches
- [ ] Reconnects after disconnect
- [ ] Shows appropriate error messages
- [ ] Gracefully degrades quality

### Device Scenarios
- [ ] Works when device rotates
- [ ] Works when app backgrounded
- [ ] Works when app suspended
- [ ] Works when resuming from sleep
- [ ] Handles incoming calls while in call
- [ ] Handles app termination

### User Interactions
- [ ] Can close app mid-call
- [ ] Can switch between apps
- [ ] Can disable and re-enable camera
- [ ] Can switch cameras
- [ ] Can toggle mute multiple times
- [ ] Can quickly end calls
- [ ] Can handle multiple rapid clicks

---

## Release Build (Optional) ✓

### Keystore Setup
- [ ] Keystore file generated (one-time)
- [ ] Keystore password secured
- [ ] Key alias created
- [ ] Key password saved
- [ ] Keystore backed up safely

### Release APK Build
- [ ] `npm run apk:release` executed
- [ ] Build completes successfully
- [ ] Release APK generated
- [ ] APK signed correctly
- [ ] APK aligned properly
- [ ] APK size optimized

### Release APK Testing
- [ ] Release APK installs
- [ ] Release APK functions identically
- [ ] No obvious differences from debug
- [ ] Performance acceptable
- [ ] No crashes specific to release

---

## Play Store Preparation (Future) ✓

### Before Publishing
- [ ] App version updated (1.0.0)
- [ ] Build number incremented
- [ ] Changelog prepared
- [ ] Screenshots captured (5)
- [ ] App description written
- [ ] Privacy policy created
- [ ] Terms of service drafted
- [ ] Permissions justified to users
- [ ] Contact email configured
- [ ] Support URL provided

### Store Listing
- [ ] App title optimized
- [ ] Short description compelling
- [ ] Long description detailed
- [ ] Keywords researched
- [ ] Category selected (Communication)
- [ ] Rating category set
- [ ] Graphics professional:
  - [ ] Icon (512x512)
  - [ ] Screenshots (5-8)
  - [ ] Feature graphic (1024x500)
  - [ ] Video trailer (optional)

---

## Go-Live Checklist ✓

### Final Verification
- [ ] All features working
- [ ] No known critical bugs
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Documentation complete
- [ ] Team trained on deployment
- [ ] Backup and recovery plan ready
- [ ] Monitoring configured

### Deployment Steps
1. [ ] Final testing completed
2. [ ] APK built and signed
3. [ ] APK tested on multiple devices
4. [ ] Changelog prepared
5. [ ] Release notes ready
6. [ ] Support team briefed
7. [ ] Deploy to Play Store (when ready)
8. [ ] Monitor initial feedback
9. [ ] Hotfix plan ready

### Post-Launch
- [ ] Monitor crash reports
- [ ] Track user feedback
- [ ] Monitor performance metrics
- [ ] Plan hotfixes if needed
- [ ] Schedule Phase 2 work
- [ ] Begin group calling implementation
- [ ] Continue UI/UX improvements

---

## Quick Reference Commands

```bash
# Development
npm run dev                           # Start dev server
npm install                           # Install dependencies

# Building
npm run build                         # Build web assets
make install                          # Install all dependencies
make apk-debug                        # Build debug APK
make apk-install                      # Install on device
make adb-logs                         # View device logs

# Initial Setup
npm run cap:add:android              # Initialize Android (first time)
npm run cap:open:android             # Open in Android Studio

# Testing
adb devices                          # List devices
adb logcat | grep eT                 # View app logs
adb shell pm grant com.etchat.app android.permission.CAMERA
adb shell pm grant com.etchat.app android.permission.RECORD_AUDIO
```

---

## Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| APK won't install | `adb uninstall com.etchat.app` first, then install |
| Build fails | Run `make clean && make apk-debug` |
| No camera/microphone | Grant permissions: `adb shell pm grant ...` |
| Black screen on launch | Check logs: `make adb-logs` |
| Calls not working | Verify Supabase credentials in .env |
| Memory issues | Restart app or check for leaks in dev tools |

---

## Sign-Off

- **Checked By**: [Your Name]
- **Date**: [Current Date]
- **Status**: ✅ READY FOR DEPLOYMENT
- **Next Phase**: Group Calling Implementation
- **Timeline**: Estimated start [Date + 1 week]

---

**Remember**: This is a living checklist. Update as you progress through builds and deployments!
