import { TOTAL_LAPS } from '../../constants';
import { useGameStore } from '../../controllers/GameController';
import { formatTime } from '../../utils';
import { useRaceStandings } from '../../controllers/useRaceStandings';

export function StandingsUI() {
  const { finished } = useRaceStandings();
  const { raceData } = useGameStore();

  return (
    finished.length > 0 && (
      <div
        style={{
          zIndex: 1,
          position: 'absolute',
          top: 20,
          right: 20,
          background: '#000a',
          padding: 10,
          color: 'white',
          fontFamily: 'monospace',
          textAlign: 'right',
        }}
      >
        <h4>🏁 Standings</h4>
        <ol>
          {finished.reverse().map(({ id }, i) => (
            <li key={id}>
              {id === useGameStore.getState().playerId ? 'You' : `Bot${id}`} — Placed #{i + 1}{' '}
              {formatTime(
                raceData[id].history.reduce(
                  (prev: number, curr: { time: number }, idx) =>
                    idx < TOTAL_LAPS ? prev + curr.time : 0 + prev,
                  0,
                ),
              )}
            </li>
          ))}
        </ol>
      </div>
    )
  );
}
