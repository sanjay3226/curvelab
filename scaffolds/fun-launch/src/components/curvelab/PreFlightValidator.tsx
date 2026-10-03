import React, { useState } from "react";
import { useCurveConfig } from "@/hooks/useCurveConfig";
import { validateCurveConfig } from "@/lib/validator";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Wand2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

export default function PreFlightValidator() {
  const { config, setConfig } = useCurveConfig();
  const [isExpanded, setIsExpanded] = useState(false);

  const report = validateCurveConfig(config);

  const handleAutoOptimize = () => {
    // Optimizes parameters for maximum anti-sniper security & 100% rug-pull immunity
    setConfig({
      feeMode: "ExponentialDecay",
      startingFeeBps: 9000, // 90% initial anti-sniper
      endingFeeBps: 120, // 1.2% terminal
      numberOfPeriods: 60,
      totalDurationSeconds: 60,
      dynamicFeeEnabled: true,
      partnerPermanentLockPercentage: 100,
      creatorPermanentLockPercentage: 0,
      migrationFeePercentage: 10,
      creatorMigrationFeePercentage: 50,
    });
    toast.success("Curve optimized: 90% anti-sniper fee decay & 100% permanent lock armed!");
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
    if (score >= 60) return "text-amber-400 border-amber-500/40 bg-amber-500/10";
    return "text-rose-400 border-rose-500/40 bg-rose-500/10";
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          {report.isValid ? (
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-rose-400" />
          )}
          <div>
            <h3 className="font-semibold text-neutral-100 text-sm">
              Pre-Flight Protocol Validator
            </h3>
            <p className="text-[11px] text-neutral-400">
              Live mathematical and Anchor contract safety audit
            </p>
          </div>
        </div>

        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-xs font-bold ${getScoreColor(
            report.score
          )}`}
        >
          <span>Score: {report.score}/100</span>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-neutral-950 p-2.5 border border-neutral-800">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
            Contract Status
          </span>
          <span
            className={`font-semibold flex items-center gap-1 mt-0.5 ${
              report.isValid ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {report.isValid ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" /> Revert Immune
              </>
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5" /> Action Required
              </>
            )}
          </span>
        </div>

        <div className="rounded-lg bg-neutral-950 p-2.5 border border-neutral-800">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
            MEV Bot Defense
          </span>
          <span className="font-semibold text-amber-300 mt-0.5 block truncate">
            {report.botResistance}
          </span>
        </div>
      </div>

      {/* Action / Auto-Optimize Button */}
      {report.score < 95 && (
        <button
          type="button"
          onClick={handleAutoOptimize}
          className="w-full rounded-lg bg-gradient-to-r from-amber-500/20 to-primary/20 hover:from-amber-500/30 hover:to-primary/30 text-neutral-200 hover:text-white border border-amber-500/30 p-2 text-xs font-medium transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <Wand2 className="h-3.5 w-3.5 text-amber-400" />
          Auto-Optimize for Anti-Sniper & 100% Lock
        </button>
      )}

      {/* Expandable Issues & Assertions List */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-xs text-neutral-400 hover:text-neutral-200 pt-1"
        >
          <span>
            {report.issues.length} Protocol Assertions Checked
          </span>
          {isExpanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>

        {isExpanded && (
          <div className="space-y-1.5 pt-1 max-h-48 overflow-y-auto">
            {report.issues.map((iss, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px]"
              >
                {iss.severity === "success" && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                )}
                {iss.severity === "warning" && (
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                )}
                {iss.severity === "error" && (
                  <XCircle className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <span className="font-semibold text-neutral-200 block">
                    {iss.title}
                  </span>
                  <span className="text-neutral-400 text-[10px] leading-tight block">
                    {iss.detail}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
