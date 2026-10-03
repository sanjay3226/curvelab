import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { useCurveConfig } from "@/hooks/useCurveConfig";
import {
  computeCurvePoints,
  computeFeeDecayPoints,
  computeSegmentAnalytics,
} from "@/lib/fee-calc";
import { Activity, ShieldAlert, Layers } from "lucide-react";

export default function CurveChart() {
  const { config } = useCurveConfig();
  const [activeTab, setActiveTab] = useState<"curve" | "fee" | "segments">("curve");

  const curveData = computeCurvePoints(config, 80);
  const feeData = computeFeeDecayPoints(config, 40);
  const segmentData = computeSegmentAnalytics(config);

  const graduationSol = config.graduationThresholdSol || 85;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-2xl backdrop-blur-md">
      {/* Header & View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-semibold text-neutral-100">
              Interactive Curve & Fee Engine
            </h3>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time mathematical projection across {config.segments} curve segment
            {config.segments > 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex rounded-lg bg-neutral-950 p-1 border border-neutral-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("curve")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-all ${
              activeTab === "curve"
                ? "bg-primary text-white shadow-sm"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            Bonding Curve
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("fee")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-all ${
              activeTab === "fee"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Anti-Sniper Fee
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("segments")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-all ${
              activeTab === "segments"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Segment Analysis
          </button>
        </div>
      </div>

      {/* Main Chart / Table Area */}
      <div className="mt-4 h-[300px] w-full">
        {activeTab === "curve" ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={curveData}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis
                dataKey="solRaised"
                stroke="#737373"
                fontSize={11}
                tickFormatter={(v) => `${v.toFixed(1)} SOL`}
              />
              <YAxis
                stroke="#737373"
                fontSize={11}
                tickFormatter={(v) =>
                  v >= 0.001 ? v.toFixed(4) : v.toExponential(1)
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#171717",
                  borderColor: "#404040",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(val: any, name: any) => {
                  if (name === "price") {
                    return [`${Number(val).toExponential(4)} SOL`, "Token Price"];
                  }
                  if (name === "marketCapSol") {
                    return [`${Number(val).toFixed(2)} SOL`, "Market Cap"];
                  }
                  return [val, name];
                }}
                labelFormatter={(label) => `SOL Raised: ${Number(label).toFixed(2)} SOL`}
              />
              <ReferenceLine
                x={graduationSol}
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: "DAMM v2 Migration Threshold",
                  fill: "#10b981",
                  fontSize: 11,
                  position: "insideTopLeft",
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#curveGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : activeTab === "fee" ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={feeData}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis
                dataKey="timeSeconds"
                stroke="#737373"
                fontSize={11}
                tickFormatter={(v) => `${v}s`}
              />
              <YAxis
                stroke="#737373"
                fontSize={11}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#171717",
                  borderColor: "#404040",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(val: any) => [`${val}%`, "Trading Fee"]}
                labelFormatter={(label) => `Elapsed: ${label} seconds`}
              />
              <Line
                type="monotone"
                dataKey="feePercent"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full overflow-y-auto pr-1">
            <div className="rounded-lg bg-neutral-950 border border-neutral-800 p-2.5">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 text-[10px] uppercase">
                    <th className="py-1.5 px-2">Seg</th>
                    <th className="py-1.5 px-2">SqrtPrice Bounds</th>
                    <th className="py-1.5 px-2">Multiplier</th>
                    <th className="py-1.5 px-2">Weight</th>
                    <th className="py-1.5 px-2">SOL Req.</th>
                    <th className="py-1.5 px-2">Cumul. SOL</th>
                    <th className="py-1.5 px-2">Supply %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {segmentData.map((s) => (
                    <tr key={s.segmentIndex} className="hover:bg-neutral-900/60 transition-colors">
                      <td className="py-2 px-2 font-bold text-primary">#{s.segmentIndex}</td>
                      <td className="py-2 px-2 text-neutral-200">
                        {s.startPrice.toExponential(2)} → {s.endPrice.toExponential(2)}
                      </td>
                      <td className="py-2 px-2 text-emerald-400 font-semibold">{s.multiplier}x</td>
                      <td className="py-2 px-2 text-neutral-300">{s.weight}</td>
                      <td className="py-2 px-2 text-neutral-200">{s.solRequired} SOL</td>
                      <td className="py-2 px-2 text-neutral-400">{s.cumulativeSol} SOL</td>
                      <td className="py-2 px-2 text-amber-400 font-semibold">{s.tokenAllocationPercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Metric Badges Footer */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-neutral-800 text-xs">
        <div className="rounded-lg bg-neutral-950/60 p-2 border border-neutral-800/80">
          <span className="text-neutral-400 block text-[10px] uppercase font-semibold">
            Starting Price
          </span>
          <span className="font-mono text-neutral-100 font-medium">
            {config.sqrtPriceCheckpoints[0]?.toExponential(3)} SOL
          </span>
        </div>
        <div className="rounded-lg bg-neutral-950/60 p-2 border border-neutral-800/80">
          <span className="text-neutral-400 block text-[10px] uppercase font-semibold">
            Migration Target
          </span>
          <span className="font-mono text-emerald-400 font-medium">
            {graduationSol} SOL
          </span>
        </div>
        <div className="rounded-lg bg-neutral-950/60 p-2 border border-neutral-800/80">
          <span className="text-neutral-400 block text-[10px] uppercase font-semibold">
            Initial Fee
          </span>
          <span className="font-mono text-amber-400 font-medium">
            {(config.startingFeeBps / 100).toFixed(1)}%
          </span>
        </div>
        <div className="rounded-lg bg-neutral-950/60 p-2 border border-neutral-800/80">
          <span className="text-neutral-400 block text-[10px] uppercase font-semibold">
            Post-Decay Fee
          </span>
          <span className="font-mono text-blue-400 font-medium">
            {(config.endingFeeBps / 100).toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}
