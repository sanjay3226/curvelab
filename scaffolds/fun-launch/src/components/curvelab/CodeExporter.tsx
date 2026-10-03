import React, { useState } from "react";
import { useCurveConfig } from "@/hooks/useCurveConfig";
import {
  generateTypeScriptCode,
  generateJSONConfig,
  generateRustAnchorCode,
} from "@/lib/code-gen";
import { encodeCurveToURL } from "@/lib/url-codec";
import { toast } from "sonner";
import { Code2, FileJson, Share2, Copy, Download, Check, Terminal } from "lucide-react";

export default function CodeExporter() {
  const { config } = useCurveConfig();
  const [activeTab, setActiveTab] = useState<"ts" | "json" | "rust" | "share">("ts");
  const [copied, setCopied] = useState(false);

  const tsCode = generateTypeScriptCode(config);
  const jsonCode = generateJSONConfig(config);
  const rustCode = generateRustAnchorCode(config);
  const shareUrl = encodeCurveToURL(config);

  const activeContent =
    activeTab === "ts"
      ? tsCode
      : activeTab === "json"
        ? jsonCode
        : activeTab === "rust"
          ? rustCode
          : shareUrl;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename =
      activeTab === "ts"
        ? `${config.symbol.toLowerCase()}-curve.ts`
        : activeTab === "json"
          ? `${config.symbol.toLowerCase()}-curve.json`
          : `${config.symbol.toLowerCase()}-curve.rs`;
    const mime =
      activeTab === "ts"
        ? "text/typescript"
        : activeTab === "json"
          ? "application/json"
          : "text/x-rust";

    const blob = new Blob([activeContent], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Header and Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-neutral-100 text-sm">
            Export & Integrator Tooling
          </h3>
        </div>

        <div className="flex rounded-lg bg-neutral-950 p-1 border border-neutral-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("ts")}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-medium transition-all ${
              activeTab === "ts"
                ? "bg-primary text-white"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            TypeScript
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("json")}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-medium transition-all ${
              activeTab === "json"
                ? "bg-primary text-white"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <FileJson className="h-3.5 w-3.5" />
            JSON
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("rust")}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-medium transition-all ${
              activeTab === "rust"
                ? "bg-primary text-white"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            Rust Anchor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("share")}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-medium transition-all ${
              activeTab === "share"
                ? "bg-primary text-white"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Share2 className="h-3.5 w-3.5" />
            Share URL
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      {activeTab === "share" ? (
        <div className="space-y-3 py-2">
          <p className="text-xs text-neutral-300">
            This URL encodes the complete bonding curve, fee parameters, and token
            metadata in a base64 URL hash. Anyone who opens this link will load your
            exact curve:
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 rounded-lg border border-neutral-750 bg-neutral-950 p-2 font-mono text-xs text-neutral-300 select-all"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-lg bg-primary hover:bg-primary/90 text-white px-3 py-2 text-xs font-semibold flex items-center gap-1"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              Copy
            </button>
          </div>
        </div>
      ) : (
        <div className="relative rounded-lg bg-neutral-950 border border-neutral-800 p-3 font-mono text-xs">
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded bg-neutral-850 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-750 text-[11px] flex items-center gap-1"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="p-1.5 rounded bg-neutral-850 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-750 text-[11px] flex items-center gap-1"
            >
              <Download className="h-3 w-3" />
              Download
            </button>
          </div>
          <pre className="overflow-x-auto max-h-56 pr-20 text-[11px] text-neutral-300 leading-relaxed">
            {activeContent}
          </pre>
        </div>
      )}
    </div>
  );
}
