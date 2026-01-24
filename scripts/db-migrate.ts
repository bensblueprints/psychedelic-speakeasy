import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.log("[Migration] No DATABASE_URL found, skipping migrations");
    return;
  }

  console.log("[Migration] Starting database migration...");
  
  try {
    const connection = await mysql.createConnection(connectionString);
    const db = drizzle(connection);
    
    await migrate(db, { migrationsFolder: "./drizzle" });
    
    console.log("[Migration] Migrations completed successfully");
    await connection.end();
  } catch (error) {
    console.error("[Migration] Migration failed:", error);
    // Don't throw - allow server to start even if migrations fail
    // Tables may already exist
  }
}

runMigrations();
