import { RequestHandler } from 'express';
import { z } from 'zod';
import {
  JoinMatchRequest,
  MatchResponse,
  MatchResultRequest,
  MatchResultResponse,
  MatchHistoryListResponse,
} from '@shared/api';
import {
  createMatch,
  getMatchById,
  updateMatch,
  getUserMatches,
  updateUserStats,
  addMatchToHistory,
  getUserMatchHistory,
  updateDaoPool,
  updateLeaderboard,
  getUserById,
  AuthRequest,
  initializeFirebase,
} from '../lib/firebase';

// Validation schemas
const joinMatchSchema = z.object({
  stake: z.number().min(1, 'Minimum stake is 1 ALGO').max(1000, 'Maximum stake is 1000 ALGO'),
});

const submitMatchResultSchema = z.object({
  matchId: z.string().min(1, 'Match ID is required'),
  playerChoice: z.enum(['rock', 'paper', 'scissors'], {
    errorMap: () => ({ message: 'Invalid choice. Must be rock, paper, or scissors' }),
  }),
  opponentChoice: z.enum(['rock', 'paper', 'scissors']),
});

// In-memory match queue for MVP (will be replaced with Firestore listeners in Phase 2)
const matchQueue: Map<string, any> = new Map();
const CHOICES = ['rock', 'paper', 'scissors'] as const;

// Initialize Firebase on first load
initializeFirebase();

/**
 * Helper: Calculate match winner
 */
function getWinner(playerA: string, playerB: string): 'A' | 'B' | 'draw' {
  if (playerA === playerB) return 'draw';
  if (playerA === 'rock' && playerB === 'scissors') return 'A';
  if (playerA === 'paper' && playerB === 'rock') return 'A';
  if (playerA === 'scissors' && playerB === 'paper') return 'A';
  return 'B';
}

/**
 * Join matchmaking queue
 * POST /api/match/join
 * Body: { stake: number }
 */
