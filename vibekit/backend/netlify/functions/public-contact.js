// netlify/functions/public/contact.js  →  POST /api/public/pages/:slug/contact
const { query }  = require("../../lib/db/pool");
const { sendContactNotification } = require("../../lib/email");
const { contactSchema, validate } = require("../../lib/validators");
const { success, error, withErrorHandler, rateLimit, parseBody } = require("../../lib/middleware");

function getSlug(event) {
  const parts = event.path.split("/").filter(Boolean);
  return parts[parts.length - 2];
}

async function handler(event) {
  if (event.httpMethod !== "POST") return error("Method not allowed", 405);
  const slug = getSlug(event);
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) return error("Invalid slug", 400);

  const data = validate(contactSchema, parseBody(event));

  const { rows } = await query(
    `SELECT p.id,p.title,u.email AS owner_email
     FROM pages p JOIN users u ON u.id=p.user_id
     WHERE p.slug=$1 AND p.status='published' AND p.deleted_at IS NULL`,
    [slug]
  );
  if (!rows.length) return error("Page not found", 404, "NOT_FOUND");
  const { id: pageId, title: pageTitle, owner_email: ownerEmail } = rows[0];

  // Always persist to DB first
  const { rows: ins } = await query(
    "INSERT INTO contact_submissions(page_id,name,email,message) VALUES($1,$2,$3,$4) RETURNING id,created_at",
    [pageId, data.name, data.email, data.message]
  );

  // Non-blocking email attempt
  const emailSent = await sendContactNotification({ ownerEmail, pageTitle, submission: data });

  return success({ submissionId: ins[0].id, message: "Message received!", emailNotified: emailSent }, 201);
}

exports.handler = withErrorHandler(rateLimit({ windowMs: 600000, max: 5 })(handler));
