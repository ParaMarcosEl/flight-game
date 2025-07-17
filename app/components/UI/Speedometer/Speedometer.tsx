import SpeedMeter from './SpeedMeter';

export const Speedometer = function ({ speed }: { speed: number }) {
  return (
    <>
      <div>Speed: {(Math.abs(speed) * Math.PI * 200).toFixed(2)} m/s</div>
      <SpeedMeter speed={Math.abs(speed)} />
    </>
  );
};
