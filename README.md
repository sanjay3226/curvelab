# 🧪 CurveLab — Visual Bonding Curve Studio & Pre-Flight Validator for Meteora DBC

> **The definitive design studio, financial analytics engine, and on-chain validator for Meteora Dynamic Bonding Curves on Solana.**

[![Solana](https://img.shields.io/badge/Solana-Devnet%20%2F%20Mainnet-14F195?logo=solana&logoColor=white)](https://solana.com)
[![Meteora DBC](https://img.shields.io/badge/Meteora-DBC%20%26%20DAMM%20v2-FE4A60)](https://meteora.ag)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)

---

## 🌐 Ecosystem Architecture

- **Meteora Dynamic Bonding Curves (DBC)**: Visual curve authoring, dynamic fee scheduler automation, DAMM v2 migration configuration, and developer tooling.
- **Solana Ecosystem Infrastructure**: Production-grade curve modeling and audit tooling for token architects, liquidity engineers, and DeFi protocols.
- **Multi-Asset Liquidity Standards**: Native multi-quote asset architecture supporting WSOL, USDC, and USDG (Global Dollar).

---

## 💡 The Problem

Meteora's Dynamic Bonding Curve (DBC) is the most powerful primitive in DeFi, allowing protocols to design custom multi-segment bonding curves, exponential fee decay, and automated migration into Meteora DAMM v2 concentrated liquidity pools.

However, building custom DBC pools today requires:
1. **Navigating complex Q64.64 fixed-point math** for `sqrtPrice` checkpoints.
2. **Writing fragile, manual scripts** without visual feedback on price curves, market cap milestones, or segment liquidity depth.
3. **Risk of on-chain reverts**: A single slip in array length constraints (`checkpoints.length !== segments + 1`), non-monotonic price arrays, or liquidity percentages not summing to 100 will brick the initialization transaction on-chain.
4. **Blind launches**: Creators have no way to simulate swaps, evaluate MEV bot vulnerability, or preview slippage before committing capital.

---

## 🚀 The Solution: CurveLab

**CurveLab** is an all-in-one visual studio and engineering workstation that turns bonding curve design into an intuitive, mathematically verified experience:

- 📊 **Visual Multi-Segment Curve Editor**: Interactively design piecewise-linear or piecewise-constant bonding curves. Drag or input price checkpoints and watch real-time market cap and token allocation charts update.
- 🛡️ **Automated Pre-Flight Protocol Validator**: In-browser static and mathematical verification that checks for price monotonicity, invariant balance, rug-pull immunity (100% lock enforcement), and computes an **MEV Bot Resistance Score (0–100)**.
- ⚡ **Dynamic Swap Simulator & DAMM v2 Graduation Engine**: Test buy and sell swaps against the exact bonding curve math. Watch real-time price impact, dynamic fee calculation, and track progress toward automatic migration into Meteora DAMM v2.
- 🧬 **6 Battle-Tested Presets**: One-click configurations for every launch archetype:
  - **Standard Pump**: Low starting price, steady escalation, reliable DAMM v2 graduation.
  - **Anti-Sniper Fair Launch**: Flat early segment with high initial fees that decay to punish MEV snipers.
  - **Exponential Liquidity**: Heavy liquidity at graduation to minimize post-migration volatility.
  - **Flat Stable Growth**: Low price delta designed for stable tokens or utility tokens.
  - **High-Tension Squeeze**: Aggressive exponential price ramp rewarding early diamond hands.
  - **Whale Shield**: Concentrated liquidity distributed evenly across segments to prevent single-buyer dominance.
- 🌐 **Multi-Quote Currency Flexibility**: Launch with **WSOL** (9 decimals), **USDC** (6 decimals), or **USDG** (Global Dollar, 6 decimals).
- 💻 **Production Code Exporter**: Export verified parameters directly into:
  - Ready-to-execute **TypeScript SDK** scripts (`@meteora-ag/dynamic-bonding-curve-sdk`).
  - Standard **JSON** configuration files for CI/CD pipelines.
  - Native **Rust / Anchor CPI** snippets for on-chain protocol builders.

---

## 🏗️ Architecture & Core Components

```
curvelab/
├── scaffolds/fun-launch/
│   ├── src/
│   │   ├── components/curvelab/
│   │   │   ├── CurveChart.tsx          # Dual-axis visual curve, MCAP, & Segment table
│   │   │   ├── PreFlightValidator.tsx  # Protocol assertion checks & MEV scoring
│   │   │   ├── DeploySimulator.tsx     # Dynamic swap simulator & DAMM v2 progress
│   │   │   ├── TokenParams.tsx         # Token metadata, decimals, & quote asset
│   │   │   ├── CurveSegments.tsx       # Segment checkpoints & liquidity weights
│   │   │   ├── FeeScheduler.tsx        # Dynamic fee decay & scheduler controls
│   │   │   ├── MigrationSettings.tsx   # DAMM v2 fee split & permanent lock setup
│   │   │   ├── Presets.tsx             # 6 one-click curve presets
│   │   │   └── CodeExporter.tsx        # TS SDK, JSON, & Rust Anchor generator
│   │   ├── lib/
│   │   │   ├── validator.ts            # Mathematical & security invariant assertions
│   │   │   ├── fee-calc.ts             # Segment analytics, quote math & swap simulator
│   │   │   ├── curve-builder.ts        # Meteora DBC SDK configuration builder
│   │   │   └── code-gen.ts             # Code generation engines
│   │   ├── types/
│   │   │   └── curve-config.ts         # TypeScript types for CurveLab configs
│   │   └── pages/
│   │       └── curvelab.tsx            # Main Studio workspace layout
```

---

## 📐 Mathematical Invariants & Validation Rules

CurveLab enforces the strict on-chain invariants required by the Meteora Dynamic Bonding Curve program:

1. **Price Monotonicity**:
   `P_0 < P_1 < P_2 < ... < P_n`
   Every checkpoint must be strictly greater than the preceding checkpoint to prevent inverted curves.

2. **Checkpoint-to-Segment Dimensionality**:
   `len(sqrtPriceCheckpoints) === segments + 1`
   `len(liquidityWeights) === segments`

3. **100% Liquidity Distribution Law**:
   `partnerLiquidity + partnerPermanentLocked + creatorLiquidity + creatorPermanentLocked === 100%`
   CurveLab automatically computes and distributes partner liquidity to guarantee that Anchor initialization never reverts.

4. **MEV Sniper Resistance Scoring**:
   CurveLab calculates a composite score based on:
   - Dynamic fee decay delta (`startingFeeBps - endingFeeBps`)
   - Initial price slope / liquidity depth in Segment 0
   - Liquidity lock security (`partnerPermanentLockPercentage + creatorPermanentLockPercentage >= 100%`)

---

## ⚡ Quickstart

### Prerequisites
- Node.js >= 20.0.0
- pnpm >= 9.0.0

### 1. Clone & Install
```bash
git clone https://github.com/sanjay3226/curvelab.git
cd curvelab
pnpm install
```

### 2. Launch the Studio
```bash
pnpm --filter fun-launch dev
```

Open [http://localhost:3000/curvelab](http://localhost:3000/curvelab) in your browser.

### 3. Connect Wallet & Simulate
1. Select a preset (e.g., **Anti-Sniper Fair Launch**).
2. Tweak price checkpoints, fee decay, or graduation thresholds.
3. Review the **Pre-Flight Validator** checks.
4. Run simulated trades in the **Live Devnet Swap Simulator**.
5. Switch to **Export Code** to copy your ready-to-run TypeScript SDK script or Rust Anchor snippet.

---

## 📦 Building for Production

```bash
pnpm --filter fun-launch build
```

Production build generates a fully optimized, statically exported application (`/curvelab` static page at ~237 kB).

---

## 🤝 Contributing

Pull requests and feedback are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
