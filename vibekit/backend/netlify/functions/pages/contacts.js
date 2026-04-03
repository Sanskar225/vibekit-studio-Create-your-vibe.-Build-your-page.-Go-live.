// netlify/functions/pages/contacts.js  →  GET /api/pages/:id/contacts
const { query } = require("../../../lib/db/pool");
const { success, error, withErrorHandler, requireAuth } = require("../../../lib/middleware");

function getPageId(event) {
  const parts = event.path.split("/").filter(Boolean);
  return parts[parts.length - 2];
}

async function handler(event) {
  const pageId = getPageId(event);
  if (!pageId || !/^[0-9a-f-]{36}$/i.test(pageId)) return error("Invalid page ID", 400);

  // Verify ownership
  const { rowCount } = await query(
    "SELECT 1 FROM pages WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL",
    [pageId, event.user.sub]
  );
  if (!rowCount) return error("Page not found", 404, "NOT_FOUND");

  if (event.httpMethod === "GET") {
    const p   = event.queryStringParameters || {};
    const pg  = Math.max(1, +p.page  || 1);
    const lim = Math.min(50, +p.limit || 20);
    const off = (pg - 1) * lim;
    const unreadOnly = p.unread === "true";
    let where = "WHERE page_id=$1";
    if (unreadOnly) where += " AND is_read=FALSE";
    const [sr, cr] = await Promise.all([
      query(`SELECT id,name,email,message,is_read,created_at FROM contact_submissions ${where} ORDER BY created_at DESC LIMIT $2 OFFSET $3`, [pageId, lim, off]),
      query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE is_read=FALSE) AS unread FROM contact_submissions ${where}`, [pageId]),
    ]);
    const { total, unread } = cr.rows[0];
    return success({ submissions: sr.rows, pagination: { page: pg, limit: lim, total: +total, unread: +unread } });
  }

  if (event.httpMethod === "PATCH") {
    const parts = event.path.split("/").filter(Boolean);
    const subId = parts[parts.length - 1];
    if (!/^[0-9a-f-]{36}$/i.test(subId)) return error("Invalid submission ID", 400);
    await query(
      `UPDATE contact_submissions cs SET is_read=TRUE FROM pages p
       WHERE cs.id=$1 AND cs.page_id=p.id AND p.user_id=$2 AND p.deleted_at IS NULL`,
      [subId, event.user.sub]
    );
    return success({ message: "Marked as read" });
  }

  return error("Method not allowed", 405);
}

exports.handler = withErrorHandler(requireAuth(handler));
