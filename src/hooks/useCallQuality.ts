import { useCallback, useEffect, useRef, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { type NetworkQuality, type CallQualityMetrics } from '@/components/calling/CallQualityDisplay';

interface CallQualityOptions {
  updateInterval?: number;
  onQualityChange?: (quality: NetworkQuality) => void;
}

export const useCallQuality = (
  peerConnection: RTCPeerConnection | null,
  options: CallQualityOptions = {}
): CallQualityMetrics | null => {
  const { updateInterval = 1000, onQualityChange } = options;
  const [metrics, setMetrics] = useState<CallQualityMetrics | null>(null);
  const previousQualityRef = useRef<NetworkQuality | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const determineQuality = useCallback((
    bitrate: number,
    packetsLost: number,
    jitter: number,
    rtt: number
  ): NetworkQuality => {
    // Excellent: >2.5 Mbps, <1% loss, <20ms jitter, <30ms RTT
    if (bitrate > 2500000 && packetsLost < 0.01 && jitter < 20 && rtt < 30) {
      return 'excellent';
    }
    
    // Good: >1.5 Mbps, <2% loss, <40ms jitter, <50ms RTT
    if (bitrate > 1500000 && packetsLost < 0.02 && jitter < 40 && rtt < 50) {
      return 'good';
    }
    
    // Fair: >500 Kbps, <5% loss, <100ms jitter, <100ms RTT
    if (bitrate > 500000 && packetsLost < 0.05 && jitter < 100 && rtt < 100) {
      return 'fair';
    }
    
    // Poor or offline
    return packetsLost >= 0.5 ? 'offline' : 'poor';
  }, []);

  useEffect(() => {
    if (!peerConnection) return;

    intervalRef.current = setInterval(async () => {
      try {
        const stats = await peerConnection.getStats();
        let inboundRtp: RTCInboundRtpStreamStats | null = null;
        let outboundRtp: RTCOutboundRtpStreamStats | null = null;
        let candidatePair: RTCIceCandidatePairStats | null = null;

        // Extract relevant stats
        stats.forEach((report) => {
          if (report.type === 'inbound-rtp' && report.kind === 'audio') {
            inboundRtp = report as RTCInboundRtpStreamStats;
          }
          if (report.type === 'outbound-rtp' && report.kind === 'video') {
            outboundRtp = report as RTCOutboundRtpStreamStats;
          }
          if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            candidatePair = report as RTCIceCandidatePairStats;
          }
        });

        // Calculate metrics
        const bitrate = outboundRtp ? (outboundRtp.bytesSent * 8 * 1000) / updateInterval : 0;
        const packetsLost = inboundRtp ? inboundRtp.packetsLost / (inboundRtp.packetsLost + inboundRtp.packetsReceived) : 0;
        const jitter = inboundRtp ? inboundRtp.jitter * 1000 : 0; // Convert to ms
        const rtt = candidatePair ? candidatePair.currentRoundTripTime * 1000 : 0; // Convert to ms
        const videoFrameRate = outboundRtp?.framesPerSecond || 0;
        const videoBitrate = outboundRtp ? (outboundRtp.bytesSent * 8 * 1000) / updateInterval : 0;

        const quality = determineQuality(bitrate, packetsLost, jitter, rtt);

        const newMetrics: CallQualityMetrics = {
          bitrate: Math.round(bitrate),
          packetsLost: Math.round(packetsLost * 100),
          jitter: Math.round(jitter),
          roundTripTime: Math.round(rtt),
          audioLevel: inboundRtp?.audioLevel || 0,
          videoFrameRate,
          videoBitrate: Math.round(videoBitrate),
          networkQuality: quality,
          timestamp: new Date(),
        };

        setMetrics(newMetrics);

        // Notify on quality change
        if (quality !== previousQualityRef.current) {
          previousQualityRef.current = quality;
          onQualityChange?.(quality);
        }
      } catch (error) {
        console.error('Error getting call quality metrics:', error);
      }
    }, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [peerConnection, updateInterval, determineQuality, onQualityChange]);

  return metrics;
};
