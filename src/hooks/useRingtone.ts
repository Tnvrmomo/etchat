import { useEffect, useRef, useCallback } from 'react';

interface UseRingtoneReturn {
  playRingtone: () => void;
  stopRingtone: () => void;
  playCallEnd: () => void;
}

export const useRingtone = (): UseRingtoneReturn => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    const ctx = getAudioContext();
    
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  };

  const playRingtonePattern = useCallback(() => {
    // Play a pleasant two-tone ring
    playTone(523.25, 0.15); // C5
    setTimeout(() => playTone(659.25, 0.15), 150); // E5
    setTimeout(() => playTone(783.99, 0.2), 300); // G5
  }, []);

  const playRingtone = useCallback(() => {
    // Vibrate on mobile if supported
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    playRingtonePattern();
    
    // Repeat ringtone every 2 seconds
    intervalRef.current = setInterval(() => {
      playRingtonePattern();
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }, 2000);
  }, [playRingtonePattern]);

  const stopRingtone = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }
  }, []);

  const playCallEnd = useCallback(() => {
    // Play a descending tone for call end
    playTone(523.25, 0.1); // C5
    setTimeout(() => playTone(392, 0.1), 100); // G4
    setTimeout(() => playTone(261.63, 0.2), 200); // C4
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRingtone();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopRingtone]);

  return {
    playRingtone,
    stopRingtone,
    playCallEnd,
  };
};
