// netlify/functions/auth/refresh.js  →  POST /api/auth/refresh
const cookie = require("cookie");
const { query } = require("../../../lib/db/pool");
const { verifyToken, signAccessToken, signRefreshToken, buildAuthCookies,
        comparePassword, hashPassword } = require("../../../lib/auth");
const { success, error, withErrorHandler, rateLimit } = require("../../../lib/middleware");

async function handler(event) {
  if (event.httpMethod !== "POST") return error("Method not allowed", 405);
  const cookies = cookie.parse(event.headers?.cookie || "");
  const refreshToken = cookies.vk_refresh;
  if (!refreshToken) return error("No refresh token", 401, "UNAUTHORIZED");

  let payload;
  try {
    payload = verifyToken(refreshToken, "vibekit-refresh");
  } catch (e) {
    return error(e.name === "TokenExpiredError" ? "Refresh expired" : "Invalid refresh token", 401, "UNAUTHORIZED");
  }

  const { rows } = await query(
    "SELECT id,token_hash FROM refresh_tokens WHERE user_id=$1 AND expires_at>NOW() ORDER BY created_at DESC LIMIT 10",
    [payload.sub]
  );
  if (!rows.length) return error("Session revoked", 401, "SESSION_REVOKED");

  let matchedId = null;
  for (const r of rows) {
    if (await comparePassword(refreshToken, r.token_hash)) { matchedId = r.id; break; }
  }
  if (!matchedId) {
    await query("DELETE FROM refresh_tokens WHERE user_id=$1", [payload.sub]);
    return error("Possible token reuse — all sessions revoked", 403, "FORBIDDEN");
  }

  const { rows: users } = await query("SELECT id,name,email FROM users WHERE id=$1", [payload.sub]);
  if (!users.length) return error("User not found", 404);
  const user = users[0];

  await query("DELETE FROM refresh_tokens WHERE id=$1", [matchedId]);
  const tp = { sub: user.id, email: user.email, name: user.name };
  const newAccess = signAccessToken(tp);
  const newRefresh = signRefreshToken(tp);
  const rHash = await hashPassword(newRefresh);
  await query(
    "INSERT INTO refresh_tokens(user_id,token_hash,expires_at) VALUES($1,$2,NOW()+INTERVAL '30 days')",
    [user.id, rHash]
  );
  const [ac, rc] = buildAuthCookies(newAccess, newRefresh);
  return { ...success({ user: { id: user.id, name: user.name, email: user.email } }), multiValueHeaders: { "Set-Cookie": [ac, rc] } };
}

exports.handler = withErrorHandler(rateLimit({ windowMs: 60000, max: 20 })(handler));
