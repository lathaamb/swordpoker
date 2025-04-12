import { create } from "zustand";

export type GamePhase = "ready" | "playing" | "ended";

interface GameState {
  phase: GamePhase;
  
  // Actions
  start: () => void;
  restart: () => void;
  end: () => void;
}

export const useGame = create<GameState>((set) => ({
  phase: "ready",
  
  start: () => {
    set((state) => {
      // Only transition from ready to playing
      if (state.phase === "ready") {
        return { phase: "playing" };
      }
      return state;
    });
  },
  
  restart: () => {
    set({ phase: "ready" });
  },
  
  end: () => {
    set((state) => {
      // Only transition from playing to ended
      if (state.phase === "playing") {
        return { phase: "ended" };
      }
      return state;
    });
  }
}));
