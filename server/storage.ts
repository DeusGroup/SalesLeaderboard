import { InsertParticipant, Participant, Admin } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getParticipant(id: number): Promise<Participant | undefined>;
  getParticipantsByScore(): Promise<Participant[]>;
  createParticipant(participant: InsertParticipant): Promise<Participant>;
  updateParticipantScore(id: number, score: number): Promise<void>;
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
      password: "admin", // This should be hashed in production
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

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(
      (admin) => admin.username === username
    );
  }
}

export const storage = new MemStorage();