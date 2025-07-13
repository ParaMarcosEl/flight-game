// utils/getStartPoseFromCurve.ts
import * as THREE from 'three';

export function getStartPoseFromCurve(
  curve: THREE.Curve<THREE.Vector3>,
  distance = 0 // Distance along the curve to spawn from
) {
  const t = distance; // value between 0 and 1
  const position = curve.getPointAt(t);
  const tangent = curve.getTangentAt(t).normalize();

//   const up = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, -1), // default forward
    tangent
  );

  return {
    position: position.toArray() as [number, number, number],
    quaternion,
  };
}

export function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = Math.floor((ms % 1000) / 10); // 2-digit milliseconds

  const pad = (n: number, z = 2) => n.toString().padStart(z, '0');

  return `${pad(minutes)}:${pad(seconds)}:${pad(milliseconds)}`;
}

export function randomNumber(length: number = 10, charset: string = '0123456789'): number {
  let result = '';
  const charactersLength = charset.length;
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charactersLength));
  }
  return Number(result);
}