export const handleJoinMatch: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Validate input
    const validationResult = joinMatchSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => `${e.message}`).join('; ');
      res.status(400).json({ error: `Validation error: ${errors}` });
      return;
    }

    const { stake } = validationResult.data;

    // Check if user already in queue
    const existingEntry = Array.from(matchQueue.values()).find((entry) => entry.userId === userId);
    if (existingEntry) {
      res.status(400).json({ error: 'Already in matchmaking queue' });
      return;
    }

    // Add to queue
    const queueId = `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    matchQueue.set(queueId, {
      userId,
      stake,
      joinedAt: new Date(),
    });

    // Try to match with someone (mock: match if 2+ entries)
    if (matchQueue.size >= 2) {
      const entries = Array.from(matchQueue.values());
      const playerA = entries[entries.length - 2];
      const playerB = entries[entries.length - 1];

      // Create match in Firestore
      const matchId = `match_${Date.now()}`;
      const matchData = await createMatch({
        id: matchId,
        playerAId: playerA.userId,
        playerBId: playerB.userId,
        stake: Math.min(playerA.stake, playerB.stake),
        status: 'in_progress',
        result: undefined,
      });

      // Remove from queue
      matchQueue.delete(Array.from(matchQueue.keys())[matchQueue.size - 2]);
      matchQueue.delete(Array.from(matchQueue.keys())[matchQueue.size - 1]);

      const response = {
        matched: true,
        matchId,
        message: `Matched with another player!`,
      };

      res.status(201).json(response);
      return;
    }

    // Still in queue
    const queuePosition = matchQueue.size;
    const response = {
      matched: false,
      message: `Added to matchmaking queue. Your position: ${queuePosition}`,
      queuePosition,
    };

    res.json(response);
  } catch (error) {
    console.error('Join match error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Leave matchmaking queue
 * POST /api/match/leave
 */
export const handleLeaveMatch: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Remove from queue
    const queueKeys = Array.from(matchQueue.keys());
    for (const key of queueKeys) {
      if (matchQueue.get(key).userId === userId) {
        matchQueue.delete(key);
        break;
      }
    }

    res.json({ message: 'Left matchmaking queue' });
  } catch (error) {
    console.error('Leave match error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get match details
 * GET /api/match/:matchId
 */
export const handleGetMatch: RequestHandler = async (req, res) => {
  try {
    const matchId = req.params.matchId as string;

    if (!matchId || matchId.trim() === '') {
      res.status(400).json({ error: 'Match ID is required' });
      return;
    }

    const match = await getMatchById(matchId);

    if (!match) {
      res.status(404).json({ error: 'Match not found' });
      return;
    }

    const response: MatchResponse = {
      id: match.id,
      playerAId: match.playerAId,
      playerBId: match.playerBId,
      stake: match.stake,
      status: match.status,
      winner: match.winner,
      result: match.result,
      createdAt: match.createdAt.toISOString(),
      updatedAt: match.updatedAt.toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('Get match error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Submit match result and claim reward
 * POST /api/match/result
 * Body: { matchId, playerChoice, opponentChoice }
 */
export const handleSubmitMatchResult: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Validate input
    const validationResult = submitMatchResultSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => `${e.message}`).join('; ');
      res.status(400).json({ error: `Validation error: ${errors}` });
      return;
    }

    const { matchId, playerChoice, opponentChoice } = validationResult.data;

    // Get match
    const match = await getMatchById(matchId);
    if (!match) {
      res.status(404).json({ error: 'Match not found' });
      return;
    }

    // Verify user is part of this match
    if (match.playerAId !== userId && match.playerBId !== userId) {
      res.status(403).json({ error: 'Not authorized to submit result for this match' });
      return;
    }

    // Determine winner
    const isPlayerA = match.playerAId === userId;
    const winner = getWinner(playerChoice, opponentChoice);
    let winnerReward = 0;
    let daoFee = 0;

    // Calculate rewards
    const totalPool = match.stake * 2; // Both players put in stake
    daoFee = Math.floor(totalPool * 0.1); // 10% to DAO
    winnerReward = totalPool - daoFee; // 90% to winner

    let winnerId: string | undefined = undefined;
    if (winner === 'draw') {
      // In case of draw, split rewards equally (this is simplified; could be no reward in future)
      winnerReward = Math.floor(totalPool / 2);
      winnerId = 'draw';
    } else if ((winner === 'A' && isPlayerA) || (winner === 'B' && !isPlayerA)) {
      winnerId = userId;
    } else {
      winnerId = isPlayerA ? match.playerBId : match.playerAId;
    }

    // Update match in Firestore
    await updateMatch(matchId, {
      status: 'completed',
      winner: winnerId,
      result: {
        playerAChoice: isPlayerA ? playerChoice : opponentChoice,
        playerBChoice: isPlayerA ? opponentChoice : playerChoice,
        winnerReward,
        daoFee,
      },
    });

    // Update user stats
    const currentUser = await getUserById(userId);
    if (currentUser) {
      if (winnerId === userId) {
        // Player won
        await updateUserStats(userId, {
          wins: currentUser.wins + 1,
          totalStaked: currentUser.totalStaked + match.stake,
          totalEarnings: currentUser.totalEarnings + winnerReward,
        });
      } else if (winnerId === 'draw') {
        // Draw
        await updateUserStats(userId, {
          totalStaked: currentUser.totalStaked + match.stake,
          totalEarnings: currentUser.totalEarnings + winnerReward,
        });
      } else {
        // Player lost
        await updateUserStats(userId, {
          losses: currentUser.losses + 1,
          totalStaked: currentUser.totalStaked + match.stake,
        });
      }

      // Update leaderboard
      const updatedUser = await getUserById(userId);
      if (updatedUser) {
        await updateLeaderboard(userId, updatedUser);
      }
    }

    // Update opponent stats
    const opponentId = isPlayerA ? match.playerBId : match.playerAId;
    const opponent = await getUserById(opponentId);
    if (opponent) {
      if (winnerId === opponentId) {
        // Opponent won
        await updateUserStats(opponentId, {
          wins: opponent.wins + 1,
          totalStaked: opponent.totalStaked + match.stake,
          totalEarnings: opponent.totalEarnings + winnerReward,
        });
      } else if (winnerId === 'draw') {
        // Draw
        await updateUserStats(opponentId, {
          totalStaked: opponent.totalStaked + match.stake,
          totalEarnings: opponent.totalEarnings + winnerReward,
        });
      } else {
        // Opponent lost
        await updateUserStats(opponentId, {
          losses: opponent.losses + 1,
          totalStaked: opponent.totalStaked + match.stake,
        });
      }

      // Update leaderboard
      const updatedOpponent = await getUserById(opponentId);
      if (updatedOpponent) {
        await updateLeaderboard(opponentId, updatedOpponent);
      }
    }

    // Add to DAO pool
    await updateDaoPool(daoFee);

    // Add to match history (for both players)
    await addMatchToHistory({
      userId,
      matchId,
      opponent: {
        id: opponentId,
        name: opponent?.name || 'Unknown',
      },
      stake: match.stake,
      result: winnerId === userId ? 'win' : winnerId === 'draw' ? 'draw' : 'loss',
      reward: winnerId === userId ? winnerReward : winnerId === 'draw' ? winnerReward : 0,
      playerChoice,
      opponentChoice,
    });

    const response: MatchResultResponse = {
      matchId,
      winner: winnerId || 'unknown',
      winnerReward,
      daoFee,
    };

    res.json(response);
  } catch (error) {
    console.error('Submit match result error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get match history for a user
 * GET /api/history/:userId?limit=50&page=1
 */
export const handleGetMatchHistory: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.userId as string;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const page = parseInt(req.query.page as string) || 1;

    if (!userId || userId.trim() === '') {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    // Get match history from Firestore
    const history = await getUserMatchHistory(userId, limit);

    const response: MatchHistoryListResponse = {
      matches: history.map((entry) => ({
        id: entry.id,
        opponent: entry.opponent,
        stake: entry.stake,
        result: entry.result,
        reward: entry.reward,
        playerChoice: entry.playerChoice,
        opponentChoice: entry.opponentChoice,
        createdAt: entry.createdAt.toISOString(),
      })),
      total: history.length,
      page,
      pageSize: limit,
    };

    res.json(response);
  } catch (error) {
    console.error('Get match history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
