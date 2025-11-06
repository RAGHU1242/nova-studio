// AlgoBattle Arena Constants

export const APP_NAME = "AlgoBattle Arena";
export const APP_DESCRIPTION = "Decentralized PvP gaming powered by Algorand";

// Game Constants
export const MIN_STAKE = 1; // 1 ALGO
export const MAX_STAKE = 1000; // 1000 ALGO
export const REWARD_SPLIT = {
  WINNER: 0.9, // 90% to winner
  DAO_POOL: 0.1, // 10% to DAO
};

// Game Options
export const GAME_CHOICES = {
  ROCK: "rock",
  PAPER: "paper",
  SCISSORS: "scissors",
} as const;

export const CHOICE_EMOJI = {
  rock: "🪨",
  paper: "📄",
  scissors: "✂️",
} as const;

// Wallet Configuration
export const ALGORAND_TESTNET_ID = "testnet-v1.0";
export const ALGORAND_MAINNET_ID = "mainnet-v1.0";

// Firestore Collections
export const FIRESTORE_COLLECTIONS = {
  PLAYERS: "players",
  MATCHES: "matches",
  LEADERBOARD: "leaderboard",
  DAO_POOL: "dao_pool",
} as const;

// Navigation Links
export const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Battle Arena", path: "/battle" },
  { label: "Leaderboard", path: "/leaderboard" },
] as const;
