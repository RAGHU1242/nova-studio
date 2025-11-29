import * as admin from 'firebase-admin';
import path from 'path';

// Initialize Firebase Admin SDK
// In development, this connects to the local emulator
// In production, it uses the GOOGLE_APPLICATION_CREDENTIALS environment variable

let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;

// Check if running with emulator
const useEmulator = process.env.FIRESTORE_EMULATOR_HOST || process.env.NODE_ENV === 'development';

export function initializeFirebase() {
  try {
    // Initialize Firebase Admin with explicit credentials if provided
    if (!admin.apps.length) {
      let credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      
      // If no credentials file is specified, try to auto-discover
      if (!credentialsPath && process.env.NODE_ENV === 'production') {
        throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable must be set in production');
      }

      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'algobattle-local',
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'algobattle-local.appspot.com',
      });

      // Connect to emulator if in development
      if (useEmulator && process.env.NODE_ENV !== 'production') {
        process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
        process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
        console.log('🔥 Using Firebase Local Emulator');
        console.log(`   Firestore: ${process.env.FIRESTORE_EMULATOR_HOST}`);
        console.log(`   Auth: ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);
      }
    }

    db = admin.firestore();
    auth = admin.auth();

    // Set up some basic Firestore settings
    db.settings({
      ignoreUndefinedProperties: true,
    });

    return { db, auth };
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
}

// Get Firestore instance
export function getFirestore(): admin.firestore.Firestore {
  if (!db) {
    initializeFirebase();
  }
  return db;
}

// Get Firebase Auth instance
export function getAuth(): admin.auth.Auth {
  if (!auth) {
    initializeFirebase();
  }
  return auth;
}

// ============================================================================
// User CRUD Operations
// ============================================================================

export interface UserData {
  id: string;
  name: string;
  email: string;
  password: string; // hashed
  walletAddress?: string;
  avatarUrl?: string;
  wins: number;
  losses: number;
  totalStaked: number;
  totalEarnings: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function createUser(userId: string, userData: Omit<UserData, 'id'>): Promise<UserData> {
  const db = getFirestore();
  const userWithId = { ...userData, id: userId };

  await db.collection('users').doc(userId).set(userWithId);
  return userWithId as UserData;
}

export async function getUserById(userId: string): Promise<UserData | null> {
  const db = getFirestore();
  const doc = await db.collection('users').doc(userId).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data() as UserData;
}

export async function getUserByEmail(email: string): Promise<UserData | null> {
  const db = getFirestore();
  const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data() as UserData;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserData, 'id' | 'password' | 'createdAt'>>
): Promise<UserData | null> {
  const db = getFirestore();
  const docRef = db.collection('users').doc(userId);

  const updateData = {
    ...updates,
    updatedAt: new Date(),
  };

  await docRef.update(updateData);

  const updatedDoc = await docRef.get();
  return updatedDoc.data() as UserData;
}

export async function updateUserStats(
  userId: string,
  stats: { wins?: number; losses?: number; totalStaked?: number; totalEarnings?: number }
): Promise<void> {
  const db = getFirestore();
  const updateData: any = {
    updatedAt: new Date(),
  };

  if (stats.wins !== undefined) updateData.wins = stats.wins;
  if (stats.losses !== undefined) updateData.losses = stats.losses;
  if (stats.totalStaked !== undefined) updateData.totalStaked = stats.totalStaked;
  if (stats.totalEarnings !== undefined) updateData.totalEarnings = stats.totalEarnings;

  await db.collection('users').doc(userId).update(updateData);
}

// ============================================================================
// Match CRUD Operations
// ============================================================================

export interface MatchData {
  id: string;
  playerAId: string;
  playerBId: string;
  stake: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  winner?: string;
  result?: {
    playerAChoice?: string;
    playerBChoice?: string;
    winnerReward?: number;
    daoFee?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export async function createMatch(matchData: Omit<MatchData, 'createdAt' | 'updatedAt'>): Promise<MatchData> {
  const db = getFirestore();
  const docRef = db.collection('matches').doc(matchData.id);

  const fullData: MatchData = {
    ...matchData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await docRef.set(fullData);
  return fullData;
}

export async function getMatchById(matchId: string): Promise<MatchData | null> {
  const db = getFirestore();
  const doc = await db.collection('matches').doc(matchId).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data() as MatchData;
}

export async function updateMatch(matchId: string, updates: Partial<MatchData>): Promise<MatchData | null> {
  const db = getFirestore();
  const docRef = db.collection('matches').doc(matchId);

  const updateData = {
    ...updates,
    updatedAt: new Date(),
  };

  await docRef.update(updateData);

  const updatedDoc = await docRef.get();
  return updatedDoc.data() as MatchData;
}

export async function getUserMatches(userId: string, limit: number = 50): Promise<MatchData[]> {
  const db = getFirestore();

  const snapshot = await db
    .collection('matches')
    .where('playerAId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  const matches1 = snapshot.docs.map((doc) => doc.data() as MatchData);

  const snapshot2 = await db
    .collection('matches')
    .where('playerBId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  const matches2 = snapshot2.docs.map((doc) => doc.data() as MatchData);

  // Combine and sort by date
  return [...matches1, ...matches2].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);
}

// ============================================================================
// Leaderboard Operations
// ============================================================================

export interface LeaderboardEntry {
  userId: string;
  name: string;
  wins: number;
  losses: number;
  winRate: number;
  totalEarnings: number;
  rank: number;
}

export async function getLeaderboard(limit: number = 100, offset: number = 0): Promise<LeaderboardEntry[]> {
  const db = getFirestore();

  const snapshot = await db
    .collection('leaderboard')
    .orderBy('wins', 'desc')
    .orderBy('totalEarnings', 'desc')
    .offset(offset)
    .limit(limit)
    .get();

  return snapshot.docs.map((doc, index) => {
    const data = doc.data();
    return {
      userId: data.userId,
      name: data.name,
      wins: data.wins,
      losses: data.losses,
      winRate: data.winRate,
      totalEarnings: data.totalEarnings,
      rank: offset + index + 1,
    };
  });
}

export async function getUserRank(userId: string): Promise<LeaderboardEntry | null> {
  const db = getFirestore();

  const snapshot = await db.collection('leaderboard').orderBy('wins', 'desc').orderBy('totalEarnings', 'desc').get();

  const allEntries = snapshot.docs.map((doc, index) => ({
    ...doc.data(),
    rank: index + 1,
  }));

  const userEntry = allEntries.find((entry) => entry.userId === userId);

  return (userEntry as LeaderboardEntry) || null;
}

export async function updateLeaderboard(userId: string, userData: Partial<UserData>): Promise<void> {
  const db = getFirestore();
  const user = await getUserById(userId);

  if (!user) {
    return;
  }

  const totalMatches = user.wins + user.losses;
  const winRate = totalMatches > 0 ? user.wins / totalMatches : 0;

  await db.collection('leaderboard').doc(userId).set({
    userId,
    name: user.name,
    wins: user.wins,
    losses: user.losses,
    winRate: Math.round(winRate * 100) / 100,
    totalEarnings: user.totalEarnings,
  });
}

// ============================================================================
// DAO Pool Operations
// ============================================================================

export interface DaoPoolData {
  totalCollected: number;
  distribution: string[]; // array of transaction IDs or withdrawal records
  lastUpdated: Date;
}

export async function getDaoPool(): Promise<DaoPoolData | null> {
  const db = getFirestore();
  const doc = await db.collection('dao_pool').doc('main').get();

  if (!doc.exists) {
    return null;
  }

  return doc.data() as DaoPoolData;
}

export async function updateDaoPool(amount: number): Promise<void> {
  const db = getFirestore();
  const docRef = db.collection('dao_pool').doc('main');

  const doc = await docRef.get();

  if (!doc.exists) {
    // Initialize DAO pool
    await docRef.set({
      totalCollected: amount,
      distribution: [],
      lastUpdated: new Date(),
    });
  } else {
    await docRef.update({
      totalCollected: admin.firestore.FieldValue.increment(amount),
      lastUpdated: new Date(),
    });
  }
}

// ============================================================================
// Match History Operations (Denormalized for performance)
// ============================================================================

export interface MatchHistoryEntry {
  id: string;
  userId: string;
  matchId: string;
  opponent: {
    id: string;
    name: string;
  };
  stake: number;
  result: 'win' | 'loss' | 'draw';
  reward?: number;
  playerChoice: string;
  opponentChoice: string;
  createdAt: Date;
}

export async function addMatchToHistory(entry: Omit<MatchHistoryEntry, 'id' | 'createdAt'>): Promise<MatchHistoryEntry> {
  const db = getFirestore();
  const docRef = db.collection('match_history').doc();

  const fullEntry: MatchHistoryEntry = {
    ...entry,
    id: docRef.id,
    createdAt: new Date(),
  };

  await docRef.set(fullEntry);
  return fullEntry;
}

export async function getUserMatchHistory(userId: string, limit: number = 50): Promise<MatchHistoryEntry[]> {
  const db = getFirestore();

  const snapshot = await db
    .collection('match_history')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => doc.data() as MatchHistoryEntry);
}
