// netlify/functions/auth/signup.js  →  POST /api/auth/signup
const { query }  = require("../../lib/db/pool");
const { hashPassword, signAccessToken, signRefreshToken, buildAuthCookies } = require("../../lib/auth");
const { signupSchema, validate } = require("../../lib/validators");
const { success, error, withErrorHandler, rateLimit, parseBody } = require("../../lib/middleware");

async function handler(event) {
  if (event.httpMethod !== "POST") return error("Method not allowed", 405, "METHOD_NOT_ALLOWED");
  const data = validate(signupSchema, parseBody(event));
  const { rowCount } = await query("SELECT 1 FROM users WHERE email=$1", [data.email]);
  if (rowCount > 0) return error("Email already registered", 409, "EMAIL_TAKEN");
  const hash = await hashPassword(data.password);
  const { rows } = await query(
    "INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email,created_at",
    [data.name, data.email, hash]
  );
  const user = rows[0];
  const payload = { sub: user.id, email: user.email, name: user.name };
  const [ac, rc] = buildAuthCookies(signAccessToken(payload), signRefreshToken(payload));
  return { ...success({ user }, 201), multiValueHeaders: { "Set-Cookie": [ac, rc] } };
}

exports.handler = withErrorHandler(rateLimit({ windowMs: 60000, max: 5 })(handler));
