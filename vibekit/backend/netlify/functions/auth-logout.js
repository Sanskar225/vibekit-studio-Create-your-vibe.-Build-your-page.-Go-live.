// netlify/functions/auth/logout.js  →  POST /api/auth/logout
const { buildClearCookies, extractToken, verifyToken } = require("../../lib/auth");
const { query } = require("../../lib/db/pool");
const { success, error, withErrorHandler } = require("../../lib/middleware");

async function handler(event) {
  if (event.httpMethod !== "POST") return error("Method not allowed", 405);
  try {
    const token = extractToken(event);
    if (token) {
      const p = verifyToken(token);
      await query("DELETE FROM refresh_tokens WHERE user_id=$1", [p.sub]);
    }
  } catch (_) {}
  const [ac, rc] = buildClearCookies();
  return { ...success({ message: "Logged out" }), multiValueHeaders: { "Set-Cookie": [ac, rc] } };
}

exports.handler = withErrorHandler(handler);
