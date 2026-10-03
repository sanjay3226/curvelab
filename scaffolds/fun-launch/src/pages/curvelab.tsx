import React, { useEffect } from "react";
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
import { useCurveConfig } from "@/hooks/useCurveConfig";
import { decodeCurveFromURL } from "@/lib/url-codec";
import { toast } from "sonner";
import { Beaker, Cpu } from "lucide-react";

export default function CurveLabPage() {
  const { setConfig } = useCurveConfig();

  // Load preset from URL hash if present
  useEffect(() => {
    const loaded = decodeCurveFromURL();
    if (loaded) {
      setConfig(loaded);
      toast.success("Loaded curve configuration from shared URL link!");
    }
  }, [setConfig]);

  return (
    <>
      <Head>
        <title>CurveLab — Meteora Dynamic Bonding Curve Studio & Simulator</title>
        <meta
          name="description"
          content="Visual Bonding Curve Designer, Anti-Sniper Fee Scheduler, DAMM v2 Migration Planner & Live Devnet Simulator for Meteora DBC."
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
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-neutral-100 tracking-tight">
                    CurveLab Studio
                  </h1>
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    Meteora DBC v1.5
                  </span>
                  <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-semibold text-indigo-400">
                    DAMM v2
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  Design custom bonding curves, simulate anti-sniper fee decay, and launch with zero manual Rust structs.
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Curve Configuration Inputs (4 cols) */}
            <div className="lg:col-span-4 space-y-5">
              <TokenParams />
              <CurveDesigner />
              <FeeDesigner />
              <MigrationDesigner />
            </div>

            {/* Middle Column: Interactive Charts, Pre-Flight Validator & Exporter (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              <CurveChart />
              <PreFlightValidator />
              <CodeExporter />
            </div>

            {/* Right Column: Presets & Live Simulation (3 cols) */}
            <div className="lg:col-span-3 space-y-5">
              <PresetLibrary />
              <DeploySimulator />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
