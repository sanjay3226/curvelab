import React, { useState, useEffect } from "react";
import { Activity, Radio, Zap, Server, ShieldCheck, CheckCircle2, ChevronRight, RefreshCw, Cpu } from "lucide-react";

export default function SolamiTelemetry() {
  const [slot, setSlot] = useState(312948210);
  const [latency, setLatency] = useState(18);
  const [dataProvider, setDataProvider] = useState<"mirage" | "beam" | "standard">("mirage");
  const [activeListeners, setActiveListeners] = useState(14);
  const [lastEvent, setLastEvent] = useState<string>("DBC Pool Account sync: slot verified");

  // Simulate real-time Yellowstone gRPC slot ticks
  useEffect(() => {
    const slotInterval = setInterval(() => {
      setSlot((prev) => prev + 1);
      // Subtle latency jitter between 14ms and 22ms
      setLatency(Math.floor(14 + Math.random() * 8));
    }, 420);

    return () => clearInterval(slotInterval);
  }, []);

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <Radio className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-neutral-100 text-sm">
                Solami Live Data Stream
              </h3>
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.2 text-[9px] font-semibold text-emerald-400 uppercase tracking-wider">
                Mirage gRPC
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Yellowstone gRPC WebSocket firehose for sub-slot pool telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 rounded-lg bg-neutral-950 px-2.5 py-1 border border-neutral-800 text-neutral-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-bold">{latency}ms</span>
          </div>
        </div>
      </div>

      {/* Provider Selector */}
      <div className="grid grid-cols-3 gap-1.5 rounded-lg bg-neutral-950 p-1 border border-neutral-800 text-xs">
        <button
          type="button"
          onClick={() => setDataProvider("mirage")}
          className={`flex items-center justify-center gap-1.5 rounded px-2 py-1.5 font-medium transition-all ${
            dataProvider === "mirage"
              ? "bg-primary text-white shadow-sm"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <Zap className="h-3.5 w-3.5" />
          Mirage (gRPC)
        </button>
        <button
          type="button"
          onClick={() => setDataProvider("beam")}
          className={`flex items-center justify-center gap-1.5 rounded px-2 py-1.5 font-medium transition-all ${
            dataProvider === "beam"
              ? "bg-primary text-white shadow-sm"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <Server className="h-3.5 w-3.5" />
          Beam (Routing)
        </button>
        <button
          type="button"
          onClick={() => setDataProvider("standard")}
          className={`flex items-center justify-center gap-1.5 rounded px-2 py-1.5 font-medium transition-all ${
            dataProvider === "standard"
              ? "bg-primary text-white shadow-sm"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          Public RPC
        </button>
      </div>

      {/* Real-Time Telemetry Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        <div className="rounded-lg bg-neutral-950 p-2.5 border border-neutral-800">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
            Current Solana Slot
          </span>
          <span className="font-mono text-neutral-200 font-bold text-sm mt-0.5 block">
            #{slot.toLocaleString()}
          </span>
        </div>

        <div className="rounded-lg bg-neutral-950 p-2.5 border border-neutral-800">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
            Account Stream
          </span>
          <span className="text-emerald-400 font-bold text-sm mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            {activeListeners} Pool Watchers
          </span>
        </div>

        <div className="rounded-lg bg-neutral-950 p-2.5 border border-neutral-800 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
            Delivery Mode
          </span>
          <span className="text-indigo-400 font-bold text-sm mt-0.5 truncate block">
            {dataProvider === "mirage" ? "Zero-Copy WSS" : dataProvider === "beam" ? "Tx Pre-Flight" : "Polling"}
          </span>
        </div>
      </div>

      {/* Solami Stream Event Log */}
      <div className="rounded-lg bg-neutral-950/90 border border-neutral-800/80 p-3 space-y-1.5 text-xs">
        <div className="flex items-center justify-between text-[11px] text-neutral-400">
          <span className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-primary" />
            Live Event Stream
          </span>
          <span className="text-[10px] font-mono text-neutral-400">wss://mirage.solami.live</span>
        </div>
        <p className="font-mono text-[11px] text-neutral-300 truncate">
          &gt; {lastEvent} (Slot {slot})
        </p>
      </div>

      {/* Footer attribution */}
      <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-400 border-t border-neutral-800/60">
        <span>Solana Infrastructure by Solami</span>
        <a
          href="https://solami.io"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
        >
          solami.io
          <ChevronRight className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
