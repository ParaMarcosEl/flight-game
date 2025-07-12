// controllers/CheckpointController.ts
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from './GameController';

type Checkpoint = {
  mesh: THREE.Mesh;
  didPass: boolean;
};

export function useCheckpointController({
  aircraftRef,
  checkpointMeshRef,
  // onLapComplete is now managed by the store's completeLap action,
  // so you might not need to pass it here directly if the store handles all lap logic.
  // We'll keep it for now as an optional external callback.
  onLapComplete,
  cooldownTime = 1
}: {
  aircraftRef: React.RefObject<THREE.Object3D>;
  checkpointMeshRef: React.RefObject<THREE.Mesh>;
  onLapComplete?: () => void; // Optional: for additional effects outside the store
  cooldownTime?: number;
}) {
  const checkpoint = useRef<Checkpoint>({
    mesh: checkpointMeshRef.current as THREE.Mesh,
    didPass: false
  });

  // Get the completeLap action from your Zustand store
  const completeLapInStore = useGameStore((state) => state.completeLap);

  const cooldown = useRef(0);
  const clock = new THREE.Clock(); // Clock for delta time calculation

  useFrame(() => {
    const aircraft = aircraftRef.current;
    const checkpointMesh = checkpointMeshRef.current;
    if (!aircraft || !checkpointMesh) return;

    const delta = clock.getDelta(); // Get time elapsed since last frame
    cooldown.current -= delta; // Decrement cooldown

    // Compute bounding boxes
    const aircraftBox = new THREE.Box3().setFromObject(aircraft);
    const checkpointBox = new THREE.Box3().setFromObject(checkpointMesh);

    // Check for intersection
    if (
      aircraftBox.intersectsBox(checkpointBox) && // Collision detected
      !checkpoint.current.didPass &&              // Not already passed (within cooldown)
      cooldown.current <= 0                     // Cooldown has expired
    ) {
      checkpoint.current.didPass = true; // Mark as passed
      cooldown.current = cooldownTime;   // Start cooldown
      
      // Trigger the lap completion logic in your Zustand store
      completeLapInStore(); 
      
      // Call the optional external callback if provided
      onLapComplete?.();
    }

    // This block is crucial for allowing subsequent triggers.
    // If the aircraft is *no longer intersecting* AND the cooldown has expired,
    // then we can allow the checkpoint to be triggered again.
    // This handles scenarios where the aircraft might briefly re-enter the box.
    if (!aircraftBox.intersectsBox(checkpointBox) && cooldown.current <= 0 && checkpoint.current.didPass) {
        checkpoint.current.didPass = false;
    }
  });

  return checkpoint;
}