import { create } from "zustand";
import { CurveLabConfig, DEFAULT_CONFIG } from "@/types/curve-config";

interface CurveStore {
  config: CurveLabConfig;
  activePresetId: string | null;
  setConfig: (partial: Partial<CurveLabConfig>) => void;
  resetConfig: () => void;
  loadPreset: (presetId: string, partial: Partial<CurveLabConfig>) => void;
}

export const useCurveConfig = create<CurveStore>((set) => ({
  config: DEFAULT_CONFIG,
  activePresetId: "meme-fair-launch",
  setConfig: (partial) =>
    set((state) => ({ config: { ...state.config, ...partial } })),
  resetConfig: () => set({ config: DEFAULT_CONFIG, activePresetId: null }),
  loadPreset: (presetId, partial) =>
    set((state) => ({
      config: { ...state.config, ...partial },
      activePresetId: presetId,
    })),
}));
