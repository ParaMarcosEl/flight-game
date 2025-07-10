// lib/FlightPath.ts
import * as THREE from 'three';

export const TUBE_RADIUS = 30;
const NUM_POINTS = 32; // Number of control points
const RADIUS = 400;    // Approximate size of loop
const HEIGHT_VARIATION = 100; // Max vertical offset
const SEED = Math.random() * 1000;

function generateLoopPoints(num_pts?: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
    const pointCount = num_pts || NUM_POINTS;
  for (let i = 0; i < pointCount; i++) {
    const angle = (i / pointCount) * Math.PI * 2;

    // Circle-based point
    const x = Math.cos(angle) * RADIUS;
    const z = Math.sin(angle) * RADIUS;

    // Add smooth vertical variation (sinusoidal with noise)
    const y = Math.sin(i * 0.5 + SEED) * HEIGHT_VARIATION;

    points.push(new THREE.Vector3(x, y, z));
  }

  return points;
}

// Procedurally generated smooth closed path
export const curve = new THREE.CatmullRomCurve3(generateLoopPoints(), true);
