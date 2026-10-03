export interface CurveLabConfig {
  // Token params
  symbol: string;
  name: string;
  totalSupply: number;
  tokenDecimals: 6 | 7 | 8 | 9;
  tokenType: "SPL" | "Token2022";
  quoteToken: "WSOL" | "USDC" | "USDG";
  quoteAsset?: "WSOL" | "USDC" | "USDG";

  // Curve shape
  segments: number; // 1-8
  sqrtPriceCheckpoints: number[]; // raw price checkpoints in human-readable SOL per token
  liquidityWeights: number[]; // must match segments count

  // Fee configuration
  feeMode: "Fixed" | "LinearDecay" | "ExponentialDecay";
  startingFeeBps: number; // e.g., 9000 = 90%
  endingFeeBps: number;
  numberOfPeriods: number;
  totalDurationSeconds: number;
  dynamicFeeEnabled: boolean;

  // Migration
  migrationFeePercentage: number; // 0-20
  creatorMigrationFeePercentage: number; // 0-100 (of migration fee)
  partnerPermanentLockPercentage: number;
  creatorPermanentLockPercentage: number;

  // Derived (computed)
  migratedPoolFeeBps: number;
  graduationThresholdSol: number;
}

export const DEFAULT_CONFIG: CurveLabConfig = {
  symbol: "CURVE",
  name: "CurveLab Token",
  totalSupply: 1_000_000_000,
  tokenDecimals: 6,
  tokenType: "SPL",
  quoteToken: "WSOL",
  quoteAsset: "WSOL",
  segments: 3,
  sqrtPriceCheckpoints: [0.000000001, 0.00000000105, 0.000000002, 0.000001],
  liquidityWeights: [2, 1, 1],
  feeMode: "ExponentialDecay",
  startingFeeBps: 9000,
  endingFeeBps: 120,
  numberOfPeriods: 60,
  totalDurationSeconds: 60,
  dynamicFeeEnabled: true,
  migrationFeePercentage: 10,
  creatorMigrationFeePercentage: 50,
  partnerPermanentLockPercentage: 100,
  creatorPermanentLockPercentage: 0,
  migratedPoolFeeBps: 120,
  graduationThresholdSol: 85,
};

export interface CurvePreset {
  id: string;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  config: Partial<CurveLabConfig>;
}

export const BUILTIN_PRESETS: CurvePreset[] = [
  {
    id: "meme-fair-launch",
    name: "Meme Fair Launch",
    tagline: "High anti-sniper fee decaying to low trading fee",
    description: "3-segment curve with 90% starting fee decaying exponentially over 60s. Maximum protection against sniper bots at launch.",
    badge: "Popular",
    config: {
      segments: 3,
      sqrtPriceCheckpoints: [0.000000001, 0.00000000105, 0.000000002, 0.000001],
      liquidityWeights: [2, 1, 1],
      feeMode: "ExponentialDecay",
      startingFeeBps: 9000,
      endingFeeBps: 120,
      numberOfPeriods: 60,
      totalDurationSeconds: 60,
      dynamicFeeEnabled: true,
      partnerPermanentLockPercentage: 100,
      creatorPermanentLockPercentage: 0,
    },
  },
  {
    id: "blue-chip-stealth",
    name: "Blue Chip Stealth",
    tagline: "Flat low-fee curve for institutional or calm launches",
    description: "Single-segment stable bonding curve with a fixed 1% fee. Ideal for protocol governance tokens and stealth launches.",
    badge: "Institutional",
    config: {
      segments: 1,
      sqrtPriceCheckpoints: [0.00000001, 0.0000005],
      liquidityWeights: [1],
      feeMode: "Fixed",
      startingFeeBps: 100,
      endingFeeBps: 100,
      numberOfPeriods: 0,
      totalDurationSeconds: 0,
      dynamicFeeEnabled: false,
      partnerPermanentLockPercentage: 100,
      creatorPermanentLockPercentage: 0,
    },
  },
  {
    id: "builder-round",
    name: "Builder Round",
    tagline: "Gradual step-down fee for dev-focused distribution",
    description: "4-segment front-heavy curve with linear fee decay from 5% to 0.5% over 10 minutes (600s). Gives organic users fair entry window.",
    badge: "Developer",
    config: {
      segments: 4,
      sqrtPriceCheckpoints: [0.000000001, 0.000000005, 0.00000002, 0.0000001, 0.000001],
      liquidityWeights: [3, 2, 1, 1],
      feeMode: "LinearDecay",
      startingFeeBps: 500,
      endingFeeBps: 50,
      numberOfPeriods: 20,
      totalDurationSeconds: 600,
      dynamicFeeEnabled: true,
      partnerPermanentLockPercentage: 90,
      creatorPermanentLockPercentage: 10,
    },
  },
  {
    id: "rwa-stable",
    name: "RWA Stable",
    tagline: "Minimal slippage & rock-bottom fixed fee for asset backing",
    description: "Single-segment linear bonding with 0.25% fixed fee, tailored for real-world asset syndication and yield tokens.",
    badge: "RWA",
    config: {
      segments: 1,
      sqrtPriceCheckpoints: [0.000001, 0.0000012],
      liquidityWeights: [1],
      feeMode: "Fixed",
      startingFeeBps: 25,
      endingFeeBps: 25,
      numberOfPeriods: 0,
      totalDurationSeconds: 0,
      dynamicFeeEnabled: false,
      partnerPermanentLockPercentage: 100,
      creatorPermanentLockPercentage: 0,
    },
  },
  {
    id: "anti-sniper-max",
    name: "Anti-Sniper Extreme",
    tagline: "99% fee cliff to completely vaporize bot extractors",
    description: "2-segment steep curve with a punishing 99% initial fee dropping aggressively in 30 seconds. Zero MEV bot tolerance.",
    badge: "MEV Shield",
    config: {
      segments: 2,
      sqrtPriceCheckpoints: [0.000000001, 0.00000001, 0.000001],
      liquidityWeights: [3, 1],
      feeMode: "ExponentialDecay",
      startingFeeBps: 9900,
      endingFeeBps: 100,
      numberOfPeriods: 30,
      totalDurationSeconds: 30,
      dynamicFeeEnabled: true,
      partnerPermanentLockPercentage: 100,
      creatorPermanentLockPercentage: 0,
    },
  },
  {
    id: "xstocks-equity-paired",
    name: "Tokenized Equity (xStocks / RWA)",
    tagline: "Engineered for price discovery on thinly traded stock pairs",
    description: "Meteora-tuned curve for tokenized equities (e.g. NVDAx, AAPLx, Ondo RFQ). Features tight sqrt-price corridors, 0.3% low volatility fee, and deep initial active bin liquidity.",
    badge: "Stocks / RWA",
    config: {
      segments: 3,
      sqrtPriceCheckpoints: [0.001, 0.00105, 0.0012, 0.0015],
      liquidityWeights: [4, 2, 1],
      feeMode: "Fixed",
      startingFeeBps: 30,
      endingFeeBps: 30,
      numberOfPeriods: 0,
      totalDurationSeconds: 0,
      dynamicFeeEnabled: true,
      partnerPermanentLockPercentage: 100,
      creatorPermanentLockPercentage: 0,
    },
  },
];
