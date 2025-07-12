import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshBVH } from 'three-mesh-bvh';

type PlayerSystemOptions = {
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

export function usePlayerController({
  aircraftRef,
  obstacleRefs,
  playingFieldRef,
  maxSpeed = 2.0,
  acceleration = 0.1,
  damping = 0.5,
  onSpeedChange,
  onAcceleratingChange,
  onBrakingChange,
}: PlayerSystemOptions) {
  const keys = useRef<Record<string, boolean>>({});
  const speedRef = useRef(0);
  const velocity = useRef(new THREE.Vector3());
  const angularVelocity = useRef(new THREE.Vector3());
  const previousInputState = useRef({ accelerating: false, braking: false });

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => (keys.current[e.key.toLowerCase()] = true);
    const handleKeyUp = (e: KeyboardEvent) => (keys.current[e.key.toLowerCase()] = false);
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

    // --- INPUT CONTROL ---

    const gamepad = navigator.getGamepads?.()[0];
    const DEAD_ZONE = 0.1;
    let [lx, ly] = gamepad ? gamepad.axes : [0, 0];
    lx = Math.abs(lx) < DEAD_ZONE ? 0 : lx;
    ly = Math.abs(ly) < DEAD_ZONE ? 0 : ly;

    // Gamepad or keyboard angular control
    angularVelocity.current.z += lx * -0.03;
    angularVelocity.current.x += ly * 0.01;
    if (keys.current['a']) angularVelocity.current.z += 0.03;
    if (keys.current['d']) angularVelocity.current.z -= 0.03;
    if (keys.current['w']) angularVelocity.current.x -= 0.01;
    if (keys.current['s']) angularVelocity.current.x += 0.01;

    // Acceleration/braking
    const accelerating = !!(keys.current['i'] || gamepad?.buttons?.[0]?.pressed);
    const braking = !!(keys.current['k'] || gamepad?.buttons?.[2]?.pressed);

    // Trigger input state change callbacks
    if (accelerating !== previousInputState.current.accelerating) {
      onAcceleratingChange?.(accelerating);
      previousInputState.current.accelerating = accelerating;
    }

    if (braking !== previousInputState.current.braking) {
      onBrakingChange?.(braking);
      previousInputState.current.braking = braking;
    }

    // --- SPEED AND VELOCITY ---

    if (accelerating) {
      speedRef.current = Math.min(maxSpeed, speedRef.current + acceleration);
    } else if (!braking) {
      speedRef.current *= damping;
    }
    if (braking) {
      speedRef.current = Math.max(-1, speedRef.current - acceleration * 1.6);
    }

    // Clamp noise
    if (Math.abs(speedRef.current) < 0.001) {
      speedRef.current = 0;
      velocity.current.set(0, 0, 0);
    }

    onSpeedChange?.(speedRef.current);

    // Apply orientation
    const deltaRotation = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        angularVelocity.current.x,
        angularVelocity.current.y,
        angularVelocity.current.z,
        'XYZ'
      )
    );
    ship.quaternion.multiply(deltaRotation);
    angularVelocity.current.multiplyScalar(0.5); // damp rotation

    // Directional movement
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(ship.quaternion).normalize();
    const desiredVelocity = forward.multiplyScalar(speedRef.current);
    const lerpFactor = Math.max(0.05, Math.min(1, Math.abs(speedRef.current))); // responsive lerp
    velocity.current.lerp(desiredVelocity, lerpFactor);
    ship.position.add(velocity.current);

    // --- BVH COLLISION ---

    if (playingFieldRef?.current) {
      const field = playingFieldRef.current;
      const geometry = field.geometry as THREE.BufferGeometry & { boundsTree?: MeshBVH };
      if (!geometry.boundsTree) {
        geometry.boundsTree = new MeshBVH(geometry);
      }

      const raycaster = new THREE.Raycaster();
      raycaster.ray.origin.copy(ship.position).add(new THREE.Vector3(0, 1000, 0));
      raycaster.ray.direction.set(0, -1, 0);
      raycaster.firstHitOnly = false;

      const hits = raycaster.intersectObject(field);
      if (hits.length === 0) {
        const hitInfo = { point: new THREE.Vector3(), distance: 0, faceIndex: -1 };
        if (geometry.boundsTree.closestPointToPoint(ship.position, hitInfo)) {
          const dist = ship.position.distanceTo(hitInfo.point);
          if (dist > 10) {
            ship.position.copy(hitInfo.point);
            velocity.current.multiplyScalar(-1);
            speedRef.current = 0;
          }
        }
      }
    }

    // --- OBSTACLE COLLISION ---

    const shipBox = new THREE.Box3().setFromObject(ship);
    for (const obsRef of obstacleRefs) {
      const obs = obsRef.current;
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
