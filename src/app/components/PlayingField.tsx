'use client';

import { useMemo, forwardRef } from 'react';
import { Line, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { curve, TUBE_RADIUS } from '../lib/flightPath';
import { computeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';

// Setup BVH on BufferGeometry and raycasting
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

const PlayingField = forwardRef<THREE.Mesh, object>((_, ref) => {
  const geometry = useMemo(() => {
    const tube = new THREE.TubeGeometry(curve, 200, TUBE_RADIUS, 16, true);
    tube.computeBoundsTree(); // ✅ Compute BVH
    return tube;
  }, []);

  const curvePoints = useMemo(() => curve.getPoints(1000), []);

  // ✅ Load texture using useTexture (from drei)
  const texture = useTexture('/textures/stage_texture.png');
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(10, 1); // You can tweak this for better tiling

  return (
    <>
      <Line points={curvePoints} color="#00ffff" lineWidth={2} dashed={false} />
      <mesh ref={ref} geometry={geometry}>
        <meshStandardMaterial map={texture} side={THREE.BackSide} />
      </mesh>
    </>
  );
});

PlayingField.displayName = 'PlayingField';

export default PlayingField;
