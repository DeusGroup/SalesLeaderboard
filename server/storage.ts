import { InsertParticipant, Participant, Admin, participants, admin } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getParticipant(id: number): Promise<Participant | undefined>;
  getParticipantsByScore(): Promise<Participant[]>;
  createParticipant(participant: InsertParticipant): Promise<Participant>;
  updateParticipantProfile(id: number, data: { name: string; role: string; department: string; avatarUrl?: string }): Promise<void>;
  updateParticipantMetrics(
    id: number,
    metrics: {
      boardRevenue?: number;
      mspRevenue?: number;
      voiceSeats?: number;
      totalDeals?: number;
      boardRevenueGoal?: number;
      mspRevenueGoal?: number;
      voiceSeatsGoal?: number;
      totalDealsGoal?: number;
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
    console.log('[Storage] Fetching participant:', id);

    const [participant] = await db
      .select()
      .from(participants)
      .where(eq(participants.id, id));

    if (!participant) {
      console.log('[Storage] Participant not found:', id);
      return undefined;
    }

    return participant;
  }

  async getParticipantsByScore(): Promise<Participant[]> {
    console.log('[Storage] Fetching all participants');
    return db
      .select()
      .from(participants)
      .orderBy(desc(participants.score));
  }

  async createParticipant(participant: InsertParticipant): Promise<Participant> {
    const [created] = await db.insert(participants).values(participant).returning();
    return created;
  }

  async updateParticipantProfile(id: number, data: { name: string; role: string; department: string; avatarUrl?: string }): Promise<void> {
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
      boardRevenueGoal?: number;
      mspRevenueGoal?: number;
      voiceSeatsGoal?: number;
      totalDealsGoal?: number;
    }
  ): Promise<void> {
    const participant = await this.getParticipant(id);
    if (!participant) return;

    const updatedMetrics = {
      boardRevenue: metrics.boardRevenue ?? participant.boardRevenue,
      mspRevenue: metrics.mspRevenue ?? participant.mspRevenue,
      voiceSeats: metrics.voiceSeats ?? participant.voiceSeats,
      totalDeals: metrics.totalDeals ?? participant.totalDeals,
      boardRevenueGoal: metrics.boardRevenueGoal ?? participant.boardRevenueGoal,
      mspRevenueGoal: metrics.mspRevenueGoal ?? participant.mspRevenueGoal,
      voiceSeatsGoal: metrics.voiceSeatsGoal ?? participant.voiceSeatsGoal,
      totalDealsGoal: metrics.totalDealsGoal ?? participant.totalDealsGoal,
    };

    // Score calculation with 2x multiplier for MSP Revenue
    const score =
      Number(updatedMetrics.boardRevenue) +
      (Number(updatedMetrics.mspRevenue) * 2) +
      (Number(updatedMetrics.voiceSeats) * 10) +
      (Number(updatedMetrics.totalDeals) * 50);

    await db
      .update(participants)
      .set({
        ...updatedMetrics,
        score,
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