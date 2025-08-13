const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function runMigration() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const client = await pool.connect();

  try {
    const migrationPath = path.join(__dirname, "migrations", "create_timers_table.sql");
    const migration = fs.readFileSync(migrationPath, "utf8");

    await client.query(migration);
    console.log("✅ Migration applied successfully");
  } catch (err) {
    console.error("❌ Migration failed", err);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

runMigration();
