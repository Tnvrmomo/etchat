# eT Chat - Calling Features Implementation Guide

## Overview
This document outlines the implementation of enhanced calling features, UI/UX improvements, and the phased development approach for Google Meet and WhatsApp-like functionality.

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         eT Chat Mobile App              │
│     (React + Capacitor + Android)       │
├─────────────────────────────────────────┤
│         UI Layer                        │
│  ├─ EnhancedVideoCallScreen            │
│  ├─ GroupVideoCallEnhanced             │
│  ├─ VoiceCallScreen                    │
│  └─ IncomingCallModal                  │
├─────────────────────────────────────────┤
│         Business Logic                  │
│  ├─ useWebRTC Hook                     │
│  ├─ useCallQuality Hook                │
│  ├─ useRealtimeCalls Hook              │
│  └─ Call State Management              │
├─────────────────────────────────────────┤
│         WebRTC Layer                    │
│  ├─ RTCManager (Peer Connections)      │
│  ├─ STUN/TURN Servers                  │
│  └─ Signaling (via Supabase Realtime)  │
├─────────────────────────────────────────┤
│    Backend (Supabase + Realtime)        │
│  ├─ Call Signaling                     │
│  ├─ Presence Tracking                  │
│  └─ Message History                    │
└─────────────────────────────────────────┘
```

## Phase 1: Enhanced Video Calling ✅ READY

### Components Implemented

#### 1. EnhancedVideoCallScreen
**File**: `src/components/calling/EnhancedVideoCallScreen.tsx`

Features:
- Full-screen video display with dark theme
- Picture-in-picture local video in corner
- Network quality indicators with colors:
  - 🟢 Excellent: >2.5 Mbps
  - 🔵 Good: >1.5 Mbps
  - 🟡 Fair: >500 Kbps
  - 🔴 Poor: <500 Kbps

- **Controls**:
  - Mic toggle (with mute indicator)
  - Video toggle (with camera off indicator)
  - Screen share toggle (desktop/tablet only)
  - End call button
  
- **Responsive**:
  - Auto-hides controls after 5 seconds of idle time
  - Tap to show/hide controls on video calls
  - Touch-friendly button sizes

**Integration Example**:
```tsx
import { EnhancedVideoCallScreen } from '@/components/calling/EnhancedVideoCallScreen';

function VideoCallComponent() {
  const {
    callState, localStream, remoteStream,
    isMuted, isVideoOff, isScreenSharing,
    onToggleMute, onToggleVideo, onEndCall
  } = useCallState();

  return (
    <EnhancedVideoCallScreen
      callerName="John Doe"
      callerAvatar={avatar}
      callState={callState}
      localStream={localStream}
      remoteStream={remoteStream}
      isMuted={isMuted}
      isVideoOff={isVideoOff}
      isScreenSharing={isScreenSharing}
      onToggleMute={onToggleMute}
      onToggleVideo={onToggleVideo}
      onToggleScreenShare={toggleScreenShare}
      onToggleCamera={toggleCamera}
      onEndCall={onEndCall}
      networkQuality="excellent"
      callType="video"
    />
  );
}
```

#### 2. useCallQuality Hook
**File**: `src/hooks/useCallQuality.ts`

Monitors real-time connection quality metrics:
- **Bitrate**: Current data transmission rate
- **Packet Loss**: Percentage of lost packets
- **Jitter**: Variation in network latency
- **RTT**: Round-trip time to peer
- **Frame Rate**: Video frames per second
- **Network Quality Score**: Calculated from above metrics

**Usage**:
```tsx
const metrics = useCallQuality(peerConnection, {
  updateInterval: 1000,
  onQualityChange: (quality) => {
    console.log('Network quality changed to:', quality);
    // Adapt video quality based on network
  }
});

// Display in UI
<CallQualityDisplay metrics={metrics} />
```

### Integration Steps

1. **Update Video Call View**:
```tsx
// src/views/VideoCallView.tsx
import { EnhancedVideoCallScreen } from '@/components/calling/EnhancedVideoCallScreen';
import { useCallQuality } from '@/hooks/useCallQuality';

export function VideoCallView() {
  const { peerConnection } = useCallContext();
  const metrics = useCallQuality(peerConnection);

  return (
    <EnhancedVideoCallScreen
      // ... props
      networkQuality={metrics?.networkQuality}
    />
  );
}
```

2. **Update Styles** (if needed):
- Ensure Tailwind CSS is processing new components
- Check `tailwind.config.ts` includes all component paths

3. **Test on Device**:
```bash
npm run cap:sync
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

## Phase 2: Group Calling 🚀 NEXT

### Components Implemented

