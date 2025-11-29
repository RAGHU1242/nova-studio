import { RequestHandler } from "express";
import { LeaderboardListResponse } from "@shared/api";

// Mock leaderboard data
const mockLeaderboard = [
  { userId: "user_1", name: "CryptoChamp", wins: 48, losses: 8, totalStaked: 5200 },
  { userId: "user_2", name: "AlgoMaster", wins: 42, losses: 10, totalStaked: 4800 },
  { userId: "user_3", name: "BlockBrawler", wins: 38, losses: 11, totalStaked: 4100 },
  { userId: "user_4", name: "DeFiDancer", wins: 35, losses: 12, totalStaked: 3900 },
  { userId: "user_5", name: "TokenTitan", wins: 32, losses: 13, totalStaked: 3600 },
  { userId: "user_6", name: "CodeCrusader", wins: 28, losses: 15, totalStaked: 3200 },
  { userId: "user_7", name: "ChainChief", wins: 25, losses: 16, totalStaked: 2900 },
  { userId: "user_8", name: "Web3Warrior", wins: 22, losses: 18, totalStaked: 2600 },
  { userId: "user_9", name: "DAppsDesigner", wins: 20, losses: 19, totalStaked: 2400 },
  { userId: "user_10", name: "SmartSage", wins: 18, losses: 20, totalStaked: 2100 },
];

/**
 * Get leaderboard with pagination
 */
export const handleGetLeaderboard: RequestHandler = (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const searchQuery = (req.query.search as string)?.toLowerCase() || "";

    let filtered = mockLeaderboard;

    // Filter by search query if provided
    if (searchQuery) {
      filtered = filtered.filter(
        (entry) =>
          entry.name.toLowerCase().includes(searchQuery) ||
          entry.userId.toLowerCase().includes(searchQuery)
      );
    }

    // Calculate pagination
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const leaderboard = filtered.slice(start, end);

    // Map to response format
    const response: LeaderboardListResponse = {
      leaderboard: leaderboard.map((entry, index) => {
        const totalMatches = entry.wins + entry.losses;
        const winRate = totalMatches > 0 ? entry.wins / totalMatches : 0;

        return {
          rank: start + index + 1,
          userId: entry.userId,
          name: entry.name,
          wins: entry.wins,
          losses: entry.losses,
          winRate: Math.round(winRate * 100) / 100,
          totalEarnings: entry.totalStaked,
        };
      }),
      total,
    };

    res.json(response);
  } catch (error) {
    console.error("Get leaderboard error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get user rank (in leaderboard position)
 */
export const handleGetUserRank: RequestHandler = (req, res) => {
  try {
    const userId = req.params.userId as string;

    const userEntry = mockLeaderboard.find((entry) => entry.userId === userId);

    if (!userEntry) {
      res.status(404).json({ error: "User not found in leaderboard" });
      return;
    }

    const rank = mockLeaderboard.indexOf(userEntry) + 1;
    const totalMatches = userEntry.wins + userEntry.losses;
    const winRate = totalMatches > 0 ? userEntry.wins / totalMatches : 0;

    res.json({
      rank,
      userId: userEntry.userId,
      name: userEntry.name,
      wins: userEntry.wins,
      losses: userEntry.losses,
      winRate: Math.round(winRate * 100) / 100,
      totalEarnings: userEntry.totalStaked,
    });
  } catch (error) {
    console.error("Get user rank error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
