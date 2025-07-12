// controllers/LapTimer.ts
import { useFrame } from '@react-three/fiber';
import { useGameStore } from './GameController'; // Assuming GameController is your zustand store file

export function useLapTimer() {
  const setLapTime = useGameStore((state) => state.setLapTime);
  const lapStartTime = useGameStore((state) => state.lapStartTime); // Get start time from store

  useFrame(() => {
    const now = performance.now();
    setLapTime((now - lapStartTime)); // Update lapTime in the store
  });
  // No useEffect with lapCompleteTrigger needed here anymore.
  // The lapStartTime is managed by the completeLap action in the store.
}