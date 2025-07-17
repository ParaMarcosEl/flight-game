// components/SpeedMeter.tsx
'use client';

import React, { CSSProperties } from 'react';
import { MAX_SPEED } from '../../../constants';

type SpeedMeterProps = {
  speed: number; // value from 0 to 1
};

export default function SpeedMeter({ speed }: SpeedMeterProps) {
  const speedPercent = Math.min(speed / MAX_SPEED, 1);

  return (
    <div style={meterWrapper}>
      <div style={{ ...meterBar, width: `${Math.min(speedPercent * 100, 100)}%` }} />
    </div>
  );
}

const meterWrapper: CSSProperties = {
  width: '100%',
  height: '10px',
  backgroundColor: '#333',
  borderRadius: '4px',
  overflow: 'hidden',
  marginBottom: '6px',
};

const meterBar: CSSProperties = {
  height: '100%',
  backgroundColor: '#00ff88',
  transition: 'width 0.1s linear',
};
