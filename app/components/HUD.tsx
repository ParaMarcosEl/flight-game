'use client';

import { CSSProperties } from 'react';

type PlayerHUDProps = {
  speed: number;
  accelerating: boolean;
  braking: boolean;
  lapCount: number;
};

export default function HUD({ speed, accelerating, braking, lapCount }: PlayerHUDProps) {
  return (
    <div style={hudStyle}>
      <div>🚀 Speed: {(speed * Math.PI * 500).toFixed(2)}</div>
      <div>
        {accelerating && '🔼 Accelerating'}
        {braking && '🔽 Braking'}
        {!accelerating && !braking && '🟢 Coasting'}
      </div>
      <div>
        Laps: {lapCount}
      </div>
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
