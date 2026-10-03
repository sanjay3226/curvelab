import React from "react";
import { useCurveConfig } from "@/hooks/useCurveConfig";
import { Coins } from "lucide-react";

export default function TokenParams() {
  const { config, setConfig } = useCurveConfig();

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-neutral-100 text-sm">
            Token Parameters
          </h3>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
          Solana {config.tokenType}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="space-y-1">
          <label className="text-neutral-400 block text-[11px] font-medium">
            Token Name
          </label>
          <input
            type="text"
            value={config.name}
            onChange={(e) => setConfig({ name: e.target.value })}
            className="w-full rounded-lg border border-neutral-750 bg-neutral-950 p-2 text-neutral-100 focus:border-primary focus:outline-none"
            placeholder="e.g. Virtual Protocol"
          />
        </div>
        <div className="space-y-1">
          <label className="text-neutral-400 block text-[11px] font-medium">
            Symbol
          </label>
          <input
            type="text"
            value={config.symbol}
            onChange={(e) => setConfig({ symbol: e.target.value.toUpperCase() })}
            className="w-full rounded-lg border border-neutral-750 bg-neutral-950 p-2 font-mono text-neutral-100 uppercase focus:border-primary focus:outline-none"
            placeholder="e.g. VIRTUAL"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="space-y-1">
          <label className="text-neutral-400 block text-[11px] font-medium">
            Total Supply
          </label>
          <input
            type="number"
            min={1000}
            max={100000000000}
            value={config.totalSupply}
            onChange={(e) => setConfig({ totalSupply: Number(e.target.value) })}
            className="w-full rounded-lg border border-neutral-750 bg-neutral-950 p-2 font-mono text-neutral-100 focus:border-primary focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-neutral-400 block text-[11px] font-medium">
            Decimals
          </label>
          <div className="grid grid-cols-4 gap-1">
            {[6, 7, 8, 9].map((dec) => (
              <button
                key={dec}
                type="button"
                onClick={() => setConfig({ tokenDecimals: dec as any })}
                className={`py-2 text-xs rounded-lg font-mono font-medium transition-all ${
                  config.tokenDecimals === dec
                    ? "bg-primary text-white shadow-sm"
                    : "bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
                }`}
              >
                {dec}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-1 text-xs">
        <label className="text-neutral-400 block text-[11px] font-medium">
          Token Standard
        </label>
        <div className="grid grid-cols-2 gap-2">
          {["SPL", "Token2022"].map((standard) => (
            <button
              key={standard}
              type="button"
              onClick={() => setConfig({ tokenType: standard as any })}
              className={`p-2 rounded-lg text-xs font-medium transition-all text-center ${
                config.tokenType === standard
                  ? "bg-primary/20 text-primary border border-primary/40"
                  : "bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
              }`}
            >
              {standard === "SPL" ? "Standard SPL" : "Token-2022 (Extensions)"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1 text-xs">
        <div className="flex justify-between items-center">
          <label className="text-neutral-400 block text-[11px] font-medium">
            Paired Quote Asset
          </label>
          <span className="text-[10px] text-emerald-400 font-mono">
            {config.quoteToken || "WSOL"}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: "WSOL", label: "SOL (Native)", badge: "9 Dec" },
            { id: "USDC", label: "USDC", badge: "6 Dec" },
            { id: "USDG", label: "USDG (Global)", badge: "Panta/Fair" },
          ].map((quote) => (
            <button
              key={quote.id}
              type="button"
              onClick={() => setConfig({ quoteToken: quote.id as any })}
              className={`p-2 rounded-lg text-xs font-medium transition-all text-center flex flex-col items-center gap-0.5 ${
                (config.quoteToken || "WSOL") === quote.id
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm"
                  : "bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
              }`}
            >
              <span className="font-semibold text-xs">{quote.label}</span>
              <span className="text-[9px] text-neutral-500 font-mono">{quote.badge}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
