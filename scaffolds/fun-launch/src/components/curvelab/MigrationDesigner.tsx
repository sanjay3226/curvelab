import React from "react";
import { useCurveConfig } from "@/hooks/useCurveConfig";
import { ArrowUpRight, Lock, Split, AlertCircle, CheckCircle2 } from "lucide-react";

export default function MigrationDesigner() {
  const { config, setConfig } = useCurveConfig();

  const totalLock =
    config.partnerPermanentLockPercentage + config.creatorPermanentLockPercentage;
  const isLockValid = totalLock === 100;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl backdrop-blur-md space-y-5">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <ArrowUpRight className="h-4 w-4 text-emerald-400" />
          <h3 className="font-semibold text-neutral-100 text-sm">
            DAMM v2 Migration & Liquidity Lock
          </h3>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          MET_DAMM_V2
        </span>
      </div>

      {/* Migration Protocol Notice */}
      <div className="flex items-center justify-between bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 text-xs">
        <span className="text-neutral-300 font-medium">Graduation Destination:</span>
        <span className="font-semibold text-emerald-400">
          Meteora Dynamic AMM v2
        </span>
      </div>

      {/* Migration Fee Slider */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-neutral-300 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-neutral-400" />
            Migration Fee on Graduation:
          </span>
          <span className="font-mono text-emerald-400 font-bold">
            {config.migrationFeePercentage}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={20}
          step={1}
          value={config.migrationFeePercentage}
          onChange={(e) =>
            setConfig({ migrationFeePercentage: Number(e.target.value) })
          }
          className="w-full accent-emerald-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
        />
      </div>

      {/* Creator Fee Split */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-neutral-300 flex items-center gap-1.5">
            <Split className="h-3.5 w-3.5 text-neutral-400" />
            Creator Fee Split (% of Migration Fee):
          </span>
          <span className="font-mono text-primary font-bold">
            {config.creatorMigrationFeePercentage}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={config.creatorMigrationFeePercentage}
          onChange={(e) =>
            setConfig({ creatorMigrationFeePercentage: Number(e.target.value) })
          }
          className="w-full accent-primary h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-neutral-400">
          <span>Partner: {100 - config.creatorMigrationFeePercentage}%</span>
          <span>Creator: {config.creatorMigrationFeePercentage}%</span>
        </div>
      </div>

      {/* Permanent Lock Distribution */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-300 font-medium">
            Permanent Liquidity Lock Distribution:
          </span>
          <span
            className={`font-mono font-bold text-xs flex items-center gap-1 ${
              isLockValid ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isLockValid ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5" />
            )}
            Sum: {totalLock}% (Must = 100%)
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
            <label className="text-neutral-400 text-[11px] block">
              Partner Lock %
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={config.partnerPermanentLockPercentage}
              onChange={(e) => {
                const partner = Number(e.target.value);
                setConfig({
                  partnerPermanentLockPercentage: partner,
                  creatorPermanentLockPercentage: Math.max(0, 100 - partner),
                });
              }}
              className="w-full rounded border border-neutral-750 bg-neutral-900 p-1.5 font-mono text-neutral-100 focus:border-primary focus:outline-none"
            />
          </div>
          <div className="space-y-1 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
            <label className="text-neutral-400 text-[11px] block">
              Creator Lock %
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={config.creatorPermanentLockPercentage}
              onChange={(e) => {
                const creator = Number(e.target.value);
                setConfig({
                  creatorPermanentLockPercentage: creator,
                  partnerPermanentLockPercentage: Math.max(0, 100 - creator),
                });
              }}
              className="w-full rounded border border-neutral-750 bg-neutral-900 p-1.5 font-mono text-neutral-100 focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
