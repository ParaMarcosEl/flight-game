import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';

export function Skybox() {
  const { scene } = useThree();

  const skyboxTexture = useMemo(() => {
    const loader = new THREE.CubeTextureLoader();
    return loader.load([
        '/textures/skybox/right.png',  // +X
        '/textures/skybox/left.png',   // -X
        '/textures/skybox/top.png',    // +Y
        '/textures/skybox/bottom.png', // -Y
        '/textures/skybox/front.png',  // +Z
        '/textures/skybox/back.png',   // -Z
    ]);
  }, []);

  useEffect(() => {
    scene.background = skyboxTexture;
  }, [scene, skyboxTexture]);

  return null;
}
