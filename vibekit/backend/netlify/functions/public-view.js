// netlify/functions/public/view.js  →  POST /api/public/pages/:slug/view
const { query, withTransaction } = require("../../lib/db/pool");
const { success, withErrorHandler, rateLimit } = require("../../lib/middleware");

function getSlug(event) {
  const parts = event.path.split("/").filter(Boolean);
  return parts[parts.length - 2];
}

async function handler(event) {
  const slug = getSlug(event);
  if (!slug) return success({ recorded: false });

  const { rows } = await query(
    "SELECT id FROM pages WHERE slug=$1 AND status='published' AND deleted_at IS NULL", [slug]
  );
  if (!rows.length) return success({ recorded: false });

  const pageId = rows[0].id;
  const ip = (event.headers?.["x-forwarded-for"] || "unknown").split(",")[0].trim();
  const ua = (event.headers?.["user-agent"] || "").slice(0, 500);
  const ref= (event.headers?.["referer"]    || "").slice(0, 500);

  // 30-min dedup per IP per page
  const { rowCount } = await query(
    "SELECT 1 FROM page_views WHERE page_id=$1 AND visitor_ip=$2 AND viewed_at>NOW()-INTERVAL '30 minutes'",
    [pageId, ip]
  );
  if (rowCount > 0) {
    const { rows: cur } = await query("SELECT view_count FROM pages WHERE id=$1", [pageId]);
    return success({ recorded: false, viewCount: cur[0].view_count });
  }

  const newCount = await withTransaction(async (client) => {
    await client.query(
      "INSERT INTO page_views(page_id,visitor_ip,user_agent,referrer) VALUES($1,$2,$3,$4)",
      [pageId, ip, ua, ref]
    );
    const { rows: r } = await client.query(
      "UPDATE pages SET view_count=view_count+1 WHERE id=$1 RETURNING view_count", [pageId]
    );
    return r[0].view_count;
  });

  return success({ recorded: true, viewCount: newCount });
}

exports.handler = withErrorHandler(rateLimit({ windowMs: 60000, max: 30 })(handler));
