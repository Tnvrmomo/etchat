# etChat - React + TypeScript → Android APK

A modern real-time chat and calling application with Google Meet-like features, built with React, TypeScript, and Capacitor for cross-platform support.

## 🚀 Features

- **Google Meet-Style Call Codes**: Generate shareable 9-character codes (abc-def-ghi format)
- **Real-Time Video Calling**: Peer-to-peer WebRTC with Supabase signaling
- **In-Call Chat**: Send messages, emoji reactions, and hand-raise system
- **Network Quality Monitoring**: Real-time connection metrics
- **Call History**: Persistent storage with call statistics
- **Screen Sharing & Recording**: Host-only features for professional calls
- **Offline Support**: PWA with service worker and offline sync
- **Beautiful UI**: Tailwind CSS with custom design system (#E2725B, #F5F1E6)

## 📱 Platform Support

| Platform | Status | Requirements |
|----------|--------|--------------|
| **Web** | ✅ Production | Modern browser with WebRTC support |
| **Android** | ✅ Production | Android 7.0+ (API 24), tested on 12+ |
| **iOS** | 🔄 Planned | Requires additional Capacitor setup |

## 🏗️ Tech Stack

```
Frontend:
  React 18.3
  TypeScript 5.8
  Vite 5.4
  Tailwind CSS 3.4
  Radix UI + shadcn/ui
  Lucide Icons

Backend/Realtime:
  Supabase (PostgreSQL + Realtime)
  WebRTC (P2P)
  
Mobile:
  Capacitor 6.0
  Android SDK 34
  Gradle 8.2.1
  Java 21

Build:
  npm/bun
  GitHub Actions
```

## ⚡ Quick Start

### Web Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Android APK Build

```bash
# Automated (recommended)
chmod +x build-apk.sh
./build-apk.sh

# OR Manual steps
npm install --legacy-peer-deps
npm run build
npm install @capacitor/cli @capacitor/core @capacitor/android --legacy-peer-deps
npx cap add android
cd android && ./gradlew assembleDebug
```

See [ANDROID_APK_BUILD.md](ANDROID_APK_BUILD.md) for detailed instructions.

## 📂 Project Structure

```
src/
├── components/
│   ├── calling/          # Video call UI components
│   │   ├── CallStarter.tsx           # Start/join call dialog
│   │   ├── FullFeaturedVideoCall.tsx # Main video interface
│   │   ├── CallCodeDisplay.tsx       # Code display & sharing
│   │   ├── InCallChat.tsx            # In-call messaging
│   │   ├── CallQualityDisplay.tsx    # Network metrics
│   │   └── CallLandingScreen.tsx     # Home screen
│   ├── auth/             # Authentication components
│   ├── layout/           # Layout components
│   ├── ui/              # Reusable UI primitives
│   └── ...
├── hooks/
│   ├── useEnhancedCallManager.ts    # Call state management
│   ├── useEnhancedCallHistory.ts    # Call history & stats
│   ├── useCallQuality.ts             # Network monitoring
│   ├── useRealtimeCalls.ts
│   ├── useRealtimeMessages.ts
│   └── ...
├── utils/
│   ├── callCodeGenerator.ts    # Call code generation
│   ├── webrtc/                 # WebRTC utilities
│   └── notifications.ts
├── contexts/              # React contexts
├── integrations/          # Third-party integrations
└── pages/                 # Route pages
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for web
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript checker

# Mobile
npm run cap:add:android       # Add Android platform
npm run cap:open:android      # Open Android project in Android Studio
npm run cap:sync              # Sync web assets to native
npm run cap:build:android     # Build Android project
npm run apk:debug             # Build debug APK
npm run apk:release           # Build release APK

# Supabase
npm run supabase:start        # Start local Supabase (Docker required)
npm run supabase:migrate      # Run database migrations
npm run supabase:generate     # Generate TypeScript types
```

## 🎯 Core Components

### Call Code Generator (`src/utils/callCodeGenerator.ts`)
- `generateCallCode()` - Creates random 9-char code
- `isValidCallCode()` - Validates code format
- `CallCodeManager` - Manages active call sessions
- Persistent session tracking

### Enhanced Call Manager Hook (`src/hooks/useEnhancedCallManager.ts`)
Manages complete call lifecycle:
- `startCall(title)` - Initiate new call
- `joinCall(code)` - Join existing call
- `sendMessage(text)` - Send chat message
- `raiseHand()` / `lowerHand()` - Hand raise system
- Toggle: mute, video, screen share, recording

### Call Quality Monitor (`src/hooks/useCallQuality.ts`)
Real-time network metrics:
- Bitrate, frame rate, packet loss
- RTT (round-trip time), jitter
- Quality assessment (excellent → offline)

### In-Call Chat (`src/components/calling/InCallChat.tsx`)
- Message history with timestamps
- 6 emoji reactions
- Hand raise list with count
- Auto-scroll to latest

## 🔐 Security & Privacy

- End-to-end encrypted signaling via Supabase
- P2P WebRTC (data doesn't go through servers)
- No call recording by default (consent required)
- Offline-first architecture
- No telemetry

## 📊 APK Specifications

| Spec | Value |
|------|-------|
| Min SDK | 24 (Android 7.0) |
| Target SDK | 34 (Android 14) |
| APK Size (debug) | ~45-50 MB |
| APK Size (release) | ~35-40 MB |
| Permissions | CAMERA, RECORD_AUDIO, INTERNET |
| Build Time | 5-10 min (first), 2-3 min (cached) |

## 🐛 Troubleshooting

### Build Issues
- Clear `node_modules`: `rm -rf node_modules && npm install --legacy-peer-deps`
- Clear Gradle cache: `cd android && ./gradlew clean`
- Increase JVM memory in `android/gradle.properties`

### Runtime Issues
- Check [ANDROID_APK_BUILD.md](ANDROID_APK_BUILD.md) for detailed troubleshooting
- Review GitHub Actions logs for cloud builds
- Check Supabase connection in browser console

## 📚 Documentation

- [Android APK Build Guide](ANDROID_APK_BUILD.md)
- [Google Meet Features](GOOGLE_MEET_FEATURES.md)
- [Implementation Guide](IMPLEMENTATION_GUIDE.md)
- [Development Roadmap](DEVELOPMENT_ROADMAP.md)
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📦 Dependencies

Major dependencies are locked in `package-lock.json`. To update:

```bash
npm update [package-name]
npm audit fix --force  # For security vulnerabilities
```

## 🚀 Deployment

### Web Deployment
```bash
npm run build
# Deploy `dist/` folder to hosting (Netlify, Vercel, GitHub Pages, etc.)
```

### Mobile Distribution
- **Debug APK**: Share `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: Sign and upload to Google Play Store
- **GitHub Releases**: Built APK available in Actions artifacts

## 📄 License

This project is open source. See LICENSE file for details.

## 👨‍💻 Author

Built with ❤️ for real-time communication

---

**Version**: 1.0
**Last Updated**: January 25, 2026
**Status**: Production Ready ✅
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
