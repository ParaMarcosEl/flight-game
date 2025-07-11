'use client';

import { useMemo, forwardRef } from 'react';
import { Line, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { curve, TUBE_RADIUS } from '../lib/flightPath';
import { computeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';
import LapTracker from './LapTracker';

// Setup BVH for accelerated raycasting
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

type PlayingFieldProps = {
  aircraftRef: React.RefObject<THREE.Object3D>;
  onStageComplete?: (lapTimes: number[]) => void;
};

const PlayingField = forwardRef<THREE.Mesh, PlayingFieldProps>(
  ({ aircraftRef, onStageComplete }, ref) => {
    const geometry = useMemo(() => {
      const tube = new THREE.TubeGeometry(curve, 200, TUBE_RADIUS, 16, true);
      tube.computeBoundsTree(); // Enable BVH
      return tube;
    }, []);

    const curvePoints = useMemo(() => curve.getPoints(1000), []);
    const lapZonePosition = useMemo(() => {
      const p = curvePoints[0]; // Start of the curve (origin of the Line)
      return [p.x, p.y, p.z] as [number, number, number];
    }, [curvePoints]);


    const texture = useTexture('/textures/stage_texture02.png');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 1);

    return (
      <>
        <Line points={curvePoints} color="#00ffff" lineWidth={2} dashed={false} />
        
        <mesh ref={ref} geometry={geometry}>
          <meshStandardMaterial map={texture} side={THREE.BackSide} />
        </mesh>

        {/* Lap Tracker inside track scene */}
        <LapTracker
          aircraftRef={aircraftRef}
          position={lapZonePosition}
          totalLaps={3}
          onStageComplete={onStageComplete}
        />

      </>
    );
  }
);

PlayingField.displayName = 'PlayingField';

export default PlayingField;
