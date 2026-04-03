// migrations/run.js
require("dotenv").config({ path: ".env" });
const fs   = require("fs");
const path = require("path");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version    VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    const { rows } = await client.query("SELECT version FROM schema_migrations ORDER BY version");
    const applied = new Set(rows.map((r) => r.version));

    const files = fs.readdirSync(__dirname)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    let count = 0;
    for (const file of files) {
      const version = file.replace(".sql", "");
      if (applied.has(version)) { console.log(`  ✓ ${file} (already applied)`); continue; }
      console.log(`  ↑ Applying ${file}...`);
      const sql = fs.readFileSync(path.join(__dirname, file), "utf8");
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations(version) VALUES($1)", [version]);
        await client.query("COMMIT");
        console.log(`  ✓ ${file} done`);
        count++;
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`  ✗ ${file} FAILED:`, err.message);
        process.exit(1);
      }
    }
    console.log(count === 0 ? "\n✅ Already up to date." : `\n✅ Applied ${count} migration(s).`);
  } finally {
    client.release();
    await pool.end();
  }
}

console.log("🔄 Running migrations...\n");
run().catch((e) => { console.error(e); process.exit(1); });
