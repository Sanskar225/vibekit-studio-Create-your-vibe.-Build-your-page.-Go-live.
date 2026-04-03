// netlify/functions/public/page.js  →  GET /api/public/pages/:slug
const { query } = require("../../lib/db/pool");
const { success, error, withErrorHandler, corsHeaders } = require("../../lib/middleware");

function getSlug(event) {
  return event.path.split("/").filter(Boolean).pop();
}

async function handler(event) {
  if (event.httpMethod !== "GET") return error("Method not allowed", 405);
  const slug = getSlug(event);
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) return error("Invalid slug", 400);

  const { rows } = await query(
    `SELECT p.id,p.title,p.slug,p.theme,p.sections,p.view_count,p.published_at,
            u.name AS author_name
     FROM pages p JOIN users u ON u.id=p.user_id
     WHERE p.slug=$1 AND p.status='published' AND p.deleted_at IS NULL`,
    [slug]
  );
  if (!rows.length) return error("Page not found", 404, "NOT_FOUND");

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
      "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=60",
    },
    body: JSON.stringify({ success: true, data: { page: rows[0] } }),
  };
}

exports.handler = withErrorHandler(handler);
