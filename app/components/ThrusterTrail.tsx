// components/FireThrusterTrail.tsx
'use client';

import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useRef, useEffect } from 'react';
import { ParticleSystem } from '../systems/ParticleSystem';
import { useLoader } from '@react-three/fiber';

export function FireThrusterTrail({
  aircraftRef,
}: {
  aircraftRef: React.RefObject<THREE.Object3D>;
}) {
  const { camera } = useThree();
  const texture = useLoader(THREE.TextureLoader, '/textures/fire.jpg');
console.log("🔥 Fire texture loaded:", texture);
  const systemRef = useRef<ParticleSystem>(null);

  useEffect(() => {
  console.log("🚀 FireThrusterTrail initialized");
    if (!aircraftRef.current) return;
    const ps = new ParticleSystem(camera, texture, aircraftRef);
    aircraftRef.current.add(ps.mesh);
    console.log("✅ Particle system mesh added", ps.mesh);
    systemRef.current = ps;

    return () => {
      aircraftRef.current?.remove(ps.mesh);
    };
  }, [aircraftRef, camera, texture]);

  useFrame((_, delta) => {
    console.log("🔥 Particle system stepping", delta);
    const system = systemRef.current;
    if (!system || !aircraftRef.current) return;

    // Offset to position behind the aircraft
    const localPos = new THREE.Vector3(0, 0, 2); // behind the ship
    const worldPos = aircraftRef.current.localToWorld(localPos.clone());
    system.mesh.position.copy(worldPos);
    system.step(delta);
  });

  return null;
}
