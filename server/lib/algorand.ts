import algosdk from 'algosdk';

// Initialize Algorand client
const ALGO_SERVER = process.env.ALGO_SERVER || 'https://testnet-algorand.api.purestake.io/ps2';
const ALGO_INDEXER = process.env.ALGO_INDEXER || 'https://testnet-algorand.api.purestake.io/idx2';
const ALGO_TOKEN = process.env.ALGO_TOKEN || '';

let algodClient: algosdk.Algodv2 | null = null;
let indexerClient: algosdk.Indexer | null = null;

/**
 * Get or initialize Algod client
 */
export function getAlgodClient(): algosdk.Algodv2 {
  if (!algodClient) {
    algodClient = new algosdk.Algodv2(ALGO_TOKEN, ALGO_SERVER, 443);
  }
  return algodClient;
}

/**
 * Get or initialize Indexer client
 */
export function getIndexerClient(): algosdk.Indexer {
  if (!indexerClient) {
    indexerClient = new algosdk.Indexer(ALGO_TOKEN, ALGO_INDEXER, 443);
  }
  return indexerClient;
}

/**
 * Get account information
 */
export async function getAccountInfo(address: string): Promise<any> {
  const client = getAlgodClient();
  return client.accountInformation(address).do();
}

/**
 * Get account balance in ALGO
 */
export async function getAccountBalance(address: string): Promise<number> {
  try {
    const info = await getAccountInfo(address);
    return info.amount / 1_000_000; // Convert microAlgos to ALGO
  } catch (error) {
    console.error('Error getting account balance:', error);
    return 0;
  }
}

/**
 * Build stake deposit transaction
 * Player sends stake to escrow account
 */
export async function buildStakeTransaction(
  playerAddress: string,
  escrowAddress: string,
  stakeAmount: number,
  matchId: string
): Promise<algosdk.Transaction> {
  const client = getAlgodClient();
  const suggestedParams = await client.getTransactionParams().do();

  // Convert ALGO to microAlgos
  const amountMicroAlgos = Math.floor(stakeAmount * 1_000_000);

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: playerAddress,
    to: escrowAddress,
    amount: amountMicroAlgos,
    note: `algobattle:stake:${matchId}`,
    suggestedParams,
  });

  return txn;
}

/**
 * Build winner payout transaction
 * Sends winner amount from escrow to winner
 */
export async function buildPayoutTransaction(
  escrowAddress: string,
  winnerAddress: string,
  payoutAmount: number,
  matchId: string
): Promise<algosdk.Transaction> {
  const client = getAlgodClient();
  const suggestedParams = await client.getTransactionParams().do();

  // Convert ALGO to microAlgos
  const amountMicroAlgos = Math.floor(payoutAmount * 1_000_000);

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: escrowAddress,
    to: winnerAddress,
    amount: amountMicroAlgos,
    note: `algobattle:payout:${matchId}`,
    suggestedParams,
  });

  return txn;
}

/**
 * Build DAO fee transaction
 * Sends 10% fee from escrow to DAO
 */
export async function buildDaoFeeTransaction(
  escrowAddress: string,
  daoAddress: string,
  feeAmount: number,
  matchId: string
): Promise<algosdk.Transaction> {
  const client = getAlgodClient();
  const suggestedParams = await client.getTransactionParams().do();

  // Convert ALGO to microAlgos
  const amountMicroAlgos = Math.floor(feeAmount * 1_000_000);

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: escrowAddress,
    to: daoAddress,
    amount: amountMicroAlgos,
    note: `algobattle:dao_fee:${matchId}`,
    suggestedParams,
  });

  return txn;
}

/**
 * Build atomic transaction group for match payout
 * Group: [player stake] or [winner payout + dao fee]
 */
