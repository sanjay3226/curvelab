import React from "react";
import { useCurveConfig } from "@/hooks/useCurveConfig";
import { BUILTIN_PRESETS, CurvePreset } from "@/types/curve-config";
import { Check, Bookmark } from "lucide-react";

export default function PresetLibrary() {
  const { activePresetId, loadPreset } = useCurveConfig();

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-neutral-100 text-sm">
            Launch Archetypes & Presets
          </h3>
        </div>
        <span className="text-[11px] text-neutral-400">
          6 Battle-Tested Templates
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {BUILTIN_PRESETS.map((preset: CurvePreset) => {
          const isActive = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => loadPreset(preset.id, preset.config)}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
                isActive
                  ? "border-primary bg-primary/10 shadow-md shadow-primary/20"
                  : "border-neutral-800 bg-neutral-950/70 hover:border-neutral-700 hover:bg-neutral-900"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs text-neutral-100 flex items-center gap-1.5">
                  {preset.name}
                  {isActive && (
                    <Check className="h-3.5 w-3.5 text-primary stroke-[3]" />
                  )}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800/80 font-mono text-neutral-300">
                  {preset.badge}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
