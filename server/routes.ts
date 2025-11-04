import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { hashPassword, comparePassword, generateToken, requireAuth, requireAdmin, type AuthRequest } from "./auth";
import { insertUserSchema, type User } from "@shared/schema";
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
      const createUserSchema = insertUserSchema.omit({ passwordHash: true }).extend({
        password: z.string().min(6, "Password must be at least 6 characters"),
      });

      const validatedData = createUserSchema.parse(req.body);
      const passwordHash = await hashPassword(validatedData.password);

      const newUser = await storage.createUser({
        username: validatedData.username,
        employeeName: validatedData.employeeName,
        role: validatedData.role,
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

  // Admin routes - Dashboard stats
  app.get("/api/admin/stats", requireAuth, requireAdmin, async (req, res) => {
    try {
      const currentYear = new Date().getFullYear();
      const employees = await storage.getAllEmployees();

      let totalVolumeGoal = 0;
      let totalVolumeCompleted = 0;
      let totalUnitsTarget = 0;
      let totalUnitsCompleted = 0;

      for (const employee of employees) {
        const kpiTarget = await storage.getEmployeeKpiTarget(employee.id, currentYear);
        if (kpiTarget) {
          totalVolumeGoal += parseFloat(kpiTarget.annualVolumeGoal);
          totalUnitsTarget += kpiTarget.requiredUnitsMonthly * 12;
        }

        const loans = await storage.getLoansForEmployee(employee.id, currentYear);
        const volume = loans
          .filter(loan => loan.closedDate)
          .reduce((sum, loan) => sum + parseFloat(loan.loanAmount), 0);
        const units = loans.filter(loan => loan.closedDate).length;
        
        totalVolumeCompleted += volume;
        totalUnitsCompleted += units;
      }

      const volumeProgress = totalVolumeGoal > 0 ? Math.round((totalVolumeCompleted / totalVolumeGoal) * 100) : 0;
      const unitsProgress = totalUnitsTarget > 0 ? Math.round((totalUnitsCompleted / totalUnitsTarget) * 100) : 0;

      // Get monthly data for charts
      const monthlyData = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonthIndex = new Date().getMonth();
      const monthlyTarget = Math.ceil(totalUnitsTarget / 12);

      for (let monthIndex = 0; monthIndex <= currentMonthIndex; monthIndex++) {
        let monthUnits = 0;
        
        for (const employee of employees) {
          const loans = await storage.getLoansForEmployee(employee.id, currentYear);
          const monthLoans = loans.filter(loan => {
            if (!loan.closedDate) return false;
            return new Date(loan.closedDate).getMonth() === monthIndex;
          });
          monthUnits += monthLoans.length;
        }

        monthlyData.push({
          name: monthNames[monthIndex],
          value: monthUnits,
          target: monthlyTarget,
        });
      }

      return res.json({
        stats: {
          totalVolumeGoal,
          totalVolumeCompleted,
          volumeProgress,
          totalUnitsTarget: monthlyTarget,
          totalUnitsCompleted: Math.round(totalUnitsCompleted / (currentMonthIndex + 1)),
          unitsProgress,
          employeeCount: employees.length,
          monthlyData,
        },
      });
    } catch (error) {
      console.error("Get admin stats error:", error);
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
          .filter((e: User) => e.role === "employee")
          .map(async (employee: User) => {
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
          thankyouCards: acc.thankyouCards + activity.thankYouCards,
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
          thankyouCards: acc.thankyouCards + activity.thankYouCards,
          leadsReceived: acc.leadsReceived + activity.leadsReceived,
          hoursProspected: acc.hoursProspected + parseFloat(activity.hoursProspected),
        }),
        { events: 0, meetings: 0, videos: 0, thankyouCards: 0, leadsReceived: 0, hoursProspected: 0 }
      );

      // Get actual loan data from the database
      const loansThisYear = await storage.getLoansForEmployee(req.userId!, currentYear);
      
      const totalVolume = loansThisYear
        .filter(loan => loan.closedDate)
        .reduce((sum, loan) => sum + parseFloat(loan.loanAmount), 0);
      
      const closedLoansThisMonth = loansThisYear.filter(loan => {
        if (!loan.closedDate) return false;
        const closedMonth = new Date(loan.closedDate).getMonth() + 1;
        return closedMonth === currentMonth;
      }).length;
      
      const lockedLoansThisMonth = loansThisYear.filter(loan => {
        if (!loan.lockedDate) return false;
        const lockedMonth = new Date(loan.lockedDate).getMonth() + 1;
        return lockedMonth === currentMonth;
      }).length;

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
        week.thankyouCards += activity.thankYouCards;
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
            thankyouCards: acc.thankyouCards + activity.thankYouCards,
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
          // Actual loan metrics from database
          volumeCompleted: totalVolume,
          unitsThisMonth: closedLoansThisMonth,
          lockedLoansThisMonth: lockedLoansThisMonth,
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

  // Daily Activities Routes
  app.get("/api/employee/daily-activities", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { startDate, endDate } = req.query;
      const activities = await storage.getDailyActivitiesForEmployee(
        req.userId!,
        startDate as string,
        endDate as string
      );
      return res.json({ activities });
    } catch (error) {
      console.error("Get daily activities error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/employee/daily-activities/:date", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { date } = req.params;
      const activity = await storage.getDailyActivity(req.userId!, date);
      return res.json({ activity });
    } catch (error) {
      console.error("Get daily activity error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/employee/daily-activities", requireAuth, async (req: AuthRequest, res) => {
    try {
      const activity = await storage.createDailyActivity({
        ...req.body,
        employeeId: req.userId!,
      });
      return res.status(201).json({ activity });
    } catch (error) {
      console.error("Create daily activity error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/employee/daily-activities/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const activity = await storage.updateDailyActivity(id, req.body);
      if (!activity) {
        return res.status(404).json({ error: "Activity not found" });
      }
      return res.json({ activity });
    } catch (error) {
      console.error("Update daily activity error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Enhanced Loan Routes
  app.put("/api/employee/loans/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const loan = await storage.updateLoan(id, req.body);
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }
      return res.json({ loan });
    } catch (error) {
      console.error("Update loan error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/employee/loans/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteLoan(id);
      if (!deleted) {
        return res.status(404).json({ error: "Loan not found" });
      }
      return res.json({ success: true });
    } catch (error) {
      console.error("Delete loan error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Coaching Notes Routes
  app.get("/api/employee/coaching-notes", requireAuth, async (req: AuthRequest, res) => {
    try {
      const notes = await storage.getCoachingNotesForEmployee(req.userId!);
      return res.json({ notes });
    } catch (error) {
      console.error("Get coaching notes error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/coaching-notes", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const note = await storage.createCoachingNote({
        ...req.body,
        managerId: req.userId!,
      });
      return res.status(201).json({ note });
    } catch (error) {
      console.error("Create coaching note error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/coaching-notes/:id", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCoachingNote(id);
      if (!deleted) {
        return res.status(404).json({ error: "Note not found" });
      }
      return res.json({ success: true });
    } catch (error) {
      console.error("Delete coaching note error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Realtor Partners Routes
  app.get("/api/employee/realtor-partners", requireAuth, async (req: AuthRequest, res) => {
    try {
      const partners = await storage.getRealtorPartnersForEmployee(req.userId!);
      return res.json({ partners });
    } catch (error) {
      console.error("Get realtor partners error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/employee/realtor-partners", requireAuth, async (req: AuthRequest, res) => {
    try {
      const partner = await storage.createRealtorPartner({
        ...req.body,
        employeeId: req.userId!,
      });
      return res.status(201).json({ partner });
    } catch (error) {
      console.error("Create realtor partner error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/employee/realtor-partners/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const partner = await storage.updateRealtorPartner(id, req.body);
      if (!partner) {
        return res.status(404).json({ error: "Partner not found" });
      }
      return res.json({ partner });
    } catch (error) {
      console.error("Update realtor partner error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/employee/realtor-partners/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteRealtorPartner(id);
      if (!deleted) {
        return res.status(404).json({ error: "Partner not found" });
      }
      return res.json({ success: true });
    } catch (error) {
      console.error("Delete realtor partner error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