export async function buildMatchTransactionGroup(
  matchId: string,
  playerAAddress: string,
  playerBAddress: string,
  escrowAddress: string,
  daoAddress: string,
  stake: number,
  winner: string // 'A', 'B', or 'draw'
): Promise<algosdk.Transaction[]> {
  const payout = stake * 0.9;
  const daoFee = stake * 0.1;

  const txns: algosdk.Transaction[] = [];

  if (winner === 'A') {
    // Player A wins: payout to A + dao fee
    txns.push(await buildPayoutTransaction(escrowAddress, playerAAddress, payout, matchId));
    txns.push(await buildDaoFeeTransaction(escrowAddress, daoAddress, daoFee, matchId));
  } else if (winner === 'B') {
    // Player B wins: payout to B + dao fee
    txns.push(await buildPayoutTransaction(escrowAddress, playerBAddress, payout, matchId));
    txns.push(await buildDaoFeeTransaction(escrowAddress, daoAddress, daoFee, matchId));
  } else {
    // Draw: split stakes + dao fee
    const drawPayout = stake / 2;
    txns.push(await buildPayoutTransaction(escrowAddress, playerAAddress, drawPayout, matchId));
    txns.push(await buildPayoutTransaction(escrowAddress, playerBAddress, drawPayout, matchId));
    txns.push(await buildDaoFeeTransaction(escrowAddress, daoAddress, daoFee, matchId));
  }

  // Group transactions
  const client = getAlgodClient();
  const suggestedParams = await client.getTransactionParams().do();
  const groupID = algosdk.computeGroupID(txns as algosdk.Transaction[]);

  return txns.map((txn) => {
    const t = algosdk.transaction.from(txn);
    t.group = groupID;
    return t;
  });
}

/**
 * Verify signed transaction signature
 */
export function verifyTransaction(
  txn: algosdk.Transaction,
  signature: Uint8Array,
  publicKey: string
): boolean {
  try {
    const pk = algosdk.decodeAddress(publicKey);
    return algosdk.verifyBytes(algosdk.encodeObj(txn), signature, pk.publicKey);
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return false;
  }
}

/**
 * Mint NFT badge (ASA transfer to player)
 */
export async function mintBadge(
  playerAddress: string,
  badgeAsaId: number,
  managerAddress: string
): Promise<string> {
  try {
    const client = getAlgodClient();
    const suggestedParams = await client.getTransactionParams().do();

    // Transfer badge ASA from manager to player
    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: managerAddress,
      to: playerAddress,
      assetIndex: badgeAsaId,
      amount: 1, // Send 1 badge
      suggestedParams,
    });

    // In production: sign with manager's private key and send
    // For now: return mock transaction ID
    console.log('Badge mint transaction:', { playerAddress, badgeAsaId });
    return `badge-txn-${Date.now()}`;
  } catch (error) {
    console.error('Error minting badge:', error);
    throw error;
  }
}

/**
 * Get ASA information
 */
export async function getAssetInfo(assetId: number): Promise<any> {
  const indexer = getIndexerClient();
  return indexer.lookupAssetByID(assetId).do();
}

/**
 * Get player's ASA balance (for checking if they have badge)
 */
export async function getAssetBalance(
  address: string,
  assetId: number
): Promise<number> {
  try {
    const info = await getAccountInfo(address);
    const asset = info.assets.find((a: any) => a['asset-id'] === assetId);
    return asset ? asset.amount : 0;
  } catch (error) {
    console.error('Error getting asset balance:', error);
    return 0;
  }
}

/**
 * Submit transaction to blockchain
 */
export async function submitTransaction(txn: algosdk.Transaction): Promise<string> {
  try {
    const client = getAlgodClient();
    const txId = await client.sendRawTransaction(algosdk.encodeObj(txn)).do();
    console.log('Transaction submitted:', txId);
    return txId.txId;
  } catch (error) {
    console.error('Error submitting transaction:', error);
    throw error;
  }
}

/**
 * Wait for transaction confirmation
 */
export async function waitForConfirmation(
  txId: string,
  timeout: number = 30
): Promise<any> {
  try {
    const client = getAlgodClient();
    const startTime = Date.now();

    while (Date.now() - startTime < timeout * 1000) {
      const info = await client.pendingTransactionInformation(txId).do();
      if (info['confirmed-round']) {
        return info;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    throw new Error('Transaction confirmation timeout');
  } catch (error) {
    console.error('Error waiting for confirmation:', error);
    throw error;
  }
}

/**
 * Get transaction details
 */
export async function getTransactionInfo(txId: string): Promise<any> {
  const indexer = getIndexerClient();
  return indexer.lookupTransactionByID(txId).do();
}

/**
 * Check if testnet is accessible
 */
export async function checkTestnetConnection(): Promise<boolean> {
  try {
    const client = getAlgodClient();
    const status = await client.status().do();
    return status['last-round'] > 0;
  } catch (error) {
    console.error('Testnet connection failed:', error);
    return false;
  }
}
