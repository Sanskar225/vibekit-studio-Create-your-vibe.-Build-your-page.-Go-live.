// lib/db/slug.js
const slugify = require("slugify");
const { nanoid } = require("nanoid");
const { query } = require("./pool");

function toSlug(title) {
  return slugify(title, { lower: true, strict: true, trim: true }).slice(0, 80);
}

async function generateUniqueSlug(baseTitle, excludeId = null) {
  const base = toSlug(baseTitle) || "page";

  async function isTaken(slug) {
    const sql = excludeId
      ? "SELECT 1 FROM pages WHERE slug=$1 AND id!=$2 AND deleted_at IS NULL"
      : "SELECT 1 FROM pages WHERE slug=$1 AND deleted_at IS NULL";
    const { rowCount } = await query(sql, excludeId ? [slug, excludeId] : [slug]);
    return rowCount > 0;
  }

  if (!(await isTaken(base))) return base;
  for (let i = 1; i <= 10; i++) {
    const c = `${base}-${i}`;
    if (!(await isTaken(c))) return c;
  }
  return `${base}-${nanoid(6).toLowerCase()}`;
}

module.exports = { toSlug, generateUniqueSlug };
