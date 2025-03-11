import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Deal type definition
export const dealSchema = z.object({
  dealId: z.string(),
  title: z.string(),
  amount: z.number(),
  date: z.string(),
  type: z.enum(['BOARD', 'MSP', 'VOICE']),
});

export type Deal = z.infer<typeof dealSchema>;

export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  boardRevenue: integer("board_revenue").notNull().default(0),
  mspRevenue: integer("msp_revenue").notNull().default(0),
  voiceSeats: integer("voice_seats").notNull().default(0),
  totalDeals: integer("total_deals").notNull().default(0),
  boardRevenueGoal: integer("board_revenue_goal").notNull().default(0),
  mspRevenueGoal: integer("msp_revenue_goal").notNull().default(0),
  voiceSeatsGoal: integer("voice_seats_goal").notNull().default(0),
  totalDealsGoal: integer("total_deals_goal").notNull().default(0),
  score: integer("score").notNull().default(0),
  role: text("role").default("Sales Representative"),
  department: text("department").default("IT"),
  // Ensure dealHistory is properly typed as a JSON array
  dealHistory: json("deal_history").$type<Deal[]>().default([]),
  performanceHistory: json("performance_history").$type<Array<{
    timestamp: string;
    score: number;
    description: string;
  }>>().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const admin = pgTable("admin", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Schema for participant creation/update
export const insertParticipantSchema = createInsertSchema(participants).pick({
  name: true,
  avatarUrl: true,
  boardRevenue: true,
  mspRevenue: true,
  voiceSeats: true,
  totalDeals: true,
  boardRevenueGoal: true,
  mspRevenueGoal: true,
  voiceSeatsGoal: true,
  totalDealsGoal: true,
  role: true,
  department: true,
});

// Schema for deal creation
export const insertDealSchema = dealSchema.omit({ dealId: true });

// Schema for admin login
export const adminLoginSchema = createInsertSchema(admin).pick({
  username: true,
  password: true,
});

export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Participant = typeof participants.$inferSelect;
export type Admin = typeof admin.$inferSelect;