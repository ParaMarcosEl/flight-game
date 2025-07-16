// lib/FlightPath.ts
import * as THREE from 'three';
import { NUM_POINTS, LAP_RADIUS, SEED, HEIGHT_VARIATION } from '../constants';

function generateLoopPoints(num_pts?: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const pointCount = num_pts || NUM_POINTS;
  for (let i = 0; i < pointCount; i++) {
    const angle = (i / pointCount) * Math.PI * 2;

    // Circle-based point
    const x = Math.cos(angle) * LAP_RADIUS;
    const z = Math.sin(angle) * LAP_RADIUS;

    // Add smooth vertical variation (sinusoidal with noise)
    const y = Math.sin(i * 0.5 + SEED) * HEIGHT_VARIATION;

    points.push(new THREE.Vector3(x, y, z));
  }

  return points;
}

// Procedurally generated smooth closed path
export const curve = new THREE.CatmullRomCurve3(generateLoopPoints(), true);
