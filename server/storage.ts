import { InsertUser, User, Sale, InsertSale } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

interface LeaderboardEntry {
  userId: number;
  displayName: string;
  totalScore: number;
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createSale(userId: number, sale: InsertSale): Promise<Sale>;
  getUserSales(userId: number): Promise<Sale[]>;
  getLeaderboard(): Promise<LeaderboardEntry[]>;
  updateUserScore(userId: number, scoreToAdd: number): Promise<void>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sales: Map<number, Sale>;
  private currentUserId: number;
  private currentSaleId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.sales = new Map();
    this.currentUserId = 1;
    this.currentSaleId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      totalScore: 0
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserScore(userId: number, scoreToAdd: number): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      user.totalScore += scoreToAdd;
      this.users.set(userId, user);
    }
  }

  async createSale(userId: number, insertSale: InsertSale): Promise<Sale> {
    const id = this.currentSaleId++;
    const sale: Sale = {
      id,
      userId,
      ...insertSale,
      createdAt: new Date(),
    };
    this.sales.set(id, sale);

    // Update the user's total score
    await this.updateUserScore(userId, insertSale.score);

    return sale;
  }

  async getUserSales(userId: number): Promise<Sale[]> {
    return Array.from(this.sales.values())
      .filter((sale) => sale.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const entries: LeaderboardEntry[] = Array.from(this.users.values())
      .map(user => ({
        userId: user.id,
        displayName: user.displayName,
        totalScore: user.totalScore
      }))
      .sort((a, b) => b.totalScore - a.totalScore);

    return entries;
  }
}

export const storage = new MemStorage();