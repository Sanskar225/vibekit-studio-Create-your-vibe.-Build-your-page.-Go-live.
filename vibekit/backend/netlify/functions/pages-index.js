// netlify/functions/pages/index.js  →  GET /api/pages  +  POST /api/pages
const { query } = require("../../lib/db/pool");
const { generateUniqueSlug } = require("../../lib/db/slug");
const { createPageSchema, validate } = require("../../lib/validators");
const { success, error, withErrorHandler, requireAuth, parseBody } = require("../../lib/middleware");

const DEFAULT_SECTIONS = [
  { type:"hero",     order:0, content:{ title:"Page Title", subtitle:"Your subtitle goes here.", buttonText:"Get Started", buttonUrl:"#contact" }},
  { type:"features", order:1, content:{ cards:[
    { title:"Feature One", description:"Describe your first feature." },
    { title:"Feature Two", description:"Describe your second feature." },
    { title:"Feature Three", description:"Describe your third feature." },
  ]}},
  { type:"gallery",  order:2, content:{ images:[
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
  ]}},
  { type:"contact",  order:3, content:{} },
];

async function listPages(event) {
  const p   = event.queryStringParameters || {};
  const pg  = Math.max(1, +p.page || 1);
  const lim = Math.min(50, Math.max(1, +p.limit || 20));
  const off = (pg - 1) * lim;
  let where = "WHERE user_id=$1 AND deleted_at IS NULL";
  const params = [event.user.sub];
  if (p.status === "draft" || p.status === "published") { params.push(p.status); where += ` AND status=$${params.length}`; }
  params.push(lim, off);
  const [pr, cr] = await Promise.all([
    query(`SELECT id,title,slug,theme,status,view_count,created_at,updated_at,published_at FROM pages ${where} ORDER BY updated_at DESC LIMIT $${params.length-1} OFFSET $${params.length}`, params),
    query("SELECT COUNT(*) AS total FROM pages WHERE user_id=$1 AND deleted_at IS NULL", [event.user.sub]),
  ]);
  const total = +cr.rows[0].total;
  return success({ pages: pr.rows, pagination: { page: pg, limit: lim, total, totalPages: Math.ceil(total/lim) } });
}

async function createPage(event) {
  const data = validate(createPageSchema, parseBody(event));
  const slug = data.slug
    ? await (async () => {
        const { rowCount } = await query("SELECT 1 FROM pages WHERE slug=$1 AND deleted_at IS NULL", [data.slug]);
        return rowCount > 0 ? await generateUniqueSlug(data.slug) : data.slug;
      })()
    : await generateUniqueSlug(data.title);
  const sections = data.sections || DEFAULT_SECTIONS;
  const { rows } = await query(
    "INSERT INTO pages(user_id,title,slug,theme,sections) VALUES($1,$2,$3,$4,$5) RETURNING id,title,slug,theme,sections,status,view_count,created_at,updated_at",
    [event.user.sub, data.title, slug, data.theme, JSON.stringify(sections)]
  );
  return success({ page: rows[0] }, 201);
}

async function handler(event) {
  if (event.httpMethod === "GET")  return listPages(event);
  if (event.httpMethod === "POST") return createPage(event);
  return error("Method not allowed", 405);
}

exports.handler = withErrorHandler(requireAuth(handler));
