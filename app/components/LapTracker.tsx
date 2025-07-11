'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { useLapSystem } from '../hooks/useLapSystem';
import LapTimerUpdater from './LapTimerUpdater';

type LapTrackerProps = {
  aircraftRef: React.RefObject<THREE.Object3D>;
  totalLaps?: number;
  onStageComplete?: (lapTimes: number[]) => void;
  position?: [number, number, number];
};

export default function LapTracker({
  aircraftRef,
  totalLaps = 3,
  onStageComplete,
  position = [0, 0, 0],
}: LapTrackerProps) {
  const lapZoneRef = useRef<THREE.Mesh>(null);

  const {
    currentLap,
    currentLapTime,
    lapTimes,
    stageComplete,
    lapStartTimeRef,
    setCurrentLapTime,
  } = useLapSystem({
    aircraftRef,
    lapZoneRef,
    totalLaps,
    onStageComplete,
  });

  // Provide data to HUD via custom hook or context if needed

  return (
    <>
      <mesh ref={lapZoneRef} position={position}>
        <boxGeometry args={[10, 10, 1]} />
        <meshBasicMaterial color="lime" transparent opacity={0.2} />
      </mesh>

      {/* Keeps currentLapTime updated */}
      <LapTimerUpdater
        lapStartTimeRef={lapStartTimeRef}
        setCurrentLapTime={setCurrentLapTime}
        stageComplete={stageComplete}
      />
    </>
  );
}
