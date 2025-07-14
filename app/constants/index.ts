import * as THREE from 'three';

// curve
export const NUM_POINTS = 32; // Number of control points
export const LAP_RADIUS = 400;    // Approximate size of loop
export const HEIGHT_VARIATION = 100; // Max vertical offset
export const SEED = Math.random() * Date.now();

export const MAX_SPEED = 1.5;

export const TUBE_RADIUS = 30;
export const SHIP_SCALE = 1;

export type BotType = {
  mesh: THREE.Group;
  speed: number;
  currentCheckpointIndex: number;
  lap: number;
  finished: boolean;
};

export type RacerProgressType = {
  player: number;
  bots: number[];
};

export type SvgMapOptions = {
        svgWidth: number;
        svgHeight: number;
        padding: number;
        numSegments: number;
        strokeColor: string;
        strokeWidth: number;
        backgroundColor: string;
    }

