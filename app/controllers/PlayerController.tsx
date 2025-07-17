import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshBVH } from 'three-mesh-bvh';
import { useGameStore } from './GameController';
import { BOT_SPEED, TOTAL_LAPS } from '../constants';

type PlayerSystemOptions = {
  aircraftRef: React.RefObject<THREE.Group | null>;
  obstacleRefs: React.RefObject<THREE.Mesh | null>[];
  playingFieldRef?: React.RefObject<THREE.Mesh | null>;
  maxSpeed?: number;
  acceleration?: number;
  damping?: number;
  noiseAmplitude?: number;
  noiseFrequency?: number;
  curve: THREE.Curve<THREE.Vector3>;
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
  noiseAmplitude = 49,
  noiseFrequency = 4,
  curve,
  onSpeedChange,
  onAcceleratingChange,
  onBrakingChange,
}: PlayerSystemOptions) {
  const keys = useRef<Record<string, boolean>>({});
  const speedRef = useRef(0);
  const velocity = useRef(new THREE.Vector3());
  const angularVelocity = useRef(new THREE.Vector3());
  const previousInputState = useRef({ accelerating: false, braking: false });
  const gamepadIndex = useRef<number | null>(null);

  const { playerId, raceData } = useGameStore((state) => state);
  const t = useRef(0);
  const clock = useRef(new THREE.Clock());

  // --- Keyboard input ---
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

  // --- Detect first connected gamepad ---
  useEffect(() => {
    const handler = (e: GamepadEvent) => {
      if (gamepadIndex.current === null) {
        gamepadIndex.current = e.gamepad.index;
      }
    };
    window.addEventListener('gamepadconnected', handler);
    return () => window.removeEventListener('gamepadconnected', handler);
  }, []);

  useFrame(() => {
    const ship = aircraftRef.current;
    if (!ship) return;

    if (raceData[playerId]?.history.length >= TOTAL_LAPS) {
      const bot = aircraftRef.current;
      if (!bot) return;

      // const delta = clock.current.getDelta();
      t.current = (t.current + BOT_SPEED) % 1;

      // Base path position and direction
      const position = curve.getPointAt(t.current);
      const tangent = curve.getTangentAt(t.current).normalize();

      // Create lateral noise perpendicular to the curve
      const normal = new THREE.Vector3(0, 1, 0); // Arbitrary up vector
      const side = new THREE.Vector3().crossVectors(tangent, normal).normalize();

      // Add oscillation or jitter along the side vector
      const time = clock.current.elapsedTime;
      const offsetStrength = Math.sin(time * noiseFrequency) * noiseAmplitude;

      const noisyPosition = position.clone().add(side.multiplyScalar(offsetStrength));
      bot.position.copy(noisyPosition);

      // Look toward the next point on the curve (with the same noise offset)
      const lookAt = curve.getPointAt((t.current + 0.01) % 1);
      bot.lookAt(lookAt);

      bot.rotateX(Math.PI / 2);
      bot.rotateY(Math.PI / 2);
      bot.rotateZ(Math.PI / 2);
      bot.rotateX(-Math.PI / 2);
      bot.rotateY(-Math.PI / 2);
      bot.rotateZ(-Math.PI / 2);
    } else {
      const DEAD_ZONE = 0.1;

      // --- Gamepad ---
      const gamepads = navigator.getGamepads?.();
      const gp = gamepadIndex.current !== null ? gamepads?.[gamepadIndex.current] : gamepads?.[0];
      let lx = 0,
        ly = 0;

      if (gp && gp.connected) {
        lx = Math.abs(gp.axes[0]) > DEAD_ZONE ? gp.axes[0] : 0;
        ly = Math.abs(gp.axes[1]) > DEAD_ZONE ? gp.axes[1] : 0;
      }

      angularVelocity.current.z += lx * -0.03;
      angularVelocity.current.x += ly * 0.01;

      // --- Keyboard fallback ---
      if (keys.current['a']) angularVelocity.current.z += 0.03;
      if (keys.current['d']) angularVelocity.current.z -= 0.03;
      if (keys.current['w']) angularVelocity.current.x -= 0.01;
      if (keys.current['s']) angularVelocity.current.x += 0.01;

      const accelerating = !!(keys.current['i'] || gp?.buttons?.[0]?.pressed);
      const braking = !!(keys.current['k'] || gp?.buttons?.[2]?.pressed);

      if (accelerating !== previousInputState.current.accelerating) {
        onAcceleratingChange?.(accelerating);
        previousInputState.current.accelerating = accelerating;
      }

      if (braking !== previousInputState.current.braking) {
        onBrakingChange?.(braking);
        previousInputState.current.braking = braking;
      }

      if (accelerating) {
        speedRef.current = Math.min(maxSpeed, speedRef.current + acceleration);
      } else if (!braking) {
        speedRef.current *= damping;
      }
      if (braking) {
        speedRef.current = Math.max(-1, speedRef.current - acceleration * 1.6);
      }

      // Clamp low noise
      if (Math.abs(speedRef.current) < 0.001) {
        speedRef.current = 0;
        velocity.current.set(0, 0, 0);
      }

      onSpeedChange?.(speedRef.current);

      // --- Apply rotation ---
      const deltaRotation = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
          angularVelocity.current.x,
          angularVelocity.current.y,
          angularVelocity.current.z,
          'XYZ',
        ),
      );
      ship.quaternion.multiply(deltaRotation);
      angularVelocity.current.multiplyScalar(0.5);

      // --- Movement ---
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(ship.quaternion).normalize();
      const desiredVelocity = forward.multiplyScalar(speedRef.current);
      const lerpFactor = Math.max(0.05, Math.min(1, Math.abs(speedRef.current)));
      velocity.current.lerp(desiredVelocity, lerpFactor);
      ship.position.add(velocity.current);

      // --- BVH Collision Check ---
      if (playingFieldRef?.current) {
        const field = playingFieldRef.current;
        const geometry = field.geometry as THREE.BufferGeometry & { boundsTree?: MeshBVH };
        if (!geometry.boundsTree) geometry.boundsTree = new MeshBVH(geometry);

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

      // --- Obstacle Collisions ---
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
    }
  });
}
