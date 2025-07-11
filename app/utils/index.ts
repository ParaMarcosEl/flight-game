// utils/utils
import * as THREE from 'three';

export function getStartPoseFromCurve(curve: THREE.Curve<THREE.Vector3>) {
  const position = curve.getPointAt(0);
  const tangent = curve.getTangentAt(0).normalize();

  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, -1), // Aircraft default forward
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
  const milliseconds = Math.floor(ms % 1000);

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}`;
}
