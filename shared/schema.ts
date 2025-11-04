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
  borrowerName: text("borrower_name"),
  loanAmount: decimal("loan_amount", { precision: 12, scale: 2 }).notNull(),
  loanType: text("loan_type").notNull().default("purchase"),
  status: text("status").notNull().default("lead"),
  lockedDate: date("locked_date"),
  closedDate: date("closed_date"),
  expectedCloseDate: date("expected_close_date"),
  referralSource: text("referral_source"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLoanSchema = createInsertSchema(loans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type Loan = typeof loans.$inferSelect;

export const dailyActivities = pgTable("daily_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  activityDate: date("activity_date").notNull(),
  callsMade: integer("calls_made").notNull().default(0),
  appointmentsScheduled: integer("appointments_scheduled").notNull().default(0),
  appointmentsCompleted: integer("appointments_completed").notNull().default(0),
  applicationsSubmitted: integer("applications_submitted").notNull().default(0),
  preQualsCompleted: integer("pre_quals_completed").notNull().default(0),
  creditPulls: integer("credit_pulls").notNull().default(0),
  followUps: integer("follow_ups").notNull().default(0),
  realtorMeetings: integer("realtor_meetings").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDailyActivitySchema = createInsertSchema(dailyActivities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDailyActivity = z.infer<typeof insertDailyActivitySchema>;
export type DailyActivity = typeof dailyActivities.$inferSelect;

export const coachingNotes = pgTable("coaching_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  managerId: varchar("manager_id").notNull().references(() => users.id),
  noteType: text("note_type").notNull().default("feedback"),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  actionItems: text("action_items"),
  isPrivate: integer("is_private").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCoachingNoteSchema = createInsertSchema(coachingNotes).omit({
  id: true,
  createdAt: true,
});

export type InsertCoachingNote = z.infer<typeof insertCoachingNoteSchema>;
export type CoachingNote = typeof coachingNotes.$inferSelect;

export const realtorPartners = pgTable("realtor_partners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  company: text("company"),
  phone: text("phone"),
  email: text("email"),
  lastContactDate: date("last_contact_date"),
  relationshipStrength: text("relationship_strength").notNull().default("new"),
  loansReferred: integer("loans_referred").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRealtorPartnerSchema = createInsertSchema(realtorPartners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertRealtorPartner = z.infer<typeof insertRealtorPartnerSchema>;
export type RealtorPartner = typeof realtorPartners.$inferSelect;
