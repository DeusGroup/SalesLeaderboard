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
  removeDeal(id: number, dealId: string): Promise<Participant>;
  removeManyDeals(id: number, dealIds: string[]): Promise<Participant>;
  updateManyDeals(id: number, dealIds: string[], data: { title: string }): Promise<Participant>;
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
    const [participant] = await db
      .select()
      .from(participants)
      .where(eq(participants.id, id));

    // Ensure dealHistory is properly initialized as an array
    if (participant) {
      participant.dealHistory = participant.dealHistory || [];
    }

    return participant;
  }

  async getParticipantsByScore(): Promise<Participant[]> {
    const allParticipants = await db
      .select()
      .from(participants)
      .orderBy(desc(participants.score));

    // Ensure dealHistory is properly initialized for all participants
    return allParticipants.map(participant => ({
      ...participant,
      dealHistory: participant.dealHistory || []
    }));
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
    console.log('[Storage] Adding deal - Input:', { participantId: id, deal });

    const participant = await this.getParticipant(id);
    if (!participant) throw new Error("Participant not found");

    console.log('[Storage] Found participant:', {
      id: participant.id,
      currentDealHistory: participant.dealHistory
    });

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

    // Ensure dealHistory is an array and add the new deal
    const dealHistory = Array.isArray(participant.dealHistory) ? [...participant.dealHistory, deal] : [deal];

    console.log('[Storage] Updating participant with:', {
      metrics,
      dealHistoryLength: dealHistory.length,
      latestDeal: deal
    });

    // Update participant with new deal and metrics
    await db
      .update(participants)
      .set({
        ...metrics,
        dealHistory
      })
      .where(eq(participants.id, id));

    // Update metrics to recalculate score
    await this.updateParticipantMetrics(id, metrics);

    // Fetch and return updated participant
    const updatedParticipant = await this.getParticipant(id);
    if (!updatedParticipant) throw new Error("Failed to fetch updated participant");

    console.log('[Storage] Updated participant result:', {
      id: updatedParticipant.id,
      dealHistoryLength: updatedParticipant.dealHistory.length,
      deals: updatedParticipant.dealHistory
    });

    return updatedParticipant;
  }

  async removeDeal(id: number, dealId: string): Promise<Participant> {
    const participant = await this.getParticipant(id);
    if (!participant) throw new Error("Participant not found");

    const dealToRemove = participant.dealHistory?.find(d => d.dealId === dealId);
    if (!dealToRemove) throw new Error("Deal not found");

    // Update metrics based on removed deal
    const metrics: any = {
      totalDeals: (participant.totalDeals || 0) - 1
    };

    switch (dealToRemove.type) {
      case 'BOARD':
        metrics.boardRevenue = (participant.boardRevenue || 0) - dealToRemove.amount;
        break;
      case 'MSP':
        metrics.mspRevenue = (participant.mspRevenue || 0) - dealToRemove.amount;
        break;
      case 'VOICE':
        metrics.voiceSeats = (participant.voiceSeats || 0) - Math.floor(dealToRemove.amount);
        break;
    }

    // Update participant by removing deal and updating metrics
    await db
      .update(participants)
      .set({
        ...metrics,
        dealHistory: participant.dealHistory?.filter(d => d.dealId !== dealId) || []
      })
      .where(eq(participants.id, id));

    // Update metrics to recalculate score
    await this.updateParticipantMetrics(id, metrics);

    // Return updated participant
    return await this.getParticipant(id) as Participant;
  }

  async removeManyDeals(id: number, dealIds: string[]): Promise<Participant> {
    const participant = await this.getParticipant(id);
    if (!participant) throw new Error("Participant not found");

    const dealsToRemove = participant.dealHistory?.filter(d => dealIds.includes(d.dealId)) || [];

    // Calculate total metrics adjustment
    const metrics = dealsToRemove.reduce((acc, deal) => {
      switch (deal.type) {
        case 'BOARD':
          acc.boardRevenue = (acc.boardRevenue || 0) - deal.amount;
          break;
        case 'MSP':
          acc.mspRevenue = (acc.mspRevenue || 0) - deal.amount;
          break;
        case 'VOICE':
          acc.voiceSeats = (acc.voiceSeats || 0) - Math.floor(deal.amount);
          break;
      }
      return acc;
    }, {
      totalDeals: -dealsToRemove.length,
      boardRevenue: 0,
      mspRevenue: 0,
      voiceSeats: 0
    });

    // Update participant metrics and remove deals
    await db
      .update(participants)
      .set({
        boardRevenue: (participant.boardRevenue || 0) + (metrics.boardRevenue || 0),
        mspRevenue: (participant.mspRevenue || 0) + (metrics.mspRevenue || 0),
        voiceSeats: (participant.voiceSeats || 0) + (metrics.voiceSeats || 0),
        totalDeals: (participant.totalDeals || 0) + metrics.totalDeals,
        dealHistory: participant.dealHistory?.filter(d => !dealIds.includes(d.dealId)) || []
      })
      .where(eq(participants.id, id));

    // Update metrics to recalculate score
    await this.updateParticipantMetrics(id, {
      boardRevenue: (participant.boardRevenue || 0) + (metrics.boardRevenue || 0),
      mspRevenue: (participant.mspRevenue || 0) + (metrics.mspRevenue || 0),
      voiceSeats: (participant.voiceSeats || 0) + (metrics.voiceSeats || 0),
      totalDeals: (participant.totalDeals || 0) + metrics.totalDeals
    });

    // Return updated participant
    return await this.getParticipant(id) as Participant;
  }

  async updateManyDeals(id: number, dealIds: string[], data: { title: string }): Promise<Participant> {
    const participant = await this.getParticipant(id);
    if (!participant) throw new Error("Participant not found");

    const updatedDealHistory = participant.dealHistory?.map(deal =>
      dealIds.includes(deal.dealId) ? { ...deal, ...data } : deal
    ) || [];

    await db
      .update(participants)
      .set({ dealHistory: updatedDealHistory })
      .where(eq(participants.id, id));

    return await this.getParticipant(id) as Participant;
  }
}

export const storage = new DatabaseStorage();