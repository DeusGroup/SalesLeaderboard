import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertSaleSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/leaderboard", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const leaderboard = await storage.getLeaderboard();
    res.json(leaderboard);
  });

  app.get("/api/sales", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const sales = await storage.getUserSales(req.user.id);
    res.json(sales);
  });

  app.post("/api/sales", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const saleData = insertSaleSchema.parse(req.body);
      const sale = await storage.createSale(req.user.id, saleData);
      res.status(201).json(sale);
    } catch (error) {
      res.status(400).json({ error: "Invalid sale data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
