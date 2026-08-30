import React, { useState, useEffect, useCallback, useRef } from 'react';

export interface UseCountdownReturn {
  seconds: number;
  isActive: boolean;
  start: (initialSeconds?: number) => void;
  reset: () => void;
  stop: () => void;
}

/**
 * Hook for OTP resend countdown timers
 */
export const useCountdown = (defaultSeconds: number = 30): UseCountdownReturn => {
  const [seconds, setSeconds] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback((initialSeconds: number = defaultSeconds) => {
    setSeconds(initialSeconds);
    setIsActive(true);
  }, [defaultSeconds]);

  const stop = useCallback(() => {
    setIsActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    setSeconds(0);
  }, [stop]);

  useEffect(() => {
    if (isActive && seconds > 0) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, seconds]);

  return {
    seconds,
    isActive,
    start,
    reset,
    stop,
  };
};

export default useCountdown;
