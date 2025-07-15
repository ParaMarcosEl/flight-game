import { useGameStore } from '../../controllers/GameController';
import { useRaceStandings } from '../../utils/useRaceStandings';

export function StandingsUI() {
  const { finished } = useRaceStandings();
  const { raceData } = useGameStore();
  

  return (
    <div style={{ zIndex: 1, position: 'absolute', top: 20, right: 20, background: '#000a', padding: 10, color: 'white', fontFamily: 'monospace' }}>
      <h4>🏁 Standings</h4>
      <ol>
        {finished.map(({ id, place }) => (
          <li key={id}>
            {id === finished.length - 1 ? 'You' : `Bot-${id}`} — Placed #{place} {raceData[id].history.reduce((prev: number, curr: { time: number; }) => prev + curr.time, 0)}
          </li>
        ))}
      </ol>
    </div>
  );
}
