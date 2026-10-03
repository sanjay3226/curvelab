# 🧪 CurveLab — Visual Bonding Curve Studio (`fun-launch` scaffold)

> **Next.js 15 web studio for creating, simulating, and auditing Meteora Dynamic Bonding Curves on Solana.**

Part of [CurveLab](https://github.com/sanjay3226/curvelab).

## 🌟 Features

- **Interactive Curve Designer**: Piecewise custom SqrtPrices and liquidity weights using `@meteora-ag/dynamic-bonding-curve-sdk`.
- **Pre-Flight Protocol Validator**: In-browser verification of mathematical invariants, rug-pull immunity, and MEV Bot Resistance Score.
- **Devnet Dynamic Swap Simulator**: Accurate price impact modeling, dynamic fees, and real-time Meteora DAMM v2 migration progress.
- **Multi-Quote Support**: WSOL, USDC, and USDG (Global Dollar).
- **Code Exporters**: One-click generation of TypeScript SDK scripts, JSON configurations, and Rust/Anchor CPI snippets.
- **6 Presets**: Standard Pump, Anti-Sniper Fair Launch, Exponential Liquidity, Flat Stable Growth, High-Tension Squeeze, Whale Shield.

## 🚀 Running Locally

```bash
# From workspace root
pnpm --filter fun-launch dev

# Or directly in this directory
pnpm dev
```

Visit [http://localhost:3000/curvelab](http://localhost:3000/curvelab).

## 📦 Production Build

```bash
pnpm build
```
