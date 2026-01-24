import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

// Register new user with email/password
export function registerAuthRoutes(app: Express) {
  // Register endpoint
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      // Check if user already exists
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user with generated openId
      const openId = `email_${nanoid()}`;
      await db.upsertUser({
        openId,
        email,
        name: name || null,
        password: hashedPassword,
        loginMethod: "email",
        lastSignedIn: new Date(),
      });

      // Create session token
      const sessionToken = await sdk.createSessionToken(openId, {
        name: name || email,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      return res.json({ success: true, message: "Registration successful" });
    } catch (error) {
      console.error("[Auth] Registration failed:", error);
      return res.status(500).json({ error: "Registration failed" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Find user by email
      const user = await db.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Update last signed in
      await db.upsertUser({
        openId: user.openId,
        lastSignedIn: new Date(),
      });

      // Create session token
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || user.email || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      });
    } catch (error) {
      console.error("[Auth] Login failed:", error);
      return res.status(500).json({ error: "Login failed" });
    }
  });

  // Logout endpoint (already exists via tRPC but adding REST version too)
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return res.json({ success: true });
  });

  // Check auth status
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);
      return res.json({
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      });
    } catch {
      return res.json({ authenticated: false, user: null });
    }
  });

  // One-time admin setup - makes the specified email an admin
  // Usage: POST /api/auth/make-admin with { email, secretKey }
  app.post("/api/auth/make-admin", async (req: Request, res: Response) => {
    try {
      const { email, secretKey } = req.body;

      // Require the JWT_SECRET as a simple auth mechanism
      if (secretKey !== process.env.JWT_SECRET) {
        return res.status(403).json({ error: "Invalid secret key" });
      }

      if (!email) {
        return res.status(400).json({ error: "Email required" });
      }

      const user = await db.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      await db.updateUserRole(user.id, "admin");
      return res.json({ success: true, message: `${email} is now an admin` });
    } catch (error) {
      console.error("[Auth] Make admin failed:", error);
      return res.status(500).json({ error: "Failed to update role" });
    }
  });
}
