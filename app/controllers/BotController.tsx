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
  noiseAmplitude = 2,
  noiseFrequency = 2,
}: BotControllerProps) {
  const t = useRef(0);
  const clock = useRef(new THREE.Clock());

  useFrame(() => {
    const bot = botRef.current;
    if (!bot) return;

    t.current = (t.current + speed) % 1;

    // Base position and tangent (forward direction)
    const position = curve.getPointAt(t.current);
    const tangent = curve.getTangentAt(t.current).normalize();

    // Create lateral noise (oscillates left/right from the path)
    const up = new THREE.Vector3(0, 1, 0); // Arbitrary up
    const side = new THREE.Vector3().crossVectors(tangent, up).normalize();

    const time = clock.current.getElapsedTime();
    const offset = Math.sin(time * noiseFrequency) * noiseAmplitude;
    const noisyPosition = position.clone().add(side.multiplyScalar(offset));

    // Update bot position
    bot.position.copy(noisyPosition);

    // Aircraft-style orientation (banking + forward-facing)
    const right = side;
    const trueUp = new THREE.Vector3().crossVectors(tangent, right).normalize();

    const rotationMatrix = new THREE.Matrix4().makeBasis(right, trueUp, tangent);
    bot.quaternion.slerp(
      new THREE.Quaternion().setFromRotationMatrix(rotationMatrix),
      0.2 // adjust for smoothness
    );
  });
}
