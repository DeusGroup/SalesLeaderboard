import { InsertParticipant, Participant, Admin } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getParticipant(id: number): Promise<Participant | undefined>;
  getParticipantsByScore(): Promise<Participant[]>;
  createParticipant(participant: InsertParticipant): Promise<Participant>;
  updateParticipantScore(id: number, score: number): Promise<void>;
  updateParticipantMetrics(
    id: number,
    metrics: {
      boardRevenue?: number;
      mspRevenue?: number;
      voiceSeats?: number;
      totalDeals?: number;
    }
  ): Promise<void>;
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private participants: Map<number, Participant>;
  private admins: Map<number, Admin>;
  private currentParticipantId: number;
  sessionStore: session.Store;

  constructor() {
    this.participants = new Map();
    this.admins = new Map();
    this.currentParticipantId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Add default admin account
    this.admins.set(1, {
      id: 1,
      username: "admin",
      password: "Welcome1", // Updated password
    });
  }

  async getParticipant(id: number): Promise<Participant | undefined> {
    return this.participants.get(id);
  }

  async getParticipantsByScore(): Promise<Participant[]> {
    return Array.from(this.participants.values())
      .sort((a, b) => b.score - a.score);
  }

  async createParticipant(insertParticipant: InsertParticipant): Promise<Participant> {
    const id = this.currentParticipantId++;
    const participant: Participant = {
      id,
      ...insertParticipant,
      boardRevenue: 0,
      mspRevenue: 0,
      voiceSeats: 0,
      totalDeals: 0,
      score: 0,
      createdAt: new Date()
    };
    this.participants.set(id, participant);
    return participant;
  }

  async updateParticipantScore(id: number, score: number): Promise<void> {
    const participant = await this.getParticipant(id);
    if (participant) {
      participant.score = score;
      this.participants.set(id, participant);
    }
  }

  async updateParticipantMetrics(
    id: number,
    metrics: {
      boardRevenue?: number;
      mspRevenue?: number;
      voiceSeats?: number;
      totalDeals?: number;
    }
  ): Promise<void> {
    const participant = await this.getParticipant(id);
    if (participant) {
      if (metrics.boardRevenue !== undefined) {
        participant.boardRevenue = metrics.boardRevenue;
      }
      if (metrics.mspRevenue !== undefined) {
        participant.mspRevenue = metrics.mspRevenue;
      }
      if (metrics.voiceSeats !== undefined) {
        participant.voiceSeats = metrics.voiceSeats;
      }
      if (metrics.totalDeals !== undefined) {
        participant.totalDeals = metrics.totalDeals;
      }

      // Calculate total score based on metrics
      participant.score = 
        (participant.boardRevenue || 0) + 
        (participant.mspRevenue || 0) + 
        ((participant.voiceSeats || 0) * 10) + // Multiply voice seats by 10 points
        ((participant.totalDeals || 0) * 100);  // Multiply total deals by 100 points

      this.participants.set(id, participant);
    }
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(
      (admin) => admin.username === username
    );
  }
}

export const storage = new MemStorage();