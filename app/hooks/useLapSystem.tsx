// hooks/useLapSystem.ts
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

export function useLapSystem({
  aircraftRef,
  lapZoneRef,
  totalLaps = 3,
  onStageComplete,
}: {
  aircraftRef: React.RefObject<THREE.Object3D>;
  lapZoneRef: React.RefObject<THREE.Mesh>;
  totalLaps?: number;
  onStageComplete?: (lapTimes: number[]) => void;
}) {
  const lapTimes = useRef<number[]>([]);
  const lapStartTimeRef = useRef(performance.now());
  const [currentLapTime, setCurrentLapTime] = useState(0);
  const [currentLap, setCurrentLap] = useState(0);
  const [stageComplete, setStageComplete] = useState(false);
  const triggeredLastFrame = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!aircraftRef.current || !lapZoneRef.current) return;

      const playerBox = new THREE.Box3().setFromObject(aircraftRef.current);
      const lapBox = new THREE.Box3().setFromObject(lapZoneRef.current);


      const isInside = playerBox.intersectsBox(lapBox);
      console.log({ isInside, playerBox, lapBox })
      if (isInside && !triggeredLastFrame.current) {
        console.log("Hit LapTracker")
        triggeredLastFrame.current = true;

        const now = performance.now();
        const lapTime = (now - lapStartTimeRef.current) / 1000;
        lapStartTimeRef.current = now;

        lapTimes.current.push(lapTime);

        setCurrentLap((prev) => {
          const next = prev + 1;
          if (next >= totalLaps) {
            setStageComplete(true);
            onStageComplete?.([...lapTimes.current]);
          }
          return next;
        });
      }

      if (!isInside) {
        triggeredLastFrame.current = false;
      }
    }, 100);

    return () => clearInterval(interval);
  }, [aircraftRef, lapZoneRef, totalLaps, onStageComplete]);

  return {
    currentLap,
    currentLapTime,
    lapTimes: lapTimes.current,
    stageComplete,
    lapStartTimeRef,
    setCurrentLapTime,
  };
}
