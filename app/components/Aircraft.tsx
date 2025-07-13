'use client';

import { useGLTF } from '@react-three/drei';
import { useEffect } from 'react';
import { usePlayerController } from '../controllers/PlayerController';
import * as THREE from 'three';

type AircraftProps = {
  aircraftRef: React.RefObject<THREE.Group | null>;
  obstacleRefs: React.RefObject<THREE.Mesh | null>[];
  playingFieldRef?: React.RefObject<THREE.Mesh | null>;  // <-- Add this optional prop
  maxSpeed?: number;
  acceleration?: number;
  damping?: number;
  onSpeedChange?: (speed: number) => void;
  onAcceleratingChange?: (state: boolean) => void;
  onBrakingChange?: (state: boolean) => void;
  startPosition?: [number, number, number];
  startQuaternion?: THREE.Quaternion;
};

export default function Aircraft({
  aircraftRef,
  startPosition,
  startQuaternion,
  obstacleRefs, 
  playingFieldRef, 
  maxSpeed, 
  acceleration, 
  damping, 
  onSpeedChange, 
  onAcceleratingChange, 
  onBrakingChange
}: AircraftProps) {
  const { scene } = useGLTF('/models/spaceship.glb');

  useEffect(() => {
    if (aircraftRef.current && startPosition && startQuaternion) {
      aircraftRef.current.position.set(...startPosition);
      aircraftRef.current.quaternion.copy(startQuaternion);
    }
  }, [startPosition, startQuaternion, aircraftRef]);


  usePlayerController({
    aircraftRef, 
    obstacleRefs, 
    playingFieldRef, 
    maxSpeed, 
    acceleration, 
    damping, 
    onSpeedChange, 
    onAcceleratingChange, 
    onBrakingChange
  });

  return (
    <group ref={aircraftRef}>
      <group scale={0.05} rotation={[0, Math.PI, 0]}>
        <primitive object={scene} scale={0.5} />
      </group>
    </group>
  );
}
