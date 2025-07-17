import { CSSProperties } from 'react';
import SpeedMeter from './SpeedMeter';

export const Speedometer = function ({ speed }: { speed: number }) {
  const speedometerStyle: CSSProperties = {
    zIndex: 1,
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: '50%',
    background: '#000a',
    padding: '20px',
    color: 'white',
    fontFamily: 'monospace',
    textAlign: 'right',
    borderRadius: '8px',
    transition: 'opacity 1s ease-in-out',
    borderTopLeftRadius: '80%',
    borderTopRightRadius: '8%',
    borderBottomLeftRadius: '0',
    borderBottomRightRadius: '25%',
  };

  return (
    <div style={speedometerStyle}>
      <div>Speed: {(Math.abs(speed) * Math.PI * 200).toFixed(2)} m/s</div>
      <SpeedMeter speed={Math.abs(speed)} />
    </div>
  );
};
