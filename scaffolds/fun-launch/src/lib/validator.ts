import { CurveLabConfig } from "@/types/curve-config";

export interface ValidationIssue {
  severity: "error" | "warning" | "success";
  title: string;
  detail: string;
}

export interface ValidationSummary {
  isValid: boolean;
  score: number; // 0 - 100
  botResistance: "Ultra High (MEV Immune)" | "Strong" | "Moderate" | "Vulnerable";
  issues: ValidationIssue[];
}

/**
 * Forensically audits the DBC curve configuration before deployment.
 * Prevents on-chain Anchor reverts and ensures optimal market mechanics.
 */
export function validateCurveConfig(cfg: CurveLabConfig): ValidationSummary {
  const issues: ValidationIssue[] = [];
  let score = 0;
  let hasFatalError = false;

  // 1. Checkpoint Monotonicity
  let isMonotonic = true;
  for (let i = 0; i < cfg.sqrtPriceCheckpoints.length - 1; i++) {
    if (cfg.sqrtPriceCheckpoints[i] >= cfg.sqrtPriceCheckpoints[i + 1]) {
      isMonotonic = false;
      break;
    }
  }

  if (!isMonotonic) {
    hasFatalError = true;
    issues.push({
      severity: "error",
      title: "Non-Ascending Checkpoints",
      detail:
        "Every checkpoint price must strictly exceed the previous one (P[i] < P[i+1]) to avoid flat zero-liquidity or inverted price bounds.",
    });
  } else {
    score += 35;
    issues.push({
      severity: "success",
      title: "Price Monotonicity Verified",
      detail: `All ${cfg.sqrtPriceCheckpoints.length} price checkpoints strictly ascend from ${cfg.sqrtPriceCheckpoints[0]?.toExponential(2)} to ${cfg.sqrtPriceCheckpoints[cfg.sqrtPriceCheckpoints.length - 1]?.toExponential(2)} SOL.`,
    });
  }

  // 2. Segment & Weight Alignment
  const expectedCheckpoints = cfg.segments + 1;
  const hasExactCheckpoints = cfg.sqrtPriceCheckpoints.length === expectedCheckpoints;
  const hasExactWeights = cfg.liquidityWeights.length === cfg.segments;

  if (!hasExactCheckpoints || !hasExactWeights) {
    hasFatalError = true;
    issues.push({
      severity: "error",
      title: "Segment Array Mismatch",
      detail: `${cfg.segments} segments requires exactly ${expectedCheckpoints} checkpoints (found ${cfg.sqrtPriceCheckpoints.length}) and ${cfg.segments} weights (found ${cfg.liquidityWeights.length}).`,
    });
  } else {
    score += 15;
    issues.push({
      severity: "success",
      title: "Segment Geometry Aligned",
      detail: `${cfg.segments} discrete curve segments with valid liquidity weight partitioning.`,
    });
  }

  // 3. Liquidity Lock & Rug-Pull Immunity
  const totalPermanentLock =
    cfg.partnerPermanentLockPercentage + cfg.creatorPermanentLockPercentage;

  if (totalPermanentLock > 100) {
    hasFatalError = true;
    issues.push({
      severity: "error",
      title: "Lock Exceeds 100%",
      detail: `Combined permanent lock (${totalPermanentLock}%) exceeds 100% total pool liquidity.`,
    });
  } else if (totalPermanentLock < 10) {
    score += 5;
    issues.push({
      severity: "warning",
      title: "Low Permanent Lock (<10%)",
      detail:
        "Meteora protocols mandate at least 10% permanent liquidity lock post-migration to prevent post-graduation liquidity withdrawal.",
    });
  } else if (totalPermanentLock === 100) {
    score += 25;
    issues.push({
      severity: "success",
      title: "100% Rug-Pull Immune",
      detail:
        "100% of migrated LP liquidity is permanently locked into the Meteora Partner Vault. Zero withdrawal vulnerability.",
    });
  } else {
    score += 15;
    issues.push({
      severity: "success",
      title: "Permanent Lock Active",
      detail: `${totalPermanentLock}% permanently locked, ${100 - totalPermanentLock}% unlocked post-migration.`,
    });
  }

  // 4. Anti-Sniper Fee Schedule Assessment
  if (cfg.feeMode === "ExponentialDecay" || cfg.feeMode === "LinearDecay") {
    if (cfg.startingFeeBps < cfg.endingFeeBps) {
      hasFatalError = true;
      issues.push({
        severity: "error",
        title: "Inverted Fee Decay",
        detail: "Starting fee cannot be lower than terminal fee in a decaying schedule.",
      });
    } else if (cfg.totalDurationSeconds <= 0) {
      hasFatalError = true;
      issues.push({
        severity: "error",
        title: "Zero Decay Duration",
        detail: "Decay duration must be greater than 0 seconds.",
      });
    } else {
      if (cfg.startingFeeBps >= 8000) {
        score += 20;
        issues.push({
          severity: "success",
          title: "Max Anti-Sniper Shield",
          detail: `${(cfg.startingFeeBps / 100).toFixed(0)}% initial fee with ${cfg.feeMode} decay completely neutralizes block-0 MEV snipers.`,
        });
      } else {
        score += 12;
        issues.push({
          severity: "success",
          title: "Fee Decay Configured",
          detail: `${(cfg.startingFeeBps / 100).toFixed(1)}% decaying to ${(cfg.endingFeeBps / 100).toFixed(2)}% over ${cfg.totalDurationSeconds}s.`,
        });
      }
    }
  } else {
    // Fixed fee
    if (cfg.startingFeeBps < 100) {
      score += 5;
      issues.push({
        severity: "warning",
        title: "Sub-1% Fixed Fee",
        detail: "Low fixed fees leave new launches open to front-running bots in the first 5 blocks.",
      });
    } else {
      score += 12;
      issues.push({
        severity: "success",
        title: "Fixed Fee Configured",
        detail: `Constant ${(cfg.startingFeeBps / 100).toFixed(2)}% fee applied across all swaps.`,
      });
    }
  }

  // 5. Dynamic Fee Mode
  if (cfg.dynamicFeeEnabled) {
    score += 5;
    issues.push({
      severity: "success",
      title: "Dynamic Volatility Fee Active",
      detail: "Meteora dynamic fee engine will automatically widen fees during extreme volatility spikes.",
    });
  }

  // Determine Bot Resistance Classification
  let botResistance: ValidationSummary["botResistance"] = "Vulnerable";
  if (cfg.feeMode === "ExponentialDecay" && cfg.startingFeeBps >= 8000) {
    botResistance = "Ultra High (MEV Immune)";
  } else if (cfg.startingFeeBps >= 5000 || (cfg.feeMode === "LinearDecay" && cfg.startingFeeBps >= 3000)) {
    botResistance = "Strong";
  } else if (cfg.startingFeeBps >= 1000) {
    botResistance = "Moderate";
  }

  return {
    isValid: !hasFatalError,
    score: Math.min(100, Math.max(0, score)),
    botResistance,
    issues,
  };
}
