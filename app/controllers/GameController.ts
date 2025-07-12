// utils/GameController.ts

type LapData = {
  stage: string;
  lapTimes: number[];
  totalTime: number;
};

type GameSettings = {
  soundEnabled: boolean;
  musicEnabled: boolean;
  controlScheme: 'keyboard' | 'gamepad';
};

class GameController {
  private static instance: GameController;
  private lapHistory: LapData[] = [];
  private settings: GameSettings = {
    soundEnabled: true,
    musicEnabled: true,
    controlScheme: 'keyboard',
  };
  private listeners: Set<() => void> = new Set();

  private currentLap: number = 0;

  private constructor() {}

  static getInstance(): GameController {
    if (!GameController.instance) {
      GameController.instance = new GameController();
    }
    return GameController.instance;
  }

  // Lap handling
  incrementLap(): void {
    this.currentLap += 1;
    console.log(`🏁 Lap ${this.currentLap} completed.`);
  }

  getCurrentLap(): number {
    return this.currentLap;
  }

  reset(): void {
    this.lapHistory = [];
    this.currentLap = 0;
  }

  // Lap history
  addLapData(data: LapData): void {
    this.lapHistory.push(data);
  }

  getLapHistory(): LapData[] {
    return this.lapHistory;
  }

  // Settings
  getSettings(): GameSettings {
    return this.settings;
  }

  updateSettings(newSettings: Partial<GameSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }
}

export const gameController = GameController.getInstance();
