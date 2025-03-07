import { InsertUser, User, Sale, InsertSale } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

interface LeaderboardEntry {
  userId: number;
  displayName: string;
  totalAmount: number;
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createSale(userId: number, sale: InsertSale): Promise<Sale>;
  getUserSales(userId: number): Promise<Sale[]>;
  getLeaderboard(): Promise<LeaderboardEntry[]>;
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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createSale(userId: number, insertSale: InsertSale): Promise<Sale> {
    const id = this.currentSaleId++;
    const sale: Sale = {
      id,
      userId,
      ...insertSale,
      date: new Date(),
    };
    this.sales.set(id, sale);
    return sale;
  }

  async getUserSales(userId: number): Promise<Sale[]> {
    return Array.from(this.sales.values()).filter(
      (sale) => sale.userId === userId,
    );
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const salesByUser = new Map<number, number>();
    
    // Calculate total sales per user
    for (const sale of this.sales.values()) {
      const currentTotal = salesByUser.get(sale.userId) || 0;
      salesByUser.set(sale.userId, currentTotal + sale.amount);
    }

    // Create leaderboard entries
    const entries: LeaderboardEntry[] = [];
    for (const [userId, totalAmount] of salesByUser) {
      const user = await this.getUser(userId);
      if (user) {
        entries.push({
          userId,
          displayName: user.displayName,
          totalAmount,
        });
      }
    }

    // Sort by total amount descending
    return entries.sort((a, b) => b.totalAmount - a.totalAmount);
  }
}

export const storage = new MemStorage();
