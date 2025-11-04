import {
  type User,
  type InsertUser,
  type EmployeeKpiTarget,
  type InsertEmployeeKpiTarget,
  type EmployeeSalesTarget,
  type InsertEmployeeSalesTarget,
  type WeeklyActivity,
  type InsertWeeklyActivity,
  type PastClient,
  type InsertPastClient,
  type TopRealtor,
  type InsertTopRealtor,
  users,
  employeeKpiTargets,
  employeeSalesTargets,
  weeklyActivities,
  pastClients,
  topRealtors,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllEmployees(): Promise<User[]>;

  // Employee KPI Targets
  getEmployeeKpiTarget(employeeId: string, year: number): Promise<EmployeeKpiTarget | undefined>;
  createEmployeeKpiTarget(target: InsertEmployeeKpiTarget): Promise<EmployeeKpiTarget>;
  updateEmployeeKpiTarget(id: string, target: Partial<InsertEmployeeKpiTarget>): Promise<EmployeeKpiTarget | undefined>;
  deleteEmployeeKpiTarget(id: string): Promise<boolean>;

  // Employee Sales Targets
  getEmployeeSalesTarget(employeeId: string, year: number): Promise<EmployeeSalesTarget | undefined>;
  createEmployeeSalesTarget(target: InsertEmployeeSalesTarget): Promise<EmployeeSalesTarget>;
  updateEmployeeSalesTarget(id: string, target: Partial<InsertEmployeeSalesTarget>): Promise<EmployeeSalesTarget | undefined>;
  deleteEmployeeSalesTarget(id: string): Promise<boolean>;

  // Weekly Activities
  getWeeklyActivity(employeeId: string, weekStartDate: string): Promise<WeeklyActivity | undefined>;
  getWeeklyActivitiesForEmployee(employeeId: string, startDate?: string, endDate?: string): Promise<WeeklyActivity[]>;
  createWeeklyActivity(activity: InsertWeeklyActivity): Promise<WeeklyActivity>;
  updateWeeklyActivity(id: string, activity: Partial<InsertWeeklyActivity>): Promise<WeeklyActivity | undefined>;
  deleteWeeklyActivity(id: string): Promise<boolean>;

  // Past Clients
  getPastClient(employeeId: string): Promise<PastClient | undefined>;
  createPastClient(pastClient: InsertPastClient): Promise<PastClient>;
  updatePastClient(employeeId: string, totalCount: number): Promise<PastClient | undefined>;

  // Top Realtors
  getTopRealtor(employeeId: string): Promise<TopRealtor | undefined>;
  createTopRealtor(topRealtor: InsertTopRealtor): Promise<TopRealtor>;
  updateTopRealtor(employeeId: string, totalCount: number): Promise<TopRealtor | undefined>;
}

