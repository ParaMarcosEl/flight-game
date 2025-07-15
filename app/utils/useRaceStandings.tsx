import { useMemo } from 'react';
import { useGameStore } from '../controllers/GameController';
import { TOTAL_LAPS } from '../constants';

export function useRaceStandings() {
  const raceData = useGameStore.getState().raceData;
  return useMemo(() => {
    const finishedList = Object.entries(useGameStore.getState().raceData)
      .filter(([id, player]) => player.lapCount >= TOTAL_LAPS && parseInt(id) >= 0)
      .sort(([, a], [, b]) => a.place - b.place)
      .map(([id, player]) => ({
        id: parseInt(id),
        place: player.place,
        finished: true,
      }));
    const inProgress = Object.entries(useGameStore.getState().raceData)
      .filter(([id, player]) => player.lapCount < TOTAL_LAPS && parseInt(id) >= 0)
      .sort(([, a], [, b]) => {
        if (b.lapCount !== a.lapCount) return b.lapCount - a.lapCount;
        if (b.progress !== a.progress) return b.progress - a.progress;
        return (
          a.history.reduce((prev, curr) => curr.time + prev, 0) -
          b.history.reduce((prev, curr) => curr.time + prev, 0)
        );
      })
      .map(([id, player]) => {
        const laps = player?.lapCount ?? 0;
        const total = player?.history?.reduce((sum, lap) => sum + lap.time, 0) ?? 0;
        return { id, laps, progress: player.progress, total, finished: false };
      });
    return {
      finished: finishedList,
      inProgress,
    };
  }, [raceData]);
}
