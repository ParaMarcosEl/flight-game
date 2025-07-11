'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MeshBVH } from 'three-mesh-bvh';

const PITCH_INPUT_SPEED = 0.01;
const ROLL_INPUT_SPEED = 0.03;
const ANGULAR_DAMPING = 0.5;
const DEAD_ZONE = 0.1;

type UseAircraftControllerProps = {
  shipRef: React.RefObject<THREE.Group | null>;
  obstacleRefs: React.RefObject<THREE.Mesh | null>[];
  playingFieldRef?: React.RefObject<THREE.Mesh | null>;
  maxSpeed?: number;
  acceleration?: number;
  damping?: number;
  onSpeedChange?: (speed: number) => void;
  onAcceleratingChange?: (state: boolean) => void;
  onBrakingChange?: (state: boolean) => void;
};

export function useAircraftController({
  shipRef,
  obstacleRefs,
  playingFieldRef,
  maxSpeed = 2.0,
  acceleration = 0.1,
  damping = 0.5,
  onSpeedChange,
  onAcceleratingChange,
  onBrakingChange,
}: UseAircraftControllerProps) {
  const keys = useRef<Record<string, boolean>>({});
  const speedRef = useRef(0);
  const angularVelocity = useRef(new THREE.Vector3());
  const velocity = useRef(new THREE.Vector3());
  const prevState = useRef({ accelerating: false, braking: false });

  const desiredDir = useRef(new THREE.Vector3());
  const desiredVelocity = useRef(new THREE.Vector3());
  const hitInfo = useRef({ point: new THREE.Vector3(), distance: 0, faceIndex: -1 });
  const raycaster = useRef(new THREE.Raycaster());
  const upOffset = useRef(new THREE.Vector3(0, 1000, 0));
  const rayDirection = useRef(new THREE.Vector3(0, -1, 0));
  const rayOrigin = useRef(new THREE.Vector3());

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

  useEffect(() => {
    if (!playingFieldRef?.current) return;
    const mesh = playingFieldRef.current;
    const geometry = mesh.geometry as THREE.BufferGeometry & { boundsTree?: MeshBVH };
    if (!geometry.boundsTree) {
      geometry.boundsTree = new MeshBVH(geometry);
    }
  }, [playingFieldRef]);

  useFrame(() => {
    const ship = shipRef.current;
    if (!ship) return;

    // --- INPUT ---
    const gp = navigator.getGamepads?.()[0];
    let rollAxis = 0, pitchAxis = 0, accelerating = false, braking = false;

    if (gp) {
      rollAxis = Math.abs(gp.axes[0]) > DEAD_ZONE ? gp.axes[0] : 0;
      pitchAxis = Math.abs(gp.axes[1]) > DEAD_ZONE ? gp.axes[1] : 0;
      accelerating = gp.buttons[0]?.pressed || false;
      braking = gp.buttons[2]?.pressed || false;
    }

    const rollInput = rollAxis || (keys.current['a'] ? -1 : keys.current['d'] ? 1 : 0);
    const pitchInput = pitchAxis || (keys.current['s'] ? 1 : keys.current['w'] ? -1 : 0);
    accelerating ||= keys.current['i'];
    braking ||= keys.current['k'];

    angularVelocity.current.z += rollInput * -ROLL_INPUT_SPEED;
    angularVelocity.current.x += pitchInput * PITCH_INPUT_SPEED;

    // Notify only on state change
    if (onAcceleratingChange && accelerating !== prevState.current.accelerating) {
      onAcceleratingChange(accelerating);
      prevState.current.accelerating = accelerating;
    }
    if (onBrakingChange && braking !== prevState.current.braking) {
      onBrakingChange(braking);
      prevState.current.braking = braking;
    }

    // --- SPEED CONTROL ---
    if (accelerating) {
      speedRef.current = Math.min(maxSpeed, speedRef.current + acceleration);
    } else if (!braking) {
      speedRef.current *= damping;
    }
    if (braking) {
      speedRef.current = Math.max(-1, speedRef.current - acceleration);
    }

    onSpeedChange?.(speedRef.current);

    // --- ROTATION ---
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

    // --- MOVEMENT ---
    desiredDir.current.set(0, 0, -1).applyQuaternion(ship.quaternion).normalize();
    desiredVelocity.current.copy(desiredDir.current).multiplyScalar(speedRef.current);
    velocity.current.lerp(desiredVelocity.current, 0.05);
    ship.position.add(velocity.current);

    // --- TUNNEL CONTAINMENT ---
    if (playingFieldRef?.current) {
      const mesh = playingFieldRef.current;
      const geometry = mesh.geometry as THREE.BufferGeometry & { boundsTree?: MeshBVH };

      rayOrigin.current.copy(ship.position).add(upOffset.current);
      raycaster.current.ray.origin.copy(rayOrigin.current);
      raycaster.current.ray.direction.copy(rayDirection.current);

      const intersects = raycaster.current.intersectObject(mesh, false);
      if (intersects.length === 0) {
        const found = geometry.boundsTree?.closestPointToPoint(ship.position, hitInfo.current);
        if (found) ship.position.copy(hitInfo.current.point);
        velocity.current.multiplyScalar(-1);
        speedRef.current = 0;
      }
    }

    // --- OBSTACLE COLLISION ---
    const shipBox = new THREE.Box3().setFromObject(ship);
    for (const ref of obstacleRefs) {
      const obs = ref.current;
      if (!obs) continue;
      const obsBox = new THREE.Box3().setFromObject(obs);
      if (shipBox.intersectsBox(obsBox)) {
        velocity.current.multiplyScalar(-3);
        speedRef.current = 0;
        break;
      }
    }
  });
}
