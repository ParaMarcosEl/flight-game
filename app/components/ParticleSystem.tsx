// components/ParticleSystemComponent.tsx
import { useThree, useFrame } from '@react-three/fiber';
import { useLoader } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { ParticleSystem } from '../systems/ParticleSystem';

export function ParticleSystemComponent() {
  const { camera, scene } = useThree();
  const texture = useLoader(THREE.TextureLoader, './resources/fire.png');
  const systemRef = useRef<ParticleSystem>(null);

  useEffect(() => {
    const ps = new ParticleSystem(camera, texture);
    scene.add(ps.mesh);
    systemRef.current = ps;
    return () => {
      scene.remove(ps.mesh);
    };
  }, [camera, scene, texture]);

  useFrame((_, delta) => {
    systemRef.current?.step(delta);
  });

  return null;
}
