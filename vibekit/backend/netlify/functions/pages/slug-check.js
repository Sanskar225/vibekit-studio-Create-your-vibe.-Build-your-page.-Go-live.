// netlify/functions/pages/slug-check.js  →  GET /api/pages/slug-check
const { query }                  = require("../../../lib/db/pool");
const { generateUniqueSlug, toSlug } = require("../../../lib/db/slug");
const { success, error, withErrorHandler, requireAuth } = require("../../../lib/middleware");

async function handler(event) {
  if (event.httpMethod !== "GET") return error("Method not allowed", 405);
  const { slug, excludeId } = event.queryStringParameters || {};
  if (!slug) return error("slug param required", 400);

  const norm = toSlug(slug);
  if (!norm || norm.length < 2) return success({ available: false, slug: norm, suggestions: [] });

  const sql    = excludeId
    ? "SELECT 1 FROM pages WHERE slug=$1 AND id!=$2 AND deleted_at IS NULL"
    : "SELECT 1 FROM pages WHERE slug=$1 AND deleted_at IS NULL";
  const params = excludeId ? [norm, excludeId] : [norm];
  const { rowCount } = await query(sql, params);

  if (rowCount === 0) return success({ available: true, slug: norm, suggestions: [] });

  const suggestions = await Promise.all([
    generateUniqueSlug(norm, excludeId),
    generateUniqueSlug(`${norm}-site`, excludeId),
    generateUniqueSlug(`${norm}-page`, excludeId),
  ]);
  return success({ available: false, slug: norm, reason: "Already taken", suggestions: [...new Set(suggestions)].slice(0, 3) });
}

exports.handler = withErrorHandler(requireAuth(handler));
