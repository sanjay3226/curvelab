import React, { useEffect, useState } from "react";
import Head from "next/head";
import Header from "@/components/Header";
import CurveChart from "@/components/curvelab/CurveChart";
import CurveDesigner from "@/components/curvelab/CurveDesigner";
import FeeDesigner from "@/components/curvelab/FeeDesigner";
import MigrationDesigner from "@/components/curvelab/MigrationDesigner";
import TokenParams from "@/components/curvelab/TokenParams";
import PresetLibrary from "@/components/curvelab/PresetLibrary";
import DeploySimulator from "@/components/curvelab/DeploySimulator";
import CodeExporter from "@/components/curvelab/CodeExporter";
import PreFlightValidator from "@/components/curvelab/PreFlightValidator";
import SolamiTelemetry from "@/components/curvelab/SolamiTelemetry";
import PantaPredictionArena from "@/components/curvelab/PantaPredictionArena";
import { useCurveConfig } from "@/hooks/useCurveConfig";
import { decodeCurveFromURL } from "@/lib/url-codec";
import { toast } from "sonner";
import { Beaker, Cpu, Radio, Scale, Sparkles } from "lucide-react";

export default function CurveLabPage() {
  const { setConfig } = useCurveConfig();
  const [mounted, setMounted] = useState(false);

  // Load preset from URL hash if present
  useEffect(() => {
    setMounted(true);
    const loaded = decodeCurveFromURL();
    if (loaded) {
      setConfig(loaded);
      toast.success("Loaded curve configuration from shared URL link!");
    }
  }, [setConfig]);

  return (
    <>
      <Head>
        <title>CurveLab — Meteora DBC Visual Studio, Solami Telemetry & Panta Prediction Arena</title>
        <meta
          name="description"
          content="Visual Bonding Curve Designer, Anti-Sniper Fee Scheduler, Solami Yellowstone gRPC Telemetry & Panta Prediction Markets for Meteora DBC."
        />
      </Head>

      <div className="min-h-screen bg-neutral-950 text-foreground">
        {/* Navigation */}
        <Header />

        {/* Sub-Header Banner */}
        <div className="border-b border-neutral-800/80 bg-neutral-900/40 px-4 py-3 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-500 shadow-md shadow-primary/20">
                <Beaker className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center flex-wrap gap-2">
                  <h1 className="text-base font-bold text-neutral-100 tracking-tight">
                    CurveLab Studio
                  </h1>
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    Meteora DBC v1.5
                  </span>
                  <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-semibold text-indigo-400">
                    DAMM v2
                  </span>
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 flex items-center gap-1">
                    <Radio className="h-2.5 w-2.5 animate-pulse" />
                    Solami Mirage
                  </span>
                  <span className="rounded-full bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 text-[10px] font-semibold text-purple-300 flex items-center gap-1">
                    <Scale className="h-2.5 w-2.5" />
                    Panta Markets
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  Design custom bonding curves, stream real-time Solami telemetry, predict graduation with Panta API, and export production code.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <div className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-2.5 py-1 border border-neutral-800">
                <Cpu className="h-3.5 w-3.5 text-primary" />
                <span>Program: dbcij3LW...</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main 3-Column Studio Canvas */}
        <main className="mx-auto max-w-7xl px-4 py-6">
          {!mounted ? (
            <div className="flex h-96 items-center justify-center rounded-2xl border border-neutral-800/80 bg-neutral-900/30">
              <div className="flex items-center gap-3 text-neutral-400">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-sm font-medium">Initializing CurveLab Studio...</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Curve Configuration Inputs (4 cols) */}
              <div className="lg:col-span-4 space-y-5">
                <TokenParams />
                <CurveDesigner />
                <FeeDesigner />
                <MigrationDesigner />
              </div>

              {/* Middle Column: Interactive Charts, Pre-Flight Validator, Code Exporter & Solami Telemetry (5 cols) */}
              <div className="lg:col-span-5 space-y-5">
                <CurveChart />
                <PreFlightValidator />
                <CodeExporter />
                <SolamiTelemetry />
              </div>

              {/* Right Column: Presets, Live Simulation & Panta Prediction Arena (3 cols) */}
              <div className="lg:col-span-3 space-y-5">
                <PresetLibrary />
                <DeploySimulator />
                <PantaPredictionArena />
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
