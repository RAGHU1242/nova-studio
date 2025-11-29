/**
 * Shared types between client and server
 */

// Demo endpoint
export interface DemoResponse {
  message: string;
}

// Auth & User Endpoints
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    walletAddress?: string;
    avatarUrl?: string;
  };
}

export interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
  walletAddress?: string;
  avatarUrl?: string;
  wins: number;
  losses: number;
  totalStaked: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  walletAddress?: string;
  avatarUrl?: string;
}

// Match & Game Endpoints
export interface JoinMatchRequest {
  stake: number;
}

export interface MatchResponse {
  id: string;
  playerAId: string;
  playerBId: string;
  stake: number;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  winner?: string;
  result?: {
    playerAChoice?: string;
    playerBChoice?: string;
    winnerReward?: number;
    daoFee?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MatchResultRequest {
  matchId: string;
  playerChoice: string;
  opponentChoice: string;
}

export interface MatchResultResponse {
  matchId: string;
  winner: string;
  winnerReward: number;
  daoFee: number;
}

// Leaderboard Endpoints
export interface LeaderboardResponse {
  rank: number;
  userId: string;
  name: string;
  wins: number;
  losses: number;
  winRate: number;
  totalEarnings: number;
}

export interface LeaderboardListResponse {
  leaderboard: LeaderboardResponse[];
  total: number;
}

// Match History Endpoints
export interface MatchHistoryResponse {
  id: string;
  opponent: {
    id: string;
    name: string;
    walletAddress?: string;
  };
  stake: number;
  result: "win" | "loss" | "draw";
  reward?: number;
  playerChoice: string;
  opponentChoice: string;
  createdAt: string;
}

export interface MatchHistoryListResponse {
  matches: MatchHistoryResponse[];
  total: number;
  page: number;
  pageSize: number;
}

// Health Check
export interface HealthResponse {
  status: "ok";
  timestamp: string;
  version: string;
}

// Wallet Endpoints (Mock for now)
export interface WalletConnectResponse {
  address: string;
  network: "testnet" | "mainnet";
  balance: number;
}

export interface StakeRequest {
  amount: number;
}

export interface StakeResponse {
  transactionId: string;
  amount: number;
  status: "pending" | "confirmed";
}
