'use client';
import { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useAircraftController } from '../hooks/useAircraftControler';
// import { FireThrusterTrail } from './ThrusterTrail';

type AircraftProps = {
  aircraftRef: React.RefObject<THREE.Group | null>;
  obstacleRefs: React.RefObject<THREE.Mesh | null>[];
  startPosition: number[];
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
  obstacleRefs,
  playingFieldRef,
  maxSpeed,
  acceleration,
  damping,
  onSpeedChange,
  onAcceleratingChange,
  onBrakingChange,
}: AircraftProps) {
  const { scene } = useGLTF('/models/spaceship.glb');

  useAircraftController({
    shipRef: aircraftRef,
    obstacleRefs,
    playingFieldRef,
    maxSpeed,
    acceleration,
    damping,
    onSpeedChange,
    onAcceleratingChange,
    onBrakingChange,
  });

  useEffect(() => {
  if (aircraftRef.current) {
    aircraftRef.current.position.set(...startPosition);
    aircraftRef.current.quaternion.copy(startQuaternion);
  }
}, []);


  return (
    <group ref={aircraftRef}>
      <group scale={0.05} rotation={[0, Math.PI, 0]}>
        <pointLight
          position={[0, 0, -1]}
          color={'orange'}
          intensity={2}
          distance={5}
        />
        <primitive object={scene} scale={0.5} />
      </group>
      {/* <FireThrusterTrail aircraftRef={aircraftRef as React.RefObject<THREE.Group<THREE.Object3DEventMap>>}/> */}
    </group>
  );
}
