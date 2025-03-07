import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertParticipantSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Public endpoint for the leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    const participants = await storage.getParticipantsByScore();
    res.json(participants);
  });

  // Admin endpoints - require authentication
  app.get("/api/participants", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const participants = await storage.getParticipantsByScore();
    res.json(participants);
  });

  app.post("/api/participants", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const participantData = insertParticipantSchema.parse(req.body);
      const participant = await storage.createParticipant(participantData);
      res.status(201).json(participant);
    } catch (error) {
      res.status(400).json({
        error: "Invalid participant data",
        details: error instanceof Error ? error.message : undefined
      });
    }
  });

  app.patch("/api/participants/:id/metrics", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const { id } = req.params;
    const { boardRevenue, mspRevenue, voiceSeats, totalDeals } = req.body;

    try {
      await storage.updateParticipantMetrics(parseInt(id), {
        boardRevenue,
        mspRevenue,
        voiceSeats,
        totalDeals
      });
      const participant = await storage.getParticipant(parseInt(id));
      res.json(participant);
    } catch (error) {
      res.status(400).json({
        error: "Failed to update metrics",
        details: error instanceof Error ? error.message : undefined
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}