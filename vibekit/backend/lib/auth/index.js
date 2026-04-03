// lib/auth/index.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookie = require("cookie");

const SECRET = () => process.env.JWT_SECRET || "dev-secret-min-32-chars-change-me";

async function hashPassword(pw) { return bcrypt.hash(pw, 12); }
async function comparePassword(pw, hash) { return bcrypt.compare(pw, hash); }

function signAccessToken(payload) {
  return jwt.sign(payload, SECRET(), {
    expiresIn: "7d", issuer: "vibekit", audience: "vibekit-users",
  });
}
function signRefreshToken(payload) {
  return jwt.sign(payload, SECRET(), {
    expiresIn: "30d", issuer: "vibekit", audience: "vibekit-refresh",
  });
}
function verifyToken(token, audience = "vibekit-users") {
  return jwt.verify(token, SECRET(), { issuer: "vibekit", audience });
}

function buildAuthCookies(access, refresh) {
  const prod = process.env.NODE_ENV === "production";
  const base = { httpOnly: true, secure: prod, sameSite: "Strict", path: "/" };
  return [
    cookie.serialize("vk_access",  access,  { ...base, maxAge: 7  * 86400 }),
    cookie.serialize("vk_refresh", refresh, { ...base, maxAge: 30 * 86400, path: "/api/auth/refresh" }),
  ];
}
function buildClearCookies() {
  const base = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Strict" };
  return [
    cookie.serialize("vk_access",  "", { ...base, maxAge: 0, path: "/" }),
    cookie.serialize("vk_refresh", "", { ...base, maxAge: 0, path: "/api/auth/refresh" }),
  ];
}
function extractToken(event) {
  const cookies = cookie.parse(event.headers?.cookie || "");
  if (cookies.vk_access) return cookies.vk_access;
  const auth = event.headers?.authorization || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

module.exports = {
  hashPassword, comparePassword,
  signAccessToken, signRefreshToken, verifyToken,
  buildAuthCookies, buildClearCookies, extractToken,
};
