import { useEffect, useState, CSSProperties } from 'react';
import Link from 'next/link';
import { useGameStore } from '../../controllers/GameController';
import { formatTime } from '../../utils';
import { useRaceStandings } from '../../controllers/useRaceStandings';

type stylesType = Record<string, CSSProperties>;

export function RaceOver() {
  const { finished, raceOver } = useRaceStandings();
  const playerId = useGameStore.getState().playerId;
  const player = finished.find(({ id }) => id === playerId);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (raceOver) {
      setTimeout(() => setVisible(true), 100); // slight delay for smooth transition
    }
  }, [raceOver]);

  if (!raceOver) return null;
  console.log({ player });

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
      {/* 
 / Position, lap history, 
*/}
      <hr />
      <br />
      <div>
        <Link
          href={'#'}
          onClick={() => {
            useGameStore.getState().reset();
          }}
        >
          Try Again
        </Link>
      </div>
      <div>
        <Link href={'/stage-select'}>Stage Select</Link>
      </div>
    </div>
  );
}
