import { useState, useEffect, useCallback, useRef } from 'react';

export interface Resources {
  energy: number;
  maxEnergy: number;
  timeLeft: number;
  maxTime: number;
  isTimerRunning: boolean;
  isOvertime: boolean;
}

const MAX_ENERGY = 3;
const MAX_TIME = 60;

export function useResources() {
  const [energy, setEnergy] = useState(MAX_ENERGY);
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    setIsTimerRunning(true);
  }, []);

  const stopTimer = useCallback(() => {
    setIsTimerRunning(false);
  }, []);

  const consumeEnergy = useCallback((): boolean => {
    if (energy <= 0) return false;
    setEnergy(prev => prev - 1);
    return true;
  }, [energy]);

  const reset = useCallback(() => {
    setEnergy(MAX_ENERGY);
    setTimeLeft(MAX_TIME);
    setIsTimerRunning(false);
  }, []);

  // Timer tick
  useEffect(() => {
    if (!isTimerRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1;
        // Don't stop at 0 -- soft timer, keeps going negative
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isTimerRunning]);

  const resources: Resources = {
    energy,
    maxEnergy: MAX_ENERGY,
    timeLeft,
    maxTime: MAX_TIME,
    isTimerRunning,
    isOvertime: timeLeft <= 0,
  };

  return { resources, consumeEnergy, startTimer, stopTimer, reset };
}
