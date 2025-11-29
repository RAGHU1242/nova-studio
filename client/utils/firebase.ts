import {
  initializeApp,
  FirebaseApp,
} from "firebase/app";
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  QueryConstraint,
} from "firebase/firestore";

export interface User {
  id: string;
  email: string;
  name: string;
  walletAddress?: string;
  avatarUrl?: string;
  wins: number;
  losses: number;
  totalStaked: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Match {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  wins: number;
  losses: number;
  winRate: number;
  totalEarnings: number;
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

/**
 * Initialize Firebase/Firestore
 * Requires VITE_FIREBASE_* environment variables to be set
 */
export const initializeFirebase = async (): Promise<Firestore> => {
  if (db) return db;

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForDevelopment",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "algobattle-arena.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "algobattle-arena",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "algobattle-arena.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
  };

  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  
  console.log("Firebase initialized with project:", firebaseConfig.projectId);
  return db;
};

/**
 * Get Firestore instance
 */
export const getDB = async (): Promise<Firestore> => {
  if (!db) {
    return initializeFirebase();
  }
  return db;
};

/**
 * Create or update user profile
 */
export const saveUserProfile = async (userId: string, userData: Partial<User>): Promise<void> => {
  const firestore = await getDB();
  const userRef = doc(firestore, "users", userId);
  
  await setDoc(
    userRef,
    {
      ...userData,
      updatedAt: new Date(),
    },
    { merge: true }
  );
};

/**
 * Fetch user profile
 */
export const fetchUserProfile = async (userId: string): Promise<User | null> => {
  const firestore = await getDB();
  const userRef = doc(firestore, "users", userId);
  const snapshot = await getDoc(userRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  const data = snapshot.data();
  return {
    ...data,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  } as User;
};

/**
 * Record a completed match
 */
export const recordMatch = async (match: Omit<Match, "id">): Promise<string> => {
  const firestore = await getDB();
  const matchRef = collection(firestore, "matches");
  
  const docRef = await addDoc(matchRef, {
    ...match,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  return docRef.id;
};

/**
 * Fetch match details
 */
export const fetchMatch = async (matchId: string): Promise<Match | null> => {
  const firestore = await getDB();
  const matchRef = doc(firestore, "matches", matchId);
  const snapshot = await getDoc(matchRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  } as Match;
};

/**
 * Fetch user's recent matches
 */
export const fetchUserMatches = async (userId: string, limitCount = 10): Promise<Match[]> => {
  const firestore = await getDB();
  const matchesRef = collection(firestore, "matches");
  
  const constraints: QueryConstraint[] = [
    where("status", "==", "completed"),
    orderBy("createdAt", "desc"),
    limit(limitCount),
  ];
  
  const q = query(matchesRef, ...constraints);
  const snapshot = await getDocs(q);
  
  return snapshot.docs
    .filter(doc => {
      const data = doc.data();
      return data.playerAId === userId || data.playerBId === userId;
    })
    .map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
    } as Match));
};

/**
 * Fetch leaderboard (top players by wins)
 */
export const fetchLeaderboard = async (limitCount = 10): Promise<LeaderboardEntry[]> => {
  const firestore = await getDB();
  const usersRef = collection(firestore, "users");
  
  const q = query(
    usersRef,
    orderBy("wins", "desc"),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((doc, index) => {
    const data = doc.data();
    const totalMatches = data.wins + data.losses;
    const winRate = totalMatches > 0 ? data.wins / totalMatches : 0;
    
    return {
      rank: index + 1,
      userId: doc.id,
      name: data.name,
      wins: data.wins,
      losses: data.losses,
      winRate,
      totalEarnings: data.totalStaked || 0,
    };
  });
};

/**
 * Update user stats after a match
 */
export const updateUserStats = async (
  userId: string,
  updates: {
    wins?: number;
    losses?: number;
    totalStaked?: number;
  }
): Promise<void> => {
  const firestore = await getDB();
  const userRef = doc(firestore, "users", userId);
  
  await updateDoc(userRef, {
    ...updates,
    updatedAt: new Date(),
  });
};

/**
 * Update match result and status
 */
export const updateMatchResult = async (
  matchId: string,
  result: {
    winner?: string;
    playerAChoice?: string;
    playerBChoice?: string;
    winnerReward?: number;
    daoFee?: number;
  }
): Promise<void> => {
  const firestore = await getDB();
  const matchRef = doc(firestore, "matches", matchId);
  
  await updateDoc(matchRef, {
    status: "completed",
    result,
    updatedAt: new Date(),
  });
};

/**
 * Get or create user by email
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  const firestore = await getDB();
  const usersRef = collection(firestore, "users");
  
  const q = query(usersRef, where("email", "==", email));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return null;
  }
  
  const data = snapshot.docs[0].data();
  return {
    id: snapshot.docs[0].id,
    ...data,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  } as User;
};
