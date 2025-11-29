import { useEffect, useCallback, useState } from 'react';
import { getSocket, emitEvent, onEvent } from '@/lib/socketManager';

export interface QueueEntry {
  userId: string;
  userName: string;
  stake: number;
  joinedAt: Date;
}

export interface MatchFound {
  matchId: string;
  opponent: {
    id: string;
    name: string;
  };
  stake: number;
  timeout: number;
}

export interface CommitPhaseData {
  timeout: number;
}

export interface RevealPhaseData {
  timeout: number;
}

export interface MatchCompletedData {
  playerAChoice: string;
  playerBChoice: string;
  result: 'A' | 'B' | 'draw';
  winner: string;
  winnerReward: number;
  daoFee: number;
}

export interface MatchRoomState {
  id: string;
  playerAName: string;
  playerBName: string;
  stake: number;
  status: 'commit' | 'reveal' | 'completed';
  playerACommitted: boolean;
  playerBCommitted: boolean;
  playerARevealed: boolean;
  playerBRevealed: boolean;
  playerAChoice?: string;
  playerBChoice?: string;
  result?: 'A' | 'B' | 'draw';
  winner?: string;
  winnerReward?: number;
  daoFee?: number;
}

/**
 * Custom hook for game Socket.IO events
 * Handles matchmaking, commit-reveal flow, and result events
 */
export function useGameSocket() {
  const [queueSize, setQueueSize] = useState(0);
  const [currentMatch, setCurrentMatch] = useState<MatchFound | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [revealTimeout, setRevealTimeout] = useState<number>(0);
  const [commitTimeout, setCommitTimeout] = useState<number>(0);

  /**
   * Join matchmaking queue
   */
  const joinQueue = useCallback(
    (stake: number) => {
      return new Promise<{ success: boolean; message: string }>((resolve, reject) => {
        emitEvent(
          'match:join-queue',
          { stake },
          (response: any) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve({ success: true, message: response.message });
            }
          }
        );
      });
    },
    []
  );

  /**
   * Leave matchmaking queue
   */
  const leaveQueue = useCallback(() => {
    return new Promise<{ success: boolean; message: string }>((resolve, reject) => {
      emitEvent('match:leave-queue', {}, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve({ success: true, message: response.message });
        }
      });
    });
  }, []);

  /**
   * Commit hashed choice
   */
  const commitChoice = useCallback((matchId: string, commitHash: string) => {
    return new Promise<{ success: boolean; message: string }>((resolve, reject) => {
      emitEvent(
        'match:commit-choice',
        { matchId, commitHash },
        (response: any) => {
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve({ success: true, message: response.message });
          }
        }
      );
    });
  }, []);

  /**
   * Reveal choice and salt
   */
  const revealChoice = useCallback(
    (matchId: string, choice: string, salt: string) => {
      return new Promise<{ success: boolean; message: string }>((resolve, reject) => {
        emitEvent(
          'match:reveal-choice',
          { matchId, choice, salt },
          (response: any) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve({ success: true, message: response.message });
            }
          }
        );
      });
    },
    []
  );

  /**
   * Get match room state
   */
  const getMatchRoom = useCallback((matchId: string) => {
    return new Promise<MatchRoomState>((resolve, reject) => {
      emitEvent(
        'match:get-room',
        { matchId },
        (response: any) => {
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response.data);
          }
        }
      );
    });
  }, []);

  /**
   * Set up event listeners
   */
  useEffect(() => {
    const socket = getSocket();

    // Queue updated event
    const unsubscribeQueueUpdated = onEvent('queue:updated', (data: any) => {
      setQueueSize(data.queueSize);
    });

    // Match found event
    const unsubscribeMatchFound = onEvent('match:found', (data: MatchFound) => {
      setCurrentMatch(data);
      setMatchId(data.matchId);
      setCommitTimeout(data.timeout);
    });

    // Reveal phase event
    const unsubscribeRevealPhase = onEvent('match:reveal-phase', (data: RevealPhaseData) => {
      setRevealTimeout(data.timeout);
    });

    // Match completed event
    const unsubscribeMatchCompleted = onEvent(
      'match:completed',
      (data: MatchCompletedData) => {
        // This will be handled by the component using this hook
        console.log('Match completed:', data);
      }
    );

    // Cleanup on unmount
    return () => {
      unsubscribeQueueUpdated();
      unsubscribeMatchFound();
      unsubscribeRevealPhase();
      unsubscribeMatchCompleted();
    };
  }, []);

  return {
    queueSize,
    currentMatch,
    matchId,
    revealTimeout,
    commitTimeout,
    joinQueue,
    leaveQueue,
    commitChoice,
    revealChoice,
    getMatchRoom,
  };
}
