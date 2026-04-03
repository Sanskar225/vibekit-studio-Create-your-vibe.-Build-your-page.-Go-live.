// netlify/functions/pages/analytics.js  →  GET /api/pages/:id/analytics
const { query } = require("../../../lib/db/pool");
const { success, error, withErrorHandler, requireAuth } = require("../../../lib/middleware");

function getPageId(event) {
  const parts = event.path.split("/").filter(Boolean);
  return parts[parts.length - 2];
}

async function handler(event) {
  if (event.httpMethod !== "GET") return error("Method not allowed", 405);
  const pageId = getPageId(event);
  if (!pageId || !/^[0-9a-f-]{36}$/i.test(pageId)) return error("Invalid page ID", 400);

  const { rows: pages } = await query(
    "SELECT id,title,slug,view_count,status,published_at FROM pages WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL",
    [pageId, event.user.sub]
  );
  if (!pages.length) return error("Page not found", 404, "NOT_FOUND");
  const page = pages[0];

  const days = [7,30,90].includes(+event.queryStringParameters?.days) ? +event.queryStringParameters.days : 7;

  const [daily, refs, contacts, unique] = await Promise.all([
    query(`SELECT DATE_TRUNC('day',viewed_at) AS date, COUNT(*) AS views
           FROM page_views WHERE page_id=$1 AND viewed_at>=NOW()-INTERVAL '${days} days'
           GROUP BY 1 ORDER BY 1`, [pageId]),
    query(`SELECT COALESCE(NULLIF(referrer,''),'Direct') AS referrer, COUNT(*) AS views
           FROM page_views WHERE page_id=$1 AND viewed_at>=NOW()-INTERVAL '${days} days'
           GROUP BY 1 ORDER BY 2 DESC LIMIT 10`, [pageId]),
    query("SELECT COUNT(*) AS total, COUNT(*) FILTER(WHERE is_read=FALSE) AS unread FROM contact_submissions WHERE page_id=$1", [pageId]),
    query(`SELECT COUNT(DISTINCT visitor_ip) AS uv FROM page_views WHERE page_id=$1 AND viewed_at>=NOW()-INTERVAL '${days} days'`, [pageId]),
  ]);

  return success({
    page: { id: page.id, title: page.title, slug: page.slug, status: page.status, publishedAt: page.published_at, totalViews: page.view_count },
    analytics: {
      rangeDays: days,
      uniqueVisitors: +unique.rows[0].uv,
      dailyViews: daily.rows.map((r) => ({ date: r.date, views: +r.views })),
      topReferrers: refs.rows.map((r) => ({ referrer: r.referrer, views: +r.views })),
      contacts: { total: +contacts.rows[0].total, unread: +contacts.rows[0].unread },
    },
  });
}

exports.handler = withErrorHandler(requireAuth(handler));
