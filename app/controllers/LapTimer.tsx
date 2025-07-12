import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';

export function useLapTimer(lapCompleteTrigger: boolean) {
  const [lapTime, setLapTime] = useState(0);
  const startTime = useRef(performance.now());

  useFrame(() => {
    const now = performance.now();
    setLapTime((now - startTime.current) / 1000); // seconds
  });

  useEffect(() => {
    if (lapCompleteTrigger) {
      startTime.current = performance.now(); // reset timer
      setLapTime(0);
    }
  }, [lapCompleteTrigger]);

  return lapTime;
}
