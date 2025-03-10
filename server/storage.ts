import { InsertParticipant, Participant, Admin, participants, admin, Deal } from "@shared/schema";
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
  addDeal(id: number, deal: Deal): Promise<Participant>;
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

    // Updated score calculation to use 2x multiplier for MSP Revenue
    const score =
      Number(updatedMetrics.boardRevenue) +
      (Number(updatedMetrics.mspRevenue) * 2) +
      (Number(updatedMetrics.voiceSeats) * 10) +
      (Number(updatedMetrics.totalDeals) * 50);

    const performanceHistory = [
      ...(participant.performanceHistory || []),
      {
        timestamp: new Date().toISOString(),
        score,
        description: `Points Update:
          Board Revenue: $${updatedMetrics.boardRevenue} (+${updatedMetrics.boardRevenue}),
          MSP Revenue: $${updatedMetrics.mspRevenue} (+${updatedMetrics.mspRevenue * 2}),
          Voice Seats: ${updatedMetrics.voiceSeats} (+${updatedMetrics.voiceSeats * 10}),
          Total Deals: ${updatedMetrics.totalDeals} (+${updatedMetrics.totalDeals * 50})
        `.replace(/\s+/g, ' ').trim(),
      },
    ];

    await db
      .update(participants)
      .set({
        ...updatedMetrics,
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

  async addDeal(id: number, deal: Deal): Promise<Participant> {
    const participant = await this.getParticipant(id);
    if (!participant) throw new Error("Participant not found");

    // Update metrics based on deal type
    const metrics: any = {
      totalDeals: (participant.totalDeals || 0) + 1
    };

    switch (deal.type) {
      case 'BOARD':
        metrics.boardRevenue = (participant.boardRevenue || 0) + deal.amount;
        break;
      case 'MSP':
        metrics.mspRevenue = (participant.mspRevenue || 0) + deal.amount;
        break;
      case 'VOICE':
        metrics.voiceSeats = (participant.voiceSeats || 0) + Math.floor(deal.amount);
        break;
    }

    // Update participant with new deal and metrics
    await db
      .update(participants)
      .set({
        ...metrics,
        dealHistory: [...(participant.dealHistory || []), deal]
      })
      .where(eq(participants.id, id));

    // Update metrics to recalculate score
    await this.updateParticipantMetrics(id, metrics);

    // Return updated participant
    return await this.getParticipant(id) as Participant;
  }
}

export const storage = new DatabaseStorage();