import {
  ActivationType,
  BaseFeeMode,
  buildCurveWithCustomSqrtPrices,
  CollectFeeMode,
  ConfigParameters,
  DammV2BaseFeeMode,
  DammV2DynamicFeeMode,
  getSqrtPriceFromPrice,
  MigratedCollectFeeMode,
  MigrationFeeOption,
  MigrationOption,
  TokenAuthorityOption,
  TokenType,
} from "@meteora-ag/dynamic-bonding-curve-sdk";
import { CurveLabConfig } from "@/types/curve-config";

export function buildSDKCurveConfig(cfg: CurveLabConfig): ConfigParameters {
  const tokenBaseDecimal = cfg.tokenDecimals;
  const quote = cfg.quoteAsset ?? cfg.quoteToken ?? "WSOL";
  const tokenQuoteDecimal = quote === "WSOL" ? 9 : 6; // WSOL is 9 decimals, USDC/USDG are 6

  // Convert human-readable price checkpoints into SDK sqrtPrices
  const sqrtPrices = cfg.sqrtPriceCheckpoints.map((p) =>
    getSqrtPriceFromPrice(String(p), tokenBaseDecimal, tokenQuoteDecimal)
  );

  const feeMode =
    cfg.feeMode === "ExponentialDecay"
      ? BaseFeeMode.FeeSchedulerExponential
      : BaseFeeMode.FeeSchedulerLinear;

  const feeSchedulerParam =
    cfg.feeMode === "Fixed"
      ? {
          startingFeeBps: cfg.startingFeeBps,
          endingFeeBps: cfg.startingFeeBps,
          numberOfPeriod: 0,
          totalDuration: 0,
        }
      : {
          startingFeeBps: cfg.startingFeeBps,
          endingFeeBps: cfg.endingFeeBps,
          numberOfPeriod: cfg.numberOfPeriods,
          totalDuration: cfg.totalDurationSeconds,
        };

  return buildCurveWithCustomSqrtPrices({
    token: {
      tokenType:
        cfg.tokenType === "SPL" ? TokenType.SPLToken : TokenType.Token2022,
      tokenBaseDecimal,
      tokenQuoteDecimal,
      tokenAuthorityOption: TokenAuthorityOption.PartnerUpdateAuthority,
      totalTokenSupply: cfg.totalSupply,
      leftover: 1_000,
    },
    fee: {
      baseFeeParams: {
        baseFeeMode: feeMode,
        feeSchedulerParam,
      },
      dynamicFeeEnabled: cfg.dynamicFeeEnabled,
      collectFeeMode: CollectFeeMode.QuoteToken,
      creatorTradingFeePercentage: 0,
      poolCreationFee: 0,
      enableFirstSwapWithMinFee: false,
    },
    migration: {
      migrationOption: MigrationOption.MET_DAMM_V2,
      migrationFeeOption: MigrationFeeOption.Customizable,
      migrationFee: {
        feePercentage: cfg.migrationFeePercentage,
        creatorFeePercentage: cfg.creatorMigrationFeePercentage,
      },
      migratedPoolFee: {
        collectFeeMode: MigratedCollectFeeMode.QuoteToken,
        dynamicFee: DammV2DynamicFeeMode.Enabled,
        poolFeeBps: cfg.migratedPoolFeeBps,
        baseFeeMode: DammV2BaseFeeMode.FeeTimeSchedulerLinear,
      },
    },
    liquidityDistribution: {
      partnerLiquidityPercentage: Math.max(
        0,
        100 - (cfg.partnerPermanentLockPercentage + cfg.creatorPermanentLockPercentage)
      ),
      partnerPermanentLockedLiquidityPercentage:
        cfg.partnerPermanentLockPercentage,
      creatorLiquidityPercentage: 0,
      creatorPermanentLockedLiquidityPercentage:
        cfg.creatorPermanentLockPercentage,
    },
    lockedVesting: {
      totalLockedVestingAmount: 0,
      numberOfVestingPeriod: 0,
      cliffUnlockAmount: 0,
      totalVestingDuration: 0,
      cliffDurationFromMigrationTime: 0,
    },
    activationType: ActivationType.Timestamp,
    sqrtPrices,
    liquidityWeights: cfg.liquidityWeights,
  });
}
