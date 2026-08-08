import express from "express";
import cors from "cors";
import talksRouter from "./routes/talks.js";
import healthRouter from "./routes/health.js";

export function createApp(frontendOrigin?: string) {
  const app = express();

  app.use(
    cors({
      origin: frontendOrigin || process.env.FRONTEND_ORIGIN || "http://localhost:5173",
      methods: ["GET", "POST", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "X-Voter-Id"],
    })
  );

  app.use(express.json());

  app.use("/api/health", healthRouter);
  app.use("/api/talks", talksRouter);

  return app;
}
