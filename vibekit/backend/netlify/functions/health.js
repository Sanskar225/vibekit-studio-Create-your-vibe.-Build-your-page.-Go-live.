// netlify/functions/health.js  →  GET /api/health
const { query }      = require("../../lib/db/pool");
const { corsHeaders } = require("../../lib/middleware");

exports.handler = async () => {
  let dbOk = false, latency = null;
  try {
    const t = Date.now();
    await query("SELECT 1");
    latency = Date.now() - t;
    dbOk = true;
  } catch (_) {}
  return {
    statusCode: dbOk ? 200 : 503,
    headers: { "Content-Type": "application/json", ...corsHeaders(), "Cache-Control": "no-store" },
    body: JSON.stringify({
      status: dbOk ? "healthy" : "degraded",
      checks: { database: { status: dbOk ? "ok" : "error", latencyMs: latency } },
      timestamp: new Date().toISOString(),
    }),
  };
};
