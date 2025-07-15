import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from './GameController';
import { useRef } from 'react';
import { getProgressAlongCurve } from '../utils';
import { TOTAL_LAPS } from '../constants';

const UPDATE_INTERVAL_MS = 200;
const MAX_DELTA_MS = 200;

export function useRaceProgress({
  playerRef,
  playerRefs,
  curve,
  onLapComplete,
  onRaceComplete,
}: {
  playerRef: React.RefObject<THREE.Object3D>;
  playerRefs: React.RefObject<THREE.Object3D>[];
  curve: THREE.Curve<THREE.Vector3>;
  onLapComplete?: () => void;
  onRaceComplete?: () => void;
}) {
  const {
    lastProgresses,
    playerId,
    setRacePosition,
    updateRacePositions,
    updateProgresses,
    raceData,
  } = useGameStore((state) => state);

  const elapsedRef = useRef(0);

  useFrame((_, delta) => {
    if (document.hidden) return;

    const safeDelta = Math.min(delta * 1000, MAX_DELTA_MS);
    elapsedRef.current += safeDelta;

    if (elapsedRef.current >= UPDATE_INTERVAL_MS) {
      elapsedRef.current = 0;

      // Update player position
      if (playerRef.current) {
        setRacePosition(playerId, playerRef.current.position);
      }

      // Update bot positions
      const botPositions = playerRefs.map((bot, idx) => ({
        id: idx,
        position: bot.current?.userData.curvePosition,
      }));
      updateRacePositions(botPositions);

      // Compute progress for each bot
      const botsProgress = playerRefs.map((ref, idx) => {
        return {
          id: idx,
          isPlayer: false,
          progress: ref.current?.userData.progress ?? 0,
        };
      });

      // Add player progress with unique ID (e.g., -1 or bots.length)
      const playerProgress = playerRef.current
        ? {
            id: playerRefs.length, // or -1
            isPlayer: true,
            progress: getProgressAlongCurve(curve, playerRef.current.position),
          }
        : null;

      // Combine and sort
      const combinedProgress = [...botsProgress, ...(playerProgress ? [playerProgress] : [])];
      combinedProgress.sort((a, b) => b.progress - a.progress); // Descending: higher progress first

      // Store sorted progresses
      updateProgresses(combinedProgress);

      if (playerProgress) {
        useGameStore.getState().setPlayerId(playerProgress.id);
      }

      Object.entries(raceData).forEach(([id, player]) => {
        const last = lastProgresses[Number(id)] ?? 0;

        const crossedFinishLine = last > 0.9 && player.progress < 0.1;
        if (crossedFinishLine) {
          useGameStore.getState().completeLap(Number(id));
          onLapComplete?.();

          if (player.isPlayer && player.lapCount >= TOTAL_LAPS) {
            useGameStore.getState().completeRace();
            onRaceComplete?.();
          }
        }
      });
    }
  });
}
