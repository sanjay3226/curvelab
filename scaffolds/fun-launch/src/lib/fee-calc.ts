import { CurveLabConfig } from "@/types/curve-config";

export interface CurvePoint {
  solRaised: number;
  price: number;
  marketCapSol: number;
  segment: number;
}

export interface FeeDecayPoint {
  timeSeconds: number;
  feePercent: number;
}

/**
 * Computes smooth mathematical bonding curve points for charting.
 */
export function computeCurvePoints(
  cfg: CurveLabConfig,
  numPoints = 80
): CurvePoint[] {
  const points: CurvePoint[] = [];
  const checkpoints = cfg.sqrtPriceCheckpoints;
  const weights = cfg.liquidityWeights;
  const totalWeight = weights.reduce((acc, w) => acc + w, 0) || 1;
  const graduationSol = cfg.graduationThresholdSol || 85;

  const numSegments = Math.min(cfg.segments, checkpoints.length - 1);
  if (numSegments <= 0) return points;

  // Calculate SOL budget allocated per segment based on liquidity weights
  const solPerSegment = weights.slice(0, numSegments).map(
    (w) => (w / totalWeight) * graduationSol
  );

  let cumulativeSol = 0;
  const pointsPerSegment = Math.max(4, Math.floor(numPoints / numSegments));

  for (let i = 0; i < numSegments; i++) {
    const pStart = checkpoints[i];
    const pEnd = checkpoints[i + 1] ?? pStart * 1.5;
    const segmentSol = solPerSegment[i] || graduationSol / numSegments;

    for (let step = 0; step < pointsPerSegment; step++) {
      const frac = step / pointsPerSegment;
      const sol = cumulativeSol + frac * segmentSol;
      // Geometric / power interpolation for realistic bonding curve response
      const price = pStart * Math.pow(pEnd / pStart, frac);
      const marketCapSol = (price * cfg.totalSupply);

      points.push({
        solRaised: Number(sol.toFixed(3)),
        price: Number(price.toPrecision(4)),
        marketCapSol: Number(marketCapSol.toFixed(2)),
        segment: i + 1,
      });
    }
    cumulativeSol += segmentSol;
  }

  // Final graduation point
  const lastPrice = checkpoints[numSegments] ?? checkpoints[checkpoints.length - 1];
  points.push({
    solRaised: Number(graduationSol.toFixed(3)),
    price: Number(lastPrice.toPrecision(4)),
    marketCapSol: Number((lastPrice * cfg.totalSupply).toFixed(2)),
    segment: numSegments,
  });

  return points;
}

/**
 * Computes the fee decay points over time for visualization.
 */
export function computeFeeDecayPoints(
  cfg: CurveLabConfig,
  numPoints = 50
): FeeDecayPoint[] {
  const points: FeeDecayPoint[] = [];
  const startFee = cfg.startingFeeBps / 100; // bps to %
  const endFee = cfg.endingFeeBps / 100;
  const duration = Math.max(10, cfg.totalDurationSeconds || 60);

  if (cfg.feeMode === "Fixed") {
    points.push({ timeSeconds: 0, feePercent: startFee });
    points.push({ timeSeconds: duration, feePercent: startFee });
    return points;
  }

  for (let i = 0; i <= numPoints; i++) {
    const t = (i / numPoints) * duration;
    let fee: number;

    if (cfg.feeMode === "LinearDecay") {
      const periods = Math.max(1, cfg.numberOfPeriods);
      const periodDuration = duration / periods;
      const currentPeriod = Math.min(periods, Math.floor(t / periodDuration));
      fee = startFee - ((startFee - endFee) * currentPeriod) / periods;
    } else {
      // ExponentialDecay
      const decayConstant = 4.5 / duration; // reaches ~99% of endFee at duration
      fee = endFee + (startFee - endFee) * Math.exp(-decayConstant * t);
    }

    points.push({
      timeSeconds: Math.round(t),
      feePercent: Number(Math.max(endFee, fee).toFixed(2)),
    });
  }

  return points;
}

