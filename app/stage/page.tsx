'use client';

import { Canvas } from '@react-three/fiber';
import { useRef, useMemo, useState, createRef } from 'react';
import * as THREE from 'three';
import Aircraft from '../components/Aircraft/Aircraft';
import PlayingField from '../components/PlayingField';
import FollowCamera from '../components/FollowCamera';
// import Obstacle from '../components/Obstacle';
import HUD from '../components/UI/HUD';
import { getStartPoseFromCurve } from '../utils';
import { curve } from '../lib/flightPath';
import { MAX_SPEED } from '../constants';
import { Skybox } from '../components/Skybox';
import BotCraft from '../components/Bot/BotCraft';
import MiniMap from '../components/UI/MiniMap';
import { useGameStore } from '../controllers/GameController';
import { useRaceProgress } from '../controllers/RaceProgressController';
import { StandingsUI } from '../components/UI/StandingsUI';

function RaceProgressTracker({
  playerRef,
  botRefs,
}: {
  playerRef: React.RefObject<THREE.Object3D>;
  botRefs: React.RefObject<THREE.Object3D>[];
}) {
  useRaceProgress({ playerRef, playerRefs: botRefs, curve });
  return null; // No rendering, just logic
}

export default function Stage() {
  const aircraftRef = useRef<THREE.Group | null>(null);
  const playingFieldRef = useRef<THREE.Mesh | null>(null);
  const botRef = useRef<THREE.Object3D | null>(null);
  const botRef2 = useRef<THREE.Object3D | null>(null);
  // const botRef3 = useRef<THREE.Object3D | null>(null);
  // const botRef4 = useRef<THREE.Object3D | null>(null);
  // const botRef5 = useRef<THREE.Object3D | null>(null);
  // const botRef6 = useRef<THREE.Object3D | null>(null);
  // const botRef7 = useRef<THREE.Object3D | null>(null);
  const bounds = { x: 500, y: 250, z: 500 };

  const { raceData } = useGameStore((state) => state);
  const positions = Object.entries(raceData)
    .map(([id, player]) => ({
      isPlayer: player.isPlayer,
      v: player.position,
      id: parseInt(id),
    }))
    .filter((pos) => pos.id >= 0);
  const obstaclePositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    for (let i = 0; i < 500; i++) {
      positions.push([
        (Math.random() * 2 - 1) * bounds.x,
        (Math.random() * 2 - 1) * bounds.y,
        (Math.random() * 2 - 1) * bounds.z,
      ]);
    }
    return positions;
  }, [bounds.x, bounds.y, bounds.z]);

  const obstacleRefs = useRef<React.RefObject<THREE.Mesh | null>[]>([]);
  if (obstacleRefs.current.length !== obstaclePositions.length) {
    obstacleRefs.current = obstaclePositions.map(() => createRef<THREE.Mesh>());
  }

  // HUD state
  const [speed, setSpeed] = useState(0);
  const { position: startPosition, quaternion: startQuaternion } = useMemo(
    () => getStartPoseFromCurve(curve, 0.01),
    [],
  );

  return (
    <main style={{ width: '100vw', height: '100vh' }}>
      {/* UI */}
      <HUD speed={speed} />
      <MiniMap positions={positions} />
      <StandingsUI />

      {/* Scene */}
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <RaceProgressTracker
          playerRef={aircraftRef as React.RefObject<THREE.Object3D>}
          botRefs={[
            botRef as React.RefObject<THREE.Object3D>,
            botRef2 as React.RefObject<THREE.Object3D>,
            // botRef3 as React.RefObject<THREE.Object3D>,
            // botRef4 as React.RefObject<THREE.Object3D>,
            // botRef5 as React.RefObject<THREE.Object3D>,
            // botRef6 as React.RefObject<THREE.Object3D>,
            // botRef7 as React.RefObject<THREE.Object3D>,
          ]}
        />
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 10, 7]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-near={0.5}
          shadow-camera-far={500}
        />
        <pointLight position={[-10, 5, -10]} intensity={0.3} />
        <ambientLight />
        <pointLight position={[10, 10, 10]} />

        {/* World */}
        <Skybox />
        <PlayingField
          ref={playingFieldRef}
          aircraftRef={aircraftRef as React.RefObject<THREE.Object3D>}
        />
        {/* {obstaclePositions.map((pos, i) => (
          <Obstacle key={i} position={pos} ref={obstacleRefs.current[i]} />
        ))} */}

        {/* Aircraft */}
        <Aircraft
          aircraftRef={aircraftRef}
          obstacleRefs={obstacleRefs.current}
          playingFieldRef={playingFieldRef}
          startPosition={startPosition}
          startQuaternion={startQuaternion}
          maxSpeed={MAX_SPEED}
          acceleration={0.01}
          damping={0.99}
          onSpeedChange={setSpeed}
        />

        {/* Bots */}
        <BotCraft
          ref={botRef as React.RefObject<THREE.Object3D>}
          startPosition={new THREE.Vector3(startPosition[0], startPosition[1], startPosition[2])}
          startQuaternion={startQuaternion}
          speed={0.0005}
          curve={curve}
        />
        <BotCraft
          ref={botRef2 as React.RefObject<THREE.Object3D>}
          startPosition={new THREE.Vector3(startPosition[0], startPosition[1], startPosition[2])}
          startQuaternion={startQuaternion}
          speed={0.00047}
          curve={curve}
        />
        {/* <BotCraft 
          ref={botRef3 as React.RefObject<THREE.Object3D>} 
          startPosition={new THREE.Vector3(startPosition[0], startPosition[1], startPosition[2])} 
          startQuaternion={startQuaternion} speed={.0003}
          curve={curve}
        />
        <BotCraft 
          ref={botRef4 as React.RefObject<THREE.Object3D>} 
          startPosition={new THREE.Vector3(startPosition[0], startPosition[1], startPosition[2])} 
          startQuaternion={startQuaternion} speed={.00035}
          curve={curve}
        />
        <BotCraft 
          ref={botRef5 as React.RefObject<THREE.Object3D>} 
          startPosition={new THREE.Vector3(startPosition[0], startPosition[1], startPosition[2])} 
          startQuaternion={startQuaternion} speed={.0004}
          curve={curve}
        />
        <BotCraft 
          ref={botRef6 as React.RefObject<THREE.Object3D>} 
          startPosition={new THREE.Vector3(startPosition[0], startPosition[1], startPosition[2])} 
          startQuaternion={startQuaternion} speed={.00045}
          curve={curve}
        />
        <BotCraft 
          ref={botRef7 as React.RefObject<THREE.Object3D>} 
          startPosition={new THREE.Vector3(startPosition[0], startPosition[1], startPosition[2])} 
          startQuaternion={startQuaternion} speed={.0005}
          curve={curve}
        /> */}

        {/* Camera */}
        <FollowCamera targetRef={aircraftRef} />
      </Canvas>
    </main>
  );
}
