'use client';

import React, { useMemo, forwardRef, useRef } from 'react';
import { Line, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { curve, TUBE_RADIUS } from '../lib/flightPath';
import { computeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';
import { useCheckpointController } from '../controllers/CheckPointController';
import { useLapTimer } from '../controllers/LapTimer';


// Setup BVH on BufferGeometry and raycasting
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

const PlayingField = forwardRef<THREE.Mesh, { 
  aircraftRef: React.RefObject<THREE.Object3D>,
  onLapComplete?: () => void,
}>(
  ({ 
      aircraftRef, 
      // onLapComplete, 
    }, ref) => {
      const checkpointMeshRef = useRef<THREE.Mesh | null>(null);

      useLapTimer();

      const checkpoint = useCheckpointController({ 
        aircraftRef, 
        checkpointMeshRef: checkpointMeshRef as React.RefObject<THREE.Mesh>,
        onLapComplete: () => {
          console.log("Lap Completed");
        },
      });

    
      // Create tube geometry with BVH acceleration
      const geometry = useMemo(() => {
        const tubeGeometry = new THREE.TubeGeometry(curve, 200, TUBE_RADIUS, 16, true);
        tubeGeometry.computeBoundsTree();
        return tubeGeometry;
      }, []);
    
    // Get points along the curve for rendering the line
    const curvePoints = useMemo(() => curve.getPoints(1000), []);
    
    const { quaternion} = useMemo(() => {
      const tangent = curve.getTangentAt(0).normalize();

      // Default orientation of cylinder is Y-up. Compute rotation from Y-up to tangent.
      const up = new THREE.Vector3(0, 1, 0);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(up, tangent);

      return {
        quaternion,
      };
    }, []);

    // Load and configure repeating texture for the playing field
    const texture = useTexture('/textures/stage_texture.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 1);

    return (
      <>
        {/* Render checkpoints as translucent spheres with color indication */}
          <mesh ref={checkpointMeshRef} position={curvePoints[0]} quaternion={quaternion}>
            <cylinderGeometry args={[35, 35, 1]} />
            <meshBasicMaterial
              color={!checkpoint.current.didPass ? 'green' : 'red'}
              transparent
              opacity={0.8}
              wireframe
            />
          </mesh>

        {/* Render the tube path line */}
        <Line points={curvePoints} color="#00ffff" lineWidth={2} dashed={false} />

        {/* Render the tube mesh with texture */}
        <mesh ref={ref} geometry={geometry}>
          <meshStandardMaterial map={texture} side={THREE.BackSide} wireframe/>
        </mesh>
      </>
    );
  }
);

PlayingField.displayName = 'PlayingField';

export default PlayingField;