#### GroupVideoCallEnhanced
**File**: `src/components/calling/GroupVideoCallEnhanced.tsx`

Features:
- **Grid Layouts**:
  - 2x2 Grid (for 4 participants)
  - 3x3 Grid (for 9 participants)
  - Focus Mode (speaker view + sidebar)

- **Participant Management**:
  - Display name and avatar
  - Mute/video status indicators
  - Participant count display
  - Join/leave tracking

- **Controls**:
  - Individual and group mute/video
  - Screen sharing
  - Layout switching
  - Remove participant (admin only)

**Integration**:
```tsx
import { GroupVideoCall } from '@/components/calling/GroupVideoCallEnhanced';

function GroupCallView() {
  const [participants, setParticipants] = useState<GroupCallParticipant[]>([]);
  const [callDuration, setCallDuration] = useState(0);

  return (
    <GroupVideoCall
      groupName="Team Meeting"
      participants={participants}
      localStream={localStream}
      isMuted={isMuted}
      isVideoOff={isVideoOff}
      isScreenSharing={isScreenSharing}
      onToggleMute={toggleMute}
      onToggleVideo={toggleVideo}
      onToggleScreenShare={toggleScreenShare}
      onEndCall={endCall}
      callDuration={callDuration}
    />
  );
}
```

### Group Call Flow
```
1. Create Group Call
   ├─ Initialize RTCPeerConnection for each participant
   ├─ Setup Signaling (via Supabase)
   └─ Display Group Call UI

2. Join/Add Participant
   ├─ Send join notification
   ├─ Establish P2P connection
   ├─ Exchange SDP offers/answers
   ├─ Exchange ICE candidates
   └─ Update UI with new participant

3. During Call
   ├─ Monitor call quality
   ├─ Handle layout changes
   ├─ Track participant status changes
   └─ Maintain participant list

4. Remove/Leave Participant
   ├─ Close peer connection
   ├─ Clean up resources
   ├─ Update other participants
   └─ Update UI
```

## Phase 3: UI/UX Refinements 🎨 UPCOMING

### Planned Improvements

1. **Theme Customization**
   - Light/Dark mode toggle
   - Custom color palettes
   - Brand consistency across all screens

2. **Animation Enhancements**
   - Smooth transitions for call screens
   - Gesture-driven animations
   - Call state transitions
   - Loading states and spinners

3. **Mobile Optimization**
   - Touch gestures:
     - Swipe to switch camera
     - Pinch to zoom on video
     - Long-press for menu
   - Haptic feedback on actions
   - Notch/safe area support

4. **Accessibility**
   - High contrast mode
   - Screen reader support
   - Keyboard navigation
   - Text scaling support

5. **Visual Indicators**
   - Connection status
   - Data usage warnings
   - Battery indicator
   - Time in call
   - Speaking indicator (audio spectrum)

### Implementation Template

```tsx
// New theme hook
export const useCallTheme = () => {
  const [theme, setTheme] = useState('dark');
  
  return {
    theme,
    setTheme,
    colors: getThemeColors(theme),
    isDark: theme === 'dark'
  };
};

// Use in components
function ThemedVideoCall() {
  const { colors, isDark } = useCallTheme();
  
  return (
    <div style={{ backgroundColor: colors.background }}>
      {/* Styled content */}
    </div>
  );
}
```

## Phase 4: Advanced Features 🔮 FUTURE

### Screen Sharing Enhancement
```tsx
export const useScreenShare = (peerConnection: RTCPeerConnection) => {
  const startScreenShare = async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { cursor: 'always' },
      audio: false
    });
    
    // Replace video track
    const videoTrack = stream.getVideoTracks()[0];
    const sender = peerConnection.getSenders()
      .find(s => s.track?.kind === 'video');
    
    await sender.replaceTrack(videoTrack);
    
    // Handle screen share end
    videoTrack.onended = stopScreenShare;
  };
  
  return { startScreenShare };
};
```

### Virtual Backgrounds
```tsx
// Requires ML library like ml5.js or MediaPipe
export const useVirtualBackground = (localStream: MediaStream) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    // Initialize segmentation model
    // Apply background replacement to video stream
  }, [localStream]);
  
  return { backgroundEnabled: true };
};
```

### Audio Spectrum Visualization
```tsx
export const useAudioSpectrum = (stream: MediaStream) => {
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  
  const getFrequencies = () => {
    analyser.getByteFrequencyData(dataArray);
    return Array.from(dataArray);
  };
  
  return { getFrequencies };
};
```

## WebRTC Configuration

### STUN/TURN Servers
**File**: `src/utils/webrtc/RTCManager.ts`

