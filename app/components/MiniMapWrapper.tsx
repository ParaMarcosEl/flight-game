'use client';

import { useEffect, useState } from 'react';
import MiniMapSvg from './MiniMapSVG';
import * as THREE from 'three';

type Props = {
  curve: THREE.Curve<THREE.Vector3>;
  playerPos: THREE.Vector3;
  botPositions: THREE.Vector3[];
};

export function MiniMapWrapper({ curve, playerPos, botPositions }: Props) {
  const safeBotPositions = botPositions.filter(pos => pos instanceof THREE.Vector3);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return null;

  return (
    <MiniMapSvg
      curve={curve}
      playerPos={playerPos}
      botPositions={safeBotPositions}
      svgWidth={150}
      svgHeight={150}
      strokeColor="cyan"
      backgroundColor="#000"
    />
  );
}
