'use client';

import { CSSProperties } from 'react';
import { useGameStore } from '../controllers/GameController';
import { formatTime } from '../utils';

type PlayerHUDProps = {
  speed: number;
  accelerating: boolean;
  braking: boolean;
};

export default function HUD({ speed, accelerating, braking }: PlayerHUDProps) {
  const {lapTime, lapCount, lapHistory} = useGameStore((state) => state);
  return (
    <div style={hudStyle}>
      <div>🚀 Speed: {(speed * Math.PI * 500).toFixed(2)}</div>
      <div>
        {accelerating && '🔼 Accelerating'}
        {braking && '🔽 Braking'}
        {!accelerating && !braking && '🟢 Coasting'}
      </div>
      <hr />
      <div>Current Lap: {lapCount + 1}{/* Displaying current lap + 1 for user-friendly 1-based indexing */}
      <div>Lap History:</div>
      {lapHistory.length === 0 ? (
          <div>No laps completed yet.</div>
        ) : (
          <ol>
            {lapHistory.map((lap) => (
              <li key={lap.timestamp}>
                Lap {lap.lapNumber}: {formatTime(lap.time)}s
              </li>
            ))}
          </ol>
        )
      }
      </div>
      <div>
        Lap Time: {formatTime(lapTime)}
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
