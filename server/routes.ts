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

interface AuthRequest extends Express.Request {
  isAuthenticated(): boolean;
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Debug middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });

  // Public endpoint for the leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      console.log('[Leaderboard] Fetching participants');
      const participants = await storage.getParticipantsByScore();
      console.log(`[Leaderboard] Found ${participants.length} participants`);
      res.json(participants);
    } catch (error) {
      console.error('[Leaderboard] Error:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard data' });
    }
  });

  // Auth middleware for protected routes
  const requireAuth = (req: AuthRequest, res: Express.Response, next: Express.NextFunction) => {
    console.log('[Auth] Checking authentication');
    if (!req.isAuthenticated()) {
      console.log('[Auth] Unauthorized access attempt');
      return res.status(401).json({ error: 'Unauthorized' });
    }
    console.log('[Auth] Authentication successful');
    next();
  };

  // Admin endpoints - require authentication
  app.get("/api/participants", requireAuth, async (req, res) => {
    try {
      const participants = await storage.getParticipantsByScore();
      res.json(participants);
    } catch (error) {
      console.error('[Admin] Error fetching participants:', error);
      res.status(500).json({ error: 'Failed to fetch participants' });
    }
  });

  app.get("/api/participants/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      console.log('[Routes] Fetching participant:', id);

      const participant = await storage.getParticipant(parseInt(id));
      if (!participant) {
        console.log('[Routes] Participant not found:', id);
        return res.status(404).json({ error: "Participant not found" });
      }

      res.json(participant);
    } catch (error) {
      console.error('[Routes] Error fetching participant:', error);
      res.status(500).json({ error: 'Failed to fetch participant' });
    }
  });

  app.post("/api/participants", requireAuth, async (req, res) => {
    try {
      console.log('[Admin] Creating participant:', req.body);
      const participantData = insertParticipantSchema.parse(req.body);
      const participant = await storage.createParticipant(participantData);
      console.log('[Admin] Participant created:', participant);
      res.status(201).json(participant);
    } catch (error) {
      console.error('[Admin] Error creating participant:', error);
      res.status(400).json({
        error: "Invalid participant data",
        details: error instanceof Error ? error.message : undefined
      });
    }
  });

  app.patch("/api/participants/:id/metrics", requireAuth, async (req, res) => {
    try {
      console.log('[Admin] Updating metrics for participant:', req.params.id, req.body);
      const { id } = req.params;
      const { boardRevenue, mspRevenue, voiceSeats, totalDeals, boardRevenueGoal, mspRevenueGoal, voiceSeatsGoal, totalDealsGoal } = req.body;

      await storage.updateParticipantMetrics(parseInt(id), {
        boardRevenue,
        mspRevenue,
        voiceSeats,
        totalDeals,
        boardRevenueGoal,
        mspRevenueGoal,
        voiceSeatsGoal,
        totalDealsGoal
      });
      const participant = await storage.getParticipant(parseInt(id));
      console.log('[Admin] Metrics updated:', participant);
      res.json(participant);
    } catch (error) {
      console.error('[Admin] Error updating metrics:', error);
      res.status(400).json({
        error: "Failed to update metrics",
        details: error instanceof Error ? error.message : undefined
      });
    }
  });

  app.post("/api/upload", upload.single('file'), requireAuth, (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });

  app.patch("/api/participants/:id/profile", requireAuth, async (req, res) => {
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

  app.delete("/api/participants/:id", requireAuth, async (req, res) => {
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