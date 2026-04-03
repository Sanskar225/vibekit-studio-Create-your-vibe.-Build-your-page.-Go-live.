// lib/middleware/index.js
const { verifyToken, extractToken } = require("../auth");

// ─── CORS ──────────────────────────────────────────────────────────────────
function corsHeaders() {
  const origin = process.env.FRONTEND_URL || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
  };
}

// ─── Response helpers ──────────────────────────────────────────────────────
function success(data, statusCode = 200, extra = {}) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", ...corsHeaders(), ...extra },
    body: JSON.stringify({ success: true, data }),
  };
}

function error(message, statusCode = 400, code = "BAD_REQUEST", details = null) {
  const body = { success: false, error: { message, code } };
  if (details) body.error.details = details;
  return {
    statusCode,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
    body: JSON.stringify(body),
  };
}

function preflight() {
  return { statusCode: 204, headers: corsHeaders(), body: "" };
}

// ─── Auth middleware ───────────────────────────────────────────────────────
function requireAuth(handler) {
  return async (event, ctx) => {
    if (event.httpMethod === "OPTIONS") return preflight();
    const token = extractToken(event);
    if (!token) return error("Authentication required", 401, "UNAUTHORIZED");
    try {
      event.user = verifyToken(token);
      return handler(event, ctx);
    } catch (e) {
      if (e.name === "TokenExpiredError")
        return error("Session expired", 401, "TOKEN_EXPIRED");
      return error("Invalid token", 403, "FORBIDDEN");
    }
  };
}

// ─── In-memory rate limiter ────────────────────────────────────────────────
const store = new Map();
function rateLimit({ windowMs = 60000, max = 60 } = {}) {
  return (handler) => async (event, ctx) => {
    const ip = event.headers?.["x-forwarded-for"]?.split(",")[0].trim() || "unknown";
    const now = Date.now();
    if (!store.has(ip)) store.set(ip, { count: 0, resetAt: now + windowMs });
    const rec = store.get(ip);
    if (now > rec.resetAt) { rec.count = 0; rec.resetAt = now + windowMs; }
    rec.count++;
    const remaining = Math.max(0, max - rec.count);
    const headers = {
      "X-RateLimit-Limit": String(max),
      "X-RateLimit-Remaining": String(remaining),
    };
    if (rec.count > max) {
      return {
        statusCode: 429,
        headers: { "Content-Type": "application/json", ...corsHeaders(), ...headers, "Retry-After": String(Math.ceil((rec.resetAt - now) / 1000)) },
        body: JSON.stringify({ success: false, error: { message: "Too many requests", code: "RATE_LIMIT_EXCEEDED" } }),
      };
    }
    const res = await handler(event, ctx);
    res.headers = { ...res.headers, ...headers };
    return res;
  };
}

// ─── Error wrapper ─────────────────────────────────────────────────────────
function withErrorHandler(handler) {
  return async (event, ctx) => {
    if (event.httpMethod === "OPTIONS") return preflight();
    try {
      return await handler(event, ctx);
    } catch (err) {
      console.error("[Handler Error]", { path: event.path, method: event.httpMethod, message: err.message });
      if (err.code === "23505") return error("Already exists", 409, "CONFLICT");
      if (err.code === "23503") return error("Referenced record not found", 400, "REFERENCE_ERROR");
      if (err.statusCode) return error(err.message, err.statusCode, err.code || "ERROR", err.details);
      return error("An unexpected error occurred", 500, "INTERNAL_ERROR");
    }
  };
}

// ─── Body parser ──────────────────────────────────────────────────────────
function parseBody(event) {
  if (!event.body) return {};
  try { return JSON.parse(event.body); }
  catch { const e = new Error("Invalid JSON body"); e.statusCode = 400; throw e; }
}

module.exports = {
  corsHeaders, success, error, preflight,
  requireAuth, rateLimit, withErrorHandler, parseBody,
};