```typescript
const iceServers: RTCIceServer[] = [
  // Public STUN servers (no credentials needed)
  { urls: ['stun:stun.l.google.com:19302'] },
  { urls: ['stun:stun1.l.google.com:19302'] },
  { urls: ['stun:stun2.l.google.com:19302'] },
  { urls: ['stun:stun3.l.google.com:19302'] },
  
  // TURN servers (for NAT traversal, credentials required)
  {
    urls: ['turn:your-turn-server.com:3478'],
    username: 'username',
    credential: 'password'
  }
];
```

### Codec Selection
```typescript
// Prefer H.264 for better device compatibility
const videoCodecs = ['video/H264', 'video/VP8', 'video/VP9'];
// Prefer Opus for audio quality
const audioCodecs = ['audio/opus', 'audio/PCMU', 'audio/PCMA'];
```

## Testing Checklist

### Functionality Tests
- [ ] Single audio call works end-to-end
- [ ] Single video call works end-to-end
- [ ] Group calls (2-9 participants) work
- [ ] Mute/unmute works during call
- [ ] Video on/off works during call
- [ ] Screen sharing works (video calls)
- [ ] End call properly closes connections
- [ ] Network quality metrics update correctly

### UI/UX Tests
- [ ] Controls auto-hide on long videos
- [ ] Tap to show/hide works
- [ ] Buttons are touch-friendly (min 44pt)
- [ ] Text is readable at small sizes
- [ ] Animations are smooth (60 FPS)
- [ ] No layout shifts during call

### Device Tests
- [ ] Works on Android 7.0+ (API 24+)
- [ ] Microphone permission granted
- [ ] Camera permission granted
- [ ] Audio plays through speaker (not earpiece by default)
- [ ] Screen stays on during call
- [ ] App can background without disconnecting

### Performance Tests
- [ ] Startup time < 3 seconds
- [ ] Call initialization < 5 seconds
- [ ] Memory usage < 200MB
- [ ] Battery drain reasonable (testing app)
- [ ] CPU usage stays below 70%
- [ ] Data usage tracking works

### Edge Cases
- [ ] Network switches (WiFi to mobile)
- [ ] Low bandwidth conditions
- [ ] High packet loss scenarios
- [ ] Device rotation during call
- [ ] Focus lost and regained
- [ ] Multiple simultaneous calls

## Performance Optimization

### Memory Management
```tsx
// Cleanup on unmount
useEffect(() => {
  return () => {
    // Stop all tracks
    localStream?.getTracks().forEach(track => track.stop());
    remoteStream?.getTracks().forEach(track => track.stop());
    
    // Close peer connection
    peerConnection?.close();
  };
}, []);
```

### Video Bitrate Adaptation
```typescript
// Reduce video quality on poor network
if (networkQuality === 'poor') {
  peerConnection.getSenders()
    .filter(s => s.track?.kind === 'video')
    .forEach(sender => {
      const params = sender.getParameters();
      params.encodings[0].maxBitrate = 500000; // 500 Kbps
      sender.setParameters(params);
    });
}
```

### Connection Pooling
```typescript
// Reuse RTCDataChannel for multiple purposes
const createDataChannels = () => {
  const chatChannel = peerConnection.createDataChannel('chat');
  const statusChannel = peerConnection.createDataChannel('status');
  
  return { chatChannel, statusChannel };
};
```

## Deployment Checklist

Before releasing to Play Store:

- [ ] Update version in `android/app/build.gradle`
- [ ] Update `ANDROID_BUILD_GUIDE.md`
- [ ] Test on multiple devices (different Android versions)
- [ ] Performance profiling with low-end devices
- [ ] Battery consumption testing
- [ ] Privacy policy updated
- [ ] Terms of service ready
- [ ] Marketing materials prepared
- [ ] Beta testing program setup

## Monitoring & Analytics

Add analytics for:
- Call initiation success rate
- Average call duration
- Call drop rate
- Network quality distribution
- Bug/crash reporting
- User engagement metrics

```tsx
// Example analytics integration
const trackCallStart = (callType: 'audio' | 'video') => {
  analytics.track('call_started', { callType });
};

const trackCallEnd = (duration: number, quality: NetworkQuality) => {
  analytics.track('call_ended', { duration, quality });
};
```

## References

- [WebRTC API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Capacitor Documentation](https://capacitorjs.com/docs/)
- [React Hooks Best Practices](https://react.dev/reference/react)
- [Android Development Guide](https://developer.android.com/)
- [Google Meet Architecture](https://arXiv.org/pdf/2104.05308.pdf)

---

**Last Updated**: January 25, 2026
**Phase Status**: Phase 1 Complete, Phase 2 Ready, Phase 3-4 Planned
