import { useEffect, useState, CSSProperties } from 'react';
import Link from 'next/link';
import { useGameStore } from '../../controllers/GameController';
import { formatTime } from '../../utils';
import { useRaceStandings } from '../../controllers/useRaceStandings';
import { curve } from '../../lib/flightPath';

type stylesType = Record<string, CSSProperties>;

export function RaceOver() {
  const { finished, raceOver } = useRaceStandings();
  const reset = useGameStore((s) => s.reset);
  const setRacePosition = useGameStore((s) => s.setRacePosition);
  const playerId = useGameStore.getState().playerId;
  const player = finished.find(({ id }) => id === playerId);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (raceOver) {
      setTimeout(() => setVisible(true), 100);
    }
  }, [raceOver]);

  if (!raceOver) return null;

  const handleTryAgain = () => {
    reset();

    // Reposition player to start
    const startingPosition = curve.getPointAt(0);
    setRacePosition(playerId, startingPosition);
  };

  const history =
    (player?.history || []).length > 0 &&
    player?.history.map(({ time, lapNumber }, idx) => (
      <div key={idx}>
        lap {lapNumber}: {formatTime(time)}
      </div>
    ));

  const styles: stylesType = {
    raceOver: {
      zIndex: 1,
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: '#000a',
      padding: '20px',
      color: 'white',
      fontFamily: 'monospace',
      textAlign: 'center',
      borderRadius: '8px',
      opacity: visible ? 1 : 0,
      transition: 'opacity 1s ease-in-out',
    },
  };

  return (
    <div style={styles.raceOver}>
      <h4>🏁 Race Over!</h4>
      <div>You placed: </div>
      <div>{player?.place}</div>
      <div>Race Time: {formatTime(player?.time || 0)}</div>
      <hr />
      {history}
      <hr />
      <br />
      <div>
        <Link href={'/stage-select'} onClick={handleTryAgain}>
          Stage Select
        </Link>
      </div>
    </div>
  );
}
