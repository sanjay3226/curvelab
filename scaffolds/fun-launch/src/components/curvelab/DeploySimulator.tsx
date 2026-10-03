import React, { useState } from "react";
import { useWallet, useUnifiedWalletContext } from "@jup-ag/wallet-adapter";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { useCurveConfig } from "@/hooks/useCurveConfig";
import {
  prepareCreateConfigTx,
  prepareCreatePoolTx,
  getDBCClient,
} from "@/lib/pool-ops";
import { toast } from "sonner";
import {
  Rocket,
  ExternalLink,
  CheckCircle,
  Wallet,
  ArrowRightLeft,
  Copy,
  RefreshCw,
  PartyPopper,
  Zap,
} from "lucide-react";
import { computeSwapQuote } from "@/lib/fee-calc";

const DEVNET_RPC = "https://api.devnet.solana.com";

interface TradeRecord {
  id: string;
  type: "BUY" | "SELL";
  solAmount: number;
  tokensReceived: number;
  priceImpactPercent: number;
  feePaidPercent: number;
  timestamp: string;
  txHash?: string;
}

export default function DeploySimulator() {
  const { publicKey, signTransaction, connected } = useWallet();
  const { setShowModal } = useUnifiedWalletContext();
  const { config } = useCurveConfig();

  const [demoKeypair, setDemoKeypair] = useState<Keypair | null>(null);
  const effectivePublicKey = publicKey || demoKeypair?.publicKey;
  const effectiveConnected = connected || !!demoKeypair;

  const [isDeployingConfig, setIsDeployingConfig] = useState(false);
  const [deployedConfigKey, setDeployedConfigKey] = useState<string | null>(null);

  const [isLaunchingPool, setIsLaunchingPool] = useState(false);
  const [launchedPoolKey, setLaunchedPoolKey] = useState<string | null>(null);
  const [launchedMintKey, setLaunchedMintKey] = useState<string | null>(null);

  // Trade simulation state
  const [tradeAmountSol, setTradeAmountSol] = useState(0.5);
  const [tradeDirection, setTradeDirection] = useState<"BUY" | "SELL">("BUY");
  const [isSwapping, setIsSwapping] = useState(false);
  const [tradeHistory, setTradeHistory] = useState<TradeRecord[]>([]);
  const [simulatedSolRaised, setSimulatedSolRaised] = useState(0);

  const graduationSol = config.graduationThresholdSol || 85;
  const migrationProgress = Math.min(
    100,
    (simulatedSolRaised / graduationSol) * 100
  );
  const isGraduated = simulatedSolRaised >= graduationSol;

  // Real-time bonding curve price impact calculation
  const liveQuote = computeSwapQuote(
    config,
    simulatedSolRaised,
    tradeAmountSol,
    tradeDirection === "BUY"
  );

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard`);
  };

  const handleDeployConfig = async () => {
    const activeKey = publicKey || demoKeypair?.publicKey;
    if (!activeKey) {
      setShowModal(true);
      return;
    }

    try {
      setIsDeployingConfig(true);
      const connection = new Connection(DEVNET_RPC, "confirmed");
      const client = getDBCClient(connection);

      toast.info("Building Meteora DBC config transaction...");
      const { configPublicKey, transaction, configKeypair } =
        await prepareCreateConfigTx(client, activeKey, config);

      const { blockhash } = await connection.getLatestBlockhash("confirmed");
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = activeKey;

      // Partial sign with config keypair
      transaction.partialSign(configKeypair);

      let signedTx = transaction;
      if (demoKeypair) {
        transaction.partialSign(demoKeypair);
      } else if (signTransaction) {
        toast.info("Requesting wallet signature...");
        signedTx = await signTransaction(transaction);
      }

      toast.info("Broadcasting config to Solana Devnet...");
      const rawTx = signedTx.serialize();
      const txSig = await connection.sendRawTransaction(rawTx, {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      await connection.confirmTransaction(txSig, "confirmed");

      setDeployedConfigKey(configPublicKey);
      toast.success("Meteora DBC Config successfully deployed on Devnet!");
    } catch (error: any) {
      console.error("Config deploy error:", error);
      toast.error(error.message || "Failed to deploy config to Devnet");
    } finally {
      setIsDeployingConfig(false);
    }
  };

  const handleLaunchPool = async () => {
    const activeKey = publicKey || demoKeypair?.publicKey;
    if (!activeKey) {
      setShowModal(true);
      return;
    }
    if (!deployedConfigKey) {
      toast.error("Please deploy a DBC config first!");
      return;
    }

    try {
      setIsLaunchingPool(true);
      const connection = new Connection(DEVNET_RPC, "confirmed");
      const client = getDBCClient(connection);

      toast.info("Generating pool & base token mint keypair...");
      const { poolAddress, baseMint, transaction, baseMintKeypair } =
        await prepareCreatePoolTx(
          client,
          activeKey,
          new PublicKey(deployedConfigKey),
          config.name,
          config.symbol,
          "https://curvelab.app/metadata.json"
        );

      const { blockhash } = await connection.getLatestBlockhash("confirmed");
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = activeKey;

      // Sign with base mint keypair
      transaction.partialSign(baseMintKeypair);

      let signedTx = transaction;
      if (demoKeypair) {
        transaction.partialSign(demoKeypair);
      } else if (signTransaction) {
        toast.info("Requesting wallet signature for Pool creation...");
        signedTx = await signTransaction(transaction);
      }

      const rawTx = signedTx.serialize();
      const txSig = await connection.sendRawTransaction(rawTx, {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      await connection.confirmTransaction(txSig, "confirmed");

      setLaunchedPoolKey(poolAddress);
      setLaunchedMintKey(baseMint);
      toast.success("Pool launched on Meteora DBC! Ready for trading.");
    } catch (error: any) {
      console.error("Pool launch error:", error);
      toast.error(error.message || "Failed to launch pool on Devnet");
    } finally {
      setIsLaunchingPool(false);
    }
  };

  const handleSimulateTrade = () => {
    setIsSwapping(true);
    setTimeout(() => {
      const quote = computeSwapQuote(
        config,
        simulatedSolRaised,
        tradeAmountSol,
        tradeDirection === "BUY"
      );

      const nextSol =
        tradeDirection === "BUY"
          ? simulatedSolRaised + tradeAmountSol
          : Math.max(0, simulatedSolRaised - tradeAmountSol);
      setSimulatedSolRaised(nextSol);

      const newRecord: TradeRecord = {
        id: Math.random().toString(36).substring(7),
        type: tradeDirection,
        solAmount: tradeAmountSol,
        tokensReceived: quote.tokensReceived,
        priceImpactPercent: quote.priceImpactPercent,
        feePaidPercent: quote.feePercent,
        timestamp: new Date().toLocaleTimeString(),
      };
      setTradeHistory([newRecord, ...tradeHistory]);
      setIsSwapping(false);

      if (nextSol >= graduationSol && !isGraduated) {
        toast.success(
          `🎉 MIGRATION TRIGGERED! Bonding curve graduated to Meteora DAMM v2!`
        );
      } else {
        toast.success(
          `Simulated ${tradeDirection} swap: ${tradeAmountSol} SOL for ~${quote.tokensReceived.toLocaleString()} ${config.symbol} (${quote.priceImpactPercent > 0 ? "+" : ""}${quote.priceImpactPercent}% price impact)`
        );
      }
    }, 400);
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl backdrop-blur-md space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <Rocket className="h-4 w-4 text-emerald-400" />
          <h3 className="font-semibold text-neutral-100 text-sm">
            Devnet Launch & Trade Simulator
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Devnet RPC
        </div>
      </div>

      {/* Wallet Connection */}
      {!effectiveConnected ? (
        <div className="rounded-lg bg-neutral-950 p-4 border border-neutral-800 text-center space-y-3">
          <Wallet className="h-6 w-6 text-primary mx-auto" />
          <p className="text-xs text-neutral-300">
            Connect Phantom or Solflare to deploy live on Solana Devnet.
          </p>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="w-full rounded-lg bg-primary py-2 text-xs font-semibold text-white shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5"
            >
              <Wallet className="h-3.5 w-3.5" />
              Connect Wallet
            </button>
            <button
              type="button"
              onClick={() => {
                const kp = Keypair.generate();
                setDemoKeypair(kp);
                toast.success(`Connected Devnet Test Wallet: ${kp.publicKey.toBase58().slice(0, 8)}...`);
              }}
              className="w-full rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 py-1.5 text-xs font-medium border border-neutral-800 transition-all flex items-center justify-center gap-1.5"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              1-Click Devnet Wallet (No Extension)
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-neutral-950 p-3 border border-neutral-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-neutral-200">
              {demoKeypair ? "Devnet: " : ""}
              {effectivePublicKey?.toBase58().slice(0, 4)}...
              {effectivePublicKey?.toBase58().slice(-4)}
            </span>
          </div>
          {demoKeypair ? (
            <button
              type="button"
              onClick={() => {
                setDemoKeypair(null);
                toast.info("Disconnected Devnet Test Wallet");
              }}
              className="text-[11px] text-neutral-400 hover:text-neutral-200"
            >
              Disconnect
            </button>
          ) : (
            <a
              href="https://faucet.solana.com"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-primary hover:underline flex items-center gap-1"
            >
              Devnet Faucet
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}

      {/* Deploy Steps */}
      <div className="space-y-3">
        {/* Step 1: Deploy Config */}
        <div className="rounded-lg bg-neutral-950/60 p-3 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-800 text-[10px]">
                1
              </span>
              Deploy Curve Config
            </span>
            {deployedConfigKey && (
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Deployed
              </span>
            )}
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Deploys your custom sqrtPrices, exponential fee scheduler, and DAMM v2
            settings to the DBC program.
          </p>
          <button
            type="button"
            disabled={isDeployingConfig}
            onClick={handleDeployConfig}
            className="w-full rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-100 py-1.5 text-xs font-medium border border-neutral-700 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isDeployingConfig ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Deploying to Devnet...
              </>
            ) : deployedConfigKey ? (
              "Deploy New Config"
            ) : (
              "Deploy Config Account"
            )}
          </button>
          {deployedConfigKey && (
            <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-neutral-400">
              <span>Config: {deployedConfigKey.slice(0, 10)}...</span>
              <button
                type="button"
                onClick={() => copyToClipboard(deployedConfigKey, "Config Public Key")}
                className="hover:text-primary flex items-center gap-1"
              >
                <Copy className="h-3 w-3" /> Copy
              </button>
            </div>
          )}
        </div>

        {/* Step 2: Launch Pool */}
        <div className="rounded-lg bg-neutral-950/60 p-3 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-800 text-[10px]">
                2
              </span>
              Launch Virtual Pool
            </span>
            {launchedPoolKey && (
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Live
              </span>
            )}
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Mints the token and attaches it to the deployed bonding curve config.
          </p>
          <button
            type="button"
            disabled={isLaunchingPool || !deployedConfigKey}
            onClick={handleLaunchPool}
            className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 text-xs font-semibold shadow-md shadow-emerald-900/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isLaunchingPool ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Launching Pool...
              </>
            ) : (
              "Launch Pool on Devnet"
            )}
          </button>
          {launchedPoolKey && (
            <div className="pt-1 text-[10px] font-mono text-neutral-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>Pool: {launchedPoolKey.slice(0, 12)}...</span>
                <a
                  href={`https://solscan.io/account/${launchedPoolKey}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline flex items-center gap-0.5"
                >
                  Solscan <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
              {launchedMintKey && (
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Mint: {launchedMintKey.slice(0, 12)}...</span>
                  <a
                    href={`https://solscan.io/account/${launchedMintKey}?cluster=devnet`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline flex items-center gap-0.5"
                  >
                    Solscan <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Swap Simulator */}
      <div className="rounded-lg bg-neutral-950 p-3 border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
            <ArrowRightLeft className="h-3.5 w-3.5 text-primary" />
            Instant Swap Simulator
          </span>
          <div className="flex rounded bg-neutral-900 p-0.5 border border-neutral-800 text-[10px]">
            <button
              type="button"
              onClick={() => setTradeDirection("BUY")}
              className={`px-2 py-0.5 rounded font-semibold ${
                tradeDirection === "BUY"
                  ? "bg-emerald-500 text-white"
                  : "text-neutral-400"
              }`}
            >
              BUY
            </button>
            <button
              type="button"
              onClick={() => setTradeDirection("SELL")}
              className={`px-2 py-0.5 rounded font-semibold ${
                tradeDirection === "SELL"
                  ? "bg-rose-500 text-white"
                  : "text-neutral-400"
              }`}
            >
              SELL
            </button>
          </div>
        </div>

        {/* Migration Progress Bar */}
        <div className="space-y-1 rounded bg-neutral-900/60 p-2 border border-neutral-800/80">
          <div className="flex justify-between text-[11px]">
            <span className="text-neutral-400">DAMM v2 Migration Progress:</span>
            <span className="font-mono text-emerald-400 font-semibold">
              {simulatedSolRaised.toFixed(1)} / {graduationSol} SOL (
              {migrationProgress.toFixed(1)}%)
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-300"
              style={{ width: `${migrationProgress}%` }}
            />
          </div>
        </div>

        {isGraduated && (
          <div className="rounded-lg bg-emerald-500/15 border border-emerald-500/40 p-2.5 text-xs text-emerald-300 space-y-1">
            <div className="flex items-center justify-between font-semibold">
              <span className="flex items-center gap-1.5">
                <PartyPopper className="h-4 w-4 text-emerald-400" />
                DAMM v2 Migration Triggered!
              </span>
              <button
                type="button"
                onClick={() => setSimulatedSolRaised(0)}
                className="text-[10px] underline text-emerald-400 hover:text-emerald-200"
              >
                Reset
              </button>
            </div>
            <p className="text-[10px] text-emerald-200/80 leading-relaxed font-mono">
              Liquidity transferred to DAMM v2. Permanent LP lock locked to Partner Vault.
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-neutral-400">
            <span>Amount (SOL)</span>
            <span>Fee: {liveQuote.feePercent.toFixed(1)}%</span>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              min={0.01}
              max={50}
              step={0.1}
              value={tradeAmountSol}
              onChange={(e) => setTradeAmountSol(Number(e.target.value))}
              className="flex-1 rounded-lg border border-neutral-750 bg-neutral-900 px-3 py-1.5 text-xs font-mono text-neutral-100 focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              disabled={isSwapping}
              onClick={handleSimulateTrade}
              className="rounded-lg bg-primary hover:bg-primary/90 text-white px-4 py-1.5 text-xs font-semibold shadow-sm transition-all"
            >
              {isSwapping ? "Simulating..." : "Quote & Swap"}
            </button>
          </div>
        </div>

        <div className="rounded bg-neutral-900/90 p-2 text-[11px] space-y-1 text-neutral-300 font-mono">
          <div className="flex justify-between">
            <span className="text-neutral-400">Estimated Output:</span>
            <span className="text-emerald-400 font-semibold">
              ~{liveQuote.tokensReceived.toLocaleString()} {config.symbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Price Impact:</span>
            <span
              className={
                liveQuote.priceImpactPercent > 5
                  ? "text-amber-400"
                  : "text-neutral-200"
              }
            >
              {liveQuote.priceImpactPercent > 0 ? "+" : ""}
              {liveQuote.priceImpactPercent}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Effective Unit Price:</span>
            <span>{liveQuote.effectivePrice.toExponential(3)} SOL</span>
          </div>
        </div>
      </div>

      {/* Trade History */}
      {tradeHistory.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-neutral-800">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
            Simulation Trade Log
          </span>
          <div className="space-y-1 max-h-36 overflow-y-auto">
            {tradeHistory.map((tr) => (
              <div
                key={tr.id}
                className="flex items-center justify-between text-[10px] bg-neutral-950 p-1.5 rounded border border-neutral-800 font-mono"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-bold ${
                      tr.type === "BUY" ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {tr.type}
                  </span>
                  <span className="text-neutral-300">{tr.solAmount} SOL</span>
                </div>
                <div className="text-neutral-400">
                  +{tr.tokensReceived.toLocaleString()} {config.symbol}
                </div>
                <div className="text-neutral-500">{tr.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
