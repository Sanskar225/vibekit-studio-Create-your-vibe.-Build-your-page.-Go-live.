// lib/email/index.js
const nodemailer = require("nodemailer");

let transporter;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport(
      process.env.SMTP_HOST
        ? { host: process.env.SMTP_HOST, port: +process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === "true",
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } }
        : { host: "smtp.ethereal.email", port: 587,
            auth: { user: process.env.ETHEREAL_USER || "test@ethereal.email", pass: process.env.ETHEREAL_PASS || "test" } }
    );
  }
  return transporter;
}

async function sendContactNotification({ ownerEmail, pageTitle, submission }) {
  if (!process.env.SMTP_HOST) {
    console.log("[Email] SMTP not configured — skipping notification");
    return false;
  }
  try {
    await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || '"VibeKit Studio" <noreply@vibekit.studio>',
      to: ownerEmail,
      subject: `New contact: "${pageTitle}"`,
      html: `<div style="font-family:sans-serif;max-width:600px">
        <h2>New Contact Submission</h2>
        <p><b>Page:</b> ${pageTitle}</p>
        <p><b>From:</b> ${submission.name} &lt;${submission.email}&gt;</p>
        <blockquote style="background:#f5f5f5;padding:12px;border-left:4px solid #7c3aed">
          ${submission.message.replace(/\n/g, "<br>")}
        </blockquote>
        <p style="color:#888;font-size:12px">Sent via VibeKit Studio</p>
      </div>`,
    });
    return true;
  } catch (err) {
    console.error("[Email] Failed:", err.message);
    return false;
  }
}

module.exports = { sendContactNotification };
