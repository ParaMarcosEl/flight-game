// lib/FlightPath.ts
import * as THREE from 'three';
import { NUM_POINTS, LAP_RADIUS, SEED, HEIGHT_VARIATION, TUBE_RADIUS } from '../constants';

const SPRING_RADIUS = 60;
const SPRING_TURNS = 3;
const SPRING_SEGMENT_RATIO = 0.5;

// Controls for side 4 noise
const SIDE4_FREQUENCY = 0.25;
const SIDE4_PHASE = SEED + 100; // different phase offset from side 3
const SIDE4_HEIGHT_VARIATION = HEIGHT_VARIATION * 0.8; // slightly gentler waves

function generateTrack1(num_pts?: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const pointCount = num_pts || NUM_POINTS;
  for (let i = 0; i < pointCount; i++) {
    const angle = (i / pointCount) * Math.PI * 2;

    // Circle-based point
    const x = Math.cos(angle) * LAP_RADIUS;
    const z = Math.sin(angle) * LAP_RADIUS;

    // Add smooth vertical variation (sinusoidal with noise)
    const y = Math.sin(i * 0.5 + 80000) * HEIGHT_VARIATION;

    points.push(new THREE.Vector3(x, y, z));
  }

  return points;
}

function generateTrack2(num_pts?: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const pointCount = num_pts || NUM_POINTS;

  // Minimum vertical distance at the crossover
  const MIN_CROSSOVER_SEPARATION = TUBE_RADIUS * 20;

  // Phase shift to align the origin with a straight segment (t = π/2 or 3π/2)
  const phaseShift = Math.PI / 2;

  for (let i = 0; i < pointCount; i++) {
    const t = (i / pointCount) * Math.PI * 2 + phaseShift;

    // Base 2D figure-8 shape in XZ
    const x = Math.sin(t) * LAP_RADIUS;
    const z = Math.sin(t) * Math.cos(t) * LAP_RADIUS;

    // Sinusoidal vertical variation
    const waveY = Math.sin(i * 0.5 + SEED) * HEIGHT_VARIATION;

    // Extra vertical lift at the crossover to avoid overlap
    const crossBoost = Math.abs(Math.sin(t)) * MIN_CROSSOVER_SEPARATION;

    const y = waveY + crossBoost;

    points.push(new THREE.Vector3(x, y, z));
  }

  return points;
}

function generateTrack3(num_pts = NUM_POINTS): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];

  const totalPoints = num_pts;
  const spiralPoints = Math.floor(totalPoints * SPRING_SEGMENT_RATIO);
  const sidePoints = Math.floor((totalPoints - spiralPoints) / 3); // remaining for straight sides

  const radius = LAP_RADIUS;

  const bottomLeft = new THREE.Vector3(-radius, 0, -radius);
  const topLeft = new THREE.Vector3(-radius, 0, radius);
  const topRight = new THREE.Vector3(radius, 0, radius);
  const bottomRight = new THREE.Vector3(radius, 0, -radius);

  // --- Side 1: bottom-left to top-left (straight)
  for (let i = 0; i < sidePoints; i++) {
    const t = i / sidePoints;
    points.push(new THREE.Vector3().lerpVectors(bottomLeft, topLeft, t));
  }

  // --- Side 2: spiral from top-left to top-right
  {
    const direction = new THREE.Vector3().subVectors(topRight, topLeft);
    const tangent = direction.clone().normalize();
    // const length = direction.length();

    const up = new THREE.Vector3(0, 1, 0);
    const normal = new THREE.Vector3().crossVectors(up, tangent).normalize();
    const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

    for (let i = 0; i < spiralPoints; i++) {
      const t = i / spiralPoints;
      const center = new THREE.Vector3().lerpVectors(topLeft, topRight, t);
      const angle = t * SPRING_TURNS * Math.PI * 2;

      const radialOffset = normal
        .clone()
        .multiplyScalar(Math.cos(angle) * SPRING_RADIUS)
        .add(binormal.clone().multiplyScalar(Math.sin(angle) * SPRING_RADIUS));

      const spiralPoint = center.clone().add(radialOffset);
      points.push(spiralPoint);
    }
  }

  // --- Side 3: top-right to bottom-right (straight)
  for (let i = 0; i < sidePoints; i++) {
    const t = i / sidePoints;
    const base = new THREE.Vector3().lerpVectors(topRight, bottomRight, t);
    const frequency = 0.3;

    // Add smooth sinusoidal height variation
    const yOffset = Math.sin(i * frequency + SEED) * HEIGHT_VARIATION;

    base.y += yOffset;
    points.push(base);
  }

  // --- Side 4: bottom-right to bottom-left (with vertical noise)
  for (let i = 0; i <= sidePoints; i++) {
    const t = i / sidePoints;
    const base = new THREE.Vector3().lerpVectors(bottomRight, bottomLeft, t);

    const yOffset = Math.sin(i * SIDE4_FREQUENCY + SIDE4_PHASE) * SIDE4_HEIGHT_VARIATION;
    base.y += yOffset;

    points.push(base);
  }

  return points;
}

// Export a closed CatmullRomCurve3
// export const spiralSquareCurve = new THREE.CatmullRomCurve3(generateSquareWithSpiralSide(), true);

// Procedurally generated smooth closed path
const track1 = new THREE.CatmullRomCurve3(generateTrack1(), true);
const track2 = new THREE.CatmullRomCurve3(generateTrack2(), true);
const track3 = new THREE.CatmullRomCurve3(generateTrack3(), true);

export const tracks = [track1, track2, track3];