export class PostgresStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  async getAllEmployees(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, "employee"));
  }

  // Employee KPI Targets
  async getEmployeeKpiTarget(employeeId: string, year: number): Promise<EmployeeKpiTarget | undefined> {
    const result = await db
      .select()
      .from(employeeKpiTargets)
      .where(and(eq(employeeKpiTargets.employeeId, employeeId), eq(employeeKpiTargets.year, year)))
      .limit(1);
    return result[0];
  }

  async createEmployeeKpiTarget(target: InsertEmployeeKpiTarget): Promise<EmployeeKpiTarget> {
    const result = await db.insert(employeeKpiTargets).values(target).returning();
    return result[0];
  }

  async updateEmployeeKpiTarget(id: string, target: Partial<InsertEmployeeKpiTarget>): Promise<EmployeeKpiTarget | undefined> {
    const result = await db
      .update(employeeKpiTargets)
      .set({ ...target, updatedAt: new Date() })
      .where(eq(employeeKpiTargets.id, id))
      .returning();
    return result[0];
  }

  async deleteEmployeeKpiTarget(id: string): Promise<boolean> {
    const result = await db.delete(employeeKpiTargets).where(eq(employeeKpiTargets.id, id)).returning();
    return result.length > 0;
  }

  // Employee Sales Targets
  async getEmployeeSalesTarget(employeeId: string, year: number): Promise<EmployeeSalesTarget | undefined> {
    const result = await db
      .select()
      .from(employeeSalesTargets)
      .where(and(eq(employeeSalesTargets.employeeId, employeeId), eq(employeeSalesTargets.year, year)))
      .limit(1);
    return result[0];
  }

  async createEmployeeSalesTarget(target: InsertEmployeeSalesTarget): Promise<EmployeeSalesTarget> {
    const result = await db.insert(employeeSalesTargets).values(target).returning();
    return result[0];
  }

  async updateEmployeeSalesTarget(id: string, target: Partial<InsertEmployeeSalesTarget>): Promise<EmployeeSalesTarget | undefined> {
    const result = await db
      .update(employeeSalesTargets)
      .set({ ...target, updatedAt: new Date() })
      .where(eq(employeeSalesTargets.id, id))
      .returning();
    return result[0];
  }

  async deleteEmployeeSalesTarget(id: string): Promise<boolean> {
    const result = await db.delete(employeeSalesTargets).where(eq(employeeSalesTargets.id, id)).returning();
    return result.length > 0;
  }

  // Weekly Activities
  async getWeeklyActivity(employeeId: string, weekStartDate: string): Promise<WeeklyActivity | undefined> {
    const result = await db
      .select()
      .from(weeklyActivities)
      .where(and(eq(weeklyActivities.employeeId, employeeId), eq(weeklyActivities.weekStartDate, weekStartDate)))
      .limit(1);
    return result[0];
  }

  async getWeeklyActivitiesForEmployee(employeeId: string, startDate?: string, endDate?: string): Promise<WeeklyActivity[]> {
    const conditions = [eq(weeklyActivities.employeeId, employeeId)];

    if (startDate && endDate) {
      conditions.push(gte(weeklyActivities.weekStartDate, startDate));
      conditions.push(lte(weeklyActivities.weekEndDate, endDate));
    }

    return await db
      .select()
      .from(weeklyActivities)
      .where(and(...conditions))
      .orderBy(desc(weeklyActivities.weekStartDate));
  }

  async createWeeklyActivity(activity: InsertWeeklyActivity): Promise<WeeklyActivity> {
    const result = await db.insert(weeklyActivities).values(activity).returning();
    return result[0];
  }

  async updateWeeklyActivity(id: string, activity: Partial<InsertWeeklyActivity>): Promise<WeeklyActivity | undefined> {
    const result = await db.update(weeklyActivities).set(activity).where(eq(weeklyActivities.id, id)).returning();
    return result[0];
  }

  async deleteWeeklyActivity(id: string): Promise<boolean> {
    const result = await db.delete(weeklyActivities).where(eq(weeklyActivities.id, id)).returning();
    return result.length > 0;
  }

  // Past Clients
  async getPastClient(employeeId: string): Promise<PastClient | undefined> {
    const result = await db.select().from(pastClients).where(eq(pastClients.employeeId, employeeId)).limit(1);
    return result[0];
  }

  async createPastClient(pastClient: InsertPastClient): Promise<PastClient> {
    const result = await db.insert(pastClients).values(pastClient).returning();
    return result[0];
  }

  async updatePastClient(employeeId: string, totalCount: number): Promise<PastClient | undefined> {
    const result = await db
      .update(pastClients)
      .set({ totalCount, updatedAt: new Date() })
      .where(eq(pastClients.employeeId, employeeId))
      .returning();
    return result[0];
  }

  // Top Realtors
  async getTopRealtor(employeeId: string): Promise<TopRealtor | undefined> {
    const result = await db.select().from(topRealtors).where(eq(topRealtors.employeeId, employeeId)).limit(1);
    return result[0];
  }

  async createTopRealtor(topRealtor: InsertTopRealtor): Promise<TopRealtor> {
    const result = await db.insert(topRealtors).values(topRealtor).returning();
    return result[0];
  }

  async updateTopRealtor(employeeId: string, totalCount: number): Promise<TopRealtor | undefined> {
    const result = await db
      .update(topRealtors)
      .set({ totalCount, updatedAt: new Date() })
      .where(eq(topRealtors.employeeId, employeeId))
      .returning();
    return result[0];
  }
}

export const storage = new PostgresStorage();
