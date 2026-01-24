import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic } from "./static";
import klaviyoRouter from "../klaviyo";
import seedRouter from "../seed-blogs-api";
import seedCommunityRouter from "../seed-community-api";
import airwallexRouter from "../airwallex";

// Database migration function
async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    console.log("[Migration] No DATABASE_URL found, skipping migrations");
    return;
  }

  console.log("[Migration] Checking database schema...");

  try {
    const { drizzle } = await import("drizzle-orm/mysql2");
    const { migrate } = await import("drizzle-orm/mysql2/migrator");
    const mysql = await import("mysql2/promise");

    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    const db = drizzle(connection);

    await migrate(db, { migrationsFolder: "./drizzle" });

    console.log("[Migration] Database schema is up to date");
    await connection.end();
  } catch (error: any) {
    // Check if it's just "table already exists" which is fine
    if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.message?.includes('already exists')) {
      console.log("[Migration] Tables already exist, continuing...");
    } else {
      console.error("[Migration] Migration error (non-fatal):", error.message || error);
    }
  }
}

// CORS configuration for cross-origin requests (Netlify/Vercel frontend -> Railway backend)
const ALLOWED_ORIGINS = [
  "https://psyspeak.netlify.app",
  "https://psy-neon.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  // Run database migrations on startup
  await runMigrations();

  const app = express();
  const server = createServer(app);

  // CORS middleware for cross-origin requests
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Klaviyo API
  app.use("/api/klaviyo", klaviyoRouter);
  // Seed API (for initial data population)
  app.use("/api", seedRouter);
  app.use(seedCommunityRouter);
  // Airwallex Payment API
  app.use("/api/airwallex", airwallexRouter);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    // Dynamic import to avoid bundling vite in production
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
