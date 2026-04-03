// netlify/functions/auth/me.js  →  GET /api/auth/me
const { query } = require("../lib/db/pool");
const { success, error, withErrorHandler, requireAuth } = require("../lib/middleware");

async function handler(event) {
  if (event.httpMethod !== "GET") return error("Method not allowed", 405);
  const { rows } = await query(
    "SELECT id,name,email,created_at,last_login_at FROM users WHERE id=$1",
    [event.user.sub]
  );
  if (!rows.length) return error("User not found", 404, "NOT_FOUND");
  return success({ user: rows[0] });
}

exports.handler = withErrorHandler(requireAuth(handler));
