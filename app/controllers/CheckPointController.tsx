import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

type Checkpoint = {
  mesh: THREE.Mesh;
  didPass: boolean;
};

export function useCheckpointController({
  aircraftRef,
  checkpointMeshRef,
  onLapComplete,
  cooldownTime = 5
}: {
  aircraftRef: React.RefObject<THREE.Object3D>;
  checkpointMeshRef: React.RefObject<THREE.Mesh>;
  onLapComplete?: () => void;
  cooldownTime?: number;
}) {
  const checkpoint = useRef<Checkpoint>({
    mesh: checkpointMeshRef.current as THREE.Mesh,
    didPass: false
  });

  const cooldown = useRef(0);
  const clock = new THREE.Clock();

  useFrame(() => {
    const aircraft = aircraftRef.current;
    const checkpointMesh = checkpointMeshRef.current;
    if (!aircraft || !checkpointMesh) return;

    const delta = clock.getDelta();
    cooldown.current -= delta;

    // Compute bounding boxes
    const aircraftBox = new THREE.Box3().setFromObject(aircraft);
    const checkpointBox = new THREE.Box3().setFromObject(checkpointMesh);

    // Check for intersection
    if (
      aircraftBox.intersectsBox(checkpointBox) &&
      !checkpoint.current.didPass &&
      cooldown.current <= 0
    ) {
      checkpoint.current.didPass = true;
      cooldown.current = cooldownTime;
      onLapComplete?.();
    } else if (!aircraftBox.intersectsBox(checkpointBox)) {
      // If the aircraft is no longer intersecting, reset didPass immediately
      // This ensures that even if cooldown.current is still > 0,
      // a new collision can be registered once the aircraft re-enters.
      // However, the cooldown logic below might be more appropriate.
      // For now, let's stick to the cooldown as the primary gate.
    }

    // After the cooldown period, allow the checkpoint to be triggered again
    if (cooldown.current <= 0 && checkpoint.current.didPass) {
        checkpoint.current.didPass = false;
    }
  });

  return checkpoint;
}