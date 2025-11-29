import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import * as crypto from 'crypto';
import { verifyAccessToken } from '../middleware/auth';
import {
  createMatch,
  updateMatch,
  getUserById,
  updateUserStats,
  updateLeaderboard,
  updateDaoPool,
  addMatchToHistory,
  getMatchById,
} from './firebase';

/**
 * Socket.IO authenticated socket type
 */
export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userName?: string;
}

/**
 * Match room state (in-memory storage)
 */
export interface MatchRoom {
  id: string;
  playerAId: string;
  playerBId: string;
  playerAName: string;
  playerBName: string;
  stake: number;
  status: 'waiting' | 'commit' | 'reveal' | 'completed';
  playerACommit?: string; // hashed choice
  playerBCommit?: string;
  playerAChoice?: string; // revealed choice
  playerBChoice?: string;
  playerAReveal?: string; // reveal hash + salt
  playerBReveal?: string;
  committedAt?: Date;
  revealStartedAt?: Date;
  completedAt?: Date;
  result?: 'A' | 'B' | 'draw';
  winner?: string;
  winnerReward?: number;
  daoFee?: number;
}

/**
 * Matchmaking queue (in-memory)
 */
export interface QueueEntry {
  userId: string;
  userName: string;
  stake: number;
  socketId: string;
  joinedAt: Date;
}

/**
 * Socket.IO configuration and handlers
 */
export class GameServer {
  private io: SocketIOServer;
  private matchQueue: Map<string, QueueEntry> = new Map();
  private matchRooms: Map<string, MatchRoom> = new Map();
  private userSockets: Map<string, string> = new Map(); // userId → socketId
  private commitTimers: Map<string, NodeJS.Timeout> = new Map();
  private revealTimers: Map<string, NodeJS.Timeout> = new Map();

  // Timers (in seconds)
  private readonly COMMIT_TIMEOUT = 30; // 30 seconds to commit choice
  private readonly REVEAL_TIMEOUT = 30; // 30 seconds to reveal choice

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:8080'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  /**
   * Authentication middleware for Socket.IO
   */
  private setupMiddleware() {
    this.io.use((socket: AuthenticatedSocket, next) => {
      try {
        // Get token from handshake auth
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = verifyAccessToken(token);
        if (!decoded) {
          return next(new Error('Authentication error: Invalid token'));
        }

        socket.userId = decoded.userId;
        socket.userName = decoded.name;
        next();
      } catch (error) {
        next(new Error(`Authentication error: ${(error as Error).message}`));
      }
    });
  }

  /**
   * Set up Socket.IO event handlers
   */
  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      const userId = socket.userId!;
      const userName = socket.userName!;

      console.log(`✅ User connected: ${userName} (${userId})`);

      // Map user to socket
      this.userSockets.set(userId, socket.id);

      // Matchmaking events
      socket.on('match:join-queue', (data, callback) => this.handleJoinQueue(socket, data, callback));
      socket.on('match:leave-queue', (data, callback) => this.handleLeaveQueue(socket, callback));
      socket.on('match:commit-choice', (data, callback) => this.handleCommitChoice(socket, data, callback));
      socket.on('match:reveal-choice', (data, callback) => this.handleRevealChoice(socket, data, callback));
      socket.on('match:get-room', (data, callback) => this.handleGetRoom(socket, data, callback));

      // Leaderboard real-time
      socket.on('leaderboard:watch', (data, callback) => this.handleWatchLeaderboard(socket, callback));

