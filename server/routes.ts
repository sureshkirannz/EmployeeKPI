import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { hashPassword, comparePassword, generateToken, requireAuth, requireAdmin, type AuthRequest } from "./auth";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const validPassword = await comparePassword(password, user.passwordHash);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = generateToken(user.id, user.role);
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.json({
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          employeeName: user.employeeName,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("auth_token");
    return res.json({ success: true });
  });

  app.get("/api/auth/me", requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.json({
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          employeeName: user.employeeName,
        },
      });
    } catch (error) {
      console.error("Get user error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin routes - Employee management
  app.get("/api/admin/employees", requireAuth, requireAdmin, async (req, res) => {
    try {
      const employees = await storage.getAllEmployees();
      return res.json({ employees });
    } catch (error) {
      console.error("Get employees error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/employees", requireAuth, requireAdmin, async (req, res) => {
    try {
      const createUserSchema = insertUserSchema.extend({
        password: z.string().min(6, "Password must be at least 6 characters"),
      });

      const validatedData = createUserSchema.parse(req.body);
      const passwordHash = await hashPassword(validatedData.password);

      const newUser = await storage.createUser({
        ...validatedData,
        passwordHash,
      });

      return res.status(201).json({
        user: {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role,
          employeeName: newUser.employeeName,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Create employee error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/admin/employees/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData: any = { ...req.body };

      if (updateData.password) {
        updateData.passwordHash = await hashPassword(updateData.password);
        delete updateData.password;
      }

      const updatedUser = await storage.updateUser(id, updateData);
      if (!updatedUser) {
        return res.status(404).json({ error: "Employee not found" });
      }

      return res.json({
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          role: updatedUser.role,
          employeeName: updatedUser.employeeName,
        },
      });
    } catch (error) {
      console.error("Update employee error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/employees/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteUser(id);

      if (!deleted) {
        return res.status(404).json({ error: "Employee not found" });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error("Delete employee error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // KPI Target routes
  app.get("/api/admin/kpi-targets/:employeeId/:year", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { employeeId, year } = req.params;
      const target = await storage.getEmployeeKpiTarget(employeeId, parseInt(year));
      return res.json({ target });
    } catch (error) {
      console.error("Get KPI target error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/kpi-targets", requireAuth, requireAdmin, async (req, res) => {
    try {
      const target = await storage.createEmployeeKpiTarget(req.body);
      return res.status(201).json({ target });
    } catch (error) {
      console.error("Create KPI target error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/admin/kpi-targets/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const target = await storage.updateEmployeeKpiTarget(id, req.body);
      if (!target) {
        return res.status(404).json({ error: "KPI target not found" });
      }
      return res.json({ target });
    } catch (error) {
      console.error("Update KPI target error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Sales Target routes
  app.get("/api/admin/sales-targets/:employeeId/:year", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { employeeId, year } = req.params;
      const target = await storage.getEmployeeSalesTarget(employeeId, parseInt(year));
      return res.json({ target });
    } catch (error) {
      console.error("Get sales target error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/sales-targets", requireAuth, requireAdmin, async (req, res) => {
    try {
      const target = await storage.createEmployeeSalesTarget(req.body);
      return res.status(201).json({ target });
    } catch (error) {
      console.error("Create sales target error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/admin/sales-targets/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const target = await storage.updateEmployeeSalesTarget(id, req.body);
      if (!target) {
        return res.status(404).json({ error: "Sales target not found" });
      }
      return res.json({ target });
    } catch (error) {
      console.error("Update sales target error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin routes - Reports and analytics
  app.get("/api/admin/reports/overview", requireAuth, requireAdmin, async (req, res) => {
    try {
      const employees = await storage.getAllUsers();
      const currentYear = new Date().getFullYear();

      const employeeData = await Promise.all(
        employees
          .filter((e) => e.role === "employee")
          .map(async (employee) => {
            const kpiTarget = await storage.getEmployeeKpiTarget(employee.id, currentYear);
            const salesTarget = await storage.getEmployeeSalesTarget(employee.id, currentYear);
            const activities = await storage.getWeeklyActivitiesForEmployee(employee.id);

            return {
              id: employee.id,
              name: employee.employeeName,
              kpiTarget,
              salesTarget,
              weeklyActivityCount: activities.length,
            };
          })
      );

      return res.json({ employeeData });
    } catch (error) {
      console.error("Get admin overview error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Employee routes - Weekly activities
  app.get("/api/employee/weekly-activities", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { startDate, endDate } = req.query;
      const activities = await storage.getWeeklyActivitiesForEmployee(
        req.userId!,
        startDate as string | undefined,
        endDate as string | undefined
      );
      return res.json({ activities });
    } catch (error) {
      console.error("Get weekly activities error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/employee/weekly-activities", requireAuth, async (req: AuthRequest, res) => {
    try {
      const activity = await storage.createWeeklyActivity({
        ...req.body,
        employeeId: req.userId!,
      });
      return res.status(201).json({ activity });
    } catch (error) {
      console.error("Create weekly activity error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/employee/weekly-activities/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const activity = await storage.updateWeeklyActivity(id, req.body);
      if (!activity) {
        return res.status(404).json({ error: "Weekly activity not found" });
      }
      return res.json({ activity });
    } catch (error) {
      console.error("Update weekly activity error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Employee routes - Calculate KPI progress
  app.get("/api/employee/kpi-progress", requireAuth, async (req: AuthRequest, res) => {
    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      const kpiTarget = await storage.getEmployeeKpiTarget(req.userId!, currentYear);
      const activities = await storage.getWeeklyActivitiesForEmployee(req.userId!);

      if (!kpiTarget) {
        return res.json({ progress: null });
      }

      // Calculate totals from weekly activities for current year
      const currentYearActivities = activities.filter((a) => {
        const activityYear = new Date(a.weekStartDate).getFullYear();
        return activityYear === currentYear;
      });

      const currentMonthActivities = activities.filter((a) => {
        const activityDate = new Date(a.weekStartDate);
        return activityDate.getFullYear() === currentYear && activityDate.getMonth() + 1 === currentMonth;
      });

      const yearTotals = currentYearActivities.reduce(
        (acc, activity) => ({
          events: acc.events + activity.events,
          meetings: acc.meetings + activity.faceToFaceMeetings,
          videos: acc.videos + activity.videos,
          thankyouCards: acc.thankyouCards + activity.thankyouCards,
          leadsReceived: acc.leadsReceived + activity.leadsReceived,
          hoursProspected: acc.hoursProspected + parseFloat(activity.hoursProspected),
        }),
        { events: 0, meetings: 0, videos: 0, thankyouCards: 0, leadsReceived: 0, hoursProspected: 0 }
      );

      const monthTotals = currentMonthActivities.reduce(
        (acc, activity) => ({
          events: acc.events + activity.events,
          meetings: acc.meetings + activity.faceToFaceMeetings,
          videos: acc.videos + activity.videos,
          thankyouCards: acc.thankyouCards + activity.thankyouCards,
          leadsReceived: acc.leadsReceived + activity.leadsReceived,
          hoursProspected: acc.hoursProspected + parseFloat(activity.hoursProspected),
        }),
        { events: 0, meetings: 0, videos: 0, thankyouCards: 0, leadsReceived: 0, hoursProspected: 0 }
      );

      // Mock actual loan data (in real app, this would come from loan tracking system)
      const mockCurrentVolume = parseFloat(kpiTarget.annualVolumeGoal) * 0.45; // 45% progress
      const mockUnitsThisMonth = Math.floor(kpiTarget.requiredUnitsMonthly * 0.75); // 75% progress
      const mockLockedLoansThisMonth = Math.floor(kpiTarget.lockedLoansMonthly * 0.85); // 85% progress

      // Generate weekly breakdown from current month activities
      const weeklyBreakdown = [];
      const weeklyActivityMap = new Map<number, any>();
      
      currentMonthActivities.forEach((activity) => {
        const weekNum = Math.ceil(new Date(activity.weekStartDate).getDate() / 7);
        if (!weeklyActivityMap.has(weekNum)) {
          weeklyActivityMap.set(weekNum, {
            weekNumber: weekNum,
            events: 0,
            meetings: 0,
            videos: 0,
            thankyouCards: 0,
            leadsReceived: 0,
            hoursProspected: 0,
          });
        }
        const week = weeklyActivityMap.get(weekNum);
        week.events += activity.events;
        week.meetings += activity.faceToFaceMeetings;
        week.videos += activity.videos;
        week.thankyouCards += activity.thankyouCards;
        week.leadsReceived += activity.leadsReceived;
        week.hoursProspected += parseFloat(activity.hoursProspected);
      });
      
      for (let i = 1; i <= 4; i++) {
        weeklyBreakdown.push(weeklyActivityMap.get(i) || {
          weekNumber: i,
          events: 0,
          meetings: 0,
          videos: 0,
          thankyouCards: 0,
          leadsReceived: 0,
          hoursProspected: 0,
        });
      }

      // Generate monthly breakdown for all months in current year
      const monthlyBreakdown = [];
      for (let monthNum = 1; monthNum <= 12; monthNum++) {
        const monthActivities = currentYearActivities.filter((a) => {
          const activityMonth = new Date(a.weekStartDate).getMonth() + 1;
          return activityMonth === monthNum;
        });

        const monthTotal = monthActivities.reduce(
          (acc, activity) => ({
            events: acc.events + activity.events,
            meetings: acc.meetings + activity.faceToFaceMeetings,
            videos: acc.videos + activity.videos,
            thankyouCards: acc.thankyouCards + activity.thankyouCards,
            leadsReceived: acc.leadsReceived + activity.leadsReceived,
            hoursProspected: acc.hoursProspected + parseFloat(activity.hoursProspected),
          }),
          { events: 0, meetings: 0, videos: 0, thankyouCards: 0, leadsReceived: 0, hoursProspected: 0 }
        );

        monthlyBreakdown.push({
          month: monthNum,
          ...monthTotal,
          activityCount: monthActivities.length,
        });
      }

      return res.json({
        progress: {
          // Actual loan metrics (mocked for now - would come from loan system)
          volumeCompleted: mockCurrentVolume,
          unitsThisMonth: mockUnitsThisMonth,
          lockedLoansThisMonth: mockLockedLoansThisMonth,
          // Activity metrics from weekly tracking
          yearTotals,
          monthTotals,
          weeklyBreakdown,
          monthlyBreakdown,
          activitiesThisYear: currentYearActivities.length,
          activitiesThisMonth: currentMonthActivities.length,
        },
      });
    } catch (error) {
      console.error("Get KPI progress error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Employee routes - KPI and Sales targets (read-only)
  app.get("/api/employee/kpi-targets/:year", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { year } = req.params;
      const target = await storage.getEmployeeKpiTarget(req.userId!, parseInt(year));
      return res.json({ target });
    } catch (error) {
      console.error("Get employee KPI target error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/employee/sales-targets/:year", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { year } = req.params;
      const target = await storage.getEmployeeSalesTarget(req.userId!, parseInt(year));
      return res.json({ target });
    } catch (error) {
      console.error("Get employee sales target error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Past clients and top realtors
  app.get("/api/employee/past-clients", requireAuth, async (req: AuthRequest, res) => {
    try {
      const pastClient = await storage.getPastClient(req.userId!);
      return res.json({ pastClient });
    } catch (error) {
      console.error("Get past clients error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/employee/top-realtors", requireAuth, async (req: AuthRequest, res) => {
    try {
      const topRealtor = await storage.getTopRealtor(req.userId!);
      return res.json({ topRealtor });
    } catch (error) {
      console.error("Get top realtors error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
