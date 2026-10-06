import React, { useState } from "react";
import { useCurveConfig } from "@/hooks/useCurveConfig";
import {
  TrendingUp,
  Vote,
  Sparkles,
  ExternalLink,
  Coins,
  ArrowUpRight,
  Check,
  Copy,
  ShieldAlert,
  ChevronRight,
  Scale,
} from "lucide-react";
import { toast } from "sonner";

export default function PantaPredictionArena() {
  const { config } = useCurveConfig();
  const [betSide, setBetSide] = useState<"YES" | "NO">("YES");
  const [betAmountSol, setBetAmountSol] = useState(0.5);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [showDeployPayload, setShowDeployPayload] = useState(false);

  // Dynamic simulated probability based on curve setup
  const yesProb = Math.min(88, Math.max(35, 68 + (config.startingFeeBps > 5000 ? 5 : -4)));
  const noProb = 100 - yesProb;

  // Calculated payouts
  const yesOdds = (100 / yesProb).toFixed(2);
  const noOdds = (100 / noProb).toFixed(2);
  const potentialPayout = (betAmountSol * (betSide === "YES" ? parseFloat(yesOdds) : parseFloat(noOdds))).toFixed(3);
  const roiPercent = (((parseFloat(potentialPayout) - betAmountSol) / betAmountSol) * 100).toFixed(1);

  const pantaPayload = {
    title: `Will $${config.symbol} graduate to Meteora DAMM v2 within 24 hours?`,
    category: "crypto-launchpad",
    marketType: "binary",
    outcomes: ["YES", "NO"],
    resolutionSource: "Meteora DBC On-Chain Pool State",
    resolutionCriteria: `Graduation occurs when $${config.symbol} reserves hit ${config.graduationThresholdSol || 85} SOL`,
    initialLiquiditySol: 1.0,
    feeBps: 50,
    creatorAttribution: "CurveLab x Panta API",
    metadata: {
      bondingCurveSymbol: config.symbol,
      graduationThresholdSol: config.graduationThresholdSol || 85,
      curveLabPreset: config.presetName || "Custom",
    },
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(pantaPayload, null, 2));
    setCopiedPayload(true);
    toast.success("Copied Panta API market creation payload!");
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleSimulateBet = () => {
    toast.success(
      `Placed test trade: ${betAmountSol} SOL on ${betSide} ($${config.symbol} Graduation)! Potential payout: ${potentialPayout} SOL.`
    );
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
            <Scale className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-neutral-100 text-sm">
                Panta Prediction Arena
              </h3>
              <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.2 text-[9px] font-semibold text-indigo-400 uppercase tracking-wider">
                Prediction Market
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Binary prediction markets powered by Panta API for bonding curve graduation
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowDeployPayload(!showDeployPayload)}
          className="flex items-center gap-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 px-2.5 py-1 text-xs font-medium text-indigo-300 transition-all"
        >
          <Sparkles className="h-3 w-3" />
          <span>{showDeployPayload ? "Hide API" : "Panta API Deploy"}</span>
        </button>
      </div>

      {/* Active Market Card */}
      <div className="rounded-lg bg-neutral-950 p-3.5 border border-neutral-800 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
              Active Curve Market
            </span>
            <h4 className="text-xs font-semibold text-neutral-200 mt-0.5 leading-snug">
              Will <span className="text-primary font-bold">${config.symbol}</span> graduate to Meteora DAMM v2 in 24h?
            </h4>
          </div>
          <span className="rounded bg-neutral-900 px-2 py-0.5 font-mono text-[10px] text-neutral-400 border border-neutral-800 shrink-0">
            Target: {config.graduationThresholdSol || 85} SOL
          </span>
        </div>

        {/* Odds Probability Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-emerald-400 flex items-center gap-1">
              YES {yesProb}% ({yesOdds}x)
            </span>
            <span className="text-rose-400 flex items-center gap-1">
              NO {noProb}% ({noOdds}x)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-900 flex border border-neutral-800">
            <div
              className="bg-emerald-500 transition-all duration-500"
              style={{ width: `${yesProb}%` }}
            />
            <div
              className="bg-rose-500 transition-all duration-500"
              style={{ width: `${noProb}%` }}
            />
          </div>
        </div>
      </div>

      {/* Betting Slip */}
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setBetSide("YES")}
            className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-bold transition-all ${
              betSide === "YES"
                ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-500/20"
                : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200"
            }`}
          >
            BUY YES ({yesOdds}x)
          </button>
          <button
            type="button"
            onClick={() => setBetSide("NO")}
            className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-bold transition-all ${
              betSide === "NO"
                ? "bg-rose-500/20 border-rose-500 text-rose-300 shadow-sm shadow-rose-500/20"
                : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200"
            }`}
          >
            BUY NO ({noOdds}x)
          </button>
        </div>

        {/* Bet Amount Selector */}
        <div className="flex items-center gap-1.5">
          {[0.1, 0.5, 1.0, 2.5].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setBetAmountSol(amt)}
              className={`flex-1 rounded-md py-1 text-xs font-mono font-medium transition-all ${
                betAmountSol === amt
                  ? "bg-primary text-white"
                  : "bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {amt} SOL
            </button>
          ))}
        </div>

        {/* Payout Calculation Banner */}
        <div className="flex items-center justify-between rounded-lg bg-neutral-950 px-3 py-2 border border-neutral-800 text-xs">
          <span className="text-neutral-400">Potential Return:</span>
          <span className="font-mono font-bold text-neutral-100 flex items-center gap-1">
            {potentialPayout} SOL
            <span className="text-emerald-400 text-[10px]">+{roiPercent}%</span>
          </span>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleSimulateBet}
          className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.99]"
        >
          <Vote className="h-4 w-4" />
          <span>Simulate Panta Bet ({betAmountSol} SOL on {betSide})</span>
        </button>
      </div>

      {/* Panta API Deployment Code Modal/Card */}
      {showDeployPayload && (
        <div className="rounded-lg bg-neutral-950 border border-indigo-500/30 p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[11px] text-neutral-300">
            <span className="font-mono text-indigo-400 font-semibold">
              POST https://api.panta.market/v1/markets
            </span>
            <button
              type="button"
              onClick={handleCopyPayload}
              className="flex items-center gap-1 rounded bg-neutral-900 px-2 py-0.5 text-[10px] text-neutral-300 hover:bg-neutral-800 border border-neutral-800 transition-all"
            >
              {copiedPayload ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copiedPayload ? "Copied" : "Copy Payload"}</span>
            </button>
          </div>
          <pre className="max-h-40 overflow-y-auto font-mono text-[10px] text-neutral-400 bg-neutral-900/60 p-2.5 rounded border border-neutral-850">
            {JSON.stringify(pantaPayload, null, 2)}
          </pre>
        </div>
      )}

      {/* Footer attribution */}
      <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-400 border-t border-neutral-800/60">
        <span>Prediction Infrastructure by Panta</span>
        <a
          href="https://docs.panta.market"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          docs.panta.market
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