      // Connection events
      socket.on('disconnect', () => this.handleDisconnect(socket));
      socket.on('error', (error) => this.handleError(socket, error));
    });
  }

  /**
   * Handle player joining matchmaking queue
   */
  private handleJoinQueue(socket: AuthenticatedSocket, data: { stake: number }, callback: Function) {
    try {
      const userId = socket.userId!;
      const userName = socket.userName!;

      // Validate stake
      if (typeof data.stake !== 'number' || data.stake < 1 || data.stake > 1000) {
        return callback({ error: 'Invalid stake amount (1-1000 ALGO)' });
      }

      // Check if already in queue or match
      if (this.matchQueue.has(userId) || Array.from(this.matchRooms.values()).some(
        (room) => room.playerAId === userId || room.playerBId === userId
      )) {
        return callback({ error: 'Already in queue or match' });
      }

      // Add to queue
      const queueEntry: QueueEntry = {
        userId,
        userName,
        stake: data.stake,
        socketId: socket.id,
        joinedAt: new Date(),
      };

      this.matchQueue.set(userId, queueEntry);

      // Broadcast queue update
      this.io.emit('queue:updated', {
        queueSize: this.matchQueue.size,
        timestamp: new Date(),
      });

      // Try to match
      const matched = this.tryMatchPlayers();

      if (matched) {
        callback({ success: true, message: 'Matched with opponent!' });
      } else {
        const position = Array.from(this.matchQueue.keys()).indexOf(userId) + 1;
        callback({ success: true, message: `Added to queue. Position: ${position}`, queuePosition: position });
      }
    } catch (error) {
      callback({ error: `Failed to join queue: ${(error as Error).message}` });
    }
  }

  /**
   * Handle player leaving queue
   */
  private handleLeaveQueue(socket: AuthenticatedSocket, callback: Function) {
    try {
      const userId = socket.userId!;

      // Remove from queue
      this.matchQueue.delete(userId);

      // Broadcast queue update
      this.io.emit('queue:updated', {
        queueSize: this.matchQueue.size,
        timestamp: new Date(),
      });

      callback({ success: true, message: 'Left queue' });
    } catch (error) {
      callback({ error: `Failed to leave queue: ${(error as Error).message}` });
    }
  }

  /**
   * Attempt to match two players from the queue
   */
  private tryMatchPlayers(): boolean {
    if (this.matchQueue.size < 2) {
      return false;
    }

    const entries = Array.from(this.matchQueue.values());
    const playerA = entries[entries.length - 2];
    const playerB = entries[entries.length - 1];

    // Remove from queue
    this.matchQueue.delete(playerA.userId);
    this.matchQueue.delete(playerB.userId);

    // Create match room
    const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const room: MatchRoom = {
      id: matchId,
      playerAId: playerA.userId,
      playerBId: playerB.userId,
      playerAName: playerA.userName,
      playerBName: playerB.userName,
      stake: Math.min(playerA.stake, playerB.stake),
      status: 'commit',
      committedAt: new Date(),
    };

    this.matchRooms.set(matchId, room);

    // Notify both players
    const socketA = this.io.sockets.sockets.get(playerA.socketId);
    const socketB = this.io.sockets.sockets.get(playerB.socketId);

    if (socketA && socketB) {
      socketA.emit('match:found', {
        matchId,
        opponent: {
          id: playerB.userId,
          name: playerB.userName,
        },
        stake: room.stake,
        timeout: this.COMMIT_TIMEOUT,
      });

      socketB.emit('match:found', {
        matchId,
        opponent: {
          id: playerA.userId,
          name: playerA.userName,
        },
        stake: room.stake,
        timeout: this.COMMIT_TIMEOUT,
      });

      // Set commit timeout
      this.setCommitTimeout(matchId);
    }

    console.log(`✅ Match created: ${matchId} (${playerA.userName} vs ${playerB.userName})`);
    return true;
  }

  /**
   * Handle player committing a choice (hashed)
   */
  private handleCommitChoice(socket: AuthenticatedSocket, data: { matchId: string; commitHash: string }, callback: Function) {
    try {
      const userId = socket.userId!;
      const { matchId, commitHash } = data;

      const room = this.matchRooms.get(matchId);
      if (!room) {
        return callback({ error: 'Match not found' });
      }

      if (room.status !== 'commit') {
        return callback({ error: 'Not in commit phase' });
      }

      // Validate commitment format
      if (!commitHash || typeof commitHash !== 'string' || commitHash.length < 32) {
        return callback({ error: 'Invalid commit hash' });
      }

      // Register commitment
      if (room.playerAId === userId) {
        room.playerACommit = commitHash;
      } else if (room.playerBId === userId) {
        room.playerBCommit = commitHash;
      } else {
        return callback({ error: 'Not part of this match' });
      }

      // Check if both committed
      if (room.playerACommit && room.playerBCommit) {
        room.status = 'reveal';
        room.revealStartedAt = new Date();

        // Clear commit timeout
        const commitTimer = this.commitTimers.get(matchId);
        if (commitTimer) clearTimeout(commitTimer);

        // Notify both players
        const socketA = this.io.sockets.sockets.get(this.userSockets.get(room.playerAId)!);
        const socketB = this.io.sockets.sockets.get(this.userSockets.get(room.playerBId)!);

        if (socketA) socketA.emit('match:reveal-phase', { timeout: this.REVEAL_TIMEOUT });
        if (socketB) socketB.emit('match:reveal-phase', { timeout: this.REVEAL_TIMEOUT });

        // Set reveal timeout
        this.setRevealTimeout(matchId);
      }

      callback({ success: true, message: 'Commitment registered' });
    } catch (error) {
      callback({ error: `Failed to commit: ${(error as Error).message}` });
    }
  }

  /**
   * Handle player revealing choice
   */
  private async handleRevealChoice(socket: AuthenticatedSocket, data: { matchId: string; choice: string; salt: string }, callback: Function) {
    try {
      const userId = socket.userId!;
      const { matchId, choice, salt } = data;

      const room = this.matchRooms.get(matchId);
      if (!room) {
        return callback({ error: 'Match not found' });
      }

      if (room.status !== 'reveal') {
        return callback({ error: 'Not in reveal phase' });
      }

      // Validate choice
      if (!['rock', 'paper', 'scissors'].includes(choice)) {
        return callback({ error: 'Invalid choice' });
      }

      // Verify commitment matches
      const hashInput = JSON.stringify({ choice, salt });
      const computedHash = crypto.createHash('sha256').update(hashInput).digest('hex');

      if (room.playerAId === userId) {
        if (computedHash !== room.playerACommit) {
          return callback({ error: 'Reveal hash does not match commitment' });
        }
        room.playerAChoice = choice;
        room.playerAReveal = computedHash;
      } else if (room.playerBId === userId) {
        if (computedHash !== room.playerBCommit) {
          return callback({ error: 'Reveal hash does not match commitment' });
        }
        room.playerBChoice = choice;
        room.playerBReveal = computedHash;
      } else {
        return callback({ error: 'Not part of this match' });
      }

      // Check if both revealed
      if (room.playerAChoice && room.playerBChoice) {
        await this.completeMatch(room);
      }

      callback({ success: true, message: 'Choice revealed' });
    } catch (error) {
      callback({ error: `Failed to reveal: ${(error as Error).message}` });
    }
  }

  /**
   * Get match room state
   */
  private handleGetRoom(socket: AuthenticatedSocket, data: { matchId: string }, callback: Function) {
    try {
      const { matchId } = data;
      const room = this.matchRooms.get(matchId);

      if (!room) {
        return callback({ error: 'Match not found' });
      }

      // Return room state (without revealing unrevealed choices)
      const state = {
        id: room.id,
        playerAName: room.playerAName,
        playerBName: room.playerBName,
        stake: room.stake,
        status: room.status,
        playerACommitted: !!room.playerACommit,
        playerBCommitted: !!room.playerBCommit,
        playerARevealed: !!room.playerAChoice,
        playerBRevealed: !!room.playerBChoice,
        playerAChoice: room.playerAChoice,
        playerBChoice: room.playerBChoice,
        result: room.result,
        winner: room.winner,
        winnerReward: room.winnerReward,
        daoFee: room.daoFee,
      };

      callback({ success: true, data: state });
    } catch (error) {
      callback({ error: `Failed to get room: ${(error as Error).message}` });
    }
  }

  /**
   * Watch leaderboard for updates (broadcast every 10 seconds)
   */
  private handleWatchLeaderboard(socket: AuthenticatedSocket, callback: Function) {
    try {
      socket.join('leaderboard-watchers');
      callback({ success: true, message: 'Watching leaderboard' });
    } catch (error) {
      callback({ error: `Failed to watch leaderboard: ${(error as Error).message}` });
    }
  }

  /**
   * Complete match and update stats
   */
  private async completeMatch(room: MatchRoom) {
    try {
      // Calculate result
      const result = this.calculateResult(room.playerAChoice!, room.playerBChoice!);
      room.result = result;

      if (result === 'draw') {
        room.winner = 'draw';
        room.winnerReward = Math.floor(room.stake);
        room.daoFee = Math.floor(room.stake / 10);
      } else {
        const winner = result === 'A' ? room.playerAId : room.playerBId;
        room.winner = winner;
        room.winnerReward = Math.floor(room.stake * 2 * 0.9); // 90% of total pool
        room.daoFee = Math.floor(room.stake * 2 * 0.1); // 10% to DAO
      }

      room.status = 'completed';
      room.completedAt = new Date();

      // Update Firestore
      const matchData = {
        id: room.id,
        playerAId: room.playerAId,
        playerBId: room.playerBId,
        stake: room.stake,
        status: 'completed' as const,
        winner: room.winner,
        result: {
          playerAChoice: room.playerAChoice!,
          playerBChoice: room.playerBChoice!,
          winnerReward: room.winnerReward,
          daoFee: room.daoFee,
        },
      };

      await createMatch(matchData);

      // Update player stats
      const playerA = await getUserById(room.playerAId);
      const playerB = await getUserById(room.playerBId);

      if (playerA) {
        if (room.winner === room.playerAId) {
          await updateUserStats(room.playerAId, {
            wins: playerA.wins + 1,
            totalStaked: playerA.totalStaked + room.stake,
            totalEarnings: playerA.totalEarnings + room.winnerReward,
          });
        } else if (room.winner === 'draw') {
          await updateUserStats(room.playerAId, {
            totalStaked: playerA.totalStaked + room.stake,
            totalEarnings: playerA.totalEarnings + room.winnerReward,
          });
        } else {
          await updateUserStats(room.playerAId, {
            losses: playerA.losses + 1,
            totalStaked: playerA.totalStaked + room.stake,
          });
        }
        const updatedA = await getUserById(room.playerAId);
        if (updatedA) await updateLeaderboard(room.playerAId, updatedA);
      }

      if (playerB) {
        if (room.winner === room.playerBId) {
          await updateUserStats(room.playerBId, {
            wins: playerB.wins + 1,
            totalStaked: playerB.totalStaked + room.stake,
            totalEarnings: playerB.totalEarnings + room.winnerReward,
          });
        } else if (room.winner === 'draw') {
          await updateUserStats(room.playerBId, {
            totalStaked: playerB.totalStaked + room.stake,
            totalEarnings: playerB.totalEarnings + room.winnerReward,
          });
        } else {
          await updateUserStats(room.playerBId, {
            losses: playerB.losses + 1,
            totalStaked: playerB.totalStaked + room.stake,
          });
        }
        const updatedB = await getUserById(room.playerBId);
        if (updatedB) await updateLeaderboard(room.playerBId, updatedB);
      }

      // Update DAO pool
      await updateDaoPool(room.daoFee);

      // Add to match history
      await addMatchToHistory({
        userId: room.playerAId,
        matchId: room.id,
        opponent: { id: room.playerBId, name: room.playerBName },
        stake: room.stake,
        result: room.winner === room.playerAId ? 'win' : room.winner === 'draw' ? 'draw' : 'loss',
        reward: room.winner === room.playerAId ? room.winnerReward : room.winner === 'draw' ? room.winnerReward : 0,
        playerChoice: room.playerAChoice!,
        opponentChoice: room.playerBChoice!,
      });

      await addMatchToHistory({
        userId: room.playerBId,
        matchId: room.id,
        opponent: { id: room.playerAId, name: room.playerAName },
        stake: room.stake,
        result: room.winner === room.playerBId ? 'win' : room.winner === 'draw' ? 'draw' : 'loss',
        reward: room.winner === room.playerBId ? room.winnerReward : room.winner === 'draw' ? room.winnerReward : 0,
        playerChoice: room.playerBChoice!,
        opponentChoice: room.playerAChoice!,
      });

      // Notify both players
      const socketA = this.io.sockets.sockets.get(this.userSockets.get(room.playerAId)!);
      const socketB = this.io.sockets.sockets.get(this.userSockets.get(room.playerBId)!);

      const resultData = {
        playerAChoice: room.playerAChoice,
        playerBChoice: room.playerBChoice,
        result: room.result,
        winner: room.winner,
        winnerReward: room.winnerReward,
        daoFee: room.daoFee,
      };

      if (socketA) socketA.emit('match:completed', resultData);
      if (socketB) socketB.emit('match:completed', resultData);

      // Broadcast leaderboard update
      this.io.to('leaderboard-watchers').emit('leaderboard:updated', { timestamp: new Date() });

      console.log(`✅ Match completed: ${room.id} (Winner: ${room.winner})`);
    } catch (error) {
      console.error('Error completing match:', error);
    }
  }

  /**
   * Calculate match result
   */
  private calculateResult(choiceA: string, choiceB: string): 'A' | 'B' | 'draw' {
    if (choiceA === choiceB) return 'draw';
    if (choiceA === 'rock' && choiceB === 'scissors') return 'A';
    if (choiceA === 'paper' && choiceB === 'rock') return 'A';
    if (choiceA === 'scissors' && choiceB === 'paper') return 'A';
    return 'B';
  }

  /**
   * Set commit timeout (auto-fail if both don't commit)
   */
  private setCommitTimeout(matchId: string) {
    const timer = setTimeout(() => {
      const room = this.matchRooms.get(matchId);
      if (room && room.status === 'commit') {
        // Timeout: auto-forfeit
        console.warn(`⚠️ Match ${matchId} commit timeout. Forfeiting.`);
        this.matchRooms.delete(matchId);
        this.commitTimers.delete(matchId);
      }
    }, this.COMMIT_TIMEOUT * 1000);

    this.commitTimers.set(matchId, timer);
  }

  /**
   * Set reveal timeout (auto-fail if both don't reveal)
   */
  private setRevealTimeout(matchId: string) {
    const timer = setTimeout(() => {
      const room = this.matchRooms.get(matchId);
      if (room && room.status === 'reveal') {
        // Timeout: use empty/default choices for non-revealers
        console.warn(`⚠️ Match ${matchId} reveal timeout. Completing with available choices.`);
        room.playerAChoice = room.playerAChoice || 'rock';
        room.playerBChoice = room.playerBChoice || 'rock';
        this.completeMatch(room);
        this.revealTimers.delete(matchId);
      }
    }, this.REVEAL_TIMEOUT * 1000);

    this.revealTimers.set(matchId, timer);
  }

  /**
   * Handle player disconnect
   */
  private handleDisconnect(socket: AuthenticatedSocket) {
    const userId = socket.userId;

    if (userId) {
      // Remove from queue
      this.matchQueue.delete(userId);

      // TODO: Handle in-match disconnect (forfeit or pause)

      // Remove socket mapping
      this.userSockets.delete(userId);

      console.log(`❌ User disconnected: ${userId}`);
    }
  }

  /**
   * Handle Socket.IO errors
   */
  private handleError(socket: AuthenticatedSocket, error: any) {
    console.error(`Socket.IO error (${socket.userId}):`, error);
  }

  /**
   * Get Socket.IO instance
   */
  getIO(): SocketIOServer {
    return this.io;
  }

  /**
   * Get match room state
   */
  getRoom(matchId: string): MatchRoom | undefined {
    return this.matchRooms.get(matchId);
  }

  /**
   * Get all match rooms
   */
  getAllRooms(): Map<string, MatchRoom> {
    return this.matchRooms;
  }

  /**
   * Get matchmaking queue
   */
  getQueue(): Map<string, QueueEntry> {
    return this.matchQueue;
  }
}
