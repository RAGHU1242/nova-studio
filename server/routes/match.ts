import { RequestHandler } from "express";
import { JoinMatchRequest, MatchResponse, MatchHistoryListResponse } from "@shared/api";
import { AuthRequest } from "../middleware/auth";

// Mock match storage
const matchQueue: Map<string, any> = new Map();
const matches: Map<string, any> = new Map();

const CHOICES = ["rock", "paper", "scissors"] as const;

function getWinner(playerA: string, playerB: string): string | "draw" {
  if (playerA === playerB) return "draw";
  if (playerA === "rock" && playerB === "scissors") return "A";
  if (playerA === "paper" && playerB === "rock") return "A";
  if (playerA === "scissors" && playerB === "paper") return "A";
  return "B";
}

/**
 * Join matchmaking queue
 */
export const handleJoinMatch: RequestHandler = (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { stake } = req.body as JoinMatchRequest;

    // Validation
    if (!stake || stake < 1 || stake > 1000) {
      res.status(400).json({ error: "Stake must be between 1 and 1000 ALGO" });
      return;
    }

    // Check if user already in queue
    const existingEntry = Array.from(matchQueue.values()).find((entry) => entry.userId === userId);
    if (existingEntry) {
      res.status(400).json({ error: "Already in matchmaking queue" });
      return;
    }

    // Add to queue
    const queueId = `queue_${Date.now()}`;
    matchQueue.set(queueId, {
      userId,
      stake,
      joinedAt: new Date(),
    });

    // Try to match with someone (for now, mock a successful match after 2 entries)
    if (matchQueue.size >= 2) {
      const entries = Array.from(matchQueue.values());
      const playerA = entries[entries.length - 2];
      const playerB = entries[entries.length - 1];

      // Create match
      const matchId = `match_${Date.now()}`;
      matches.set(matchId, {
        id: matchId,
        playerAId: playerA.userId,
        playerBId: playerB.userId,
        stake: Math.min(playerA.stake, playerB.stake),
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Remove from queue
      matchQueue.delete(entries[entries.length - 2]);
      matchQueue.delete(entries[entries.length - 1]);

      res.status(201).json({
        matched: true,
        matchId,
        message: `Matched with another player!`,
      });
      return;
    }

    res.status(202).json({
      matched: false,
      message: "Added to matchmaking queue. Waiting for opponent...",
      queuePosition: matchQueue.size,
    });
  } catch (error) {
    console.error("Join match error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Leave matchmaking queue
 */
export const handleLeaveMatch: RequestHandler = (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Find and remove from queue
    let found = false;
    for (const [queueId, entry] of matchQueue.entries()) {
      if (entry.userId === userId) {
        matchQueue.delete(queueId);
        found = true;
        break;
      }
    }

    if (!found) {
      res.status(404).json({ error: "Not in matchmaking queue" });
      return;
    }

    res.json({ message: "Left matchmaking queue" });
  } catch (error) {
    console.error("Leave match error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get match details
 */
export const handleGetMatch: RequestHandler = (req, res) => {
  try {
    const matchId = req.params.matchId as string;

    const match = matches.get(matchId);

    if (!match) {
      res.status(404).json({ error: "Match not found" });
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
    console.error("Get match error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Submit match result (both players' choices and calculate winner)
 */
export const handleSubmitMatchResult: RequestHandler = (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId;
    const { matchId, playerChoice } = req.body;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!matchId || !playerChoice) {
      res.status(400).json({ error: "Missing matchId or playerChoice" });
      return;
    }

    if (!CHOICES.includes(playerChoice as any)) {
      res.status(400).json({ error: "Invalid choice. Must be rock, paper, or scissors" });
      return;
    }

    const match = matches.get(matchId);

    if (!match) {
      res.status(404).json({ error: "Match not found" });
      return;
    }

    // Check if user is part of this match
    const isPlayerA = match.playerAId === userId;
    const isPlayerB = match.playerBId === userId;

    if (!isPlayerA && !isPlayerB) {
      res.status(403).json({ error: "You are not part of this match" });
      return;
    }

    // Store choice (mock - in reality would be commit-reveal pattern)
    if (isPlayerA) {
      match.playerAChoice = playerChoice;
    } else {
      match.playerBChoice = playerChoice;
    }

    // If both have chosen, calculate result
    if (match.playerAChoice && match.playerBChoice) {
      const winner = getWinner(match.playerAChoice, match.playerBChoice);
      match.status = "completed";
      match.winner = winner === "draw" ? undefined : winner === "A" ? match.playerAId : match.playerBId;
      match.result = {
        playerAChoice: match.playerAChoice,
        playerBChoice: match.playerBChoice,
        winnerReward: winner === "draw" ? 0 : Math.round(match.stake * 0.9),
        daoFee: winner === "draw" ? 0 : Math.round(match.stake * 0.1),
      };
      match.updatedAt = new Date();

      res.json({
        matchId,
        winner: match.winner || "draw",
        winnerReward: match.result.winnerReward,
        daoFee: match.result.daoFee,
      });
    } else {
      res.status(202).json({
        matchId,
        message: "Choice submitted. Waiting for opponent...",
      });
    }
  } catch (error) {
    console.error("Submit match result error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get match history for a user
 */
export const handleGetMatchHistory: RequestHandler = (req, res) => {
  try {
    const userId = req.params.userId as string;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const userMatches = Array.from(matches.values())
      .filter(
        (match) =>
          (match.playerAId === userId || match.playerBId === userId) &&
          match.status === "completed"
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = userMatches.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedMatches = userMatches.slice(start, end);

    const response: MatchHistoryListResponse = {
      matches: paginatedMatches.map((match) => {
        const isPlayerA = match.playerAId === userId;
        const opponentId = isPlayerA ? match.playerBId : match.playerAId;
        const playerChoice = isPlayerA ? match.result?.playerAChoice : match.result?.playerBChoice;
        const opponentChoice = isPlayerA
          ? match.result?.playerBChoice
          : match.result?.playerAChoice;

        return {
          id: match.id,
          opponent: {
            id: opponentId,
            name: `Player_${opponentId.slice(0, 6)}`,
          },
          stake: match.stake,
          result: match.winner === userId ? "win" : match.winner ? "loss" : "draw",
          reward: match.winner === userId ? match.result?.winnerReward : 0,
          playerChoice: playerChoice || "",
          opponentChoice: opponentChoice || "",
          createdAt: match.createdAt.toISOString(),
        };
      }),
      total,
      page,
      pageSize,
    };

    res.json(response);
  } catch (error) {
    console.error("Get match history error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
