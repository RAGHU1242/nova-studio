import { PeraWalletConnect } from '@perawallet/connect';

// Initialize Pera Wallet
let peraWallet: PeraWalletConnect | null = null;

/**
 * Get or initialize Pera Wallet instance
 */
export function getPeraWallet(): PeraWalletConnect {
  if (!peraWallet) {
    peraWallet = new PeraWalletConnect({
      shouldShowSignTxnToast: true,
    });
  }
  return peraWallet;
}

/**
 * Get connected wallet account address
 */
export async function getConnectedWallet(): Promise<string | null> {
  const wallet = getPeraWallet();
  const accounts = await wallet.connect();
  return accounts && accounts.length > 0 ? accounts[0] : null;
}

/**
 * Disconnect Pera Wallet
 */
export async function disconnectWallet(): Promise<void> {
  const wallet = getPeraWallet();
  await wallet.disconnect();
}

/**
 * Check if wallet is connected
 */
export async function isWalletConnected(): Promise<boolean> {
  try {
    const wallet = getPeraWallet();
    const accounts = await wallet.connect();
    return accounts && accounts.length > 0;
  } catch {
    return false;
  }
}

/**
 * Get wallet account address (cached)
 */
export function getCachedWalletAddress(): string | null {
  const cached = localStorage.getItem('walletAddress');
  return cached || null;
}

/**
 * Cache wallet address locally
 */
export function cacheWalletAddress(address: string): void {
  localStorage.setItem('walletAddress', address);
}

/**
 * Clear cached wallet address
 */
export function clearCachedWalletAddress(): void {
  localStorage.removeItem('walletAddress');
}

/**
 * Get testnet balance for wallet
 */
export async function getWalletBalance(address: string): Promise<number> {
  try {
    const response = await fetch(
      `https://testnet-algorand.api.purestake.io/ps2/v2/accounts/${address}`,
      {
        headers: {
          'X-API-Key': process.env.REACT_APP_ALGO_API_KEY || '',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch balance');
    }

    const data = await response.json();
    // Convert from microAlgos to ALGO
    return data.amount / 1_000_000;
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return 0;
  }
}

/**
 * Sign and send transaction group for match staking
 */
export async function signStakeTransaction(
  walletAddress: string,
  amount: number,
  matchId: string
): Promise<string> {
  try {
    const wallet = getPeraWallet();

    // This will be replaced with actual algosdk transaction building
    // For now, return a mock transaction ID
    console.log('Stake transaction:', { walletAddress, amount, matchId });

    // TODO: Build actual algosdk transaction
    // const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({...})

    // Show wallet signing UI
    await wallet.connect();

    // TODO: Sign transaction
    // const signedTxn = await wallet.signTransactions([txn])

    return `mock-txn-${Date.now()}`;
  } catch (error) {
    console.error('Error signing stake transaction:', error);
    throw error;
  }
}

/**
 * Handle wallet connect button click
 */
export async function handleWalletConnect(): Promise<string | null> {
  try {
    const wallet = getPeraWallet();
    const accounts = await wallet.connect();

    if (accounts && accounts.length > 0) {
      const address = accounts[0];
      cacheWalletAddress(address);
      return address;
    }

    return null;
  } catch (error) {
    console.error('Wallet connection failed:', error);
    throw error;
  }
}

/**
 * Handle wallet disconnect
 */
export async function handleWalletDisconnect(): Promise<void> {
  try {
    await disconnectWallet();
    clearCachedWalletAddress();
  } catch (error) {
    console.error('Wallet disconnection failed:', error);
    throw error;
  }
}
