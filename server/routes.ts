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

  const httpServer = createServer(app);
  return httpServer;
}
