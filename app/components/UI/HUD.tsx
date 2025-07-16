/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRaceStandings } from '../../utils/useRaceStandings';
import { useGameStore } from '../../controllers/GameController';
import { formatTime } from '../../utils';
import SpeedMeter from '../SpeedMeter';
import { CSSProperties } from 'react';
import { TOTAL_LAPS } from '../../constants';

export default function HUD({ speed }: { speed: number }) {
  const { lapTime, raceCompleted, totalTime, raceData, playerId } = useGameStore((state) => {
    return state;
  });

  const { finished, inProgress } = useRaceStandings();

  const playerHistory = raceData[playerId]?.history || [];

  const history =
    playerHistory.length === 0 ? (
      <>
        <hr />
        <div>Lap History:</div>
        <div>No laps completed.</div>
      </>
    ) : (
      <>
        {playerHistory.map((lap, idx) => idx < TOTAL_LAPS && (
          <div key={lap.timestamp}>
            Lap {lap.lapNumber}: {formatTime(lap.time)}
          </div>
        ))}
      </>
    );

  const standingsUI = (
    <>
      <hr />
      <div>🏁 Standings:</div>
      <ol>
        {finished.map((player) => {
          const time = raceData[player.id].history.reduce((prev, curr) => curr.time + prev, 0);
          return (
            <li key={player.id}>
              #{player.place} Place – {player.id === playerId ? 'You' : `Bot ${player.id}`}, Time:{' '}
              {formatTime(time)}
            </li>
          );
        })}
      </ol>
    </>
  );

  return (
    <div style={hudStyle}>
      <div>Speed: {(Math.abs(speed) * Math.PI * 200).toFixed(2)} m/s</div>
      <SpeedMeter speed={Math.abs(speed)} />
      <hr />

      {raceCompleted ? (
        <>
          <div>🎉 RACE COMPLETED!</div>
          <div>Total Time: {formatTime(totalTime)}</div>
          {history}
        </>
      ) : (
        <>
          <div>Current Lap: {(raceData[playerId]?.lapCount || 0) + 1}</div>
          <div>Current Time: {formatTime(lapTime)}</div>
          {history}
        </>
      )}

      <hr />
      <hr />
      <div>Controls:</div>
      <div>Accelerate: I</div>
      <div>Brake: K</div>
      <div>Roll: A/D</div>
      <div>Pitch: W/S</div>
    </div>
  );
}

const hudStyle: CSSProperties = {
  position: 'absolute',
  top: 20,
  left: 20,
  padding: '10px 15px',
  background: 'rgba(0, 0, 0, 0.6)',
  color: 'white',
  fontFamily: 'monospace',
  fontSize: '14px',
  borderRadius: '8px',
  pointerEvents: 'none',
  zIndex: 10,
};
