// netlify/functions/pages/duplicate.js  →  POST /api/pages/:id/duplicate
const { query, withTransaction } = require("../../../lib/db/pool");
const { generateUniqueSlug }     = require("../../../lib/db/slug");
const { success, error, withErrorHandler, requireAuth } = require("../../../lib/middleware");

function getId(event) {
  const parts = event.path.split("/").filter(Boolean);
  return parts[parts.length - 2]; // /api/pages/:id/duplicate
}

async function handler(event) {
  if (event.httpMethod !== "POST") return error("Method not allowed", 405);
  const id = getId(event);
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return error("Invalid page ID", 400);

  const { rows } = await query(
    "SELECT * FROM pages WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL",
    [id, event.user.sub]
  );
  if (!rows.length) return error("Page not found", 404, "NOT_FOUND");
  const orig = rows[0];

  const duplicated = await withTransaction(async (client) => {
    const newTitle = `${orig.title} (Copy)`;
    const newSlug  = await generateUniqueSlug(newTitle);
    const { rows: r } = await client.query(
      `INSERT INTO pages(user_id,title,slug,theme,sections,status)
       VALUES($1,$2,$3,$4,$5,'draft')
       RETURNING id,title,slug,theme,sections,status,view_count,created_at,updated_at`,
      [event.user.sub, newTitle, newSlug, orig.theme, JSON.stringify(orig.sections)]
    );
    return r[0];
  });

  return success({ page: duplicated }, 201);
}

exports.handler = withErrorHandler(requireAuth(handler));