export interface SegmentAnalytics {
  segmentIndex: number;
  startPrice: number;
  endPrice: number;
  multiplier: number;
  weight: number;
  solRequired: number;
  cumulativeSol: number;
  tokenAllocationPercent: number;
}

/**
 * Computes granular financial metrics per curve segment for transparency.
 */
export function computeSegmentAnalytics(cfg: CurveLabConfig): SegmentAnalytics[] {
  const analytics: SegmentAnalytics[] = [];
  const checkpoints = cfg.sqrtPriceCheckpoints;
  const weights = cfg.liquidityWeights;
  const totalWeight = weights.reduce((acc, w) => acc + w, 0) || 1;
  const graduationSol = cfg.graduationThresholdSol || 85;
  const numSegments = Math.min(cfg.segments, checkpoints.length - 1);

  let cumulativeSol = 0;
  for (let i = 0; i < numSegments; i++) {
    const startPrice = checkpoints[i] || 0.000000001;
    const endPrice = checkpoints[i + 1] ?? startPrice * 1.5;
    const weight = weights[i] || 1;
    const solRequired = (weight / totalWeight) * graduationSol;
    cumulativeSol += solRequired;
    const multiplier = endPrice / startPrice;
    const tokenAllocationPercent = Number(((weight / totalWeight) * 100).toFixed(1));

    analytics.push({
      segmentIndex: i + 1,
      startPrice,
      endPrice,
      multiplier: Number(multiplier.toFixed(2)),
      weight,
      solRequired: Number(solRequired.toFixed(2)),
      cumulativeSol: Number(cumulativeSol.toFixed(2)),
      tokenAllocationPercent,
    });
  }

  return analytics;
}

export interface SwapQuoteResult {
  currentPrice: number;
  postPrice: number;
  priceImpactPercent: number;
  feePercent: number;
  feePaidSol: number;
  netSol: number;
  effectivePrice: number;
  tokensReceived: number;
}

/**
 * Calculates realistic bonding curve price impact, fee, and tokens received.
 */
export function computeSwapQuote(
  cfg: CurveLabConfig,
  currentSolRaised: number,
  tradeAmountSol: number,
  isBuy: boolean
): SwapQuoteResult {
  const checkpoints = cfg.sqrtPriceCheckpoints;
  const graduationSol = cfg.graduationThresholdSol || 85;
  const startPrice = checkpoints[0] || 0.000000001;
  const maxPrice = checkpoints[checkpoints.length - 1] || startPrice * 10;

  // Position along the curve [0, 1]
  const currentRatio = Math.min(1, Math.max(0, currentSolRaised / graduationSol));
  const currentPrice = startPrice * Math.pow(maxPrice / startPrice, currentRatio);

  const postSol = isBuy
    ? Math.min(graduationSol * 1.5, currentSolRaised + tradeAmountSol)
    : Math.max(0, currentSolRaised - tradeAmountSol);
  const postRatio = Math.min(1, Math.max(0, postSol / graduationSol));
  const postPrice = startPrice * Math.pow(maxPrice / startPrice, postRatio);

  const priceImpactPercent =
    currentPrice > 0 ? ((postPrice - currentPrice) / currentPrice) * 100 : 0;

  const feePercent = cfg.startingFeeBps / 100;
  const feePaidSol = tradeAmountSol * (feePercent / 100);
  const netSol = Math.max(0, tradeAmountSol - feePaidSol);

  const effectivePrice = Math.sqrt(currentPrice * postPrice);
  const tokensReceived = effectivePrice > 0 ? Math.floor(netSol / effectivePrice) : 0;

  return {
    currentPrice,
    postPrice,
    priceImpactPercent: Number(priceImpactPercent.toFixed(2)),
    feePercent: Number(feePercent.toFixed(2)),
    feePaidSol: Number(feePaidSol.toFixed(4)),
    netSol: Number(netSol.toFixed(4)),
    effectivePrice,
    tokensReceived,
  };
}

