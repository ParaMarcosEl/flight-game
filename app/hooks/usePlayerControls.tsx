// hooks/usePlayerControls.ts
'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MeshBVH } from 'three-mesh-bvh';

const PITCH_INPUT_SPEED = 0.01;
const ROLL_INPUT_SPEED = 0.03;
const ANGULAR_DAMPING = 0.5;
const DEAD_ZONE = 0.1;

type UsePlayerControlsProps = {
  ship: THREE.Group | null;
  playingFieldRef?: React.RefObject<THREE.Mesh | null>;
  speedRef: React.MutableRefObject<number>;
  angularVelocity: React.MutableRefObject<THREE.Vector3>;
  velocity: React.MutableRefObject<THREE.Vector3>;
  maxSpeed?: number;
  acceleration?: number;
  damping?: number;
  onSpeedChange?: (speed: number) => void;
  onAcceleratingChange?: (state: boolean) => void;
  onBrakingChange?: (state: boolean) => void;
};

export function usePlayerControls({
  ship,
  playingFieldRef,
  speedRef,
  angularVelocity,
  velocity,
  maxSpeed = 2.0,
  acceleration = 0.1,
  damping = 0.5,
  onSpeedChange,
  onAcceleratingChange,
  onBrakingChange,
}: UsePlayerControlsProps) {
  const keys = useRef<Record<string, boolean>>({});
  const prevState = useRef({ accelerating: false, braking: false });

  const desiredDir = useRef(new THREE.Vector3());
  const desiredVelocity = useRef(new THREE.Vector3());
  const upOffset = useRef(new THREE.Vector3(0, 1000, 0));
  const rayOrigin = useRef(new THREE.Vector3());
  const rayDirection = useRef(new THREE.Vector3(0, -1, 0));
  const raycaster = useRef(new THREE.Raycaster());
  const hitInfo = useRef({
    point: new THREE.Vector3(),
    distance: 0,
    faceIndex: -1,
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => (keys.current[e.key.toLowerCase()] = true);
    const up = (e: KeyboardEvent) => (keys.current[e.key.toLowerCase()] = false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useEffect(() => {
    if (!playingFieldRef?.current) return;
    const geometry = playingFieldRef.current.geometry as THREE.BufferGeometry & { boundsTree?: MeshBVH };
    if (!geometry.boundsTree) geometry.boundsTree = new MeshBVH(geometry);
  }, [playingFieldRef]);

  useFrame(() => {
    if (!ship) return;

    // Controls
    const gp = navigator.getGamepads?.()[0];
    const lx = Math.abs(gp?.axes?.[0] ?? 0) > DEAD_ZONE ? gp!.axes[0] : 0;
    const ly = Math.abs(gp?.axes?.[1] ?? 0) > DEAD_ZONE ? gp!.axes[1] : 0;
    const roll = lx || (keys.current['a'] ? 1 : keys.current['d'] ? -1 : 0);
    const pitch = ly || (keys.current['s'] ? 1 : keys.current['w'] ? -1 : 0);

    angularVelocity.current.z += roll * -ROLL_INPUT_SPEED;
    angularVelocity.current.x += pitch * PITCH_INPUT_SPEED;

    const accelerating = gp?.buttons?.[0]?.pressed || keys.current['i'];
    const braking = gp?.buttons?.[2]?.pressed || keys.current['k'];

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

    onSpeedChange?.(speedRef.current);

    // Rotation
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

    // Forward movement
    desiredDir.current.set(0, 0, -1).applyQuaternion(ship.quaternion).normalize();
    desiredVelocity.current.copy(desiredDir.current).multiplyScalar(speedRef.current);
    velocity.current.lerp(desiredVelocity.current, 0.05);
    ship.position.add(velocity.current);

    // Tunnel containment
    if (playingFieldRef?.current) {
      const mesh = playingFieldRef.current;
      const geometry = mesh.geometry as THREE.BufferGeometry & { boundsTree?: MeshBVH };

      rayOrigin.current.copy(ship.position).add(upOffset.current);
      raycaster.current.ray.origin.copy(rayOrigin.current);
      raycaster.current.ray.direction.copy(rayDirection.current);

      const intersects = raycaster.current.intersectObject(mesh, false);
      if (intersects.length === 0) {
        const found = geometry.boundsTree?.closestPointToPoint(ship.position, hitInfo.current);
        if (found) {
          ship.position.copy(hitInfo.current.point);
        }
        velocity.current.multiplyScalar(-1);
        speedRef.current = 0;
      }
    }
  });
}
