import { RequestHandler } from 'express';
import { LeaderboardListResponse } from '@shared/api';
import { getLeaderboard, getUserRank, initializeFirebase } from '../lib/firebase';

// Initialize Firebase on first load
initializeFirebase();

/**
 * Get leaderboard with pagination
 * GET /api/leaderboard?page=1&pageSize=10&search=name
 */
export const handleGetLeaderboard: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const searchQuery = (req.query.search as string)?.toLowerCase() || '';

    // Validate pagination parameters
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      res.status(400).json({ error: 'Invalid pagination parameters' });
      return;
    }

    // Calculate offset
    const offset = (page - 1) * pageSize;

    // Get leaderboard from Firestore
    let leaderboard = await getLeaderboard(pageSize * page, 0); // Get enough to handle search

    // Filter by search query if provided
    if (searchQuery) {
      leaderboard = leaderboard.filter(
        (entry) =>
          entry.name.toLowerCase().includes(searchQuery) || entry.userId.toLowerCase().includes(searchQuery)
      );
    }

    // Paginate after filtering
    const total = leaderboard.length;
    const paginatedLeaderboard = leaderboard.slice(offset, offset + pageSize);

    const response: LeaderboardListResponse = {
      leaderboard: paginatedLeaderboard.map((entry, index) => ({
        ...entry,
        rank: offset + index + 1,
      })),
      total,
    };

    res.json(response);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get user rank in leaderboard
 * GET /api/leaderboard/:userId
 */
export const handleGetUserRank: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.userId as string;

    if (!userId || userId.trim() === '') {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    // Get user rank from Firestore
    const userRank = await getUserRank(userId);

    if (!userRank) {
      res.status(404).json({ error: 'User not found in leaderboard' });
      return;
    }

    res.json(userRank);
  } catch (error) {
    console.error('Get user rank error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
