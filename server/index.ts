import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { authMiddleware } from "./middleware/auth";
import { initializeFirebase } from "./lib/firebase";
import { GameServer } from "./lib/socket";
import { handleDemo } from "./routes/demo";
import { handleRegister, handleLogin, handleGetCurrentUser, handleLogout, handleRefreshToken } from "./routes/auth";
import { handleGetLeaderboard, handleGetUserRank } from "./routes/leaderboard";
import {
  handleJoinMatch,
  handleLeaveMatch,
  handleGetMatch,
  handleSubmitMatchResult,
  handleGetMatchHistory,
} from "./routes/match";

export function createServer() {
  const app = express();
  const httpServer = http.createServer(app);

  // Initialize Firebase lazily - will be called on first use via getFirestore/getAuth
  // Avoid calling here during vite config load phase
  try {
    initializeFirebase();
  } catch (error) {
    // Suppress initialization errors during vite config load
    console.warn('Firebase initialization deferred:', (error as any)?.message);
  }

  // Initialize Socket.IO Game Server
  const gameServer = new GameServer(httpServer);

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Expose Socket.IO instance for testing/debugging
  app.locals.gameServer = gameServer;

  // Health check endpoint
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "pong";
    res.json({
      status: "ok",
      message: ping,
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    });
  });

  // Demo endpoint
  app.get("/api/demo", handleDemo);

  // Auth endpoints (public)
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/logout", handleLogout);
  app.post("/api/auth/refresh", handleRefreshToken);

  // User endpoints
  app.get("/api/users/me", authMiddleware, handleGetCurrentUser);

  // Leaderboard endpoints (public)
  app.get("/api/leaderboard", handleGetLeaderboard);
  app.get("/api/leaderboard/:userId", handleGetUserRank);

  // Match endpoints
  app.post("/api/match/join", authMiddleware, handleJoinMatch);
  app.post("/api/match/leave", authMiddleware, handleLeaveMatch);
  app.get("/api/match/:matchId", handleGetMatch);
  app.post("/api/match/result", authMiddleware, handleSubmitMatchResult);
  app.get("/api/history/:userId", handleGetMatchHistory);

  // Error handling middleware
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  });

  // Note: 404 handler is NOT included here because this is used as Vite middleware
  // in development. In production, the frontend is served separately.

  // Return both app and httpServer
  (app as any).httpServer = httpServer;
  return app;
}
