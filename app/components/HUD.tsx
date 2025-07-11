'use client';

import { CSSProperties } from 'react';
import { formatTime } from '../utils/FormatLapTime';


type PlayerHUDProps = {
  speed: number;
  accelerating: boolean;
  braking: boolean;
  currentLap: number;
  currentLapTime: number;
  lapTimes: number[];
  stageComplete: boolean;
};

export default function HUD({ speed, accelerating, braking, currentLap, currentLapTime, lapTimes, stageComplete }: PlayerHUDProps) {

  // TODO: format currentLapTime to 00:00:00 Min:Sec:Milli
  return (
    <div style={hudStyle}>
      <div>🚀 Speed: {(speed * Math.PI * 500).toFixed(2)}</div>
      <div>
        {accelerating && '🔼 Accelerating'}
        {braking && '🔽 Braking'}
        {!accelerating && !braking && '🟢 Coasting'}
      </div>
      <p>Lap: {currentLap} / 3</p>
      {lapTimes.map((time, i) => (
        <p key={i}>Lap {i + 1}: {time.toFixed(2)}s</p>
      ))}
      <div>Lap Time: {formatTime(currentLapTime)}</div>
      {stageComplete && <p>🎉 Stage Complete!</p>}
      <hr style={{ borderColor: 'gray' }} />
      <div>Controls:</div>
      <div>W/S - Pitch Up/Down</div>
      <div>A/D - Roll Left/Right</div>
      <div>I / (X on gamepad) - Accelerate</div>
      <div>K / (Square on gamepad) - Brake</div>
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
