// netlify/functions/pages/[id].js  →  GET|PUT|DELETE /api/pages/:id
const { query } = require("../../../lib/db/pool");
const { generateUniqueSlug } = require("../../../lib/db/slug");
const { updatePageSchema, validate } = require("../../../lib/validators");
const { success, error, withErrorHandler, requireAuth, parseBody } = require("../../../lib/middleware");

function getId(event) { return event.path.split("/").filter(Boolean).pop(); }

async function owned(id, userId) {
  const { rows } = await query("SELECT * FROM pages WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL", [id, userId]);
  return rows[0] || null;
}

async function getPage(event, id) {
  const page = await owned(id, event.user.sub);
  if (!page) return error("Page not found", 404, "NOT_FOUND");
  return success({ page });
}

async function updatePage(event, id) {
  const page = await owned(id, event.user.sub);
  if (!page) return error("Page not found", 404, "NOT_FOUND");
  const data = validate(updatePageSchema, parseBody(event));
  if (!Object.keys(data).length) return error("Nothing to update", 400);

  let slug = page.slug;
  if (data.slug && data.slug !== page.slug) {
    const { rowCount } = await query("SELECT 1 FROM pages WHERE slug=$1 AND id!=$2 AND deleted_at IS NULL", [data.slug, id]);
    slug = rowCount > 0 ? await generateUniqueSlug(data.slug, id) : data.slug;
  }
  const { rows } = await query(
    `UPDATE pages SET title=COALESCE($1,title), slug=$2, theme=COALESCE($3,theme),
     sections=COALESCE($4,sections), updated_at=NOW()
     WHERE id=$5 AND user_id=$6
     RETURNING id,title,slug,theme,sections,status,view_count,created_at,updated_at,published_at`,
    [data.title||null, slug, data.theme||null, data.sections ? JSON.stringify(data.sections) : null, id, event.user.sub]
  );
  return success({ page: rows[0] });
}

async function deletePage(event, id) {
  const page = await owned(id, event.user.sub);
  if (!page) return error("Page not found", 404, "NOT_FOUND");
  await query("UPDATE pages SET deleted_at=NOW(), status='draft', updated_at=NOW() WHERE id=$1", [id]);
  return success({ message: "Page deleted" });
}

async function handler(event) {
  const id = getId(event);
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return error("Invalid page ID", 400);
  if (event.httpMethod === "GET")    return getPage(event, id);
  if (event.httpMethod === "PUT")    return updatePage(event, id);
  if (event.httpMethod === "DELETE") return deletePage(event, id);
  return error("Method not allowed", 405);
}

exports.handler = withErrorHandler(requireAuth(handler));
