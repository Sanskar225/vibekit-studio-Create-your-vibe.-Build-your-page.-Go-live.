require("dotenv").config();
const http = require("http");
const { URL } = require("url");
const PORT = process.env.PORT || 8888;

const ROUTES = [
  ["POST", "/api/auth/signup",              "./netlify/functions/auth-signup"],
  ["POST", "/api/auth/login",               "./netlify/functions/auth-login"],
  ["POST", "/api/auth/logout",              "./netlify/functions/auth-logout"],
  ["GET",  "/api/auth/me",                  "./netlify/functions/auth-me"],
  ["POST", "/api/auth/refresh",             "./netlify/functions/auth-refresh"],
  ["GET",  "/api/health",                   "./netlify/functions/health"],
  ["GET",  "/api/themes",                   "./netlify/functions/themes"],
  ["GET",  "/api/pages/slug-check",         "./netlify/functions/pages/slug-check"],
  ["POST", "/api/pages/:id/publish",        "./netlify/functions/pages-publish"],
  ["POST", "/api/pages/:id/unpublish",      "./netlify/functions/pages-publish"],
  ["POST", "/api/pages/:id/duplicate",      "./netlify/functions/pages-duplicate"],
  ["GET",  "/api/pages/:id/contacts",       "./netlify/functions/pages/contacts"],
  ["PATCH","/api/pages/:id/contacts/:sid",  "./netlify/functions/pages/contacts"],
  ["GET",  "/api/pages/:id/analytics",      "./netlify/functions/pages/analytics"],
  ["GET",  "/api/pages/:id",                "./netlify/functions/pages-id"],
  ["PUT",  "/api/pages/:id",                "./netlify/functions/pages-id"],
  ["DELETE","/api/pages/:id",               "./netlify/functions/pages-id"],
  ["GET",  "/api/pages",                    "./netlify/functions/pages-index"],
  ["POST", "/api/pages",                    "./netlify/functions/pages-index"],
  ["POST", "/api/public/pages/:slug/view",    "./netlify/functions/public-view"],
  ["POST", "/api/public/pages/:slug/contact", "./netlify/functions/public-contact"],
  ["GET",  "/api/public/pages/:slug",         "./netlify/functions/public-page"],
];

function matchRoute(method, pathname) {
  for (const [m, pattern, file] of ROUTES) {
    if (m !== method && method !== "OPTIONS") continue;
    const patParts = pattern.split("/");
    const urlParts = pathname.split("/");
    if (patParts.length !== urlParts.length) continue;
    const params = {};
    let ok = true;
    for (let i = 0; i < patParts.length; i++) {
      if (patParts[i].startsWith(":")) { params[patParts[i].slice(1)] = urlParts[i]; }
      else if (patParts[i] !== urlParts[i]) { ok = false; break; }
    }
    if (ok) return { file, params };
  }
  return null;
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => resolve(body));
  });
}

const server = http.createServer(async (req, res) => {
  const url    = new URL(req.url, `http://localhost:${PORT}`);
  const path   = url.pathname;
  const method = req.method.toUpperCase();
  const origin = process.env.FRONTEND_URL || "http://localhost:3000";

  const corsH = {
    "Access-Control-Allow-Origin":      origin,
    "Access-Control-Allow-Methods":     "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers":     "Content-Type,Authorization",
    "Access-Control-Allow-Credentials": "true",
  };

  if (method === "OPTIONS") {
    res.writeHead(204, corsH);
    return res.end();
  }

  const match = matchRoute(method, path);
  if (!match) {
    res.writeHead(404, { "Content-Type": "application/json", ...corsH });
    return res.end(JSON.stringify({ success: false, error: { message: `Not found: ${method} ${path}`, code: "NOT_FOUND" } }));
  }

  try {
    const body = await readBody(req);
    const handler = require(match.file).handler;
    const headers = {};
    for (const [k, v] of Object.entries(req.headers)) headers[k] = v;
    const queryStringParameters = {};
    url.searchParams.forEach((v, k) => (queryStringParameters[k] = v));

    const event = {
      httpMethod: method, path, headers, queryStringParameters,
      pathParameters: match.params, body: body || null, isBase64Encoded: false,
    };

    const result = await handler(event, {});
    const outHeaders = { ...result.headers };
    if (result.multiValueHeaders) {
      for (const [k, vals] of Object.entries(result.multiValueHeaders)) {
        if (Array.isArray(vals)) outHeaders[k] = vals;
      }
    }
    res.writeHead(result.statusCode || 200, outHeaders);
    res.end(result.body || "");
  } catch (err) {
    console.error(`[Error] ${method} ${path}:`, err.message);
    res.writeHead(500, { "Content-Type": "application/json", ...corsH });
    res.end(JSON.stringify({ success: false, error: { message: "Internal server error" } }));
  }
});

server.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║  VibeKit Backend running!            ║
  ║  http://localhost:${PORT}               ║
  ╚══════════════════════════════════════╝
  `);
});
