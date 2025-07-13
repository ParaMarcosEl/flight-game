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
  onRaceComplete,
  cooldownTime = .5
}: {
  aircraftRef: React.RefObject<THREE.Object3D>;
  checkpointMeshRef: React.RefObject<THREE.Mesh>;
  onLapComplete?: () => void; // Optional: for additional effects outside the store
  onRaceComplete?: () => void; // Optional: for additional effects outside the store
  cooldownTime?: number;
}) {
  const checkpoint = useRef<Checkpoint>({
    mesh: checkpointMeshRef.current as THREE.Mesh,
    didPass: false
  });

  // Get the completeLap action from your Zustand store
  const { completeLap: completeLapInStore, completeRace, lapCount } = useGameStore((state) => state);

  const cooldown = useRef(0);
  // const clock = new THREE.Clock(); // Clock for delta time calculation

  useFrame((_, delta) => {
  const aircraft = aircraftRef.current;
  const checkpointMesh = checkpointMeshRef.current;
  if (!aircraft || !checkpointMesh) return;

  cooldown.current -= delta;

  const aircraftBox = new THREE.Box3().setFromObject(aircraft);
  const checkpointBox = new THREE.Box3().setFromObject(checkpointMesh);

  if (
    aircraftBox.intersectsBox(checkpointBox) &&
    !checkpoint.current.didPass &&
    cooldown.current <= 0
  ) {
    checkpoint.current.didPass = true;
    cooldown.current = cooldownTime;
    completeLapInStore();
    onLapComplete?.();

    if (lapCount >= 2) {
      completeRace();
      onRaceComplete?.();
    }
  }

  if (
    !aircraftBox.intersectsBox(checkpointBox) &&
    cooldown.current <= 0 &&
    checkpoint.current.didPass
  ) {
    checkpoint.current.didPass = false;
  }
});


  return checkpoint;
}