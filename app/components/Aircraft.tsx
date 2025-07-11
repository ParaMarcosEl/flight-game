'use client';

import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useRef } from 'react';
import { usePlayerControls } from '../hooks/usePlayerControls'; // Update path as needed

type AircraftProps = {
  aircraftRef: React.RefObject<THREE.Group | null>;
  obstacleRefs: React.RefObject<THREE.Mesh | null>[];
  playingFieldRef?: React.RefObject<THREE.Mesh | null>;
  maxSpeed?: number;
  acceleration?: number;
  damping?: number;
  onSpeedChange?: (speed: number) => void;
  onAcceleratingChange?: (state: boolean) => void;
  onBrakingChange?: (state: boolean) => void;
};

export default function Aircraft({
  aircraftRef,
  playingFieldRef,
  maxSpeed = 2.0,
  acceleration = 0.1,
  damping = 0.5,
  onSpeedChange,
  onAcceleratingChange,
  onBrakingChange,
}: AircraftProps) {
  const { scene } = useGLTF('/models/spaceship.glb');

  // Movement state refs
  const speedRef = useRef(0);
  const velocity = useRef(new THREE.Vector3());
  const angularVelocity = useRef(new THREE.Vector3());

  // Use player controls
  usePlayerControls({
    ship: aircraftRef.current,
    playingFieldRef,
    speedRef,
    velocity,
    angularVelocity,
    maxSpeed,
    acceleration,
    damping,
    onSpeedChange,
    onAcceleratingChange,
    onBrakingChange,
  });

  return (
    <group ref={aircraftRef}>
      <group scale={0.05} rotation={[0, Math.PI, 0]}>
        <primitive object={scene} scale={0.5} />
      </group>
    </group>
  );
}
