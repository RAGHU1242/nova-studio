# Algorand Testnet Setup Guide for AlgoBattle Arena

This guide walks through setting up Algorand testnet infrastructure for AlgoBattle Arena.

## Prerequisites

- Node.js 18+
- Web browser (Chrome, Firefox, Safari, or Edge)
- Internet connection

## Step 1: Install Pera Wallet

1. Visit [Pera Wallet](https://perawallet.app)
2. Install the browser extension for your browser
3. Complete installation and setup

## Step 2: Create Testnet Pera Wallet Account

### Account Creation

1. Open Pera Wallet extension
2. Click "Create New Wallet"
3. Follow the setup wizard
4. **IMPORTANT**: Save your recovery phrase in a secure location (you'll need this if you ever need to restore)
5. Complete the setup

### Network Selection

1. In Pera Wallet, click the network selector (top of the extension)
2. Select "Testnet"
3. Your wallet is now on Algorand Testnet

### Document Your Details

Once created, note down:
- **Wallet Address**: The 58-character address starting with "A" (visible in Pera Wallet)
- **Network**: Testnet

Example format:
```
Wallet Address: XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
Network: Testnet
Created: [Today's Date]
```

## Step 3: Fund Testnet Wallet with Dispenser

1. Visit [Algorand Testnet Dispenser](https://dispenser.testnet.algorand.network)
2. Paste your wallet address in the input field
3. Click "Dispense"
4. Wait for confirmation (usually instant to a few seconds)
5. Check your Pera Wallet - you should see ~10 ALGO

### Request Multiple Times if Needed

The dispenser may have a daily limit. If you need more testnet ALGO:
- Wait a few hours and request again
- Each request provides ~10 ALGO

**Recommended amount for testing**: 50-100 ALGO

## Step 4: Create Algorand SDK Integration

Add the Algorand SDK to the project:

```bash
pnpm add algosdk
```

## Step 5: Create Escrow Smart Contract (TEAL)

See `server/contracts/escrow.teal` for the escrow contract that manages stakes.

## Step 6: Create NFT Badge ASAs

Follow the [ASA Creation Process](#asa-creation-process) below.

### ASA Creation Process

To create Algorand Standard Assets (ASAs) for NFT badges, you can use the Algorand Web Wallet or write a script.

#### Option A: Using Pera Wallet + AlgoExplorer (Manual)

1. Visit [AlgoExplorer Testnet](https://testnet.algoexplorer.io)
2. Connect your Pera Wallet
3. Use a transaction builder to create an ASA

#### Option B: Using Script (Recommended)

```typescript
// Example: Create ASA via script
// This creates a badge ASA on testnet

const algosdk = require('algosdk');

const client = new algosdk.Algodv2(
  '', // token (empty for public)
  'https://testnet-algorand.api.purestake.io/ps2', // server
  443 // port
);

const sender = 'YOUR_WALLET_ADDRESS';
const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
  from: sender,
  assetName: 'AlgoBattle 10-Win Badge',
  unitName: 'BADGE10',
  total: 1000, // Only 1000 badges can ever exist
  decimals: 0,
  defaultFrozen: false,
  manager: sender,
  reserve: sender,
  freeze: sender,
  clawback: sender,
  suggestedParams: await client.getTransactionParams().do(),
});

// Sign and send transaction
// Capture the Asset ID from the result
```

## Step 7: Document ASA IDs

Once you create your three badge ASAs, document them:

```env
# Badge ASA IDs (Testnet)
BADGE_10_WINS_ASA_ID=123456
BADGE_50_WINS_ASA_ID=123457
BADGE_100_WINS_ASA_ID=123458
```

## Step 8: Fund Second Account (DAO/Payout Account)

For testing the payout flow, you may want a second testnet account:

1. Create another Pera Wallet (or use a different browser profile)
2. Fund it with the dispenser (same steps as Step 3)
3. Document this address as the **DAO Account**

Example:
```
DAO Account Address: YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
```

## Environment Variables Setup

Add these to your `.env` file:

```env
# Algorand Configuration
ALGO_NETWORK=testnet
ALGO_SERVER=https://testnet-algorand.api.purestake.io/ps2
ALGO_INDEXER=https://testnet-algorand.api.purestake.io/idx2
ALGO_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # PureStake API token (optional for public endpoints)

# Wallet Addresses
PLAYER_WALLET_ADDRESS=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
DAO_WALLET_ADDRESS=YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY

# Smart Contract IDs
ESCROW_CONTRACT_ID=123456
BADGE_10_WINS_ASA_ID=234567
BADGE_50_WINS_ASA_ID=234568
BADGE_100_WINS_ASA_ID=234569

# Feature Flags
ENABLE_BLOCKCHAIN=true
TESTNET_MODE=true
```

## Verification Checklist

- [ ] Pera Wallet installed and set to Testnet
- [ ] Testnet wallet address documented
- [ ] Received testnet ALGO from dispenser (balance > 0)
- [ ] Have at least 3-4 ALGO to test matches
- [ ] Escrow contract code reviewed (`server/contracts/escrow.teal`)
- [ ] Three NFT badge ASAs created and documented
- [ ] `.env` file updated with all IDs and addresses
- [ ] `algosdk` package installed

## Testing the Setup

Once all steps complete, you can test:

1. **Wallet Connection**: Visit BattleArena page and connect Pera Wallet
2. **Check Balance**: Should show your testnet ALGO balance
3. **Create Transaction**: Submit a match stake (will prompt Pera Wallet signing)
4. **View Transactions**: Check [AlgoExplorer Testnet](https://testnet.algoexplorer.io) for your transactions

## Troubleshooting

### Issue: Pera Wallet not detecting extension

**Solution**: Refresh the page after installing extension, ensure it's enabled in your browser's extension settings.

### Issue: Dispenser returns error

**Solution**: Wait a few minutes, check that you're on testnet (not mainnet), and try again. Some IPs may have rate limits.

### Issue: Not enough ALGO for multiple tests

**Solution**: Request more testnet ALGO from dispenser again, or ask for testnet faucet access.

### Issue: Transaction fails with "insufficient balance"

**Solution**: Ensure your wallet has testnet ALGO. Each transaction costs a minimum fee (1000 microAlgos = 0.001 ALGO). Request more from dispenser.

## Next Steps

Once this setup is complete:

1. Integrate Pera Wallet SDK (`@perawallet/connect`)
2. Implement escrow contract interaction in `server/lib/algorand.ts`
3. Build staking transaction flow in BattleArena
4. Test full match flow with blockchain integration

## Useful Resources

- [Algorand Documentation](https://developer.algorand.org)
- [TEAL Language Guide](https://developer.algorand.org/articles/understanding-smart-contracts)
- [Pera Wallet Docs](https://docs.perawallet.app)
- [Algorand JavaScript SDK](https://github.com/algorand/js-algorand-sdk)
- [AlgoExplorer Testnet](https://testnet.algoexplorer.io)

## Questions?

Refer to the [Algorand Community Forum](https://forum.algorand.org) for questions about the blockchain layer.
