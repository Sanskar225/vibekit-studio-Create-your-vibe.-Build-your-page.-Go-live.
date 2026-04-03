
// lib/db/pool.js
// Persistent pg connection pool — survives warm Lambda invocations
const { Pool } = require("pg");

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    pool.on("error", (err) => console.error("[DB Pool] idle client error:", err.message));
  }
  return pool;
}

async function query(text, params) {
  const start = Date.now();
  try {
    const result = await getPool().query(text, params);
    const ms = Date.now() - start;
    if (ms > 1000) console.warn(`[DB] Slow query (${ms}ms):`, text.slice(0, 80));
    return result;
  } catch (err) {
    console.error("[DB] Query error:", err.message);
    throw err;
  }
}

async function withTransaction(fn) {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { query, withTransaction, getPool };
