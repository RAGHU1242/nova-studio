import "dotenv/config";
import express from "express";
import cors from "cors";
import { authMiddleware } from "./middleware/auth";
import { handleDemo } from "./routes/demo";
import { handleRegister, handleLogin, handleGetCurrentUser } from "./routes/auth";
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

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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

  return app;
}
