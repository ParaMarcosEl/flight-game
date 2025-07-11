// hooks/useThrusterTrail.ts
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const MAX_PARTICLES = 1000;
const PARTICLES_PER_UNIT = 50; // Number of particles per world unit moved

export function useThrusterTrail(aircraftRef: React.RefObject<THREE.Object3D>) {
  const particles = useRef<THREE.Points>(null);
  const positions = useMemo(() => new Float32Array(MAX_PARTICLES * 3), []);
  const velocities = useMemo(() => new Array(MAX_PARTICLES).fill(null).map(() => new THREE.Vector3()), []);
  const ages = useMemo(() => new Float32Array(MAX_PARTICLES), []);
  const colors = useMemo(() => new Float32Array(MAX_PARTICLES * 3), []);

  const prevPosition = useRef(new THREE.Vector3());
  const emitBuffer = useRef(0); // how many particles we can still emit

  useFrame((_, delta) => {
    const aircraft = aircraftRef.current;
    if (!aircraft) return;

    // Calculate distance moved
    const currentPosition = aircraft.position.clone();
    const dist = currentPosition.distanceTo(prevPosition.current);
    emitBuffer.current += dist * PARTICLES_PER_UNIT;
    prevPosition.current.copy(currentPosition);

    for (let i = 0; i < MAX_PARTICLES; i++) {
      ages[i] += delta;

      if (ages[i] > 1.5 || positions[i * 3 + 1] < -50) {
        if (emitBuffer.current >= 1) {
          // Reset particle
          ages[i] = 0;
          const angle = Math.random() * Math.PI * 2;
          const spread = 0.1;
          const speed = 1.5 + Math.random() * 0.5;
          velocities[i].set(
            Math.sin(angle) * spread,
            -speed,
            Math.cos(angle) * spread
          );
          positions[i * 3 + 0] = 0;
          positions[i * 3 + 1] = 0;
          positions[i * 3 + 2] = 0;
          emitBuffer.current -= 1;
        } else {
          continue;
        }
      } else {
        positions[i * 3 + 0] += velocities[i].x * delta;
        positions[i * 3 + 1] += velocities[i].y * delta;
        positions[i * 3 + 2] += velocities[i].z * delta;
      }

      // Color transition logic
      const ageRatio = ages[i] / 1.5;
      let r = 1, g = 1, b = 1;
      if (ageRatio < 0.25) {
        r = 1;
        g = 1;
        b = 1 - ageRatio * 4;
      } else if (ageRatio < 0.5) {
        r = 1;
        g = 1 - (ageRatio - 0.25) * 4;
        b = 0;
      } else if (ageRatio < 0.75) {
        r = 1 - (ageRatio - 0.5) * 4;
        g = 0;
        b = 0;
      } else {
        r = g = b = 0;
      }

      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }

    if (particles.current) {
      particles.current.geometry.attributes.position.needsUpdate = true;
      particles.current.geometry.attributes.color.needsUpdate = true;
    }
  });

  return { particles, positions, colors };
}
