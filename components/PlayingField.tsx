import React from 'react';
import * as THREE from 'three';

export default function PlayingField() {
  const size = 1000; // Length/width of the box
  const height = 500; // Height of the box
  const halfSize = size / 2;
  const halfHeight = height / 2;

  const materialProps = {
    color: '#0ff',
    side: THREE.DoubleSide, // DoubleSide
    transparent: true,
    opacity: 0.2, // Light see-through look
  };

  return (
    <>
      {/* Floor */}
      <mesh position={[0, -halfHeight, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial {...materialProps} color="brown" />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, halfHeight, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial {...materialProps} color="skyblue"/>
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 0, -halfSize]} rotation={[0, 0, 0]}>
        <planeGeometry args={[size, height]} />
        <meshStandardMaterial {...materialProps} color="green" />
      </mesh>

      {/* Front Wall */}
      <mesh position={[0, 0, halfSize]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[size, height]} />
        <meshStandardMaterial {...materialProps} color="darkgreen" />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-halfSize, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[size, height]} />
        <meshStandardMaterial {...materialProps} color="green" />
      </mesh>

      {/* Right Wall */}
      <mesh position={[halfSize, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[size, height]} />
        <meshStandardMaterial {...materialProps} color="darkgreen" />
      </mesh>
    </>
  );
}
