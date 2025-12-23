export type CallType = 'voice' | 'video';
export type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';

interface RTCManagerCallbacks {
  onRemoteStream: (stream: MediaStream) => void;
  onCallStateChange: (state: CallState) => void;
  onError: (error: Error) => void;
  onIceCandidate?: (candidate: RTCIceCandidate) => void;
}

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

export class RTCManager {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private callbacks: RTCManagerCallbacks;
  private callState: CallState = 'idle';
  private callType: CallType = 'voice';

  constructor(callbacks: RTCManagerCallbacks) {
    this.callbacks = callbacks;
  }

  async initializeCall(type: CallType): Promise<MediaStream> {
    this.callType = type;
    this.updateCallState('calling');

    try {
      // Get local media stream
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: type === 'video' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        } : false,
      });

      // Create peer connection
      this.peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      // Add local tracks to connection
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      // Handle remote stream
      this.peerConnection.ontrack = (event) => {
        console.log('Received remote track:', event.track.kind);
        if (event.streams[0]) {
          this.remoteStream = event.streams[0];
          this.callbacks.onRemoteStream(event.streams[0]);
        }
      };

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate && this.callbacks.onIceCandidate) {
          this.callbacks.onIceCandidate(event.candidate);
        }
      };

      // Handle connection state changes
      this.peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', this.peerConnection?.connectionState);
        if (this.peerConnection?.connectionState === 'connected') {
          this.updateCallState('connected');
        } else if (this.peerConnection?.connectionState === 'failed') {
          this.callbacks.onError(new Error('Connection failed'));
          this.endCall();
        }
      };

      return this.localStream;
    } catch (error) {
      console.error('Failed to initialize call:', error);
      this.callbacks.onError(error as Error);
      throw error;
    }
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  async createAnswer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  async handleRemoteOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  }

  async handleRemoteAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  toggleMute(): boolean {
    if (!this.localStream) return false;
    
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      return !audioTrack.enabled; // Returns true if muted
    }
    return false;
  }

  toggleVideo(): boolean {
    if (!this.localStream) return false;
    
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      return !videoTrack.enabled; // Returns true if video off
    }
    return false;
  }

  async toggleCamera(): Promise<void> {
    if (!this.localStream || this.callType !== 'video') return;

    const currentTrack = this.localStream.getVideoTracks()[0];
    const currentFacingMode = currentTrack?.getSettings().facingMode;
    const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

    // Stop current video track
    currentTrack?.stop();

    // Get new stream with different camera
    const newStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: newFacingMode },
    });

    const newVideoTrack = newStream.getVideoTracks()[0];

    // Replace track in local stream
    this.localStream.removeTrack(currentTrack);
    this.localStream.addTrack(newVideoTrack);

    // Replace track in peer connection
    const sender = this.peerConnection?.getSenders().find(s => s.track?.kind === 'video');
    if (sender) {
      await sender.replaceTrack(newVideoTrack);
    }
  }

  async startScreenShare(): Promise<MediaStream> {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: true,
      });

      // Replace video track with screen share
      const screenVideoTrack = screenStream.getVideoTracks()[0];
      const sender = this.peerConnection?.getSenders().find(s => s.track?.kind === 'video');
      
      if (sender && screenVideoTrack) {
        await sender.replaceTrack(screenVideoTrack);
      }

      // Handle screen share stop
      screenVideoTrack.onended = () => {
        this.stopScreenShare();
      };

      return screenStream;
    } catch (error) {
      console.error('Failed to start screen share:', error);
      throw error;
    }
  }

  async stopScreenShare(): Promise<void> {
    if (!this.localStream || this.callType !== 'video') return;

    // Get new camera stream
    const cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
    });

    const cameraVideoTrack = cameraStream.getVideoTracks()[0];
    const sender = this.peerConnection?.getSenders().find(s => s.track?.kind === 'video');
    
    if (sender && cameraVideoTrack) {
      await sender.replaceTrack(cameraVideoTrack);
    }

    // Update local stream
    const oldVideoTrack = this.localStream.getVideoTracks()[0];
    if (oldVideoTrack) {
      this.localStream.removeTrack(oldVideoTrack);
    }
    this.localStream.addTrack(cameraVideoTrack);
  }

  endCall(): void {
    // Stop all tracks
    this.localStream?.getTracks().forEach(track => track.stop());
    this.remoteStream?.getTracks().forEach(track => track.stop());

    // Close peer connection
    this.peerConnection?.close();

    // Reset state
    this.localStream = null;
    this.remoteStream = null;
    this.peerConnection = null;
    this.updateCallState('ended');
  }

  private updateCallState(state: CallState): void {
    this.callState = state;
    this.callbacks.onCallStateChange(state);
  }

  getCallState(): CallState {
    return this.callState;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }
}
