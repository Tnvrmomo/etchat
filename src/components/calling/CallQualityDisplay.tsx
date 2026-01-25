import React, { ReactNode } from 'react';

export type NetworkQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'offline';

export interface CallQualityMetrics {
  bitrate: number;
  packetsLost: number;
  jitter: number;
  roundTripTime: number;
  audioLevel: number;
  videoFrameRate: number;
  videoBitrate: number;
  networkQuality: NetworkQuality;
  timestamp: Date;
}

interface CallQualityDisplayProps {
  metrics: CallQualityMetrics | null;
}

export const CallQualityDisplay = ({ metrics }: CallQualityDisplayProps): ReactNode => {
  if (!metrics) return null;

  const getQualityColor = (quality: NetworkQuality): string => {
    switch (quality) {
      case 'excellent':
        return 'text-green-500';
      case 'good':
        return 'text-blue-500';
      case 'fair':
        return 'text-yellow-500';
      case 'poor':
        return 'text-orange-500';
      case 'offline':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const colorClass = getQualityColor(metrics.networkQuality);
  const classNameValue = `text-xs font-mono ${colorClass} p-2 rounded bg-slate-900/50`;

  return (
    <div className={classNameValue}>
      <div className="font-semibold mb-1 capitalize">
        {metrics.networkQuality}
      </div>
      <div>
        Bitrate: {(metrics.bitrate / 1000).toFixed(0)} Kbps
      </div>
      <div>
        Frame Rate: {metrics.videoFrameRate} fps
      </div>
      <div>
        Loss: {metrics.packetsLost}%
      </div>
      <div>
        Jitter: {metrics.jitter}ms
      </div>
      <div>
        RTT: {metrics.roundTripTime}ms
      </div>
    </div>
  );
};
