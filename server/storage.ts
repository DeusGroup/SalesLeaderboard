import { InsertParticipant, Participant, Admin, participants, admin } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getParticipant(id: number): Promise<Participant | undefined>;
  getParticipantsByScore(): Promise<Participant[]>;
  createParticipant(participant: InsertParticipant): Promise<Participant>;
  updateParticipantProfile(id: number, data: { name: string; role: string; department: string }): Promise<void>;
  updateParticipantMetrics(
    id: number,
    metrics: {
      boardRevenue?: number;
      mspRevenue?: number;
      voiceSeats?: number;
      totalDeals?: number;
    }
  ): Promise<void>;
  deleteParticipant(id: number): Promise<void>;
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getParticipant(id: number): Promise<Participant | undefined> {
    const [participant] = await db.select().from(participants).where(eq(participants.id, id));
    return participant;
  }

  async getParticipantsByScore(): Promise<Participant[]> {
    return db.select().from(participants).orderBy(participants.score);
  }

  async createParticipant(participant: InsertParticipant): Promise<Participant> {
    const [created] = await db.insert(participants).values(participant).returning();
    return created;
  }

  async updateParticipantProfile(id: number, data: { name: string; role: string; department: string }): Promise<void> {
    await db
      .update(participants)
      .set(data)
      .where(eq(participants.id, id));
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
    if (!participant) return;

    // Update the metrics
    const updatedMetrics = {
      ...participant,
      ...metrics,
    };

    // Calculate new score
    const score = 
      (updatedMetrics.boardRevenue || 0) +
      (updatedMetrics.mspRevenue || 0) +
      ((updatedMetrics.voiceSeats || 0) * 10) +
      ((updatedMetrics.totalDeals || 0) * 100);

    // Add to performance history
    const performanceHistory = [
      ...(participant.performanceHistory || []),
      {
        timestamp: new Date().toISOString(),
        score,
        description: `Score updated to ${score}`,
      },
    ];

    await db
      .update(participants)
      .set({
        ...metrics,
        score,
        performanceHistory,
      })
      .where(eq(participants.id, id));
  }

  async deleteParticipant(id: number): Promise<void> {
    await db.delete(participants).where(eq(participants.id, id));
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [foundAdmin] = await db
      .select()
      .from(admin)
      .where(eq(admin.username, username));
    return foundAdmin;
  }
}

export const storage = new DatabaseStorage();