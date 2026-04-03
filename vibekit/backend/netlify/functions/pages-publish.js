// netlify/functions/pages/publish.js  →  POST /api/pages/:id/publish|unpublish
const { query } = require("../lib/db/pool");
const { success, error, withErrorHandler, requireAuth } = require("../lib/middleware");

function getId(event) {
  const parts = event.path.split("/").filter(Boolean);
  return parts[parts.length - 2];
}
function getAction(event) {
  return event.path.split("/").filter(Boolean).pop();
}

async function handler(event) {
  if (event.httpMethod !== "POST") return error("Method not allowed", 405);
  const id     = getId(event);
  const action = getAction(event);
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return error("Invalid page ID", 400);

  const { rows } = await query(
    "SELECT id,status,sections FROM pages WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL",
    [id, event.user.sub]
  );
  if (!rows.length) return error("Page not found", 404, "NOT_FOUND");
  const page = rows[0];

  if (action === "publish") {
    if (page.status === "published") return error("Already published", 409);
    const types = (page.sections || []).map((s) => s.type);
    const missing = ["hero","features","gallery","contact"].filter((t) => !types.includes(t));
    if (missing.length) return error(`Missing sections: ${missing.join(", ")}`, 400, "INCOMPLETE_PAGE");
    const { rows: r } = await query(
      "UPDATE pages SET status='published',published_at=NOW(),updated_at=NOW() WHERE id=$1 RETURNING id,title,slug,status,published_at",
      [id]
    );
    return success({ page: r[0], publicUrl: `/p/${r[0].slug}` });
  }

  if (action === "unpublish") {
    if (page.status === "draft") return error("Already unpublished", 409);
    const { rows: r } = await query(
      "UPDATE pages SET status='draft',updated_at=NOW() WHERE id=$1 RETURNING id,title,slug,status",
      [id]
    );
    return success({ page: r[0] });
  }

  return error("Unknown action", 400);
}

exports.handler = withErrorHandler(requireAuth(handler));
