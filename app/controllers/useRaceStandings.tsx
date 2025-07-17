import { useMemo } from 'react';
import { useGameStore } from './GameController';
import { TOTAL_LAPS } from '../constants';

export function useRaceStandings() {
  const raceData = useGameStore.getState().raceData;
  const playerId = useGameStore.getState().playerId;
  return useMemo(() => {
    const finishedList = Object.entries(useGameStore.getState().raceData)
      .filter(([id, player]) => player.lapCount >= TOTAL_LAPS && parseInt(id) >= 0)
      .sort(
        ([, a], [, b]) =>
          a?.history.reduce((sum, lap) => sum + lap.time, 0) -
          b?.history.reduce((sum, lap) => sum + lap.time, 0),
      )
      .map(([id, { history }], idx) => ({
        id: parseInt(id),
        place: idx + 1,
        finished: true,
        time: history.reduce((sum, lap) => sum + lap.time, 0),
        history,
      }));

    const inProgress = Object.entries(useGameStore.getState().raceData)
      .filter(([id, player]) => (player?.history?.length || 0) < TOTAL_LAPS && parseInt(id) >= 0)
      .sort(([, a], [, b]) => {
        if (b.lapCount !== a.lapCount) return b.lapCount - a.lapCount;
        if (b.progress !== a.progress) return b.progress - a.progress;
        return (
          a?.history.reduce((sum, lap) => sum + lap.time, 0) -
          b?.history.reduce((sum, lap) => sum + lap.time, 0)
        );
      })
      .map(([id, { history }], idx) => {
        return {
          id: parseInt(id),
          place: idx + 1 + finishedList.length,
          finished: true,
          time: history?.reduce((sum, lap) => sum + lap.time, 0) || 0,
          history,
        };
      });

    return {
      finished: finishedList,
      inProgress,
      raceOver: (raceData[playerId]?.history?.length || 0) >= TOTAL_LAPS,
    };
  }, [raceData]);
}
