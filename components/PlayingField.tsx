'use client';

import { useMemo, forwardRef } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { curve, TUBE_RADIUS } from '../lib/flightPath';
import { computeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';

// Setup BVH on BufferGeometry and raycasting
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

type PlayingFieldProps = {
  forwardedRef: React.RefObject<THREE.Mesh | null>;
};

const PlayingField = forwardRef<THREE.Mesh, PlayingFieldProps>(({ forwardedRef }) => {
  const geometry = useMemo(() => {
    const tube = new THREE.TubeGeometry(curve, 200, TUBE_RADIUS, 16, true);
    tube.computeBoundsTree(); // ✅ Compute BVH on geometry
    return tube;
  }, []);

  const curvePoints = useMemo(() => curve.getPoints(1000), []);

  return (
    <>
      <Line points={curvePoints} color="#00ffff" lineWidth={2} dashed={false} />
      <mesh ref={forwardedRef} geometry={geometry}>
        <meshStandardMaterial color="#0055ff" wireframe />
      </mesh>
    </>
  );
});

PlayingField.displayName = 'PlayingField';

export default PlayingField;
