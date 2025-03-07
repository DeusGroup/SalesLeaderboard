import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertParticipantSchema } from "@shared/schema";
import { randomBytes } from "crypto";
import { join } from "path";
import multer from "multer";
import { mkdir } from "fs/promises";

const multerStorage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadDir = join(process.cwd(), 'uploads');
    await mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = randomBytes(16).toString('hex');
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({ storage: multerStorage });

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

  app.get("/api/participants/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { id } = req.params;
    const participant = await storage.getParticipant(parseInt(id));
    if (!participant) {
      return res.status(404).json({ error: "Participant not found" });
    }
    res.json(participant);
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

  app.post("/api/upload", upload.single('file'), (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });

  app.patch("/api/participants/:id/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const { id } = req.params;
    const { name, role, department, avatarUrl } = req.body;

    try {
      await storage.updateParticipantProfile(parseInt(id), { 
        name, 
        role, 
        department,
        avatarUrl 
      });
      const participant = await storage.getParticipant(parseInt(id));
      res.json(participant);
    } catch (error) {
      res.status(400).json({
        error: "Failed to update profile",
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

  app.delete("/api/participants/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const { id } = req.params;
    try {
      await storage.deleteParticipant(parseInt(id));
      res.sendStatus(200);
    } catch (error) {
      res.status(400).json({
        error: "Failed to delete participant",
        details: error instanceof Error ? error.message : undefined
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}