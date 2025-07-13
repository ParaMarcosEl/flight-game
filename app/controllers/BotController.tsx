// controllers/useBotController.ts
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

type BotControllerProps = {
  botRef: React.RefObject<THREE.Object3D>;
  curve: THREE.Curve<THREE.Vector3>;
  speed?: number;
  onCheckpointPass?: (index: number) => void;
  noiseAmplitude?: number;
  noiseFrequency?: number;
};

export function useBotController({
  botRef,
  curve,
  speed = 0.003,
  onCheckpointPass,
  noiseAmplitude = 2,
  noiseFrequency = 2,
}: BotControllerProps) {
  const t = useRef(0);
  const clock = useRef(new THREE.Clock());
  const prevCheckpointIndex = useRef(-1);

  useFrame(() => {
    const bot = botRef.current;
    if (!bot) return;

    // const delta = clock.current.getDelta();
    t.current = (t.current + speed) % 1;

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

    // Checkpoint callback
    const checkpointIndex = Math.floor(t.current * 20); // assuming 20 checkpoints
    if (checkpointIndex !== prevCheckpointIndex.current) {
      prevCheckpointIndex.current = checkpointIndex;
      onCheckpointPass?.(checkpointIndex);
    }
  });
}
