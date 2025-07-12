"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useRef,
} from "react";

type LapData = {
  stage: string;
  lapTimes: number[];
  totalTime: number;
};

type GameSettings = {
  soundEnabled: boolean;
  musicEnabled: boolean;
  controlScheme: "keyboard" | "gamepad";
};

type GameControllerContextType = {
  lapTime: number;
  setLapTime: (time: number) => void;
  completeLap: () => void;
  lapCount: number;
  lapHistory: LapData[];
  settings: GameSettings;
  incrementLap: () => void;
  addLapData: (data: LapData) => void;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  reset: () => void;
  lapStartTime: number;
};

const defaultSettings: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  controlScheme: "keyboard",
};

const GameControllerContext = createContext<GameControllerContextType | null>(null);

export function GameControllerProvider({ children }: { children: ReactNode }) {
  const [lapCount, setLapCount] = useState(0);
  const [lapHistory, setLapHistory] = useState<LapData[]>([]);
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [lapTime, setLapTime] = useState(0);

  const lapStart = useRef(performance.now());

  const completeLap = useCallback(() => {
    setLapCount((prev) => prev + 1);
    lapStart.current = performance.now();
    setLapTime(0);
  }, []);

  const incrementLap = useCallback(() => {
    setLapCount((prev) => prev + 1);
  }, []);

  const addLapData = useCallback((data: LapData) => {
    setLapHistory((prev) => [...prev, data]);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const reset = useCallback(() => {
    setLapCount(0);
    setLapHistory([]);
    lapStart.current = performance.now();
    setLapTime(0);
  }, []);

  return (
    <GameControllerContext.Provider
      value={{
        lapCount,
        lapHistory,
        settings,
        lapTime,
        completeLap,
        setLapTime,
        incrementLap,
        addLapData,
        updateSettings,
        reset,
        lapStartTime: lapStart.current,
      }}
    >
      {children}
    </GameControllerContext.Provider>
  );
}

export function useGameController(): GameControllerContextType {
  const context = useContext(GameControllerContext);
  if (!context) {
    throw new Error("useGameController must be used within a GameControllerProvider");
  }
  return context;
}
