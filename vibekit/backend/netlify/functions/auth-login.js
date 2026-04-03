// netlify/functions/auth/login.js  →  POST /api/auth/login
const { query } = require("../../lib/db/pool");
const { comparePassword, signAccessToken, signRefreshToken, buildAuthCookies } = require("../../lib/auth");
const { loginSchema, validate } = require("../../lib/validators");
const { success, error, withErrorHandler, rateLimit, parseBody } = require("../../lib/middleware");

const INVALID = error("Invalid email or password", 401, "INVALID_CREDENTIALS");

async function handler(event) {
  if (event.httpMethod !== "POST") return error("Method not allowed", 405);
  const data = validate(loginSchema, parseBody(event));
  const { rows } = await query("SELECT id,name,email,password_hash FROM users WHERE email=$1", [data.email]);
  if (!rows.length) {
    await comparePassword("dummy", "$2b$12$dummy.hash.to.prevent.timing");
    return INVALID;
  }
  const user = rows[0];
  if (!(await comparePassword(data.password, user.password_hash))) return INVALID;
  await query("UPDATE users SET last_login_at=NOW() WHERE id=$1", [user.id]);
  const payload = { sub: user.id, email: user.email, name: user.name };
  const [ac, rc] = buildAuthCookies(signAccessToken(payload), signRefreshToken(payload));
  return {
    ...success({ user: { id: user.id, name: user.name, email: user.email } }),
    multiValueHeaders: { "Set-Cookie": [ac, rc] },
  };
}

exports.handler = withErrorHandler(rateLimit({ windowMs: 60000, max: 10 })(handler));
