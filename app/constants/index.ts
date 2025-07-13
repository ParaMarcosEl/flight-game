import * as THREE from 'three';

// curve
export const NUM_POINTS = 32; // Number of control points
export const LAP_RADIUS = 400;    // Approximate size of loop
export const HEIGHT_VARIATION = 100; // Max vertical offset
export const SEED = Math.random() * Date.now();

export const MAX_SPEED = 2;

export const TUBE_RADIUS = 30;
export const SHIP_SCALE = 1;

export type BotType = {
  mesh: THREE.Group;
  speed: number;
  currentCheckpointIndex: number;
  lap: number;
  finished: boolean;
};
