/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import * as THREE from 'three';
import { RacerProgressType, TOTAL_LAPS } from '../constants';

// --- Helpers ---
const defaultRaceData = (): RaceData => ({
  position: new THREE.Vector3(),
  progress: 0,
  place: 0,
  lapCount: 0,
  isPlayer: false,
  history: [],
});

type RaceData = {
  position: THREE.Vector3;
  progress: number;
  place: number;
  lapCount: number;
  isPlayer: boolean;
  history: LapRecord[];
};

export type SingleLapRecord = {
  lapNumber: number;
  time: number;
  timestamp: number;
};

export type GameSettings = {
  soundEnabled: boolean;
  musicEnabled: boolean;
  controlScheme: 'keyboard' | 'gamepad';
};

export type LapRecord = {
  lapNumber: number;
  time: number;
  timestamp: number;
};

export type RaceDataType = Record<
  number,
  {
    position: THREE.Vector3;
    progress: number;
    place: number;
    lapCount: number;
    isPlayer: boolean;
    history: LapRecord[];
  }
>;

type PlayerPhaseType = 'Idle' | 'Race' | 'Finished';

type GameState = {
  lapTime: number;
  totalTime: number;
  raceCompleted: boolean;
  lapHistory: SingleLapRecord[];
  settings: GameSettings;
  lapStartTime: number;
  lastProgresses: Record<number, number>;
  finishedCrafts: number[]; // just array of ids
  playerId: number;
  raceData: Record<
    number,
    {
      position: THREE.Vector3;
      progress: number;
      place: number;
      lapCount: number;
      isPlayer: boolean;
      history: LapRecord[];
    }
  >;
playerPhase: 'Idle' | 'Race' | 'Finished';
};

export type RacePositonsType = { id: number; position: THREE.Vector3 };
export type RaceProgressesType = { id: number; progress: number };

type GameActions = {
  setPlayerId: (id: number) => void;
  setLapTime: (time: number) => void;
  completeLap: (id: number) => void;
  completeRace: () => void;
  reset: () => void;
  setLapStartTime: (time: number) => void;
  setRacePosition: (id: number, pos: THREE.Vector3) => void;
  setRaceProgress: (id: number, progress: number) => void;
  updateRaceData: (id: number, updates: Partial<GameState['raceData']>) => void;
  markFinished: (id: number) => void;
  updateRacePositions: (positions: RacePositonsType[]) => void;
  updateProgresses: (positions: RaceProgressesType[]) => void;
  updateLastProgresses: (progresses: Record<number, number>[]) => void;
  setPlayerPhase: (state: PlayerPhaseType) => void;
};

type GameStore = GameState & GameActions;

const defaultSettings: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  controlScheme: 'keyboard',
};

export const useGameStore = create(
  devtools<GameStore>((set, get) => ({
    // --- Initial State
    lapTime: 0,
    totalTime: 0,
    raceCompleted: false,
    lapHistory: [],
    settings: defaultSettings,
    lapStartTime: performance.now(),
    lastProgresses: {},
    finishedCrafts: [],
    playerId: -1,
    raceData: {},
    playerPhase: 'Idle',
    

    // --- Actions
    setPlayerPhase: (phase: PlayerPhaseType) => set({playerPhase: phase}),
    setPlayerId: (id) => set({ playerId: id }),

    setLapTime: (newTime) => {
      const { raceCompleted, lapHistory } = get();
      if (raceCompleted) return;

      const completedTime = lapHistory.reduce((sum, lap, idx) => idx < TOTAL_LAPS ? sum + lap.time : 0, 0);
      set({
        lapTime: newTime,
        totalTime: completedTime + newTime,
      });
    },

    completeLap: (id) =>
      set((state) => {
        if(state.raceData[id].history.length >= TOTAL_LAPS) return state;
        
        const now = performance.now();
        const prev = state.raceData[id] ?? {
          position: new THREE.Vector3(),
          progress: 0,
          place: 0,
          lapCount: 0,
          isPlayer: false,
          history: [],
        };

        const lapTime = now - (prev.history.at(-1)?.timestamp ?? state.lapStartTime);

        const updatedLap = {
          lapNumber: prev.lapCount + 1,
          time: lapTime,
          timestamp: now,
        };

        const newHistory = [...prev.history, updatedLap];

        return {
          raceData: {
            ...state.raceData,
            [id]: {
              ...prev,
              lapCount: prev.lapCount + 1,
              history: newHistory,
            },
          },
        };
      }),

    completeRace: () => set({ raceCompleted: true }),

    reset: () =>
      set({
        lapTime: 0,
        totalTime: 0,
        raceCompleted: false,
        lapHistory: [],
        lapStartTime: performance.now(),
        finishedCrafts: [],
        raceData: {},
        lastProgresses: {},
      }),

    setLapStartTime: (time) => set({ lapStartTime: time }),

    setRacePosition: (id, position) =>
      set((state) => ({
        raceData: {
          ...state.raceData,
          [id]: {
            ...state.raceData[id],
            position,
          },
        },
      })),

    setRaceProgress: (id, progress) =>
      set((state) => ({
        raceData: {
          ...state.raceData,
          [id]: {
            ...state.raceData[id],
            progress,
          },
        },
      })),

    updateLastProgresses: (progresses: Record<number, number>[]) => {
      set((state) => {
        if (state.raceCompleted) return state;
        const updatedLastProgresses = { ...state.lastProgresses };
        progresses.forEach((prog) => {
          Object.entries(prog).forEach(([id, progress]) => {
            updatedLastProgresses[parseInt(id)] = progress;
          });
        });

        return { lastProgresses: updatedLastProgresses };
      });
    },

    updateRacePositions: (positions) =>
      set((state) => {
        if (state.raceCompleted) return state;
        const updated = { ...state.raceData };
        positions.forEach(({ id, position }) => {
          updated[id] = {
            ...(updated[id] ?? defaultRaceData()),
            position,
          };
        });
        return { raceData: updated };
      }),

    updateProgresses: (progresses) =>
      set((state) => {
        const updatedRaceData = { ...state.raceData };
        const lastProgresses = {
          ...Object.entries(state.raceData).reduce((prev, [id, { progress }]) => {
            return {
              ...prev,
              [id]: progress,
            };
          }, {}),
        };

        progresses.forEach((prog) => {
          updatedRaceData[prog.id] = {
            ...(updatedRaceData[prog.id] ?? defaultRaceData()),
            progress: prog.progress,
          };
        });
        return { raceData: updatedRaceData, lastProgresses };
      }),

    updateRaceData: (id, partialUpdate) =>
      set((state) => {
        
        const existing = state.raceData[id] ?? {
          position: new THREE.Vector3(),
          progress: 0,
          place: 0,
          lapCount: 0,
          isPlayer: false,
          history: [],
        };

        return {
          raceData: {
            ...state.raceData,
            [id]: {
              ...existing,
              ...partialUpdate,
            },
          },
        };
      }),

    markFinished: (id) =>
      set((state) => {
        const already = state.finishedCrafts.includes(id);
        if (already) return {};

        const time = state.raceData[id]?.history.reduce((sum, l, idx) => idx < TOTAL_LAPS ? sum + l.time : 0, 0) ?? 0;

        return {
          finishedCrafts: [...state.finishedCrafts, id],
          raceData: {
            ...state.raceData,
            [id]: {
              ...state.raceData[id],
              place: state.finishedCrafts.length + 1,
            },
          },
        };
      }),
  })),
);
