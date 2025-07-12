// utils/getStartPoseFromCurve.ts
import * as THREE from 'three';

export function getStartPoseFromCurve(
  curve: THREE.Curve<THREE.Vector3>,
  distance = 0 // Distance along the curve to spawn from
) {
  const t = distance; // value between 0 and 1
  const position = curve.getPointAt(t);
  const tangent = curve.getTangentAt(t).normalize();

//   const up = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, -1), // default forward
    tangent
  );

  return {
    position: position.toArray() as [number, number, number],
    quaternion,
  };
}

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

