import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("employee"),
  employeeName: text("employee_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const employeeKpiTargets = pgTable("employee_kpi_targets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  year: integer("year").notNull(),
  annualVolumeGoal: decimal("annual_volume_goal", { precision: 15, scale: 2 }).notNull(),
  avgLoanAmount: decimal("avg_loan_amount", { precision: 12, scale: 2 }).notNull(),
  requiredUnitsMonthly: integer("required_units_monthly").notNull(),
  lockPercentage: decimal("lock_percentage", { precision: 5, scale: 2 }).notNull(),
  lockedLoansMonthly: integer("locked_loans_monthly").notNull(),
  newFileToLockedPercentage: decimal("new_file_to_locked_percentage", { precision: 5, scale: 2 }).notNull(),
  newFilesMonthly: decimal("new_files_monthly", { precision: 8, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEmployeeKpiTargetSchema = createInsertSchema(employeeKpiTargets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertEmployeeKpiTarget = z.infer<typeof insertEmployeeKpiTargetSchema>;
export type EmployeeKpiTarget = typeof employeeKpiTargets.$inferSelect;

export const employeeSalesTargets = pgTable("employee_sales_targets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  year: integer("year").notNull(),
  eventsTarget: integer("events_target").notNull().default(52),
  meetingsTarget: integer("meetings_target").notNull().default(240),
  thankyouTarget: integer("thankyou_target").notNull().default(365),
  prospectingTarget: integer("prospecting_target").notNull().default(365),
  videosTarget: integer("videos_target").notNull().default(365),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEmployeeSalesTargetSchema = createInsertSchema(employeeSalesTargets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertEmployeeSalesTarget = z.infer<typeof insertEmployeeSalesTargetSchema>;
export type EmployeeSalesTarget = typeof employeeSalesTargets.$inferSelect;

export const weeklyActivities = pgTable("weekly_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  weekStartDate: date("week_start_date").notNull(),
  weekEndDate: date("week_end_date").notNull(),
  faceToFaceMeetings: integer("face_to_face_meetings").notNull().default(0),
  events: integer("events").notNull().default(0),
  videos: integer("videos").notNull().default(0),
  hoursProspected: decimal("hours_prospected", { precision: 5, scale: 2 }).notNull().default("0"),
  thankYouCards: integer("thank_you_cards").notNull().default(0),
  leadsReceived: integer("leads_received").notNull().default(0),
  dailyBreakdown: jsonb("daily_breakdown"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWeeklyActivitySchema = createInsertSchema(weeklyActivities).omit({
  id: true,
  createdAt: true,
});

export type InsertWeeklyActivity = z.infer<typeof insertWeeklyActivitySchema>;
export type WeeklyActivity = typeof weeklyActivities.$inferSelect;

export const pastClients = pgTable("past_clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  totalCount: integer("total_count").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPastClientSchema = createInsertSchema(pastClients).omit({
  id: true,
  updatedAt: true,
});

export type InsertPastClient = z.infer<typeof insertPastClientSchema>;
export type PastClient = typeof pastClients.$inferSelect;

export const topRealtors = pgTable("top_realtors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  totalCount: integer("total_count").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTopRealtorSchema = createInsertSchema(topRealtors).omit({
  id: true,
  updatedAt: true,
});

export type InsertTopRealtor = z.infer<typeof insertTopRealtorSchema>;
export type TopRealtor = typeof topRealtors.$inferSelect;

export const loans = pgTable("loans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  loanAmount: decimal("loan_amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default("new"),
  lockedDate: date("locked_date"),
  closedDate: date("closed_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLoanSchema = createInsertSchema(loans).omit({
  id: true,
  createdAt: true,
});

export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type Loan = typeof loans.$inferSelect;
