import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';

export function Skybox() {
  const { scene } = useThree();

  const skyboxTexture = useMemo(() => {
    const loader = new THREE.CubeTextureLoader();
    return loader.load([
      '/textures/skybox2/right.png', // +X
      '/textures/skybox2/left.png', // -X
      '/textures/skybox2/top.png', // +Y
      '/textures/skybox2/bottom.png', // -Y
      '/textures/skybox2/front.png', // +Z
      '/textures/skybox2/back.png', // -Z
    ]);
  }, []);

  useEffect(() => {
    scene.background = skyboxTexture;
  }, [scene, skyboxTexture]);

  return null;
}
