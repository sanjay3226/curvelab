import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import { NATIVE_MINT } from "@solana/spl-token";
import {
  DynamicBondingCurveClient,
  deriveDbcPoolAddress,
} from "@meteora-ag/dynamic-bonding-curve-sdk";
import { buildSDKCurveConfig } from "./curve-builder";
import { CurveLabConfig } from "@/types/curve-config";

export function getDBCClient(connection: Connection): DynamicBondingCurveClient {
  return new DynamicBondingCurveClient(connection, "confirmed");
}

export interface DeployConfigResult {
  configPublicKey: string;
  transaction: Transaction;
  configKeypair: Keypair;
}

export async function prepareCreateConfigTx(
  client: DynamicBondingCurveClient,
  userWallet: PublicKey,
  config: CurveLabConfig,
  quoteMint: PublicKey = NATIVE_MINT
): Promise<DeployConfigResult> {
  const configKeypair = Keypair.generate();
  const sdkCurveConfig = buildSDKCurveConfig(config);

  const tx = await client.partner.createConfig({
    config: configKeypair.publicKey,
    quoteMint,
    feeClaimer: userWallet,
    leftoverReceiver: userWallet,
    payer: userWallet,
    ...sdkCurveConfig,
  });

  return {
    configPublicKey: configKeypair.publicKey.toBase58(),
    transaction: tx,
    configKeypair,
  };
}

export interface LaunchPoolResult {
  poolAddress: string;
  baseMint: string;
  transaction: Transaction;
  baseMintKeypair: Keypair;
}

export async function prepareCreatePoolTx(
  client: DynamicBondingCurveClient,
  userWallet: PublicKey,
  configKey: PublicKey,
  name: string,
  symbol: string,
  uri: string,
  quoteMint: PublicKey = NATIVE_MINT
): Promise<LaunchPoolResult> {
  const baseMintKeypair = Keypair.generate();

  const tx = await client.creator.createPool({
    config: configKey,
    baseMint: baseMintKeypair.publicKey,
    name,
    symbol,
    uri,
    payer: userWallet,
    poolCreator: userWallet,
  });

  const poolAddress = deriveDbcPoolAddress(
    quoteMint,
    baseMintKeypair.publicKey,
    configKey
  );

  return {
    poolAddress: poolAddress.toBase58(),
    baseMint: baseMintKeypair.publicKey.toBase58(),
    transaction: tx,
    baseMintKeypair,
  };
}

export async function fetchLivePoolData(
  client: DynamicBondingCurveClient,
  poolPublicKey: PublicKey
) {
  try {
    const [poolState, quoteProgress] = await Promise.all([
      client.state.getPool(poolPublicKey),
      client.state.getPoolQuoteTokenCurveProgress(poolPublicKey).catch(() => 0),
    ]);
    return {
      poolState,
      quoteProgress,
    };
  } catch (error) {
    console.error("Failed to fetch pool state:", error);
    return null;
  }
}
