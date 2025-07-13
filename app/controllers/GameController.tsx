// stores/useGameStore.ts
import { create } from 'zustand';

// --- Type Definitions ---
// Updated to reflect storing individual lap times
type SingleLapRecord = {
  lapNumber: number;
  time: number; // Duration of this specific lap
  timestamp: number; // When this lap was completed
  // You can add more properties here, e.g., 'fastestSectorTimes', 'penalties'
};

type GameSettings = {
  soundEnabled: boolean;
  musicEnabled: boolean;
  controlScheme: "keyboard" | "gamepad";
};

// --- Store State Interface ---
interface GameState {
  lapTime: number; // Current lap's elapsed time
  lapCount: number; // Current lap number (e.g., 1 for the first lap)
  totalTime: number; // Current lap number (e.g., 1 for the first lap)
  raceCompleted: boolean;
  lapHistory: SingleLapRecord[]; // History of completed laps
  settings: GameSettings;
  lapStartTime: number; // Timestamp when the current lap began
}

// --- Store Actions Interface ---
interface GameActions {
  setLapTime: (time: number) => void;
  // completeLap will now automatically add to history
  completeLap: () => void;
  incrementLap: () => void; // Keeping this separate if you need to increment without full lap logic
  addLapData: (data: SingleLapRecord) => void; // Changed type to SingleLapRecord
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  completeRace: () => void;
  reset: () => void;
  setLapStartTime: (time: number) => void;
}

// --- Combined Store Type ---
type GameStore = GameState & GameActions;

const defaultSettings: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  controlScheme: "keyboard",
};

export const useGameStore = create<GameStore>((set, get) => ({
  // --- Initial State ---
  lapTime: 0,
  totalTime: 0,
  lapCount: 0, // Starts at 0, first lap completed will make it 1
  raceCompleted: false,
  lapHistory: [],
  settings: defaultSettings,
  lapStartTime: performance.now(), // Initialize with current time

  // --- Actions ---
  setLapTime: (newTime: number) => {
    const currentState = get();
    if (currentState.raceCompleted) return;
    set(state => {
      // Calculate the sum of all completed lap times
      const sumOfCompletedLaps = state.lapHistory.reduce((sum, lap) => sum + lap.time, 0);
      // totalTime is sum of completed laps + current lapTime
      const calculatedTotalTime = sumOfCompletedLaps + newTime;

      return {
        lapTime: newTime,
        totalTime: calculatedTotalTime // Update totalTime here
      };
    });
  },
  completeRace() {
    set({ raceCompleted: true });
  },
  setLapStartTime: (time: number) => set({ lapStartTime: time }),

  completeLap: () => {
    const currentState = get();
    const now = performance.now();
    const lapDuration = now - currentState.lapStartTime; // Calculate duration of the *completed* lap

    const newLapRecord: SingleLapRecord = {
      lapNumber: currentState.lapCount + 1, // Store the number of the lap *just completed*
      time: lapDuration,
      timestamp: now,
    };

    set((state) => ({
      lapCount: state.lapCount + 1, // Increment lap count for the *next* lap
      lapHistory: [...state.lapHistory, newLapRecord], // Add the completed lap's data
      lapTime: 0, // Reset current lap time displayed to 0 for the new lap
      lapStartTime: now, // Set new start time for the *next* lap
    }));
  },

  incrementLap: () => {
    set((state) => ({ lapCount: state.lapCount + 1 }));
  },

  // This action might become less necessary if completeLap handles all additions.
  // But keeping it if you have other scenarios where you manually add historical data.
  addLapData: (data: SingleLapRecord) => {
    set((state) => ({ lapHistory: [...state.lapHistory, data] }));
  },

  updateSettings: (newSettings: Partial<GameSettings>) => {
    set((state) => ({ settings: { ...state.settings, ...newSettings } }));
  },

  reset: () => {
    set({
      lapCount: 0,
      lapHistory: [],
      raceCompleted: false,
      lapTime: 0,
      lapStartTime: performance.now(), // Reset lap start time on full reset
    });
  },
}));