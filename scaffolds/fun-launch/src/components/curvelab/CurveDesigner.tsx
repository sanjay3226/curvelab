import React from "react";
import { useCurveConfig } from "@/hooks/useCurveConfig";
import { Layers, Sliders, TrendingUp, Info } from "lucide-react";

export default function CurveDesigner() {
  const { config, setConfig } = useCurveConfig();

  const handleSegmentChange = (num: number) => {
    const newCount = Math.max(1, Math.min(6, num));
    let checkpoints = [...config.sqrtPriceCheckpoints];
    let weights = [...config.liquidityWeights];

    // Adjust checkpoints array length (must be segments + 1)
    while (checkpoints.length < newCount + 1) {
      const last = checkpoints[checkpoints.length - 1] ?? 0.000001;
      checkpoints.push(last * 2);
    }
    while (checkpoints.length > newCount + 1) {
      checkpoints.pop();
    }

    // Adjust weights array length (must equal newCount)
    while (weights.length < newCount) {
      weights.push(1);
    }
    while (weights.length > newCount) {
      weights.pop();
    }

    setConfig({
      segments: newCount,
      sqrtPriceCheckpoints: checkpoints,
      liquidityWeights: weights,
    });
  };

  const handleCheckpointChange = (index: number, valStr: string) => {
    const val = parseFloat(valStr);
    if (isNaN(val) || val <= 0) return;
    const newCheckpoints = [...config.sqrtPriceCheckpoints];
    newCheckpoints[index] = val;
    setConfig({ sqrtPriceCheckpoints: newCheckpoints });
  };

  const handleWeightChange = (index: number, valStr: string) => {
    const val = parseInt(valStr, 10);
    if (isNaN(val) || val <= 0) return;
    const newWeights = [...config.liquidityWeights];
    newWeights[index] = val;
    setConfig({ liquidityWeights: newWeights });
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl backdrop-blur-md space-y-5">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-neutral-100 text-sm">
            Curve Segmentation & Liquidity
          </h3>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
          buildCurveWithCustomSqrtPrices
        </span>
      </div>

      {/* Segment Count Buttons */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <label className="text-neutral-300 font-medium flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5 text-neutral-400" />
            Number of Curve Segments:
          </label>
          <span className="text-primary font-mono font-semibold">
            {config.segments} Segment{config.segments > 1 ? "s" : ""}
          </span>
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleSegmentChange(num)}
              className={`py-1.5 text-xs rounded-lg font-mono font-semibold transition-all ${
                config.segments === num
                  ? "bg-primary text-white shadow-md shadow-primary/25 border border-primary/50"
                  : "bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Graduation Target SOL */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <label className="text-neutral-300 font-medium flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            Migration Threshold (SOL Target):
          </label>
          <span className="font-mono text-emerald-400 font-semibold">
            {config.graduationThresholdSol} SOL
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={10}
            max={500}
            step={5}
            value={config.graduationThresholdSol}
            onChange={(e) =>
              setConfig({ graduationThresholdSol: Number(e.target.value) })
            }
            className="w-full accent-primary h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
          />
          <input
            type="number"
            min={5}
            max={1000}
            value={config.graduationThresholdSol}
            onChange={(e) =>
              setConfig({ graduationThresholdSol: Number(e.target.value) })
            }
            className="w-20 rounded-lg border border-neutral-750 bg-neutral-950 p-1.5 text-xs text-center font-mono text-neutral-100 focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Checkpoints & Weights Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
          <span>Price Checkpoints (SOL / Token)</span>
          <span>Segment Liquidity Weight</span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {config.sqrtPriceCheckpoints.map((p, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 bg-neutral-950/70 p-2 rounded-lg border border-neutral-800/80 text-xs"
            >
              <div className="flex items-center gap-2 flex-1">
                <span className="font-mono text-neutral-400 text-[10px] w-5">
                  P{idx}:
                </span>
                <input
                  type="text"
                  defaultValue={p}
                  onBlur={(e) => handleCheckpointChange(idx, e.target.value)}
                  className="w-full rounded border border-neutral-750 bg-neutral-900 px-2 py-1 font-mono text-neutral-200 text-xs focus:border-primary focus:outline-none"
                />
              </div>

              {idx < config.segments && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-neutral-400">W{idx + 1}:</span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    defaultValue={config.liquidityWeights[idx] || 1}
                    onBlur={(e) => handleWeightChange(idx, e.target.value)}
                    className="w-12 rounded border border-neutral-750 bg-neutral-900 px-1.5 py-1 font-mono text-center text-neutral-200 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-primary/10 border border-primary/20 p-2.5 text-[11px] text-neutral-300">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <span>
          Meteora DBC calculates sqrtPrices automatically from checkpoints. Weights
          determine the density of tokens distributed along each curve tier.
        </span>
      </div>
    </div>
  );
}
