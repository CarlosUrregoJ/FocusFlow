"use client";

import { useEffect, useRef, useState } from 'react';

type PomodoroStatus = 'idle' | 'running' | 'paused';

function playAlertSound() {
  try {
    const audioContext = new window.AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    gainNode.gain.value = 0.02;

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.35);
  } catch {
    // No-op if audio is blocked.
  }
}

export function usePomodoro(minutes: number, onComplete: (completedMinutes: number) => void) {
  const [status, setStatus] = useState<PomodoroStatus>('idle');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(minutes * 60);
  const timerRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (status === 'idle') {
      setRemainingSeconds(minutes * 60);
    }
  }, [minutes, status]);

  useEffect(() => {
    if (status !== 'running') {
      return undefined;
    }

    timerRef.current = window.setInterval(() => {
      setRemainingSeconds((current: number) => {
        if (current <= 1) {
          if (timerRef.current !== null) {
            window.clearInterval(timerRef.current);
          }
          timerRef.current = null;
          setStatus('idle');
          playAlertSound();
          onCompleteRef.current(minutes);
          return minutes * 60;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [minutes, status]);

  const start = () => setStatus('running');
  const pause = () => setStatus('paused');
  const reset = () => {
    setStatus('idle');
    setRemainingSeconds(minutes * 60);
  };

  return {
    remainingSeconds,
    status,
    start,
    pause,
    reset,
    setRemainingSeconds
  };
}
