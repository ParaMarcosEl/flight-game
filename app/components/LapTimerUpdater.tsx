// components/LapTimerUpdater.tsx
'use client';

import { useFrame } from '@react-three/fiber';
import { MutableRefObject } from 'react';

type LapTimerUpdaterProps = {
  lapStartTimeRef: MutableRefObject<number>;
  setCurrentLapTime: (value: number) => void;
  stageComplete: boolean;
};

export default function LapTimerUpdater({
  lapStartTimeRef,
  setCurrentLapTime,
  stageComplete,
}: LapTimerUpdaterProps) {
  useFrame(() => {
    if (!stageComplete && lapStartTimeRef.current != null) {
      setCurrentLapTime(performance.now() - lapStartTimeRef.current);
    }
  });

  return null;
}
