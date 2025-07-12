'use client';

import { CSSProperties } from 'react';
import { useGameStore } from '../controllers/GameController';
import { formatTime } from '../utils';
import SpeedMeter from './SpeedMeter';

type PlayerHUDProps = {
  speed: number;
};

export default function HUD({ speed }: PlayerHUDProps) {
  const {lapTime, lapCount, lapHistory} = useGameStore((state) => state);
  return (
    <div style={hudStyle}>
      <div> Speed: {(Math.abs(speed) * Math.PI * 200).toFixed(2)}m/s</div>
      <div>
        <SpeedMeter speed={Math.abs(speed)} />
      </div>
      <hr />
      <div>Current Lap: {lapCount + 1}{/* Displaying current lap + 1 for user-friendly 1-based indexing */}
      <div>
        Current Time: {formatTime(lapTime)}
      </div>
      <hr />
      <div>Lap History:</div>
      {lapHistory.length === 0 ? (
          <div>No laps completed yet.</div>
        ) : (
          <>
            {lapHistory.map((lap) => (
              <div key={lap.timestamp}>
                Lap {lap.lapNumber}: {formatTime(lap.time)}s
              </div>
            ))}
          </>
        )
      }
      </div>
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
