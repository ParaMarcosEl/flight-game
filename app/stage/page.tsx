'use client';

import { Canvas } from '@react-three/fiber';
import { useRef, useMemo, useState, createRef } from 'react';
import * as THREE from 'three';
import Aircraft from '../components/Aircraft';
import PlayingField from '../components/PlayingField';
import FollowCamera from '../components/FollowCamera';
// import Obstacle from '../components/Obstacle';
import HUD from '../components/HUD';
import { getStartPoseFromCurve } from '../utils';
import { curve } from '../lib/flightPath';
import { MAX_SPEED } from '../constants';
import { Skybox } from '../components/Skybox';
import BotCraft from '../components/Bot/BotCraft';


export default function Stage() {
  const aircraftRef = useRef<THREE.Group | null>(null);
  const playingFieldRef = useRef<THREE.Mesh | null>(null);
  const bounds = { x: 500, y: 250, z: 500 };
  
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
    () => getStartPoseFromCurve(curve, .01),
    []
  );

  
  return (
    <main style={{ width: '100vw', height: '100vh' }}>
      <HUD speed={speed} />

      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        {/* HUD */}
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

        {/* Bot */}
        <BotCraft startPosition={new THREE.Vector3(startPosition[0], startPosition[1], startPosition[2])} startQuaternion={startQuaternion}/>

        {/* Camera */}
        <FollowCamera targetRef={aircraftRef} />
      </Canvas>
    </main>
  );
}
