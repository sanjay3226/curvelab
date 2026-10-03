import React from "react";
import { useCurveConfig } from "@/hooks/useCurveConfig";
import { ShieldCheck, Zap, Clock, Percent, AlertTriangle } from "lucide-react";

export default function FeeDesigner() {
  const { config, setConfig } = useCurveConfig();

  const startPercent = (config.startingFeeBps / 100).toFixed(1);
  const endPercent = (config.endingFeeBps / 100).toFixed(2);

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl backdrop-blur-md space-y-5">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-amber-400" />
          <h3 className="font-semibold text-neutral-100 text-sm">
            Fee Engine & Anti-Sniper Shield
          </h3>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
          FeeSchedulerExponential
        </span>
      </div>

      {/* Fee Mode Tabs */}
      <div className="space-y-1.5">
        <label className="text-neutral-300 font-medium text-xs flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-neutral-400" />
          Scheduler Mode:
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "Fixed", label: "Fixed Flat" },
            { id: "LinearDecay", label: "Linear Decay" },
            { id: "ExponentialDecay", label: "Exponential (Anti-Sniper)" },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() =>
                setConfig({
                  feeMode: mode.id as any,
                })
              }
              className={`p-2 rounded-lg text-xs font-medium transition-all text-center ${
                config.feeMode === mode.id
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm"
                  : "bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Starting Fee Slider */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-neutral-300 flex items-center gap-1">
            <Percent className="h-3.5 w-3.5 text-amber-400" />
            Initial Launch Fee:
          </span>
          <span className="font-mono text-amber-400 font-bold">
            {startPercent}% ({config.startingFeeBps} bps)
          </span>
        </div>
        <input
          type="range"
          min={25}
          max={9900}
          step={25}
          value={config.startingFeeBps}
          onChange={(e) =>
            setConfig({ startingFeeBps: Number(e.target.value) })
          }
          className="w-full accent-amber-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
        />
      </div>

      {config.feeMode !== "Fixed" && (
        <>
          {/* Ending Fee Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-300 flex items-center gap-1">
                <Percent className="h-3.5 w-3.5 text-blue-400" />
                Target Terminal Fee:
              </span>
              <span className="font-mono text-blue-400 font-bold">
                {endPercent}% ({config.endingFeeBps} bps)
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={1000}
              step={10}
              value={config.endingFeeBps}
              onChange={(e) =>
                setConfig({ endingFeeBps: Number(e.target.value) })
              }
              className="w-full accent-blue-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Decay Duration & Steps */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-neutral-400 block text-[11px]">
                Total Duration (Seconds)
              </label>
              <input
                type="number"
                min={10}
                max={3600}
                value={config.totalDurationSeconds}
                onChange={(e) =>
                  setConfig({ totalDurationSeconds: Number(e.target.value) })
                }
                className="w-full rounded-lg border border-neutral-750 bg-neutral-950 p-2 font-mono text-neutral-100 focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-neutral-400 block text-[11px]">
                Decay Steps (Periods)
              </label>
              <input
                type="number"
                min={5}
                max={120}
                value={config.numberOfPeriods}
                onChange={(e) =>
                  setConfig({ numberOfPeriods: Number(e.target.value) })
                }
                className="w-full rounded-lg border border-neutral-750 bg-neutral-950 p-2 font-mono text-neutral-100 focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </>
      )}

      {/* Dynamic Fee Toggle */}
      <div className="flex items-center justify-between rounded-lg bg-neutral-950 p-3 border border-neutral-800">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-emerald-400" />
          <div>
            <div className="text-xs font-semibold text-neutral-200">
              Meteora Dynamic Fee
            </div>
            <div className="text-[11px] text-neutral-400">
              Auto-scales fee with pool market volatility
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            setConfig({ dynamicFeeEnabled: !config.dynamicFeeEnabled })
          }
          className={`h-6 w-11 rounded-full p-0.5 transition-colors ${
            config.dynamicFeeEnabled ? "bg-emerald-500" : "bg-neutral-800"
          }`}
        >
          <div
            className={`h-5 w-5 rounded-full bg-white transition-transform ${
              config.dynamicFeeEnabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Anti-Sniper Impact Callout */}
      {config.feeMode === "ExponentialDecay" && (
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/25 p-3 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5" />
            Anti-MEV Bot Simulation:
          </div>
          <p className="text-[11px] text-neutral-300 leading-relaxed">
            Bots attempting to snipe block #0 will pay a <strong>{startPercent}%</strong> tax.
            After <strong>{config.totalDurationSeconds}s</strong>, the tax reaches <strong>{endPercent}%</strong>,
            protecting regular community buyers from front-running.
          </p>
        </div>
      )}
    </div>
  );
}
