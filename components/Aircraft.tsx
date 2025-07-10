'use client';

import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { MeshBVH } from 'three-mesh-bvh';

const PITCH_INPUT_SPEED = 0.02;
const ROLL_INPUT_SPEED = 0.03;
const ANGULAR_DAMPING = 0.5;
const DEAD_ZONE = 0.1;

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
};

export default function Aircraft({
  aircraftRef,
  obstacleRefs,
  playingFieldRef,
  maxSpeed = 2.0,
  acceleration = 0.1,
  damping = 0.5,
  onSpeedChange,
  onAcceleratingChange,
  onBrakingChange,
}: AircraftProps) {
  const { scene } = useGLTF('/models/spaceship.glb');
  const keys = useRef<Record<string, boolean>>({});
  const speedRef = useRef(0);
  const angularVelocity = useRef(new THREE.Vector3(0, 0, 0));
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const prevState = useRef({ accelerating: false, braking: false });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    const ship = aircraftRef.current;
    if (!ship) return;

    // --- Gamepad ---
    const gp = navigator.getGamepads?.()[0];
    let [lx, ly] = gp ? gp.axes : [0, 0];
    lx = Math.abs(lx) < DEAD_ZONE ? 0 : lx;
    ly = Math.abs(ly) < DEAD_ZONE ? 0 : ly;
    angularVelocity.current.z += lx * -ROLL_INPUT_SPEED;
    angularVelocity.current.x += ly * PITCH_INPUT_SPEED;

    // --- Keyboard fallback ---
    if (keys.current['a']) angularVelocity.current.z += ROLL_INPUT_SPEED;
    if (keys.current['d']) angularVelocity.current.z -= ROLL_INPUT_SPEED;
    if (keys.current['w']) angularVelocity.current.x -= PITCH_INPUT_SPEED;
    if (keys.current['s']) angularVelocity.current.x += PITCH_INPUT_SPEED;

    // Read and normalize input state
    const accelerating = !!(keys.current['i'] || gp?.buttons?.[0]?.pressed);
    const braking = !!(keys.current['k'] || gp?.buttons?.[2]?.pressed);

    // Notify HUD only on change
    if (onAcceleratingChange && accelerating !== prevState.current.accelerating) {
      onAcceleratingChange(accelerating);
      prevState.current.accelerating = accelerating;
    }
    if (onBrakingChange && braking !== prevState.current.braking) {
      onBrakingChange(braking);
      prevState.current.braking = braking;
    }

    if (accelerating) {
      speedRef.current = Math.min(maxSpeed, speedRef.current + acceleration);
    } else if (!braking) {
      speedRef.current *= damping;
    }
    if (braking) {
      speedRef.current = Math.max(-1, speedRef.current - acceleration);
    }

    // Update HUD speed
    onSpeedChange?.(speedRef.current);

    // --- Rotation ---
    const deltaQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        angularVelocity.current.x,
        angularVelocity.current.y,
        angularVelocity.current.z,
        'XYZ'
      )
    );
    ship.quaternion.multiply(deltaQuat);
    angularVelocity.current.multiplyScalar(ANGULAR_DAMPING);

    // --- Smooth forward movement ---
    const desiredDir = new THREE.Vector3(0, 0, -1).applyQuaternion(ship.quaternion).normalize();
    const desiredVelocity = desiredDir.multiplyScalar(speedRef.current);
    velocity.current.lerp(desiredVelocity, 0.05); // Antigrav inertia
    ship.position.add(velocity.current);

    // --- Bound player to mesh track using BVH ---
    if (playingFieldRef?.current) {
      const playingFieldMesh = playingFieldRef.current;
      const geometry = playingFieldMesh.geometry as THREE.BufferGeometry & { boundsTree?: MeshBVH };

      // Build BVH if it doesn't exist yet
      if (!geometry.boundsTree) {
        geometry.boundsTree = new MeshBVH(geometry);
      }

      // Raycast down from above player to check if inside tube
      const raycaster = new THREE.Raycaster();
      raycaster.firstHitOnly = false; // get all hits
      raycaster.ray.origin.copy(ship.position).add(new THREE.Vector3(0, 1000, 0));
      raycaster.ray.direction.set(0, -1, 0);

      const intersects = raycaster.intersectObject(playingFieldMesh, false);

      if (intersects.length === 0) {
        // Outside bounds — project to nearest point on mesh surface
        const hitInfo = {
          point: new THREE.Vector3(),
          distance: 0,
          faceIndex: -1,
        };

        const foundClosest = geometry.boundsTree.closestPointToPoint(ship.position, hitInfo);
        if (foundClosest) {
          ship.position.copy(hitInfo.point);
        }
        velocity.current.multiplyScalar(-1);
        speedRef.current = 0;
      }
    }

    // --- Collision bounce ---
    const shipBox = new THREE.Box3().setFromObject(ship);
    for (const ref of obstacleRefs) {
      const obs = ref.current;
      if (!obs) continue;

      const obsBox = new THREE.Box3().setFromObject(obs);
      if (shipBox.intersectsBox(obsBox)) {
        console.log('💥 Bounce collision');
        // Invert and reduce velocity
        velocity.current.multiplyScalar(-3);
        speedRef.current = 0;
        break;
      }
    }
  });

  return (
    <group ref={aircraftRef}>
      <group scale={0.05} rotation={[0, Math.PI, 0]}>
        <primitive object={scene} scale={0.5} />
      </group>
    </group>
  );
}
